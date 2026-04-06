import { useState } from 'react';
import { logReduction } from '../api/carbonApi';
import { useAuth } from '../context/AuthContext';
import '../styles/components.css';

const ReduceModal = ({ isOpen, onClose }) => {
  const [actionType, setActionType] = useState('solar_installation');
  const [impact, setImpact] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { updateUserBalance } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!impact || parseFloat(impact) <= 0) {
      setError('Impact must be greater than 0');
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await logReduction({
        action_type: actionType,
        impact: parseFloat(impact)
      });

      if (response && response.credits_earned !== undefined) {
        setMessage(`Great job! You earned ${response.credits_earned} carbon credits for this activity.`);
        setError('');
        if (response.new_balance !== undefined) {
          updateUserBalance(response.new_balance);
        }
        setImpact('');
        setDescription('');
      } else {
        setError('Invalid response from server');
        setMessage('');
      }
    } catch (err) {
      console.error('Log reduction error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to record reduction';
      setError(errorMessage);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setImpact('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🌿 Log Reduction Activity</h3>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Action Type</label>
            <select 
              value={actionType} 
              onChange={(e) => setActionType(e.target.value)}
            >
              <option value="solar_installation">Solar Panel Installation</option>
              <option value="tree_planting">Tree Planting</option>
              <option value="recycling">Recycling Program</option>
              <option value="energy_efficiency">Energy Efficiency Upgrade</option>
            </select>
          </div>
          <div className="form-group">
            <label>Estimated CO₂ Reduction (kg)</label>
            <input
              type="number"
              step="0.01"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="Enter CO₂ saved"
              min="0.01"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Recording...' : 'Log Activity'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default ReduceModal;
