import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';
import LoginModal from './LoginModal';
import UploadModal from './UploadModal';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">🏫</span>
              <span className="logo-text">College Issue Portal</span>
            </div>
          </div>

          <div className="header-right">
            {isAuthenticated ? (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowUploadModal(true)}
                >
                  + Upload Problem
                </button>
                <div className="profile-container">
                  <button 
                    className="profile-btn"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <span className="profile-icon">
                      {user?.isAdmin ? '👨‍💼' : '👤'}
                    </span>
                    <span className="profile-email">{user?.email}</span>
                  </button>
                  {showProfileMenu && (
                    <div className="profile-menu">
                      <div className="profile-info">
                        <p className="profile-name">{user?.name}</p>
                        <p className="profile-role">{user?.isAdmin ? 'Admin' : 'Student'}</p>
                      </div>
                      <button onClick={handleLogout} className="btn-logout">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
      
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </>
  );
};

export default Header;
