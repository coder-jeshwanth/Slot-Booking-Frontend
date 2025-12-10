import type { AuditEntry, AuditAction } from '../types/audit';

// In-memory audit log storage (in real app, this would be in a database)
let auditLog: AuditEntry[] = [];
let nextId = 1;

interface CreateAuditEntryParams {
  action: AuditAction;
  performedBy: string;
  performedByRole: string;
  entityType: 'slot' | 'booking' | 'assignment';
  entityId: number | string;
  projectName?: string;
  slotName?: string;
  details: string;
  before?: any;
  after?: any;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

/**
 * Creates an immutable audit log entry
 * @param params - Audit entry parameters
 * @returns The created audit entry
 */
export const createAuditEntry = (params: CreateAuditEntryParams): AuditEntry => {
  const entry: AuditEntry = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    ...params
  };

  // Make entry immutable by freezing it
  Object.freeze(entry);
  
  // Append-only: add to the end of the log
  auditLog.push(entry);

  // In a real application, this would be sent to the backend API
  // Example: await fetch('/api/audit-logs', { method: 'POST', body: JSON.stringify(entry) });
  
  console.log('[AUDIT]', entry.action, entry.details);
  
  return entry;
};

/**
 * Get all audit log entries (read-only)
 * @returns Array of audit entries
 */
export const getAuditLog = (): readonly AuditEntry[] => {
  return Object.freeze([...auditLog]);
};

/**
 * Get audit log entries filtered by criteria
 * @param filters - Filter criteria
 * @returns Filtered audit entries
 */
export const getFilteredAuditLog = (filters: {
  action?: AuditAction;
  performedBy?: string;
  projectName?: string;
  entityType?: 'slot' | 'booking' | 'assignment';
  fromDate?: string;
  toDate?: string;
}): readonly AuditEntry[] => {
  let filtered = [...auditLog];

  if (filters.action) {
    filtered = filtered.filter(entry => entry.action === filters.action);
  }

  if (filters.performedBy) {
    filtered = filtered.filter(entry => 
      entry.performedBy.toLowerCase().includes(filters.performedBy!.toLowerCase())
    );
  }

  if (filters.projectName) {
    filtered = filtered.filter(entry => entry.projectName === filters.projectName);
  }

  if (filters.entityType) {
    filtered = filtered.filter(entry => entry.entityType === filters.entityType);
  }

  if (filters.fromDate) {
    filtered = filtered.filter(entry => entry.timestamp >= filters.fromDate!);
  }

  if (filters.toDate) {
    filtered = filtered.filter(entry => entry.timestamp <= filters.toDate!);
  }

  return Object.freeze(filtered);
};

/**
 * Clear audit log (for development/testing only - should never be used in production)
 */
export const clearAuditLog = () => {
  // Only allow in development mode
  if (import.meta.env.DEV) {
    auditLog = [];
    nextId = 1;
    console.warn('[AUDIT] Audit log cleared (development mode only)');
  } else {
    throw new Error('Audit log cannot be cleared in production');
  }
};

// Audit logging helper functions for common operations

export const auditSlotCreate = (
  performedBy: string,
  performedByRole: string,
  slotData: any
) => {
  return createAuditEntry({
    action: 'slot_create',
    performedBy,
    performedByRole,
    entityType: 'slot',
    entityId: slotData.id,
    projectName: slotData.projectName,
    slotName: slotData.slotName,
    details: `Created new slot "${slotData.slotName}" for ${slotData.date}`,
    after: slotData
  });
};

export const auditSlotEdit = (
  performedBy: string,
  performedByRole: string,
  slotId: number | string,
  projectName: string,
  slotName: string,
  before: any,
  after: any
) => {
  const changes: string[] = [];
  
  if (before.date !== after.date) changes.push(`date from ${before.date} to ${after.date}`);
  if (before.startTime !== after.startTime) changes.push(`start time from ${before.startTime} to ${after.startTime}`);
  if (before.endTime !== after.endTime) changes.push(`end time from ${before.endTime} to ${after.endTime}`);
  if (before.capacity !== after.capacity) changes.push(`capacity from ${before.capacity} to ${after.capacity}`);
  if (before.notes !== after.notes) changes.push('notes');

  return createAuditEntry({
    action: 'slot_edit',
    performedBy,
    performedByRole,
    entityType: 'slot',
    entityId: slotId,
    projectName,
    slotName,
    details: `Updated slot: ${changes.join(', ')}`,
    before,
    after
  });
};

export const auditSlotPublish = (
  performedBy: string,
  performedByRole: string,
  slotId: number | string,
  projectName: string,
  slotName: string,
  published: boolean
) => {
  return createAuditEntry({
    action: published ? 'slot_publish' : 'slot_unpublish',
    performedBy,
    performedByRole,
    entityType: 'slot',
    entityId: slotId,
    projectName,
    slotName,
    details: published ? `Published slot "${slotName}"` : `Unpublished slot "${slotName}"`,
    before: { published: !published },
    after: { published }
  });
};

export const auditRepAssignment = (
  performedBy: string,
  performedByRole: string,
  slotId: number | string,
  projectName: string,
  slotName: string,
  repName: string | null,
  previousRep?: string | null
) => {
  return createAuditEntry({
    action: repName ? 'rep_assign' : 'rep_unassign',
    performedBy,
    performedByRole,
    entityType: 'assignment',
    entityId: slotId,
    projectName,
    slotName,
    details: repName 
      ? `Assigned sales representative "${repName}" to slot`
      : `Unassigned sales representative "${previousRep}" from slot`,
    before: { assignedSalesUser: previousRep },
    after: { assignedSalesUser: repName }
  });
};

export const auditCapacityOverride = (
  performedBy: string,
  performedByRole: string,
  slotId: number | string,
  projectName: string,
  slotName: string,
  oldCapacity: number,
  newCapacity: number,
  reason?: string
) => {
  return createAuditEntry({
    action: 'capacity_override',
    performedBy,
    performedByRole,
    entityType: 'slot',
    entityId: slotId,
    projectName,
    slotName,
    details: `Capacity overridden from ${oldCapacity} to ${newCapacity}${reason ? ` - ${reason}` : ''}`,
    before: { capacity: oldCapacity },
    after: { capacity: newCapacity, reason }
  });
};

export const auditBookingConfirm = (
  performedBy: string,
  performedByRole: string,
  bookingId: string,
  projectName: string,
  slotName: string,
  customerInfo: any
) => {
  return createAuditEntry({
    action: 'booking_confirm',
    performedBy,
    performedByRole,
    entityType: 'booking',
    entityId: bookingId,
    projectName,
    slotName,
    details: `Booking confirmed for customer ${customerInfo.name}`,
    after: {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      status: 'confirmed'
    }
  });
};

export const auditBookingReschedule = (
  performedBy: string,
  performedByRole: string,
  bookingId: string,
  projectName: string,
  oldSlotName: string,
  newSlotName: string,
  oldDate: string,
  newDate: string
) => {
  return createAuditEntry({
    action: 'booking_reschedule',
    performedBy,
    performedByRole,
    entityType: 'booking',
    entityId: bookingId,
    projectName,
    slotName: newSlotName,
    details: `Booking rescheduled from ${oldDate} (${oldSlotName}) to ${newDate} (${newSlotName})`,
    before: { date: oldDate, slotName: oldSlotName },
    after: { date: newDate, slotName: newSlotName }
  });
};

export const auditBookingCancel = (
  performedBy: string,
  performedByRole: string,
  bookingId: string,
  projectName: string,
  slotName: string,
  reason?: string
) => {
  return createAuditEntry({
    action: 'booking_cancel',
    performedBy,
    performedByRole,
    entityType: 'booking',
    entityId: bookingId,
    projectName,
    slotName,
    details: `Booking cancelled${reason ? ` - ${reason}` : ''}`,
    before: { status: 'confirmed' },
    after: { status: 'cancelled', cancelledAt: new Date().toISOString(), reason }
  });
};

export const auditStatusChange = (
  performedBy: string,
  performedByRole: string,
  bookingId: string,
  projectName: string,
  slotName: string,
  oldStatus: string,
  newStatus: string
) => {
  return createAuditEntry({
    action: 'status_change',
    performedBy,
    performedByRole,
    entityType: 'booking',
    entityId: bookingId,
    projectName,
    slotName,
    details: `Booking status changed from ${oldStatus} to ${newStatus}`,
    before: { status: oldStatus },
    after: { status: newStatus }
  });
};
