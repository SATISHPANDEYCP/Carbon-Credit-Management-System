import { useState, useEffect } from 'react';
import { getOffsetProjects, purchaseOffset } from '../api/carbonApi';
import { useAuth } from '../context/AuthContext';
import '../styles/components.css';

const OffsetModal = ({ isOpen, onClose }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { updateUserBalance } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setError('');
      const data = await getOffsetProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError('Failed to load projects. Please ensure the backend is running and database is seeded.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !creditAmount) {
      setError('Please select a project and enter credit amount');
      setMessage('');
      return;
    }

    const credits = parseInt(creditAmount);
    if (credits <= 0) {
      setError('Credit amount must be greater than 0');
      setMessage('');
      return;
    }

    const selectedProject = projects.find(p => p._id === selectedProjectId);
    if (!selectedProject) {
      setError('Selected project not found');
      setMessage('');
      return;
    }

    if (credits > selectedProject.credits_available) {
      setError(`Only ${selectedProject.credits_available} credits available`);
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await purchaseOffset({
        project_id: selectedProjectId,
        credit_amount: credits
      });

      if (response && response.credits_purchased !== undefined) {
        const totalCost = response.total_cost || (credits * selectedProject.price_per_credit);
        setMessage(`Successfully purchased ${response.credits_purchased} credits for $${Math.round(totalCost)}. Thank you for offsetting!`);
        setError('');
        if (response.new_balance !== undefined) {
          updateUserBalance(response.new_balance);
        }
        setCreditAmount('');
        // Refresh projects to update available credits
        fetchProjects();
      } else {
        setError('Invalid response from server');
        setMessage('');
      }
    } catch (err) {
      console.error('Purchase offset error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Purchase failed';
      setError(errorMessage);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setCreditAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💚 Purchase Carbon Credits</h3>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        {loadingProjects ? (
          <div style={{ padding: '25px', textAlign: 'center' }}>
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '25px' }}>
            <div className="error-message">
              No projects available. Please make sure:
              <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                <li>Backend server is running (npm run dev in backend folder)</li>
                <li>Database is seeded (npm run seed in backend folder)</li>
              </ul>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="projectSelect">Select Project</label>
              <select 
                id="projectSelect"
                value={selectedProjectId} 
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setError('');
                }}
                required
                disabled={loading}
                style={{ cursor: 'pointer' }}
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name} - ${project.price_per_credit}/credit
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="creditInput">Number of Credits</label>
              <input
                id="creditInput"
                type="number"
                value={creditAmount}
                onChange={(e) => {
                  setCreditAmount(e.target.value);
                  setError('');
                }}
                placeholder="How many credits?"
                min="1"
                step="1"
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn" disabled={loading || projects.length === 0}>
              {loading ? 'Processing...' : 'Purchase Credits'}
            </button>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default OffsetModal;
