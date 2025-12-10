import React, { useState } from 'react';
import { Search, UserCog, Shield, Users as UsersIcon, Eye, User, Phone, Mail, Building2, UserPlus, X, Clock } from 'lucide-react';
import './Dashboard.css';

interface User {
  id: number;
  name: string;
  project: string;
  status: 'Active' | 'Inactive';
  contactNumber: string;
  email: string;
  userRole: 'Super Admin' | 'Project Admin' | 'Sales User' | 'Viewer' | 'Customer';
  languages?: string[];
}

interface HistoryEntry {
  id: number;
  date: string;
  time: string;
  projectName: string;
  action: string;
}

interface UsersProps {
  selectedProject?: string | null;
}

const Users: React.FC<UsersProps> = ({ selectedProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    userRole: '',
    contactNumber: '',
    email: '',
    status: 'Active' as 'Active' | 'Inactive',
    project: ''
  });

  // Generate initial user data
  const generateUsers = (): User[] => {
    const users: User[] = [];
    
    const projects = ['GreenX', 'Timber', 'Mountain Mist', 'Sanveda', 'All Projects'];
    const availableLanguages = ['English', 'Telugu', 'Kannada', 'Hindi', 'Tamil', 'Malayalam'];
    
    const getRandomLanguages = () => {
      const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 languages
      const shuffled = [...availableLanguages].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    const names = [
      'John Smith', 'Emily Davis', 'Michael Brown', 'Sarah Johnson', 'David Wilson',
      'Jessica Martinez', 'Robert Taylor', 'Amanda Anderson', 'Christopher Lee', 'Jennifer White',
      'Matthew Harris', 'Ashley Clark', 'Daniel Lewis', 'Stephanie Robinson', 'James Walker',
      'Michelle Hall', 'Joshua Allen', 'Kimberly Young', 'Andrew King', 'Laura Wright',
      'Ryan Lopez', 'Nicole Hill', 'Brandon Scott', 'Megan Green', 'Justin Adams',
      'Rachel Baker', 'Kevin Nelson', 'Heather Carter', 'Eric Mitchell', 'Melissa Perez'
    ];

    let id = 1;
    
    // Super Admins (2)
    for (let i = 0; i < 2; i++) {
      users.push({
        id: id++,
        name: names[i],
        project: 'All Projects',
        status: 'Active',
        contactNumber: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: names[i].toLowerCase().replace(' ', '.') + '@smartslot.com',
        userRole: 'Super Admin'
      });
    }

    // Project Admins (4)
    for (let i = 0; i < 4; i++) {
      users.push({
        id: id++,
        name: names[i + 2],
        project: projects[i % 4],
        status: i === 3 ? 'Inactive' : 'Active',
        contactNumber: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: names[i + 2].toLowerCase().replace(' ', '.') + '@smartslot.com',
        userRole: 'Project Admin'
      });
    }

    // Sales Users (8)
    for (let i = 0; i < 8; i++) {
      users.push({
        id: id++,
        name: names[i + 6],
        project: projects[i % 4],
        status: i % 5 === 0 ? 'Inactive' : 'Active',
        contactNumber: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: names[i + 6].toLowerCase().replace(' ', '.') + '@smartslot.com',
        userRole: 'Sales User'
      });
    }

    // Viewers (5)
    for (let i = 0; i < 5; i++) {
      users.push({
        id: id++,
        name: names[i + 14],
        project: projects[i % 4],
        status: i === 2 ? 'Inactive' : 'Active',
        contactNumber: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: names[i + 14].toLowerCase().replace(' ', '.') + '@smartslot.com',
        userRole: 'Viewer'
      });
    }

    // Customers (12)
    for (let i = 0; i < 12; i++) {
      users.push({
        id: id++,
        name: names[i + 18],
        project: projects[i % 4],
        status: i % 7 === 0 ? 'Inactive' : 'Active',
        contactNumber: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: names[i + 18].toLowerCase().replace(' ', '.') + '@customer.com',
        userRole: 'Customer',
        languages: getRandomLanguages()
      });
    }

    return users;
  };

  const [userList] = useState<User[]>(generateUsers());

  const projects = ['GreenX', 'Timber', 'Mountain Mist', 'Sanveda', 'All Projects'];
  const roles = ['Super Admin', 'Project Admin', 'Sales User', 'Viewer', 'Customer'];

  const handleCreateUser = () => {
    if (newUser.name && newUser.userRole && newUser.contactNumber && newUser.email && newUser.project) {
      // Here you would typically add the user to the list
      console.log('Creating user:', newUser);
      setShowCreateModal(false);
      setNewUser({
        name: '',
        userRole: '',
        contactNumber: '',
        email: '',
        status: 'Active',
        project: ''
      });
    }
  };

  // Helper function to filter users by project
  const getUsersByProject = (users: User[]) => {
    if (!selectedProject) return users;
    return users.filter(u => {
      // Super Admins are not filtered by project
      if (u.userRole === 'Super Admin') return true;
      return u.project === selectedProject || u.project === 'All Projects';
    });
  };

  // Count users by role (filtered by project if selected)
  const filteredByProject = getUsersByProject(userList);
  const superAdminCount = filteredByProject.filter(u => u.userRole === 'Super Admin').length;
  const projectAdminCount = filteredByProject.filter(u => u.userRole === 'Project Admin').length;
  const salesUserCount = filteredByProject.filter(u => u.userRole === 'Sales User').length;
  const viewerCount = filteredByProject.filter(u => u.userRole === 'Viewer').length;
  const customerCount = filteredByProject.filter(u => u.userRole === 'Customer').length;

  // Generate history for a user
  const generateHistory = (user: User): HistoryEntry[] => {
    const projects = ['GreenX', 'Timber', 'Mountain Mist', 'Sanveda'];
    const history: HistoryEntry[] = [];
    const now = new Date();
    
    // Current project assignment
    const currentDate = new Date(now);
    currentDate.setHours(9, 0, 0, 0);
    history.push({
      id: 1,
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      projectName: user.project,
      action: 'Currently assigned to project'
    });
    
    // Previous project assignment (if exists)
    if (user.project !== 'All Projects') {
      const previousDate = new Date(now);
      previousDate.setDate(previousDate.getDate() - Math.floor(Math.random() * 30 + 15)); // 15-45 days ago
      previousDate.setHours(14, 30, 0, 0);
      
      // Get a different project for previous assignment
      const previousProject = projects.filter(p => p !== user.project)[Math.floor(Math.random() * 3)];
      
      history.push({
        id: 2,
        date: previousDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: previousDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        projectName: previousProject,
        action: 'Previously assigned to project'
      });
    }
    
    return history;
  };

  const handleUserCardClick = (user: User) => {
    // Don't show history for Super Admin and Customer
    if (user.userRole === 'Super Admin' || user.userRole === 'Customer') {
      return;
    }
    setSelectedUser(user);
    setShowHistoryModal(true);
  };

  // Filter users based on search
  const filteredUsers = userList.filter(user => {
    // Filter by selected project (exclude Super Admin from project filtering)
    if (selectedProject && user.userRole !== 'Super Admin') {
      if (user.project !== selectedProject && user.project !== 'All Projects') {
        return false;
      }
    }
    
    // Filter by selected role
    if (selectedRole && user.userRole !== selectedRole) {
      return false;
    }
    
    // Filter by search query
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.project.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.contactNumber.includes(query) ||
      user.userRole.toLowerCase().includes(query)
    );
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin': return <Shield size={24} />;
      case 'Project Admin': return <UserCog size={24} />;
      case 'Sales User': return <UsersIcon size={24} />;
      case 'Viewer': return <Eye size={24} />;
      case 'Customer': return <User size={24} />;
      default: return <User size={24} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return '#dc2626';
      case 'Project Admin': return '#0b6ef6';
      case 'Sales User': return '#22c55e';
      case 'Viewer': return '#f59e0b';
      case 'Customer': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-content users-page">
      {/* Role Cards */}
      <div className="user-role-cards">
        <div 
          className={`user-role-card ${selectedRole === 'Super Admin' ? 'selected' : ''}`}
          style={{ borderLeft: `4px solid ${getRoleColor('Super Admin')}` }}
          onClick={() => setSelectedRole(selectedRole === 'Super Admin' ? null : 'Super Admin')}
        >
          <div className="role-card-content">
            <div className="role-card-label">Super Admin</div>
            <div className="role-card-count">{superAdminCount}</div>
          </div>
          <div className="role-card-icon" style={{ background: `${getRoleColor('Super Admin')}15`, color: getRoleColor('Super Admin') }}>
            <Shield size={28} />
          </div>
        </div>

        <div 
          className={`user-role-card ${selectedRole === 'Project Admin' ? 'selected' : ''}`}
          style={{ borderLeft: `4px solid ${getRoleColor('Project Admin')}` }}
          onClick={() => setSelectedRole(selectedRole === 'Project Admin' ? null : 'Project Admin')}
        >
          <div className="role-card-content">
            <div className="role-card-label">Project Admin</div>
            <div className="role-card-count">{projectAdminCount}</div>
          </div>
          <div className="role-card-icon" style={{ background: `${getRoleColor('Project Admin')}15`, color: getRoleColor('Project Admin') }}>
            <UserCog size={28} />
          </div>
        </div>

        <div 
          className={`user-role-card ${selectedRole === 'Sales User' ? 'selected' : ''}`}
          style={{ borderLeft: `4px solid ${getRoleColor('Sales User')}` }}
          onClick={() => setSelectedRole(selectedRole === 'Sales User' ? null : 'Sales User')}
        >
          <div className="role-card-content">
            <div className="role-card-label">Sales User</div>
            <div className="role-card-count">{salesUserCount}</div>
          </div>
          <div className="role-card-icon" style={{ background: `${getRoleColor('Sales User')}15`, color: getRoleColor('Sales User') }}>
            <UsersIcon size={28} />
          </div>
        </div>

        <div 
          className={`user-role-card ${selectedRole === 'Viewer' ? 'selected' : ''}`}
          style={{ borderLeft: `4px solid ${getRoleColor('Viewer')}` }}
          onClick={() => setSelectedRole(selectedRole === 'Viewer' ? null : 'Viewer')}
        >
          <div className="role-card-content">
            <div className="role-card-label">Viewer</div>
            <div className="role-card-count">{viewerCount}</div>
          </div>
          <div className="role-card-icon" style={{ background: `${getRoleColor('Viewer')}15`, color: getRoleColor('Viewer') }}>
            <Eye size={28} />
          </div>
        </div>

        <div 
          className={`user-role-card ${selectedRole === 'Customer' ? 'selected' : ''}`}
          style={{ borderLeft: `4px solid ${getRoleColor('Customer')}` }}
          onClick={() => setSelectedRole(selectedRole === 'Customer' ? null : 'Customer')}
        >
          <div className="role-card-content">
            <div className="role-card-label">Customer</div>
            <div className="role-card-count">{customerCount}</div>
          </div>
          <div className="role-card-icon" style={{ background: `${getRoleColor('Customer')}15`, color: getRoleColor('Customer') }}>
            <User size={28} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="users-search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, project, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="create-project-btn" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={20} />
          Create User
        </button>
      </div>

      {/* User Cards */}
      <div className="user-cards-container">
        {filteredUsers.map(user => (
          <div 
            key={user.id} 
            className={`user-detail-card ${user.userRole !== 'Super Admin' && user.userRole !== 'Customer' ? 'clickable' : ''}`}
            onClick={() => handleUserCardClick(user)}
          >
            <div className="user-card-header">
              <div className="user-avatar" style={{ background: getRoleColor(user.userRole) }}>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="user-card-main-info">
                <h3 className="user-card-name">{user.name}</h3>
                <div className="user-role-badge" style={{ background: `${getRoleColor(user.userRole)}15`, color: getRoleColor(user.userRole) }}>
                  {getRoleIcon(user.userRole)}
                  <span>{user.userRole}</span>
                </div>
              </div>
              <div className={`user-status-badge ${user.status.toLowerCase()}`}>
                {user.status}
              </div>
            </div>
            
            <div className="user-card-body">
              <div className="user-info-row">
                <Building2 size={18} />
                <div className="user-info-content">
                  <span className="user-info-label">Project</span>
                  <span className="user-info-value">{user.project}</span>
                </div>
              </div>

              <div className="user-info-row">
                <Phone size={18} />
                <div className="user-info-content">
                  <span className="user-info-label">Contact</span>
                  <span className="user-info-value">{user.contactNumber}</span>
                </div>
              </div>

              <div className="user-info-row">
                <Mail size={18} />
                <div className="user-info-content">
                  <span className="user-info-label">Email</span>
                  <span className="user-info-value">{user.email}</span>
                </div>
              </div>

              {user.userRole === 'Customer' && user.languages && (
                <div className="user-info-row">
                  <UsersIcon size={18} />
                  <div className="user-info-content">
                    <span className="user-info-label">Languages</span>
                    <div className="languages-tags">
                      {user.languages.map((lang, index) => (
                        <span key={index} className="language-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">
          <UsersIcon size={48} color="#cbd5e1" />
          <p>No users found</p>
          <span>Try adjusting your search query</span>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Activity History - {selectedUser.name}</h2>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="history-info-bar">
                <div className="history-user-info">
                  <div className="history-user-avatar" style={{ background: getRoleColor(selectedUser.userRole) }}>
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="history-user-name">{selectedUser.name}</div>
                    <div className="history-user-role">{selectedUser.userRole}</div>
                  </div>
                </div>
                <div className="history-user-project">
                  <Building2 size={16} />
                  <span>{selectedUser.project}</span>
                </div>
              </div>

              <div className="timeline-container">
                {generateHistory(selectedUser).map((entry, index) => (
                  <div key={entry.id} className="timeline-item">
                    <div className="timeline-marker">
                      <div className="timeline-dot"></div>
                      {index !== generateHistory(selectedUser).length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div className="timeline-date-time">
                          <Clock size={14} />
                          <span className="timeline-date">{entry.date}</span>
                          <span className="timeline-time">{entry.time}</span>
                        </div>
                        <div className="timeline-project">
                          <Building2 size={14} />
                          <span>{entry.projectName}</span>
                        </div>
                      </div>
                      <div className="timeline-action">{entry.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>User Role</label>
                <select
                  value={newUser.userRole}
                  onChange={(e) => setNewUser({ ...newUser, userRole: e.target.value })}
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  value={newUser.contactNumber}
                  onChange={(e) => setNewUser({ ...newUser, contactNumber: e.target.value })}
                  placeholder="+1 XXX-XXX-XXXX"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'Active' | 'Inactive' })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Project</label>
                <select
                  value={newUser.project}
                  onChange={(e) => setNewUser({ ...newUser, project: e.target.value })}
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateUser}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
