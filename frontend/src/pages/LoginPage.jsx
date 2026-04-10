import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, sendOtp as sendOtpApi } from '../api/authApi';
import '../styles/auth.css';

const LoginPage = () => {
  const OTP_RESEND_SECONDS = 600;
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [autoResending, setAutoResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const requestOtp = async ({ isAuto = false } = {}) => {
    const response = await sendOtpApi(email.trim());
    setOtpSent(true);
    setCooldown(OTP_RESEND_SECONDS);

    if (isAuto) {
      setMessage('New OTP auto-sent to your email.');
    } else {
      setMessage(response.message || 'OTP sent successfully');
    }
  };

  useEffect(() => {
    if (!otpSent) {
      return;
    }

    if (cooldown > 0) {
      const timerId = setInterval(() => {
        setCooldown((previous) => previous - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }

    if (autoResending) {
      return;
    }

    const handleAutoResend = async () => {
      setAutoResending(true);
      setError('');

      try {
        await requestOtp({ isAuto: true });
      } catch (err) {
        const retryAfterSec = Number(err.response?.data?.retryAfterSec || OTP_RESEND_SECONDS);
        setError(err.response?.data?.message || 'Auto resend failed. Trying again later.');
        setCooldown(retryAfterSec > 0 ? retryAfterSec : OTP_RESEND_SECONDS);
      } finally {
        setAutoResending(false);
      }
    };

    handleAutoResend();
  }, [otpSent, cooldown, autoResending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    setLoading(true);

    try {
      if (!otpSent) {
        if (!email.trim()) {
          setError('Please enter your email');
          return;
        }

        await requestOtp();
        return;
      }

      if (!otp.trim()) {
        setError('Please enter OTP');
        return;
      }

      if (otp.trim().length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }

      const response = await loginApi(email.trim(), otp.trim());
      loginUser(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>🌱 Carbon Credit System</h2>
        <p className="auth-subtitle">Enter email, continue, then verify OTP</p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={loading || otpSent}
            required
          />
        </div>
        
        <div className="form-group">
          <label>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
            disabled={!otpSent}
          />
        </div>
        {otpSent && (
          <>
            <p className="otp-hint">OTP sent to your email. It expires in 10 minutes.</p>
            <p className="otp-timer">
              {autoResending
                ? 'Auto resending OTP...'
                : `Auto resend in ${String(Math.floor(cooldown / 60)).padStart(2, '0')}:${String(cooldown % 60).padStart(2, '0')}`}
            </p>
          </>
        )}
        
        <button type="submit" className="btn" disabled={loading || autoResending}>
          {loading ? (otpSent ? 'Verifying OTP...' : 'Sending OTP...') : (otpSent ? 'Login' : 'Continue')}
        </button>

        {otpSent && (
          <button
            type="button"
            className="auth-secondary-btn"
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setCooldown(0);
              setAutoResending(false);
              setMessage('');
              setError('');
            }}
            disabled={loading || autoResending}
          >
            Change email
          </button>
        )}
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
