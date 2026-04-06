import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Trim and lowercase email
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();
    const trimmedName = name?.trim();

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email: trimmedEmail, password: trimmedPassword, name: trimmedName });
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
        carbon_balance: user.carbon_balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trim and lowercase email, trim password
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(trimmedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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
        carbon_balance: user.carbon_balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
