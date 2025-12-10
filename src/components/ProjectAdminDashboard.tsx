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
  Calendar,
  Users,
  Download,
  TrendingUp,
  FileText,
  Shield
} from 'lucide-react';
import './Dashboard.css';
import UsersList from './Users';
import Bookings from './Bookings';
import AuditLog from './AuditLog'; // Audit timeline component
import { 
  auditSlotCreate, 
  auditSlotEdit, 
  auditSlotPublish,
  auditRepAssignment,
  auditCapacityOverride
} from '../utils/auditLogger';

const ProjectAdminDashboard = () => {
  const { user, logout } = useAuth();
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

  // Reports state
  const [reportFilters, setReportFilters] = useState({
    project: '',
    fromDate: '',
    toDate: '',
    slot: '',
    salesRep: '',
    status: ''
  });
  
  const [projectList] = useState([
    {
      id: 1,
      name: 'GreenX',
      code: 'GRX-001',
      status: 'Active',
      location: 'New York, USA',
      timezone: 'EST (UTC-5)',
      projectAdmin: 'Michael Brown'
    },
    {
      id: 2,
      name: 'Timber',
      code: 'TMB-002',
      status: 'Active',
      location: 'Portland, Oregon',
      timezone: 'PST (UTC-8)',
      projectAdmin: 'Sarah Johnson'
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
        const letterCode = String.fromCharCode(65 + (day % 26));
        
        // Assign 1-3 sales users randomly
        const numUsers = (day % 3) + 1;
        const assignedUsers: string[] = [];
        for (let i = 0; i < numUsers; i++) {
          assignedUsers.push(config.salesUsers[(day + i) % config.salesUsers.length]);
        }
        
        slots.push({
          id: id++,
          projectName: project.name,
          date: dateStr,
          slotName: `${slotTime.name} ${letterCode}`,
          startTime: slotTime.start,
          endTime: slotTime.end,
          assignedSalesUser: assignedUsers,
          capacity: assignedUsers.length,
          overrideCapacity: false,
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
    assignedSalesUser: [] as string[],
    capacity: '',
    published: 'Yes',
    notes: '',
    overrideCapacity: false
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
      const salesUserStr = Array.isArray(slot.assignedSalesUser) 
        ? slot.assignedSalesUser.join(' ').toLowerCase() 
        : String(slot.assignedSalesUser).toLowerCase();
      const matchesSearch = 
        slot.projectName.toLowerCase().includes(query) ||
        slot.slotName.toLowerCase().includes(query) ||
        salesUserStr.includes(query) ||
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
        newSlot.endTime && newSlot.assignedSalesUser.length > 0 && newSlot.capacity) {
      const slot = {
        id: slotList.length + 1,
        ...newSlot,
        capacity: parseInt(newSlot.capacity)
      };
      setSlotList([...slotList, slot]);
      
      // Audit log: Slot creation
      auditSlotCreate(
        user?.name || 'Unknown',
        user?.role || 'unknown',
        slot
      );
      
      setNewSlot({
        projectName: '',
        date: '',
        slotName: '',
        startTime: '',
        endTime: '',
        assignedSalesUser: [],
        capacity: '',
        published: 'Yes',
        notes: '',
        overrideCapacity: false
      });
      setShowCreateSlotModal(false);
    }
  };

  const handleEditSlot = (slot: any) => {
    setEditingSlot({ 
      ...slot, 
      capacity: slot.capacity.toString(), 
      assignedSalesUser: Array.isArray(slot.assignedSalesUser) ? slot.assignedSalesUser : [slot.assignedSalesUser],
      overrideCapacity: slot.overrideCapacity || false
    });
    setShowEditSlotModal(true);
  };

  const handleUpdateSlot = () => {
    if (editingSlot && editingSlot.projectName && editingSlot.date && editingSlot.slotName && 
        editingSlot.startTime && editingSlot.endTime && editingSlot.assignedSalesUser.length > 0 && editingSlot.capacity) {
      
      const oldSlot = slotList.find(s => s.id === editingSlot.id);
      const updatedSlot = { ...editingSlot, capacity: parseInt(editingSlot.capacity) };
      
      setSlotList(slotList.map(s => 
        s.id === editingSlot.id ? updatedSlot : s
      ));
      
      // Audit log: Slot edit
      if (oldSlot) {
        auditSlotEdit(
          user?.name || 'Unknown',
          user?.role || 'unknown',
          editingSlot.id,
          editingSlot.projectName,
          editingSlot.slotName,
          oldSlot,
          updatedSlot
        );
        
        // Audit log: Capacity override if changed
        if (oldSlot.capacity !== updatedSlot.capacity) {
          auditCapacityOverride(
            user?.name || 'Unknown',
            user?.role || 'unknown',
            editingSlot.id,
            editingSlot.projectName,
            editingSlot.slotName,
            oldSlot.capacity,
            updatedSlot.capacity,
            editingSlot.overrideCapacity ? 'Manual override' : undefined
          );
        }
        
        // Audit log: Rep assignment if changed
        const oldRep = Array.isArray(oldSlot.assignedSalesUser) 
          ? oldSlot.assignedSalesUser[0] 
          : oldSlot.assignedSalesUser;
        const newRep = Array.isArray(updatedSlot.assignedSalesUser)
          ? updatedSlot.assignedSalesUser[0]
          : updatedSlot.assignedSalesUser;
          
        if (oldRep !== newRep) {
          auditRepAssignment(
            user?.name || 'Unknown',
            user?.role || 'unknown',
            editingSlot.id,
            editingSlot.projectName,
            editingSlot.slotName,
            newRep,
            oldRep
          );
        }
        
        // Audit log: Publish/unpublish if changed
        if (oldSlot.published !== updatedSlot.published) {
          auditSlotPublish(
            user?.name || 'Unknown',
            user?.role || 'unknown',
            editingSlot.id,
            editingSlot.projectName,
            editingSlot.slotName,
            updatedSlot.published === 'Yes'
          );
        }
      }
      
      setShowEditSlotModal(false);
      setEditingSlot(null);
    }
  };

  const toggleSalesUser = (user: string, isCreate: boolean) => {
    if (isCreate) {
      const currentUsers = newSlot.assignedSalesUser;
      let updatedUsers;
      if (currentUsers.includes(user)) {
        updatedUsers = currentUsers.filter(u => u !== user);
      } else {
        updatedUsers = [...currentUsers, user];
      }
      // Auto-calculate capacity unless override is enabled
      const newCapacity = newSlot.overrideCapacity ? newSlot.capacity : updatedUsers.length.toString();
      setNewSlot({ ...newSlot, assignedSalesUser: updatedUsers, capacity: newCapacity });
    } else {
      const currentUsers = editingSlot.assignedSalesUser;
      let updatedUsers;
      if (currentUsers.includes(user)) {
        updatedUsers = currentUsers.filter((u: string) => u !== user);
      } else {
        updatedUsers = [...currentUsers, user];
      }
      // Auto-calculate capacity unless override is enabled
      const newCapacity = editingSlot.overrideCapacity ? editingSlot.capacity : updatedUsers.length.toString();
      setEditingSlot({ ...editingSlot, assignedSalesUser: updatedUsers, capacity: newCapacity });
    }
  };

  // Reports functions
  const calculateKPIs = () => {
    // Mock data - in real app, this would calculate from actual booking data
    return {
      totalBookings: 156,
      arrivals: 142,
      completionRate: 91.2,
      noShowRate: 8.8,
      perRepLoad: 31.2,
      capacityUtilization: 78.5
    };
  };

  const handleExportCSV = () => {
    const project = reportFilters.project || selectedProject || 'AllProjects';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${project}_Report_${date}.csv`;
    console.log('Exporting CSV:', filename);
    // TODO: Implement actual CSV export
  };

  const handleExportPDF = () => {
    const project = reportFilters.project || selectedProject || 'AllProjects';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${project}_Report_${date}.pdf`;
    console.log('Exporting PDF:', filename);
    // TODO: Implement actual PDF export
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'slots', icon: CalendarClock, label: 'Slots' },
    { id: 'bookings', icon: ClipboardList, label: 'Bookings' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'audit', icon: Shield, label: 'Audit Logs' },
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
               activeMenu === 'users' ? 'Users' :
               activeMenu === 'bookings' ? 'Bookings' :
               activeMenu === 'reports' ? 'Reports' :
               activeMenu === 'audit' ? 'Audit Logs' : 'Dashboard'}
            </h1>
          </div>

          <div className="navbar-right">
            {activeMenu !== 'projects' && activeMenu !== 'users' && activeMenu !== 'dashboard' && (
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
                        <Users size={16} />
                        <span className="info-value">{project.projectAdmin}</span>
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
                                  <td className="cell-sales-user">
                                    {Array.isArray(slot.assignedSalesUser) 
                                      ? slot.assignedSalesUser.join(', ') 
                                      : slot.assignedSalesUser}
                                  </td>
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
          ) : activeMenu === 'users' ? (
            <UsersList selectedProject={selectedProject} />
          ) : activeMenu === 'bookings' ? (
            <Bookings selectedProject={selectedProject} />
          ) : activeMenu === 'audit' ? (
            <AuditLog selectedProject={selectedProject} />
          ) : activeMenu === 'reports' ? (
            <>
              <div className="reports-page">
                {/* Filters Section */}
                <div className="reports-filters-section">
                  <div className="filters-grid">
                    <div className="form-group">
                      <label className="form-label">Project</label>
                      <select
                        className="form-select"
                        value={reportFilters.project}
                        onChange={(e) => setReportFilters({ ...reportFilters, project: e.target.value })}
                      >
                        <option value="">All Projects</option>
                        {projectList.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">From Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={reportFilters.fromDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, fromDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">To Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={reportFilters.toDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, toDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Slot</label>
                      <select
                        className="form-select"
                        value={reportFilters.slot}
                        onChange={(e) => setReportFilters({ ...reportFilters, slot: e.target.value })}
                      >
                        <option value="">All Slots</option>
                        <option value="Early Bird Special">Early Bird Special</option>
                        <option value="Mid Morning Session">Mid Morning Session</option>
                        <option value="Lunch Hour Block">Lunch Hour Block</option>
                        <option value="Afternoon Peak">Afternoon Peak</option>
                        <option value="Evening Premium">Evening Premium</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Sales Rep</label>
                      <select
                        className="form-select"
                        value={reportFilters.salesRep}
                        onChange={(e) => setReportFilters({ ...reportFilters, salesRep: e.target.value })}
                      >
                        <option value="">All Sales Reps</option>
                        <option value="John Smith">John Smith</option>
                        <option value="Emily Davis">Emily Davis</option>
                        <option value="Michael Brown">Michael Brown</option>
                        <option value="Sarah Johnson">Sarah Johnson</option>
                        <option value="David Wilson">David Wilson</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={reportFilters.status}
                        onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                      >
                        <option value="">All Statuses</option>
                        <option value="Booked">Booked</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Done">Done</option>
                        <option value="No-show">No-show</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* KPIs Section */}
                <div className="kpis-section">
                  <h3 className="subsection-title">Key Performance Indicators</h3>
                  <div className="kpis-grid">
                    <div className="kpi-card">
                      <div className="kpi-icon" style={{ background: '#eff6ff', color: '#0b6ef6' }}>
                        <ClipboardList size={24} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Total Bookings</span>
                        <span className="kpi-value">{calculateKPIs().totalBookings}</span>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon" style={{ background: '#d1fae5', color: '#22c55e' }}>
                        <Users size={24} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Arrivals</span>
                        <span className="kpi-value">{calculateKPIs().arrivals}</span>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                        <TrendingUp size={24} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Completion Rate</span>
                        <span className="kpi-value">{calculateKPIs().completionRate}%</span>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                        <FileText size={24} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">No-Show Rate</span>
                        <span className="kpi-value">{calculateKPIs().noShowRate}%</span>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                        <Users size={24} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Per-Rep Load</span>
                        <span className="kpi-value">{calculateKPIs().perRepLoad}</span>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
                        <BarChart3 size={24} />
                      </div>
                      <div className="kpi-content">
                        <span className="kpi-label">Capacity Utilization</span>
                        <span className="kpi-value">{calculateKPIs().capacityUtilization}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Section */}
                <div className="export-section">
                  <h3 className="subsection-title">Export Reports</h3>
                  <div className="export-buttons">
                    <button className="export-btn csv-btn" onClick={handleExportCSV}>
                      <Download size={20} />
                      Export as CSV
                      <span className="export-filename">
                        {(reportFilters.project || selectedProject || 'AllProjects')}_Report_{new Date().toISOString().split('T')[0]}.csv
                      </span>
                    </button>
                    <button className="export-btn pdf-btn" onClick={handleExportPDF}>
                      <Download size={20} />
                      Export as PDF
                      <span className="export-filename">
                        {(reportFilters.project || selectedProject || 'AllProjects')}_Report_{new Date().toISOString().split('T')[0]}.pdf
                      </span>
                    </button>
                  </div>
                </div>
              </div>
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
                  <label>Assigned Sales Users</label>
                  <div className="multi-select-dropdown">
                    <div className="selected-users">
                      {newSlot.assignedSalesUser.length === 0 ? (
                        <span className="placeholder-text">Select Sales Users</span>
                      ) : (
                        <span>{newSlot.assignedSalesUser.join(', ')}</span>
                      )}
                    </div>
                    <div className="checkbox-list">
                      {salesUsers.map(user => (
                        <label key={user} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={newSlot.assignedSalesUser.includes(user)}
                            onChange={() => toggleSalesUser(user, true)}
                          />
                          <span>{user}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    Capacity
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={newSlot.overrideCapacity}
                        onChange={(e) => {
                          const override = e.target.checked;
                          const autoCapacity = override ? newSlot.capacity : newSlot.assignedSalesUser.length.toString();
                          setNewSlot({ ...newSlot, overrideCapacity: override, capacity: autoCapacity });
                        }}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Override</span>
                    </label>
                  </label>
                  <input
                    type="number"
                    value={newSlot.capacity}
                    onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                    placeholder="Auto-calculated"
                    min="1"
                    disabled={!newSlot.overrideCapacity}
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
                  <label>Assigned Sales Users</label>
                  <div className="multi-select-dropdown">
                    <div className="selected-users">
                      {editingSlot.assignedSalesUser.length === 0 ? (
                        <span className="placeholder-text">Select Sales Users</span>
                      ) : (
                        <span>{editingSlot.assignedSalesUser.join(', ')}</span>
                      )}
                    </div>
                    <div className="checkbox-list">
                      {salesUsers.map(user => (
                        <label key={user} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={editingSlot.assignedSalesUser.includes(user)}
                            onChange={() => toggleSalesUser(user, false)}
                          />
                          <span>{user}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    Capacity
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={editingSlot.overrideCapacity}
                        onChange={(e) => {
                          const override = e.target.checked;
                          const autoCapacity = override ? editingSlot.capacity : editingSlot.assignedSalesUser.length.toString();
                          setEditingSlot({ ...editingSlot, overrideCapacity: override, capacity: autoCapacity });
                        }}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Override</span>
                    </label>
                  </label>
                  <input
                    type="number"
                    value={editingSlot.capacity}
                    onChange={(e) => setEditingSlot({ ...editingSlot, capacity: e.target.value })}
                    placeholder="Auto-calculated"
                    min="1"
                    disabled={!editingSlot.overrideCapacity}
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
