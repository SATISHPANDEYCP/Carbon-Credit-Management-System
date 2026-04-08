import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('city').trim().notEmpty().withMessage('City is required')
];

export const validateSendOtp = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit number')
];

export const validateMeasure = [
  body('activity_type').isIn(['transport', 'electricity', 'waste', 'manufacturing']).withMessage('Invalid activity type'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit').isIn(['km', 'kwh', 'kg', 'liters']).withMessage('Invalid unit')
];

export const validateReduce = [
  body('action_type').isIn(['solar_installation', 'tree_planting', 'recycling', 'energy_efficiency']).withMessage('Invalid action type'),
  body('impact').isNumeric().withMessage('Impact must be a number')
];

export const validateOffset = [
  body('credit_amount').isNumeric().withMessage('Credit amount must be a number'),
  body('project_id').notEmpty().withMessage('Project ID is required')
];

export const validateShare = [
  body('recipient_email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('credit_amount').isNumeric().withMessage('Credit amount must be a number')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
