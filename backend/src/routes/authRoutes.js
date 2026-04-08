import express from 'express';
import { register, login, sendOtp } from '../controllers/authController.js';
import { validateRegister, validateSendOtp, validateLogin, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/send-otp', validateSendOtp, handleValidationErrors, sendOtp);
router.post('/login', validateLogin, handleValidationErrors, login);

export default router;
