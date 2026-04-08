import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/authApi';
import '../styles/auth.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [countryCityMap, setCountryCityMap] = useState({});
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await response.json();

        if (!response.ok || !Array.isArray(data?.data)) {
          throw new Error('Failed to load countries');
        }

        const countryList = data.data
          .map((item) => item.country)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        const map = {};
        for (const item of data.data) {
          if (!item?.country) {
            continue;
          }

          map[item.country] = Array.isArray(item.cities)
            ? [...new Set(item.cities)].filter(Boolean).sort((a, b) => a.localeCompare(b))
            : [];
        }

        setCountries(countryList);
        setCountryCityMap(map);
      } catch (err) {
        setError('Unable to load countries right now. Please refresh and try again.');
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (selectedCountry) => {
    setCountry(selectedCountry);
    setCity('');
  };

  const availableCities = country ? (countryCityMap[country] || []) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!country || !city) {
      setError('Please select your country and city');
      return;
    }

    setLoading(true);

    try {
      const response = await registerApi(name.trim(), email.trim(), country.trim(), city.trim());
      loginUser(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>🌱 Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Country</label>
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            required
            disabled={countriesLoading || loading}
          >
            <option value="">{countriesLoading ? 'Loading countries...' : 'Select country'}</option>
            {countries.map((countryName) => (
              <option key={countryName} value={countryName}>
                {countryName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={!country || loading || availableCities.length === 0}
          >
            <option value="">
              {!country
                ? 'Select country first'
                : availableCities.length === 0
                  ? 'No cities available'
                  : 'Select city'}
            </option>
            {availableCities.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
