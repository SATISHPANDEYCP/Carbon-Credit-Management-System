import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOffsetProjects, purchaseOffset } from '../api/carbonApi';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/dashboard.css';

const OffsetProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { updateUserBalance } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getOffsetProjects();
      setProjects(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError('Failed to load offset projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedProject || !creditAmount) return;

    const credits = parseFloat(creditAmount);
    if (credits <= 0) {
      setError('Credit amount must be greater than 0');
      setMessage('');
      return;
    }

    if (credits > selectedProject.credits_available) {
      setError(`Only ${selectedProject.credits_available} credits available`);
      setMessage('');
      return;
    }

    try {
      setPurchasing(true);
      setError('');
      setMessage('');
      
      const response = await purchaseOffset({
        project_id: selectedProject._id,
        credit_amount: credits
      });
      
      setMessage(`✅ Successfully purchased ${response.credits_purchased} credits for $${response.total_cost.toFixed(2)}. Your new balance: ${response.new_balance} credits`);
      setError('');
      updateUserBalance(response.new_balance);
      setCreditAmount('');
      setSelectedProject(null);
      
      // Refresh projects to show updated available credits
      await fetchProjects();
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed. Please try again.');
      setMessage('');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <h1 className="page-title">🌳 Offset Projects</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          Purchase carbon credits from verified environmental projects
        </p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>No offset projects available at this time.</p>
          </div>
        ) : (
          <>
            <div className="projects-grid">
              {projects.map((project) => (
                <div 
                  key={project._id} 
                  className={`project-card ${selectedProject?._id === project._id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedProject(project);
                    setCreditAmount('');
                    setError('');
                    setMessage('');
                  }}
                >
                  <h3>{project.name}</h3>
                  <p className="project-location">📍 {project.location}</p>
                  <p className="project-description">{project.description}</p>
                  <p className="project-type">{project.project_type?.replace(/_/g, ' ')}</p>
                  <p className="project-price">${project.price_per_credit.toFixed(2)} per credit</p>
                  <p className="project-available">
                    {project.credits_available > 0 
                      ? `${project.credits_available.toLocaleString()} credits available` 
                      : '❌ Sold Out'}
                  </p>
                </div>
              ))}
            </div>
            
            {selectedProject && (
              <div className="purchase-form">
                <h2>Purchase Credits from {selectedProject.name}</h2>
                {selectedProject.credits_available > 0 ? (
                  <form onSubmit={handlePurchase}>
                    <div className="form-group">
                      <label>Number of Credits</label>
                      <input
                        type="number"
                        value={creditAmount}
                        onChange={(e) => {
                          setCreditAmount(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter amount"
                        min="1"
                        max={selectedProject.credits_available}
                        step="1"
                        required
                        disabled={purchasing}
                      />
                      <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                        Maximum: {selectedProject.credits_available} credits
                      </small>
                    </div>
                    
                    <div className="form-group">
                      <p className="total-cost">
                        Total Cost: ${((parseFloat(creditAmount) || 0) * selectedProject.price_per_credit).toFixed(2)}
                      </p>
                    </div>
                    
                    <button type="submit" className="btn" disabled={purchasing}>
                      {purchasing ? 'Processing...' : 'Purchase Credits'}
                    </button>
                    
                    {error && (
                      <div className="error-message" style={{ marginTop: '20px', padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', textAlign: 'center' }}>
                        {error}
                      </div>
                    )}
                    
                    {message && (
                      <div className="success-message" style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', textAlign: 'center' }}>
                        {message}
                      </div>
                    )}
                  </form>
                ) : (
                  <div>
                    <p style={{ textAlign: 'center', color: '#c62828', fontSize: '18px', marginTop: '20px' }}>
                      This project is currently sold out.
                    </p>
                    {(error || message) && (
                      <div style={{ marginTop: '20px' }}>
                        {error && (
                          <div className="error-message" style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', textAlign: 'center' }}>
                            {error}
                          </div>
                        )}
                        {message && (
                          <div className="success-message" style={{ marginTop: '10px', padding: '15px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', textAlign: 'center' }}>
                            {message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OffsetProjectsPage;
