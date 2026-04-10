import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendOtpEmail } from '../services/gmailService.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_MS || 10 * 60 * 1000);
const OTP_REQUEST_WINDOW_MS = Number(process.env.OTP_REQUEST_WINDOW_MS || 2 * 60 * 60 * 1000);
const OTP_MAX_REQUESTS_PER_WINDOW = Number(process.env.OTP_MAX_REQUESTS_PER_WINDOW || 10);

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const register = async (req, res) => {
  try {
    const { email, name, country, city } = req.body;

    // Normalize and trim incoming fields
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedName = name?.trim();
    const trimmedCountry = country?.trim();
    const trimmedCity = city?.trim();

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      email: trimmedEmail,
      name: trimmedName,
      address: {
        country: trimmedCountry,
        city: trimmedCity
      }
    });
    await user.save();

    await AuditLog.create({
      user_id: user._id,
      action: 'USER_REGISTERED',
      entity_type: 'User',
      entity_id: user._id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        address: user.address,
        carbon_balance: user.carbon_balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Normalize login payload
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedOtp = otp?.trim();

    const user = await User.findOne({ email: trimmedEmail }).select('+otp_code_hash +otp_expires_at');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.otp_code_hash || !user.otp_expires_at) {
      return res.status(400).json({ message: 'Please request OTP first' });
    }

    if (user.otp_expires_at.getTime() < Date.now()) {
      user.otp_code_hash = null;
      user.otp_expires_at = null;
      await user.save();
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP' });
    }

    if (hashOtp(trimmedOtp) !== user.otp_code_hash) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    user.otp_code_hash = null;
    user.otp_expires_at = null;
    await user.save();

    await AuditLog.create({
      user_id: user._id,
      action: 'USER_LOGIN',
      entity_type: 'User',
      entity_id: user._id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        address: user.address,
        carbon_balance: user.carbon_balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail }).select('+otp_code_hash +otp_expires_at +otp_last_sent_at +otp_request_count +otp_request_window_started_at');
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    const now = new Date();
    if (
      !user.otp_request_window_started_at ||
      now.getTime() - user.otp_request_window_started_at.getTime() >= OTP_REQUEST_WINDOW_MS
    ) {
      user.otp_request_window_started_at = now;
      user.otp_request_count = 0;
    }

    if (user.otp_request_count >= OTP_MAX_REQUESTS_PER_WINDOW) {
      const elapsedInWindow = now.getTime() - user.otp_request_window_started_at.getTime();
      const retryAfterSec = Math.ceil((OTP_REQUEST_WINDOW_MS - elapsedInWindow) / 1000);
      return res.status(429).json({
        message: `OTP request limit reached. Try again in ${retryAfterSec}s.`,
        retryAfterSec
      });
    }

    if (user.otp_last_sent_at) {
      const elapsedMs = now.getTime() - user.otp_last_sent_at.getTime();
      if (elapsedMs < OTP_RESEND_COOLDOWN_MS) {
        const retryAfterSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsedMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${retryAfterSec}s before requesting OTP again.`,
          retryAfterSec
        });
      }
    }

    const otpCode = generateOtp();
    const previousOtpCodeHash = user.otp_code_hash;
    const previousOtpExpiresAt = user.otp_expires_at;
    const previousOtpLastSentAt = user.otp_last_sent_at;
    const previousOtpRequestCount = user.otp_request_count;
    const previousOtpRequestWindowStartedAt = user.otp_request_window_started_at;

    user.otp_code_hash = hashOtp(otpCode);
    user.otp_expires_at = new Date(Date.now() + OTP_TTL_MS);
    user.otp_last_sent_at = now;
    user.otp_request_count += 1;
    await user.save();

    try {
      await sendOtpEmail({ toEmail: user.email, otpCode });
    } catch (mailError) {
      user.otp_code_hash = previousOtpCodeHash;
      user.otp_expires_at = previousOtpExpiresAt;
      user.otp_last_sent_at = previousOtpLastSentAt;
      user.otp_request_count = previousOtpRequestCount;
      user.otp_request_window_started_at = previousOtpRequestWindowStartedAt;
      await user.save();
      throw mailError;
    }

    await AuditLog.create({
      user_id: user._id,
      action: 'USER_OTP_SENT',
      entity_type: 'User',
      entity_id: user._id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    const message = process.env.NODE_ENV === 'development'
      ? `Failed to send OTP: ${error.message}`
      : 'Failed to send OTP. Please try again.';

    res.status(500).json({ message });
  }
};
