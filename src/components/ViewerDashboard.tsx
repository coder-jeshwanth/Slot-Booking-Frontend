import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ViewerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Viewer Dashboard</h1>
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
          <h2>Welcome, Viewer! 👁️</h2>
          <p>
            You have read-only access to view projects, slots, and reports.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="number">42</div>
            <div className="label">Total Projects</div>
          </div>
          <div className="stat-card">
            <div className="number">1,247</div>
            <div className="label">Total Slots</div>
          </div>
          <div className="stat-card">
            <div className="number">856</div>
            <div className="label">Booked Slots</div>
          </div>
          <div className="stat-card">
            <div className="number">391</div>
            <div className="label">Available Slots</div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>View Projects</h3>
            <p>Browse and view all projects and their details (read-only access).</p>
          </div>
          <div className="feature-card">
            <h3>View Slots</h3>
            <p>Check slot availability, pricing, and booking status across projects.</p>
          </div>
          <div className="feature-card">
            <h3>View Reports</h3>
            <p>Access and view various reports and analytics dashboards.</p>
          </div>
          <div className="feature-card">
            <h3>View Sales Data</h3>
            <p>Review sales information and customer booking details.</p>
          </div>
          <div className="feature-card">
            <h3>Export Data</h3>
            <p>Export reports and data for offline analysis and review.</p>
          </div>
          <div className="feature-card">
            <h3>Search & Filter</h3>
            <p>Use advanced search and filtering to find specific information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
