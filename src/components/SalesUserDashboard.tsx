import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const SalesUserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Sales Dashboard</h1>
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
          <h2>Welcome, Sales User! 💼</h2>
          <p>
            Manage sales activities, customer bookings, and track your sales performance.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="number">32</div>
            <div className="label">Sales This Month</div>
          </div>
          <div className="stat-card">
            <div className="number">$45,200</div>
            <div className="label">Revenue Generated</div>
          </div>
          <div className="stat-card">
            <div className="number">18</div>
            <div className="label">Active Customers</div>
          </div>
          <div className="stat-card">
            <div className="number">94%</div>
            <div className="label">Success Rate</div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Sales Management</h3>
            <p>Create new sales, manage bookings, and process customer orders.</p>
          </div>
          <div className="feature-card">
            <h3>Customer Database</h3>
            <p>Access customer information and manage customer relationships.</p>
          </div>
          <div className="feature-card">
            <h3>Available Slots</h3>
            <p>Browse available slots across all projects for customer bookings.</p>
          </div>
          <div className="feature-card">
            <h3>Sales Pipeline</h3>
            <p>Track your sales pipeline from lead to closure.</p>
          </div>
          <div className="feature-card">
            <h3>Performance Metrics</h3>
            <p>View your sales performance metrics and achievements.</p>
          </div>
          <div className="feature-card">
            <h3>Commission Tracking</h3>
            <p>Monitor your commissions and earnings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesUserDashboard;
