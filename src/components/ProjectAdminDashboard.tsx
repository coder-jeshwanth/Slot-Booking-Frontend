import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarClock, 
  ClipboardList, 
  BarChart3, 
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

const ProjectAdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [projectList] = useState([
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
    }
  ]);

  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  
  // Generate 20 slots for each project with unique data
  const generateInitialSlots = () => {
    const slots: any[] = [];
    
    const projectConfigs: any = {
      'GreenX': {
        slotTimes: [
          { name: 'Early Bird Special', start: '07:00', end: '10:00' },
          { name: 'Mid Morning Session', start: '10:30', end: '13:30' },
          { name: 'Lunch Hour Block', start: '13:00', end: '16:00' },
          { name: 'Afternoon Peak', start: '16:30', end: '19:30' },
          { name: 'Evening Premium', start: '19:00', end: '22:00' }
        ],
        locations: [
          'Green Tower - Hall A', 'Green Tower - Hall B', 'Eco Wing Conference Center', 
          'Garden View Executive Room', 'Rooftop Terrace Suite', 'Executive Boardroom Level 5',
          'Innovation Lab - West Wing', 'Sky Lounge Premium', 'Atrium Central Space', 'Wellness Center East'
        ],
        salesUsers: ['John Smith', 'Emily Davis', 'Michael Brown'],
        baseCapacity: 40,
        dateOffset: 0
      },
      'Timber': {
        slotTimes: [
          { name: 'Dawn Sunrise Slot', start: '06:00', end: '09:00' },
          { name: 'Brunch Experience', start: '11:00', end: '14:00' },
          { name: 'Midday Prime Block', start: '14:30', end: '17:30' },
          { name: 'Sunset View Session', start: '17:00', end: '20:00' },
          { name: 'Night Vista Hours', start: '20:30', end: '23:30' }
        ],
        locations: [
          'Timber Hall - Main Floor', 'Oak Room Premium', 'Pine Conference Suite A', 
          'Cedar Executive Meeting Space', 'Forest View Terrace', 'Woodland Pavilion Center',
          'Lakeside Conference Room', 'Mountain View Hall West', 'Timber Executive Lounge', 'Nature Center Plaza'
        ],
        salesUsers: ['Sarah Johnson', 'David Wilson', 'Emily Davis'],
        baseCapacity: 25,
        dateOffset: 2
      }
    };
    
    const projects = [
      { name: 'GreenX' },
      { name: 'Timber' }
    ];
    
    let id = 1;
    projects.forEach(project => {
      const config = projectConfigs[project.name];
      if (!config) return;
      
      for (let day = 0; day < 20; day++) {
        const date = new Date(2025, 11, 10 + day + config.dateOffset);
        const dateStr = date.toISOString().split('T')[0];
        const slotTime = config.slotTimes[day % config.slotTimes.length];
        const location = config.locations[day % config.locations.length];
        const salesUser = config.salesUsers[day % config.salesUsers.length];
        const letterCode = String.fromCharCode(65 + (day % 26));
        
        slots.push({
          id: id++,
          projectName: project.name,
          date: dateStr,
          slotName: `${slotTime.name} ${letterCode}`,
          startTime: slotTime.start,
          endTime: slotTime.end,
          assignedSalesUser: salesUser,
          capacity: config.baseCapacity + (day * 3) % 30,
          published: (day + id) % 4 === 0 ? 'No' : 'Yes',
          notes: location
        });
      }
    });
    
    console.log('Generated slots:', slots.length, 'slots for', projects.length, 'projects');
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
    if (selectedProject && slot.projectName !== selectedProject) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        slot.projectName.toLowerCase().includes(query) ||
        slot.slotName.toLowerCase().includes(query) ||
        slot.assignedSalesUser.toLowerCase().includes(query) ||
        slot.notes.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
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
    setCurrentPage(1);
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
  ];

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <Building2 size={32} className="logo-icon" />
            {sidebarOpen && <h2>Smart Slot</h2>}
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <item.icon size={22} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="menu-item logout-item" onClick={handleLogout}>
            <LogOut size={22} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-navbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={24} />
          </button>
          
          <div className="navbar-left">
            <h1 className="page-title">
              {activeMenu === 'dashboard' ? 'Dashboard' :
               activeMenu === 'projects' ? 'Projects' :
               activeMenu === 'slots' ? 'Slots' :
               activeMenu === 'bookings' ? 'Bookings' :
               activeMenu === 'reports' ? 'Reports' : 'Dashboard'}
            </h1>
          </div>

          <div className="navbar-right">
            {activeMenu !== 'projects' && (
              <div className="project-selector">
                <button 
                  className="project-dropdown-btn"
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
                        className={`dropdown-item ${selectedProject === project ? 'selected' : ''}`}
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

        <div className="content-area">
          {activeMenu === 'projects' ? (
            <>
              <div className="projects-header">
                <h2 className="section-title"><strong>My Projects</strong></h2>
              </div>
              <div className="projects-grid">
                {projectList.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-card-header">
                      <h3>{project.name}</h3>
                      <div className="card-header-right">
                        <span className={`status-badge ${project.status.toLowerCase()}`}>
                          {project.status}
                        </span>
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
                <h2>Welcome, Project Admin! 🏗️</h2>
                <p>
                  Manage your assigned projects, team members, and project-specific settings.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="number">2</div>
                  <div className="label">My Projects</div>
                </div>
                <div className="stat-card">
                  <div className="number">24</div>
                  <div className="label">Team Members</div>
                </div>
                <div className="stat-card">
                  <div className="number">40</div>
                  <div className="label">Project Slots</div>
                </div>
                <div className="stat-card">
                  <div className="number">18</div>
                  <div className="label">Active Sales</div>
                </div>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <h3>Project Management</h3>
                  <p>Create and manage slots, configure project settings, and track progress.</p>
                </div>
                <div className="feature-card">
                  <h3>Team Management</h3>
                  <p>Manage project team members, assign roles, and control permissions.</p>
                </div>
                <div className="feature-card">
                  <h3>Slot Configuration</h3>
                  <p>Configure slot availability, pricing, and booking parameters.</p>
                </div>
                <div className="feature-card">
                  <h3>Sales Tracking</h3>
                  <p>Monitor sales activities and revenue for your projects.</p>
                </div>
                <div className="feature-card">
                  <h3>Reports</h3>
                  <p>Generate project-specific reports and analytics.</p>
                </div>
                <div className="feature-card">
                  <h3>Customer Relations</h3>
                  <p>View and manage customer interactions for your projects.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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

export default ProjectAdminDashboard;
