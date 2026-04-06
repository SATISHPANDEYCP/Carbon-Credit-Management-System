import { useState } from 'react';
import { shareCredits } from '../api/carbonApi';
import { useAuth } from '../context/AuthContext';
import '../styles/components.css';

const ShareModal = ({ isOpen, onClose }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, updateUserBalance } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientEmail || !creditAmount) {
      setError('Please enter recipient email and credit amount');
      setMessage('');
      return;
    }

    const credits = parseInt(creditAmount);
    if (credits <= 0) {
      setError('Credit amount must be greater than 0');
      setMessage('');
      return;
    }

    if (credits > user.carbon_balance) {
      setError(`Insufficient credits. Your balance: ${user.carbon_balance}`);
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await shareCredits({
        recipient_email: recipientEmail,
        credit_amount: credits,
        message: messageText
      });

      if (response && response.credits_shared !== undefined) {
        setMessage(`Successfully shared ${response.credits_shared} credits with ${recipientEmail}!`);
        setError('');
        if (response.new_balance !== undefined) {
          updateUserBalance(response.new_balance);
        }
        setRecipientEmail('');
        setCreditAmount('');
        setMessageText('');
      } else {
        setError('Invalid response from server');
        setMessage('');
      }
    } catch (err) {
      console.error('Share credits error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to share credits';
      setError(errorMessage);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setRecipientEmail('');
    setCreditAmount('');
    setMessageText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🤝 Share Carbon Credits</h3>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Number of Credits</label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="Credits to share"
              min="1"
              max={user?.carbon_balance || 0}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Message (Optional)</label>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Add a message"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing...' : 'Transfer Credits'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
