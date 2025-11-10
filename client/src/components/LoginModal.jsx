import { useState } from 'react';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState('email'); // 'email', 'otp', or 'credentials'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSignupOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.sendSignupOTP(email);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(email, otp, name, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
          <p>Use your college email to continue</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="modal-form">
            <div className="form-group">
              <label>College Email</label>
              <input
                type="email"
                placeholder="yourroll@iiitdwd.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern=".*@iiitdwd\.ac\.in$"
                title="Please use your college email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button 
              type="button" 
              className="btn-link"
              onClick={() => {
                setMode('signup');
                setStep('email');
                setError('');
              }}
            >
              Don't have an account? Sign up
            </button>
          </form>
        ) : (
          <>
            {step === 'email' && (
              <form onSubmit={handleSendSignupOTP} className="modal-form">
                <div className="form-group">
                  <label>College Email</label>
                  <input
                    type="email"
                    placeholder="yourroll@iiitdwd.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    pattern=".*@iiitdwd\.ac\.in$"
                    title="Please use your college email"
                  />
                  <small>Must end with @iiitdwd.ac.in</small>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn btn-submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>

                <button 
                  type="button" 
                  className="btn-link"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Already have an account? Login
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifySignup} className="modal-form">
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    pattern="\d{6}"
                    maxLength="6"
                  />
                  <small>Check your email: {email}</small>
                </div>

                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Create Password</label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <small>At least 6 characters</small>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn btn-submit" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Complete Signup'}
                </button>

                <button 
                  type="button" 
                  className="btn-link"
                  onClick={() => {
                    setStep('email');
                    setError('');
                  }}
                >
                  Change Email
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
