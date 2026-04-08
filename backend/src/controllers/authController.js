import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendOtpEmail } from '../services/gmailService.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const OTP_TTL_MS = 10 * 60 * 1000;

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

    const user = await User.findOne({ email: trimmedEmail }).select('+otp_code_hash +otp_expires_at');
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    const otpCode = generateOtp();
    user.otp_code_hash = hashOtp(otpCode);
    user.otp_expires_at = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    await sendOtpEmail({ toEmail: user.email, otpCode });

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
