import { useState } from 'react';
import { measureEmission } from '../api/carbonApi';
import { useAuth } from '../context/AuthContext';
import '../styles/components.css';

const MeasureModal = ({ isOpen, onClose }) => {
  const [activityType, setActivityType] = useState('transport');
  const [vehicleType, setVehicleType] = useState('car');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('km');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { updateUserBalance } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await measureEmission({
        activity_type: activityType,
        quantity: parseFloat(quantity),
        unit: unit,
        vehicle_type: activityType === 'transport' ? vehicleType : undefined
      });

      if (response && response.carbon_emitted !== undefined) {
        setMessage(`Emission recorded: ${response.carbon_emitted.toFixed(2)} kg CO₂. Your carbon footprint has been updated.`);
        setError('');
        if (response.new_balance !== undefined) {
          updateUserBalance(response.new_balance);
        }
        setQuantity('');
      } else {
        setError('Invalid response from server');
        setMessage('');
      }
    } catch (err) {
      console.error('Measure emission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to record emission';
      setError(errorMessage);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setQuantity('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 Measure Carbon Emissions</h3>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Activity Type</label>
            <select 
              value={activityType} 
              onChange={(e) => {
                setActivityType(e.target.value);
                // Set default unit based on activity
                if (e.target.value === 'transport') setUnit('km');
                else if (e.target.value === 'electricity') setUnit('kwh');
                else if (e.target.value === 'waste') setUnit('kg');
                else setUnit('liters');
              }}
            >
              <option value="transport">Transportation</option>
              <option value="electricity">Electricity Usage</option>
              <option value="waste">Waste Generation</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </div>
          {activityType === 'transport' && (
            <div className="form-group">
              <label>Vehicle Type (if transportation)</label>
              <select 
                value={vehicleType} 
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="car">Car</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="flight">Flight</option>
              </select>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter amount"
                min="0.01"
                required
                disabled={loading}
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
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Recording...' : 'Calculate Emissions'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default MeasureModal;
