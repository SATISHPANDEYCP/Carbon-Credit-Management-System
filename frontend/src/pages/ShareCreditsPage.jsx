import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shareCredits } from '../api/carbonApi';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/dashboard.css';

const ShareCreditsPage = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [message, setMessage] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUserBalance } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage('');

    if (parseFloat(creditAmount) > user.carbon_balance) {
      setResultMessage('Insufficient credits');
      setLoading(false);
      return;
    }

    try {
      // Trim recipient email before sending
      const response = await shareCredits({
        recipient_email: recipientEmail.trim(),
        credit_amount: parseFloat(creditAmount),
        message: message.trim()
      });

      setResultMessage(`Successfully shared ${response.credits_shared} credits with ${recipientEmail}`);
      updateUserBalance(response.new_balance);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setResultMessage(err.response?.data?.message || 'Failed to share credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <h1 className="page-title">🤝 Share Carbon Credits</h1>
        
        <div className="form-container">
          <div className="balance-info">
            <p>Your Current Balance: <strong>{user?.carbon_balance || 0} credits</strong></p>
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
              />
            </div>

            <div className="form-group">
              <label>Number of Credits</label>
              <input
                type="number"
                step="0.01"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Credits to share"
                max={user?.carbon_balance}
                required
              />
            </div>

            <div className="form-group">
              <label>Message (Optional)</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Transferring...' : 'Transfer Credits'}
            </button>
          </form>

          {resultMessage && <div className="result-message">{resultMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default ShareCreditsPage;
