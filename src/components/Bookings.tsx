import React, { useState } from 'react';
import { Search, Calendar, Edit2, X } from 'lucide-react';
import './Dashboard.css';

interface Booking {
  id: number;
  projectName: string;
  slotName: string;
  customerName: string;
  contact: string;
  email: string;
  status: 'Booked' | 'Arrived' | 'Done' | 'No-show' | 'Cancelled';
  assignedSalesRep: string;
  date: string;
  time: string;
}

interface BookingsProps {
  selectedProject?: string | null;
}

const Bookings: React.FC<BookingsProps> = ({ selectedProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    slotName: '',
    customerName: '',
    contact: '',
    email: '',
    status: 'Booked' as 'Booked' | 'Arrived' | 'Done' | 'No-show' | 'Cancelled',
    assignedSalesRep: '',
    date: '',
    time: ''
  });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      slotName: booking.slotName,
      customerName: booking.customerName,
      contact: booking.contact,
      email: booking.email,
      status: booking.status,
      assignedSalesRep: booking.assignedSalesRep,
      date: booking.date,
      time: booking.time
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingBooking(null);
  };

  const handleSaveBooking = () => {
    console.log('Save booking:', editingBooking?.id, formData);
    // TODO: Update booking in state
    handleCloseModal();
  };

  // Generate initial bookings data
  const generateBookings = (): Booking[] => {
    const bookings: Booking[] = [];
    const projects = ['GreenX', 'Timber', 'Mountain Mist', 'Sanveda'];
    const slots = [
      'Early Bird A', 'Morning Session B', 'Lunch Block C', 'Afternoon D', 'Evening E',
      'Dawn Slot F', 'Midday G', 'Sunset H', 'Night View I', 'Premium J'
    ];
    const customers = [
      'Robert Johnson', 'Maria Garcia', 'James Wilson', 'Patricia Martinez', 'Michael Anderson',
      'Linda Thomas', 'David Jackson', 'Barbara White', 'Richard Harris', 'Susan Martin',
      'Joseph Thompson', 'Jessica Moore', 'Thomas Taylor', 'Sarah Anderson', 'Charles Jackson',
      'Karen Thomas', 'Christopher Lee', 'Nancy Lewis', 'Daniel Walker', 'Lisa Hall',
      'Matthew Allen', 'Betty Young', 'Anthony King', 'Sandra Wright', 'Mark Lopez',
      'Ashley Hill', 'Donald Scott', 'Kimberly Green', 'Paul Adams', 'Emily Baker'
    ];
    const salesReps = [
      'John Smith', 'Emily Davis', 'Michael Brown', 'Sarah Johnson', 'David Wilson'
    ];
    const statuses: Array<'Booked' | 'Arrived' | 'Done' | 'No-show' | 'Cancelled'> = [
      'Booked', 'Arrived', 'Done', 'No-show', 'Cancelled'
    ];
    const times = [
      '09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '04:00 PM',
      '06:00 PM', '08:00 PM', '11:00 AM', '01:00 PM', '03:30 PM'
    ];

    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days
      
      bookings.push({
        id: i + 1,
        projectName: projects[i % projects.length],
        slotName: slots[i % slots.length],
        customerName: customers[i % customers.length],
        contact: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: customers[i % customers.length].toLowerCase().replace(' ', '.') + '@example.com',
        status: statuses[i % statuses.length],
        assignedSalesRep: salesReps[i % salesReps.length],
        date: date.toISOString().split('T')[0],
        time: times[i % times.length]
      });
    }

    return bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const [bookingList] = useState<Booking[]>(generateBookings());

  // Filter bookings
  const filteredBookings = bookingList.filter(booking => {
    // Filter by selected project
    if (selectedProject && booking.projectName !== selectedProject) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        booking.projectName.toLowerCase().includes(query) ||
        booking.slotName.toLowerCase().includes(query) ||
        booking.customerName.toLowerCase().includes(query) ||
        booking.contact.includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.assignedSalesRep.toLowerCase().includes(query) ||
        booking.status.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter by date range
    if (fromDate && booking.date < fromDate) {
      return false;
    }
    if (toDate && booking.date > toDate) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Booked': return '#0b6ef6';
      case 'Arrived': return '#8b5cf6';
      case 'Done': return '#22c55e';
      case 'No-show': return '#f59e0b';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-content bookings-page">
      {/* Filters Section */}
      <div className="filters-actions-row">
        <div className="filters-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="date-range-filter">
            <div className="date-input-group">
              <Calendar size={16} className="date-icon" />
              <input
                type="date"
                className="date-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From"
              />
            </div>
            <span className="date-separator">to</span>
            <div className="date-input-group">
              <Calendar size={16} className="date-icon" />
              <input
                type="date"
                className="date-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="slot-listing-container">
        <div className="table-wrapper">
          <table className="data-table slots-table">
            <thead>
              <tr>
                <th>Slot Name</th>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Status</th>
                <th>Assigned Sales Rep</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map(booking => (
                  <tr key={booking.id}>
                    <td className="cell-slot-name">{booking.slotName}</td>
                    <td className="cell-customer-name">{booking.customerName}</td>
                    <td className="cell-contact">{booking.contact}</td>
                    <td className="cell-email">{booking.email}</td>
                    <td className="cell-status">
                      <span 
                        className="status-badge-booking"
                        style={{ 
                          background: `${getStatusColor(booking.status)}15`,
                          color: getStatusColor(booking.status)
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="cell-sales-user">{booking.assignedSalesRep}</td>
                    <td className="cell-date">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="cell-time">{booking.time}</td>
                    <td className="cell-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(booking)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="no-data-row">
                    No bookings found
                  </td>
                </tr>
              )}
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

      {/* Edit Booking Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Booking</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Slot Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.slotName}
                    onChange={e => setFormData({ ...formData, slotName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Booked' | 'Arrived' | 'Done' | 'No-show' | 'Cancelled' })}
                  >
                    <option value="Booked">Booked</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Done">Done</option>
                    <option value="No-show">No-show</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Sales Rep</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.assignedSalesRep}
                    onChange={e => setFormData({ ...formData, assignedSalesRep: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 09:00 AM"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveBooking}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
