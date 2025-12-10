# Audit System Implementation

## Overview
This document describes the comprehensive audit logging system implemented for the Smart Slot application. The audit system captures all critical operations with immutable, append-only logs.

## Features Implemented

### ✅ Audit Tracking
The system tracks the following operations with **who/when** information:

1. **Slot Operations**
   - Slot creation
   - Slot editing
   - Slot publish/unpublish
   - Capacity overrides

2. **Assignment Operations**
   - Sales representative assignment
   - Sales representative unassignment

3. **Booking Operations**
   - Booking confirmation
   - Booking rescheduling
   - Booking cancellation
   - Status changes

### ✅ Audit View with Filters
The audit log page (`/audit`) includes comprehensive filtering options:

- **Search**: Search by details, user name, project, or slot name
- **Action Type**: Filter by specific audit actions (create, edit, publish, etc.)
- **Entity Type**: Filter by slot, booking, or assignment
- **Performed By**: Filter by user name
- **Date Range**: Filter by from/to dates
- **Project**: Automatically filtered by selected project

### ✅ CSV Export
- Export audit logs to CSV format
- Includes all audit entry details (timestamp, action, performer, changes)
- Filename includes timestamp: `audit_log_YYYY-MM-DD.csv`
- Exports filtered results based on current filter settings

### ✅ Immutable Audit Entries
- **Append-only**: New entries are only added, never modified or deleted
- **Object.freeze()**: Each audit entry is frozen to prevent modification
- **Readonly Arrays**: Getter functions return readonly arrays
- **Immutable Badge**: Each entry displays an "Immutable Record" badge

## File Structure

```
src/
├── types/
│   └── audit.ts                 # Audit type definitions
├── utils/
│   └── auditLogger.ts          # Audit logging utility functions
└── components/
    ├── AuditLog.tsx            # Audit log viewer component
    └── ProjectAdminDashboard.tsx # Integrated with audit tracking
```

## Type Definitions

### AuditAction
```typescript
type AuditAction = 
  | 'slot_create'
  | 'slot_edit'
  | 'slot_publish'
  | 'slot_unpublish'
  | 'rep_assign'
  | 'rep_unassign'
  | 'capacity_override'
  | 'booking_confirm'
  | 'booking_reschedule'
  | 'booking_cancel'
  | 'status_change';
```

### AuditEntry
```typescript
interface AuditEntry {
  id: number;
  timestamp: string;              // ISO 8601 format
  action: AuditAction;
  performedBy: string;            // User name
  performedByRole: string;        // User role
  entityType: 'slot' | 'booking' | 'assignment';
  entityId: number | string;
  projectName?: string;
  slotName?: string;
  details: string;                // Human-readable description
  before?: any;                   // State before change
  after?: any;                    // State after change
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
}
```

## Audit Logging Functions

### Core Functions

#### `createAuditEntry(params)`
Creates a new immutable audit entry and appends it to the log.

**Example:**
```typescript
createAuditEntry({
  action: 'slot_create',
  performedBy: 'John Doe',
  performedByRole: 'project-admin',
  entityType: 'slot',
  entityId: 101,
  projectName: 'GreenX',
  slotName: 'Morning Session A',
  details: 'Created new slot for 2025-12-15',
  after: { date: '2025-12-15', capacity: 40 }
});
```

### Helper Functions

#### Slot Operations
- `auditSlotCreate(performedBy, performedByRole, slotData)`
- `auditSlotEdit(performedBy, performedByRole, slotId, projectName, slotName, before, after)`
- `auditSlotPublish(performedBy, performedByRole, slotId, projectName, slotName, published)`

#### Assignment Operations
- `auditRepAssignment(performedBy, performedByRole, slotId, projectName, slotName, repName, previousRep)`

#### Capacity Operations
- `auditCapacityOverride(performedBy, performedByRole, slotId, projectName, slotName, oldCapacity, newCapacity, reason)`

#### Booking Operations
- `auditBookingConfirm(performedBy, performedByRole, bookingId, projectName, slotName, customerInfo)`
- `auditBookingReschedule(performedBy, performedByRole, bookingId, projectName, oldSlotName, newSlotName, oldDate, newDate)`
- `auditBookingCancel(performedBy, performedByRole, bookingId, projectName, slotName, reason)`
- `auditStatusChange(performedBy, performedByRole, bookingId, projectName, slotName, oldStatus, newStatus)`

## Usage Examples

### 1. Tracking Slot Creation
```typescript
const handleCreateSlot = () => {
  const slot = { id: 1, projectName: 'GreenX', slotName: 'Morning A', ... };
  setSlotList([...slotList, slot]);
  
  // Create audit entry
  auditSlotCreate(user.name, user.role, slot);
};
```

### 2. Tracking Slot Edits with Multiple Changes
```typescript
const handleUpdateSlot = () => {
  const oldSlot = slotList.find(s => s.id === editingSlot.id);
  const updatedSlot = { ...editingSlot, capacity: parseInt(editingSlot.capacity) };
  
  // Track main edit
  auditSlotEdit(user.name, user.role, slot.id, slot.projectName, slot.slotName, oldSlot, updatedSlot);
  
  // Track capacity override if changed
  if (oldSlot.capacity !== updatedSlot.capacity) {
    auditCapacityOverride(user.name, user.role, slot.id, slot.projectName, slot.slotName, 
      oldSlot.capacity, updatedSlot.capacity, 'Manual override');
  }
  
  // Track rep assignment if changed
  if (oldSlot.assignedSalesUser !== updatedSlot.assignedSalesUser) {
    auditRepAssignment(user.name, user.role, slot.id, slot.projectName, slot.slotName,
      updatedSlot.assignedSalesUser, oldSlot.assignedSalesUser);
  }
};
```

### 3. Tracking Booking Operations
```typescript
// Confirm booking
auditBookingConfirm(
  user.name,
  user.role,
  'BK-2001',
  'GreenX',
  'Morning Session A',
  { name: 'Jane Doe', email: 'jane@example.com' }
);

// Reschedule booking
auditBookingReschedule(
  user.name,
  user.role,
  'BK-2001',
  'GreenX',
  'Morning Session A',
  'Afternoon Session B',
  '2025-12-15',
  '2025-12-18'
);

// Cancel booking
auditBookingCancel(
  user.name,
  user.role,
  'BK-2001',
  'GreenX',
  'Morning Session A',
  'Customer requested cancellation'
);
```

## Audit Log Component Features

### Visual Design
- **Color-coded action badges**: Each action type has a unique color
- **Timeline view**: Entries sorted by timestamp (newest first)
- **Expandable details**: Shows before/after states in formatted JSON
- **Responsive layout**: Works on desktop and mobile devices

### Filter Options
```typescript
interface AuditFilters {
  action?: AuditAction | 'all';
  performedBy?: string;
  projectName?: string;
  fromDate?: string;
  toDate?: string;
  entityType?: 'slot' | 'booking' | 'assignment' | 'all';
  searchQuery?: string;
}
```

### Export Functionality
The CSV export includes:
- Timestamp (formatted)
- Action type
- Performed by (name and role)
- Project and slot information
- Entity details
- Before/after states (as JSON)

## Security Considerations

### Immutability
1. **Object.freeze()**: All audit entries are frozen immediately after creation
2. **No delete operations**: The audit log has no delete functionality
3. **No update operations**: Existing entries cannot be modified
4. **Append-only**: New entries are only added to the end

### Production Safeguards
```typescript
export const clearAuditLog = () => {
  if (process.env.NODE_ENV === 'development') {
    // Only allowed in development
    auditLog = [];
  } else {
    throw new Error('Audit log cannot be cleared in production');
  }
};
```

## Integration with Backend (Future)

When integrating with a backend API:

```typescript
// Example backend integration
export const createAuditEntry = async (params: CreateAuditEntryParams): Promise<AuditEntry> => {
  const entry: AuditEntry = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    ...params
  };

  // Send to backend API
  await fetch('/api/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });

  return entry;
};
```

### Backend Requirements
1. **Database**: Use append-only tables with no UPDATE or DELETE permissions
2. **Retention**: Implement log retention policies (e.g., keep for 7 years)
3. **Encryption**: Encrypt sensitive data in audit logs
4. **Access Control**: Restrict audit log access to authorized users only
5. **Backup**: Regular backups of audit logs to prevent data loss

## Menu Integration

The audit log is accessible from the Project Admin Dashboard:
- Navigate to **Audit Logs** from the sidebar menu
- View all audit entries for the selected project
- Filter and export as needed

## UI/UX Features

1. **Search Bar**: Real-time search across all audit entry fields
2. **Multiple Filters**: Combine multiple filters for precise results
3. **Clear Filters Button**: Reset all filters with one click
4. **Results Counter**: Shows number of matching entries
5. **Pagination**: 20 entries per page for better performance
6. **Responsive Cards**: Each audit entry is displayed in an expandable card
7. **Before/After View**: Side-by-side comparison of changes
8. **Action Badges**: Color-coded badges for quick visual identification
9. **Timestamp Display**: Both date and time shown for each entry
10. **Immutable Badge**: Visual indicator that entries cannot be modified

## Best Practices

### When to Create Audit Entries
✅ **Always audit:**
- Data creation (slots, bookings)
- Data modifications (edits, updates)
- State changes (publish/unpublish, status changes)
- Permission changes (assignment/unassignment)
- Critical operations (capacity overrides, cancellations)

❌ **Don't audit:**
- Read operations (viewing data)
- UI interactions (clicks, navigation)
- Non-critical updates (sorting, filtering)

### Audit Entry Quality
1. **Be descriptive**: Write clear, human-readable details
2. **Include context**: Add project name, slot name, etc.
3. **Capture state**: Include before/after for modifications
4. **Add metadata**: Include reason, source, etc. when relevant

### Performance Considerations
1. **Async logging**: Don't block UI for audit logging (use background tasks)
2. **Batch operations**: Consider batching multiple audit entries
3. **Indexing**: Index timestamp, action, and entityId in database
4. **Archiving**: Archive old audit logs to separate storage

## Testing the Audit System

### Manual Testing Checklist
- [ ] Create a slot → Check audit log for slot_create entry
- [ ] Edit a slot → Check audit log for slot_edit entry
- [ ] Change capacity → Check for capacity_override entry
- [ ] Assign rep → Check for rep_assign entry
- [ ] Publish slot → Check for slot_publish entry
- [ ] Filter by action type → Verify filtering works
- [ ] Filter by date range → Verify date filtering
- [ ] Search functionality → Test search across all fields
- [ ] Export to CSV → Download and verify CSV content
- [ ] Try to modify entry in console → Should be frozen
- [ ] Pagination → Test with >20 entries

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live audit log updates
2. **Advanced Analytics**: Charts and graphs for audit data visualization
3. **Alerting**: Notify admins of suspicious activities
4. **Compliance Reports**: Generate compliance reports (SOC 2, HIPAA, etc.)
5. **Audit Trail Verification**: Cryptographic signatures for tamper-proof logs
6. **User Activity Tracking**: Track user sessions and login/logout
7. **Data Retention Policies**: Automated archiving and cleanup
8. **Full-text Search**: Elasticsearch integration for better search
9. **Audit Log API**: RESTful API for external audit log access
10. **Webhooks**: Trigger external systems on specific audit events

## Compliance

This audit system helps meet compliance requirements for:
- **SOC 2**: Security monitoring and logging
- **GDPR**: Data access and modification tracking
- **HIPAA**: Healthcare data audit trails
- **PCI DSS**: Payment card data security logging
- **ISO 27001**: Information security management

## Summary

The audit system provides:
✅ Complete who/when tracking for all critical operations  
✅ Comprehensive filtering and search capabilities  
✅ CSV export functionality  
✅ Immutable, append-only audit entries  
✅ User-friendly audit log viewer  
✅ Integration with existing application workflows  
✅ Foundation for compliance and security requirements  

All audit entries are immutable, searchable, filterable, and exportable, providing a complete audit trail for the Smart Slot application.
