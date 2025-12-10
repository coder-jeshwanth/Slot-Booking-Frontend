import { useState, useMemo } from 'react';
import { Search, Calendar, Download, Shield, User } from 'lucide-react';
import type { AuditEntry, AuditFilters, AuditAction } from '../types/audit';
import './Dashboard.css';

interface AuditLogProps {
  selectedProject: string | null;
}

const AuditLog = ({ selectedProject }: AuditLogProps) => {
  const [filters, setFilters] = useState<AuditFilters>({
    action: 'all',
    performedBy: '',
    projectName: selectedProject || '',
    fromDate: '',
    toDate: '',
    entityType: 'all',
    searchQuery: ''
  });
  const [visibleCount, setVisibleCount] = useState(6);

  // Sample audit data
  const [auditEntries] = useState<AuditEntry[]>([
    {
      id: 1,
      timestamp: '2025-12-10T10:30:00Z',
      action: 'slot_create',
      performedBy: 'Project Admin',
      performedByRole: 'project-admin',
      entityType: 'slot',
      entityId: 101,
      projectName: 'GreenX',
      slotName: 'Early Bird Special A',
      details: 'Created new slot for 2025-12-15',
      after: { date: '2025-12-15', startTime: '07:00', endTime: '10:00', capacity: 40, published: true }
    },
    {
      id: 2,
      timestamp: '2025-12-10T11:15:00Z',
      action: 'rep_assign',
      performedBy: 'Project Admin',
      performedByRole: 'project-admin',
      entityType: 'assignment',
      entityId: 102,
      projectName: 'GreenX',
      slotName: 'Early Bird Special A',
      details: 'Assigned sales representative John Smith to slot',
      before: { assignedSalesUser: null },
      after: { assignedSalesUser: 'John Smith' }
    },
    {
      id: 3,
      timestamp: '2025-12-10T12:00:00Z',
      action: 'capacity_override',
      performedBy: 'Project Admin',
      performedByRole: 'project-admin',
      entityType: 'slot',
      entityId: 101,
      projectName: 'GreenX',
      slotName: 'Early Bird Special A',
      details: 'Capacity overridden from 40 to 50',
      before: { capacity: 40 },
      after: { capacity: 50 }
    },
    {
      id: 4,
      timestamp: '2025-12-10T13:30:00Z',
      action: 'slot_publish',
      performedBy: 'Project Admin',
      performedByRole: 'project-admin',
      entityType: 'slot',
      entityId: 101,
      projectName: 'GreenX',
      slotName: 'Early Bird Special A',
      details: 'Published slot to customers',
      before: { published: false },
      after: { published: true }
    },
    {
      id: 5,
      timestamp: '2025-12-10T14:20:00Z',
      action: 'booking_confirm',
      performedBy: 'Sales User',
      performedByRole: 'sales-user',
      entityType: 'booking',
      entityId: 'BK-2001',
      projectName: 'GreenX',
      slotName: 'Early Bird Special A',
      details: 'Booking confirmed for customer John Doe',
      after: { customerName: 'John Doe', customerEmail: 'john@example.com', status: 'confirmed' }
    },
    {
      id: 6,
      timestamp: '2025-12-10T15:10:00Z',
      action: 'slot_edit',
      performedBy: 'Project Admin',
      performedByRole: 'project-admin',
      entityType: 'slot',
      entityId: 102,
      projectName: 'Timber',
      slotName: 'Dawn Sunrise Slot B',
      details: 'Updated slot time from 06:00-09:00 to 06:30-09:30',
      before: { startTime: '06:00', endTime: '09:00' },
      after: { startTime: '06:30', endTime: '09:30' }
    },
    {
      id: 7,
      timestamp: '2025-12-10T16:00:00Z',
      action: 'booking_reschedule',
      performedBy: 'Sales User',
      performedByRole: 'sales-user',
      entityType: 'booking',
      entityId: 'BK-2002',
      projectName: 'Timber',
      slotName: 'Dawn Sunrise Slot B',
      details: 'Booking rescheduled from 2025-12-15 to 2025-12-18',
      before: { date: '2025-12-15' },
      after: { date: '2025-12-18' }
    },
    {
      id: 8,
      timestamp: '2025-12-10T17:45:00Z',
      action: 'status_change',
      performedBy: 'Sales User',
      performedByRole: 'sales-user',
      entityType: 'booking',
      entityId: 'BK-2003',
      projectName: 'GreenX',
      slotName: 'Afternoon Peak D',
      details: 'Booking status changed from pending to confirmed',
      before: { status: 'pending' },
      after: { status: 'confirmed' }
    }
  ]);

  const actionLabels: Record<AuditAction, string> = {
    slot_create: 'Slot Created',
    slot_edit: 'Slot Edited',
    slot_publish: 'Slot Published',
    slot_unpublish: 'Slot Unpublished',
    rep_assign: 'Rep Assigned',
    rep_unassign: 'Rep Unassigned',
    capacity_override: 'Capacity Override',
    booking_confirm: 'Booking Confirmed',
    booking_reschedule: 'Booking Rescheduled',
    booking_cancel: 'Booking Cancelled',
    status_change: 'Status Changed'
  };

  const actionColors: Record<AuditAction, string> = {
    slot_create: '#10b981',
    slot_edit: '#3b82f6',
    slot_publish: '#8b5cf6',
    slot_unpublish: '#f59e0b',
    rep_assign: '#06b6d4',
    rep_unassign: '#ef4444',
    capacity_override: '#f59e0b',
    booking_confirm: '#10b981',
    booking_reschedule: '#3b82f6',
    booking_cancel: '#ef4444',
    status_change: '#6366f1'
  };

  const filteredEntries = useMemo(() => {
    return auditEntries.filter(entry => {
      if (selectedProject && entry.projectName !== selectedProject) return false;
      if (filters.action && filters.action !== 'all' && entry.action !== filters.action) return false;
      if (filters.performedBy && !entry.performedBy.toLowerCase().includes(filters.performedBy.toLowerCase())) return false;
      if (filters.entityType && filters.entityType !== 'all' && entry.entityType !== filters.entityType) return false;
      if (filters.fromDate && entry.timestamp < filters.fromDate) return false;
      if (filters.toDate && entry.timestamp > filters.toDate) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          entry.details.toLowerCase().includes(query) ||
          entry.slotName?.toLowerCase().includes(query) ||
          entry.projectName?.toLowerCase().includes(query) ||
          entry.performedBy.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditEntries, selectedProject, filters]);

  const visibleEntries = filteredEntries.slice(0, visibleCount);
  const hasMore = filteredEntries.length > visibleCount;

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Action', 'Performed By', 'Role', 'Project', 'Slot Name', 'Entity Type', 'Entity ID', 'Details'];
    const rows = filteredEntries.map(entry => [
      new Date(entry.timestamp).toLocaleString(),
      actionLabels[entry.action],
      entry.performedBy,
      entry.performedByRole,
      entry.projectName || '',
      entry.slotName || '',
      entry.entityType,
      entry.entityId,
      entry.details
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  return (
    <div className="audit-log-container">
      <div className="audit-filters-bar">
        <div className="filters-compact-grid">
          <div className="input-with-icon">
            <Search size={16} className="input-icon" />
            <input type="text" placeholder="Search activities..." value={filters.searchQuery} onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })} />
          </div>
          <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value as AuditAction | 'all' })}>
            <option value="all">All Actions</option>
            <option value="slot_create">Slot Created</option>
            <option value="slot_edit">Slot Edited</option>
            <option value="slot_publish">Slot Published</option>
            <option value="slot_unpublish">Slot Unpublished</option>
            <option value="rep_assign">Rep Assigned</option>
            <option value="rep_unassign">Rep Unassigned</option>
            <option value="capacity_override">Capacity Override</option>
            <option value="booking_confirm">Booking Confirmed</option>
            <option value="booking_reschedule">Booking Rescheduled</option>
            <option value="booking_cancel">Booking Cancelled</option>
            <option value="status_change">Status Changed</option>
          </select>
          <select value={filters.entityType} onChange={(e) => setFilters({ ...filters, entityType: e.target.value as any })}>
            <option value="all">All Types</option>
            <option value="slot">Slot</option>
            <option value="booking">Booking</option>
            <option value="assignment">Assignment</option>
          </select>
          <div className="input-with-icon">
            <Calendar size={16} className="input-icon" />
            <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
          </div>
          <div className="input-with-icon">
            <Calendar size={16} className="input-icon" />
            <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
          </div>
          <button className="clear-filters-btn" onClick={() => { setFilters({ action: 'all', performedBy: '', projectName: selectedProject || '', fromDate: '', toDate: '', entityType: 'all', searchQuery: '' }); setVisibleCount(6); }}>
            Clear
          </button>
          <button className="export-btn" onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="results-info">
          Showing {visibleEntries.length} of {filteredEntries.length} activities
        </div>
      </div>

      <div className="audit-timeline">
        {visibleEntries.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} className="empty-icon" />
            <h3>No Activities Found</h3>
            <p>No entries match your current filters</p>
          </div>
        ) : (
          <>
            {visibleEntries.map((entry, index) => {
              const { date, time } = formatTimestamp(entry.timestamp);
              const isLast = index === visibleEntries.length - 1;
              
              return (
                <div key={entry.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="timeline-dot" style={{ backgroundColor: actionColors[entry.action] }}></div>
                    {!isLast && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-time">
                      <div className="time-date">{date}</div>
                      <div className="time-clock">{time}</div>
                    </div>
                    <div className="timeline-card">
                      <div className="card-header">
                        <div className="action-badge" style={{ backgroundColor: actionColors[entry.action] + '20', color: actionColors[entry.action] }}>
                          {actionLabels[entry.action]}
                        </div>
                        <div className="performer-info">
                          <User size={14} />
                          <span>{entry.performedBy}</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="activity-description">{entry.details}</p>
                        {(entry.projectName || entry.slotName) && (
                          <div className="activity-meta">
                            {entry.projectName && <span className="meta-item"><strong>Project:</strong> {entry.projectName}</span>}
                            {entry.slotName && <span className="meta-item"><strong>Slot:</strong> {entry.slotName}</span>}
                          </div>
                        )}
                        {(entry.before || entry.after) && (
                          <div className="changes-display">
                            {entry.before && (
                              <div className="change-item before">
                                <span className="change-label">Before</span>
                                <div className="change-value">{JSON.stringify(entry.before, null, 2)}</div>
                              </div>
                            )}
                            {entry.after && (
                              <div className="change-item after">
                                <span className="change-label">After</span>
                                <div className="change-value">{JSON.stringify(entry.after, null, 2)}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="card-footer">
                        <span className="immutable-tag">
                          <Shield size={11} />
                          Immutable
                        </span>
                        <span className="entry-id">#{entry.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {hasMore && (
        <div className="load-more-section">
          <button className="load-more-btn" onClick={loadMore}>
            Load More Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
