import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Customer Dashboard</h1>
        <div className="user-info">
          <div className="user-details">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, Customer! 🎯</h2>
          <p>
            View your bookings, browse available slots, and manage your account.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="number">5</div>
            <div className="label">My Bookings</div>
          </div>
          <div className="stat-card">
            <div className="number">2</div>
            <div className="label">Upcoming</div>
          </div>
          <div className="stat-card">
            <div className="number">3</div>
            <div className="label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="number">$12,500</div>
            <div className="label">Total Spent</div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>My Bookings</h3>
            <p>View and manage all your slot bookings in one place.</p>
          </div>
          <div className="feature-card">
            <h3>Browse Slots</h3>
            <p>Explore available slots and make new bookings.</p>
          </div>
          <div className="feature-card">
            <h3>Payment History</h3>
            <p>Review your payment history and download invoices.</p>
          </div>
          <div className="feature-card">
            <h3>Account Settings</h3>
            <p>Manage your profile, preferences, and account settings.</p>
          </div>
          <div className="feature-card">
            <h3>Support</h3>
            <p>Get help and contact customer support for assistance.</p>
          </div>
          <div className="feature-card">
            <h3>Notifications</h3>
            <p>Stay updated with booking confirmations and important updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
