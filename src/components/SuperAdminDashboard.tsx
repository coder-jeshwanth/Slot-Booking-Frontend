import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarClock, 
  ClipboardList, 
  BarChart3, 
  ShieldCheck, 
  LogOut,
  Menu,
  Building2,
  Plus,
  MapPin,
  Clock,
  Pencil,
  Search,
  Calendar
} from 'lucide-react';
import './Dashboard.css';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [projectList, setProjectList] = useState([
    {
      id: 1,
      name: 'GreenX',
      code: 'GRX-001',
      status: 'Active',
      location: 'New York, USA',
      timezone: 'EST (UTC-5)'
    },
    {
      id: 2,
      name: 'Timber',
      code: 'TMB-002',
      status: 'Active',
      location: 'Portland, Oregon',
      timezone: 'PST (UTC-8)'
    },
    {
      id: 3,
      name: 'Mountain Mist',
      code: 'MMT-003',
      status: 'Active',
      location: 'Denver, Colorado',
      timezone: 'MST (UTC-7)'
    },
    {
      id: 4,
      name: 'Sanveda',
      code: 'SNV-004',
      status: 'Active',
      location: 'Mumbai, India',
      timezone: 'IST (UTC+5:30)'
    }
  ]);
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    status: 'Active',
    location: '',
    timezone: ''
  });

  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  
  // Generate 20 slots for each project (80 total)
  const generateInitialSlots = () => {
    const slots: any[] = [];
    
    // Different configurations per project
    const projectConfigs: any = {
      'GreenX': {
        slotTimes: [
          { name: 'Early Bird', start: '07:00', end: '10:00' },
          { name: 'Mid Morning', start: '10:30', end: '13:30' },
          { name: 'Lunch Session', start: '13:00', end: '16:00' },
          { name: 'Afternoon Peak', start: '16:30', end: '19:30' },
          { name: 'Evening Special', start: '19:00', end: '22:00' }
        ],
        locations: [
          'Green Tower - Hall A', 'Green Tower - Hall B', 'Eco Wing Conference', 
          'Garden View Room', 'Rooftop Terrace', 'Executive Boardroom',
          'Innovation Lab', 'Sky Lounge', 'Atrium Space', 'Wellness Center'
        ],
        salesUsers: ['John Smith', 'Emily Davis', 'Michael Brown'],
        baseCapacity: 40,
        dateOffset: 0
      },
      'Timber': {
        slotTimes: [
          { name: 'Dawn Slot', start: '06:00', end: '09:00' },
          { name: 'Brunch Time', start: '11:00', end: '14:00' },
          { name: 'Midday Block', start: '14:30', end: '17:30' },
          { name: 'Sunset Session', start: '17:00', end: '20:00' },
          { name: 'Night View', start: '20:30', end: '23:30' }
        ],
        locations: [
          'Timber Hall Main', 'Oak Room', 'Pine Conference Suite', 
          'Cedar Meeting Space', 'Forest View Terrace', 'Woodland Pavilion',
          'Lakeside Room', 'Mountain View Hall', 'Timber Lounge', 'Nature Center'
        ],
        salesUsers: ['Sarah Johnson', 'David Wilson', 'Emily Davis'],
        baseCapacity: 25,
        dateOffset: 2
      },
      'Mountain Mist': {
        slotTimes: [
          { name: 'Sunrise Gathering', start: '05:30', end: '08:30' },
          { name: 'Peak Hours', start: '09:00', end: '12:00' },
          { name: 'Valley Session', start: '13:00', end: '16:00' },
          { name: 'Alpine Time', start: '16:00', end: '19:00' },
          { name: 'Starlight Slot', start: '20:00', end: '23:00' }
        ],
        locations: [
          'Summit Conference Hall', 'Alpine Lodge', 'Vista Point Room', 
          'Mountain Peak Terrace', 'Cloud Nine Suite', 'Highland Center',
          'Valley View Hall', 'Ridge Top Pavilion', 'Glacier Room', 'Summit Lounge'
        ],
        salesUsers: ['Michael Brown', 'John Smith', 'Sarah Johnson'],
        baseCapacity: 35,
        dateOffset: 5
      },
      'Sanveda': {
        slotTimes: [
          { name: 'Morning Wellness', start: '08:00', end: '11:00' },
          { name: 'Vitality Block', start: '11:30', end: '14:30' },
          { name: 'Energy Session', start: '15:00', end: '18:00' },
          { name: 'Harmony Hours', start: '18:00', end: '21:00' },
          { name: 'Zen Evening', start: '21:00', end: '00:00' }
        ],
        locations: [
          'Wellness Center A', 'Ayurveda Hall', 'Yoga Studio', 
          'Meditation Room', 'Herbal Garden Space', 'Holistic Suite',
          'Vitality Lounge', 'Serenity Hall', 'Balance Center', 'Harmony Pavilion'
        ],
        salesUsers: ['David Wilson', 'Emily Davis', 'John Smith'],
        baseCapacity: 30,
        dateOffset: 3
      }
    };
    
    let id = 1;
    projectList.forEach(project => {
      const config = projectConfigs[project.name];
      if (!config) return;
      
      for (let day = 0; day < 20; day++) {
        const date = new Date(2025, 11, 10 + day + config.dateOffset);
        const dateStr = date.toISOString().split('T')[0];
        const slotTime = config.slotTimes[day % config.slotTimes.length];
        const location = config.locations[day % config.locations.length];
        const salesUser = config.salesUsers[day % config.salesUsers.length];
        
        slots.push({
          id: id++,
          projectName: project.name,
          date: dateStr,
          slotName: `${slotTime.name} ${String.fromCharCode(65 + (day % 26))}`,
          startTime: slotTime.start,
          endTime: slotTime.end,
          assignedSalesUser: salesUser,
          capacity: config.baseCapacity + (day * 3) % 30,
          published: (day + id) % 4 === 0 ? 'No' : 'Yes',
          notes: location
        });
      }
    });
    return slots;
  };
  
  const [slotList, setSlotList] = useState(generateInitialSlots());
  const [newSlot, setNewSlot] = useState({
    projectName: '',
    date: '',
    slotName: '',
    startTime: '',
    endTime: '',
    assignedSalesUser: '',
    capacity: '',
    published: 'Yes',
    notes: ''
  });

  const salesUsers = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];

  const projects = projectList.map(p => p.name);
  
  // Filter slots based on selected project, search query, and date range
  const filteredSlots = slotList.filter(slot => {
    // Filter by selected project
    if (selectedProject && slot.projectName !== selectedProject) {
      return false;
    }
    
    // Filter by search query (search in project name, slot name, sales user, notes)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        slot.projectName.toLowerCase().includes(query) ||
        slot.slotName.toLowerCase().includes(query) ||
        slot.assignedSalesUser.toLowerCase().includes(query) ||
        slot.notes.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Filter by date range
    if (fromDate && slot.date < fromDate) {
      return false;
    }
    if (toDate && slot.date > toDate) {
      return false;
    }
    
    return true;
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSlots = filteredSlots.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProjectSelect = (project: string) => {
    setSelectedProject(project);
    setShowDropdown(false);
    setCurrentPage(1); // Reset to page 1 when changing projects
  };

  const handleCreateProject = () => {
    if (newProject.name && newProject.code && newProject.location && newProject.timezone) {
      const project = {
        id: projectList.length + 1,
        ...newProject
      };
      setProjectList([...projectList, project]);
      setNewProject({ name: '', code: '', status: 'Active', location: '', timezone: '' });
      setShowCreateModal(false);
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject({ ...project });
    setShowEditModal(true);
  };

  const handleUpdateProject = () => {
    if (editingProject && editingProject.name && editingProject.code && editingProject.location && editingProject.timezone) {
      setProjectList(projectList.map(p => 
        p.id === editingProject.id ? editingProject : p
      ));
      setShowEditModal(false);
      setEditingProject(null);
    }
  };

  const handleCreateSlot = () => {
    if (newSlot.projectName && newSlot.date && newSlot.slotName && newSlot.startTime && 
        newSlot.endTime && newSlot.assignedSalesUser && newSlot.capacity) {
      const slot = {
        id: slotList.length + 1,
        ...newSlot,
        capacity: parseInt(newSlot.capacity)
      };
      setSlotList([...slotList, slot]);
      setNewSlot({
        projectName: '',
        date: '',
        slotName: '',
        startTime: '',
        endTime: '',
        assignedSalesUser: '',
        capacity: '',
        published: 'Yes',
        notes: ''
      });
      setShowCreateSlotModal(false);
    }
  };

  const handleEditSlot = (slot: any) => {
    setEditingSlot({ ...slot, capacity: slot.capacity.toString() });
    setShowEditSlotModal(true);
  };

  const handleUpdateSlot = () => {
    if (editingSlot && editingSlot.projectName && editingSlot.date && editingSlot.slotName && 
        editingSlot.startTime && editingSlot.endTime && editingSlot.assignedSalesUser && editingSlot.capacity) {
      setSlotList(slotList.map(s => 
        s.id === editingSlot.id ? { ...editingSlot, capacity: parseInt(editingSlot.capacity) } : s
      ));
      setShowEditSlotModal(false);
      setEditingSlot(null);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'slots', icon: CalendarClock, label: 'Slots' },
    { id: 'bookings', icon: ClipboardList, label: 'Bookings' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'audit', icon: ShieldCheck, label: 'Audit Logs' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <Building2 className="logo-icon" size={32} />
            {sidebarOpen && <h2>Smart Slot</h2>}
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <Icon className="menu-icon" size={20} />
                {sidebarOpen && <span className="menu-label">{item.label}</span>}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="menu-item" onClick={handleLogout}>
            <LogOut className="menu-icon" size={20} />
            {sidebarOpen && <span className="menu-label">Logout</span>}
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="page-title">
              {activeMenu === 'dashboard' ? 'Dashboard' : 
               activeMenu === 'projects' ? 'Projects' :
               activeMenu === 'slots' ? 'Slots' :
               activeMenu === 'bookings' ? 'Bookings' :
               activeMenu === 'reports' ? 'Reports' :
               activeMenu === 'audit' ? 'Audit Logs' : 'Dashboard'}
            </h1>
          </div>
          
          <div className="header-right">
            {activeMenu !== 'projects' && (
              <div className="project-dropdown-container">
                <button 
                  className={`project-dropdown-trigger ${selectedProject ? 'selected' : ''}`}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {selectedProject || 'Select Project'}
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showDropdown && (
                  <div className="project-dropdown-menu">
                    {projects.map((project) => (
                      <div
                        key={project}
                        className={`project-dropdown-item ${
                          selectedProject === project ? 'active' : ''
                        }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        {project}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="dashboard-content">
          {activeMenu === 'projects' ? (
            <>
              <div className="content-actions">
                <button 
                  className="create-project-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={20} />
                  Create Project
                </button>
              </div>

              <div className="projects-grid">
                {projectList.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-card-header">
                      <h3>{project.name}</h3>
                      <div className="card-header-actions">
                        <span className={`status-badge ${project.status.toLowerCase()}`}>
                          {project.status}
                        </span>
                        <button 
                          className="edit-icon-btn"
                          onClick={() => handleEditProject(project)}
                          title="Edit Project"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="project-card-body">
                      <div className="project-info-item">
                        <span className="info-label">Code:</span>
                        <span className="info-value">{project.code}</span>
                      </div>
                      <div className="project-info-item">
                        <MapPin size={16} />
                        <span className="info-value">{project.location}</span>
                      </div>
                      <div className="project-info-item">
                        <Clock size={16} />
                        <span className="info-value">{project.timezone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeMenu === 'slots' ? (
            <>
              {!selectedProject ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Project Selected</h3>
                  <p>Please select a project from the dropdown above to view slots</p>
                </div>
              ) : (
                <>
                  <div className="filters-actions-row">
                    <div className="filters-section">
                      <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search slots by name, project, user..."
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                          className="search-input"
                        />
                      </div>
                      <div className="date-filter-wrapper">
                        <Calendar size={18} className="calendar-icon" />
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => { setFromDate(e.target.value); handleFilterChange(); }}
                          className="date-filter-input"
                          placeholder="From Date"
                        />
                        <span className="date-separator">to</span>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => { setToDate(e.target.value); handleFilterChange(); }}
                          className="date-filter-input"
                          placeholder="To Date"
                        />
                        {(fromDate || toDate) && (
                          <button 
                            className="clear-date-btn"
                            onClick={() => { setFromDate(''); setToDate(''); handleFilterChange(); }}
                            title="Clear date filters"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="primary-action-section">
                      <button 
                        className="create-project-btn"
                        onClick={() => setShowCreateSlotModal(true)}
                      >
                        <Plus size={20} />
                        Create Slot
                      </button>
                    </div>
                  </div>

                  {filteredSlots.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <h3>{slotList.length === 0 ? 'No slots created yet' : 'No slots found'}</h3>
                      <p>{slotList.length === 0 ? 'Create your first slot to get started' : 'Try adjusting your filters or search query'}</p>
                      {slotList.length === 0 && (
                        <button 
                          className="create-project-btn"
                          onClick={() => setShowCreateSlotModal(true)}
                        >
                          <Plus size={20} />
                          Create Slot
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="slot-listing-container">
                        <div className="table-wrapper">
                          <table className="data-table slots-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Slot Name</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Assigned Sales User</th>
                                <th>Capacity</th>
                                <th>Published</th>
                                <th>Notes</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedSlots.map((slot) => (
                                <tr key={slot.id}>
                                  <td className="cell-date">{slot.date}</td>
                                  <td className="cell-slot-name">{slot.slotName}</td>
                                  <td className="cell-time">{slot.startTime}</td>
                                  <td className="cell-time">{slot.endTime}</td>
                                  <td className="cell-sales-user">{slot.assignedSalesUser}</td>
                                  <td className="cell-capacity">{slot.capacity}</td>
                                  <td className="cell-published">
                                    <span className={`published-badge ${slot.published.toLowerCase()}`}>
                                      {slot.published}
                                    </span>
                                  </td>
                                  <td className="cell-notes">{slot.notes}</td>
                                  <td className="cell-actions">
                                    <button 
                                      className="action-btn edit-btn"
                                      onClick={() => handleEditSlot(slot)}
                                      title="Edit Slot"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="pagination-controls">
                        <button 
                          className="pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <div className="pagination-info">
                          Page {currentPage} of {totalPages || 1}
                        </div>
                        <button 
                          className="pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages || totalPages === 0}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="welcome-section">
                <h2>Welcome, Super Admin! 👑</h2>
                <p>
                  You have full system access. Manage all users, projects, sales, and system configurations.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="number">156</div>
                  <div className="label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="number">42</div>
                  <div className="label">Active Projects</div>
                </div>
                <div className="stat-card">
                  <div className="number">89</div>
                  <div className="label">Sales Records</div>
                </div>
                <div className="stat-card">
                  <div className="number">1,247</div>
                  <div className="label">Total Slots</div>
                </div>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <h3>User Management</h3>
                  <p>Create, edit, and manage all user accounts and permissions across the system.</p>
                </div>
                <div className="feature-card">
                  <h3>Project Oversight</h3>
                  <p>Monitor and control all projects, assign admins, and configure project settings.</p>
                </div>
                <div className="feature-card">
                  <h3>System Configuration</h3>
                  <p>Configure global settings, manage integrations, and system-wide preferences.</p>
                </div>
                <div className="feature-card">
                  <h3>Analytics & Reports</h3>
                  <p>Access comprehensive analytics and generate detailed system-wide reports.</p>
                </div>
                <div className="feature-card">
                  <h3>Sales Overview</h3>
                  <p>View all sales activities, revenue analytics, and customer management.</p>
                </div>
                <div className="feature-card">
                  <h3>Audit Logs</h3>
                  <p>Review complete system audit logs and user activity tracking.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Project Code</label>
                <input
                  type="text"
                  value={newProject.code}
                  onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                  placeholder="e.g., PRJ-005"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <input
                  type="text"
                  value={newProject.timezone}
                  onChange={(e) => setNewProject({ ...newProject, timezone: e.target.value })}
                  placeholder="e.g., PST (UTC-8)"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateProject}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingProject && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Project</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Project Code</label>
                <input
                  type="text"
                  value={editingProject.code}
                  onChange={(e) => setEditingProject({ ...editingProject, code: e.target.value })}
                  placeholder="e.g., PRJ-005"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editingProject.location}
                  onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <input
                  type="text"
                  value={editingProject.timezone}
                  onChange={(e) => setEditingProject({ ...editingProject, timezone: e.target.value })}
                  placeholder="e.g., PST (UTC-8)"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleUpdateProject}
              >
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateSlotModal && (
        <div className="modal-overlay" onClick={() => setShowCreateSlotModal(false)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Slot</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateSlotModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Project Name</label>
                  <select
                    value={newSlot.projectName}
                    onChange={(e) => setNewSlot({ ...newSlot, projectName: e.target.value })}
                  >
                    <option value="">Select Project</option>
                    {projectList.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Slot Name</label>
                <input
                  type="text"
                  value={newSlot.slotName}
                  onChange={(e) => setNewSlot({ ...newSlot, slotName: e.target.value })}
                  placeholder="Enter slot name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assigned Sales User</label>
                  <select
                    value={newSlot.assignedSalesUser}
                    onChange={(e) => setNewSlot({ ...newSlot, assignedSalesUser: e.target.value })}
                  >
                    <option value="">Select Sales User</option>
                    {salesUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={newSlot.capacity}
                    onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                    placeholder="Enter capacity"
                    min="1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Published</label>
                <select
                  value={newSlot.published}
                  onChange={(e) => setNewSlot({ ...newSlot, published: e.target.value })}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newSlot.notes}
                  onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
                  placeholder="Enter any notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateSlotModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateSlot}
              >
                Create Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditSlotModal && editingSlot && (
        <div className="modal-overlay" onClick={() => setShowEditSlotModal(false)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Slot</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditSlotModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Project Name</label>
                  <select
                    value={editingSlot.projectName}
                    onChange={(e) => setEditingSlot({ ...editingSlot, projectName: e.target.value })}
                  >
                    <option value="">Select Project</option>
                    {projectList.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editingSlot.date}
                    onChange={(e) => setEditingSlot({ ...editingSlot, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Slot Name</label>
                <input
                  type="text"
                  value={editingSlot.slotName}
                  onChange={(e) => setEditingSlot({ ...editingSlot, slotName: e.target.value })}
                  placeholder="Enter slot name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={editingSlot.startTime}
                    onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={editingSlot.endTime}
                    onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assigned Sales User</label>
                  <select
                    value={editingSlot.assignedSalesUser}
                    onChange={(e) => setEditingSlot({ ...editingSlot, assignedSalesUser: e.target.value })}
                  >
                    <option value="">Select Sales User</option>
                    {salesUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={editingSlot.capacity}
                    onChange={(e) => setEditingSlot({ ...editingSlot, capacity: e.target.value })}
                    placeholder="Enter capacity"
                    min="1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Published</label>
                <select
                  value={editingSlot.published}
                  onChange={(e) => setEditingSlot({ ...editingSlot, published: e.target.value })}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={editingSlot.notes}
                  onChange={(e) => setEditingSlot({ ...editingSlot, notes: e.target.value })}
                  placeholder="Enter any notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowEditSlotModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleUpdateSlot}
              >
                Update Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
