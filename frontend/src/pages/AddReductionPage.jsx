import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logReduction } from '../api/carbonApi';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/dashboard.css';

const AddReductionPage = () => {
  const [actionType, setActionType] = useState('solar_installation');
  const [impact, setImpact] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUserBalance } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await logReduction({
        action_type: actionType,
        impact: parseFloat(impact),
        description: description.trim()
      });

      setMessage(`Great! You earned ${response.credits_earned} credits. New balance: ${response.new_balance}`);
      updateUserBalance(response.new_balance);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to log reduction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <h1 className="page-title">🌿 Log Reduction Activity</h1>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Action Type</label>
              <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
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
                placeholder="Enter CO₂ saved in kg"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your activity"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </form>

          {message && <div className="result-message success">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default AddReductionPage;
