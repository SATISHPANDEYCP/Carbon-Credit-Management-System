import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { measureEmission } from '../api/carbonApi';
import Header from '../components/Header';
import '../styles/dashboard.css';

const AddActivityPage = () => {
  const [activityType, setActivityType] = useState('transport');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('km');
  const [vehicleType, setVehicleType] = useState('car');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = {
        activity_type: activityType,
        quantity: parseFloat(quantity),
        unit,
        description: description.trim()
      };

      if (activityType === 'transport') {
        data.vehicle_type = vehicleType;
      }

      const response = await measureEmission(data);
      setMessage(`Emission recorded: ${response.co2_generated} kg CO₂`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to record emission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <h1 className="page-title">📊 Measure Carbon Emissions</h1>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Activity Type</label>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                <option value="transport">Transportation</option>
                <option value="electricity">Electricity Usage</option>
                <option value="waste">Waste Generation</option>
                <option value="manufacturing">Manufacturing</option>
              </select>
            </div>

            {activityType === 'transport' && (
              <div className="form-group">
                <label>Vehicle Type</label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                  <option value="car">Car</option>
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                  <option value="flight">Flight</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="km">Kilometers</option>
                <option value="kwh">kWh</option>
                <option value="kg">Kilograms</option>
                <option value="liters">Liters</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Recording...' : 'Calculate Emissions'}
            </button>
          </form>

          {message && <div className="result-message">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default AddActivityPage;
