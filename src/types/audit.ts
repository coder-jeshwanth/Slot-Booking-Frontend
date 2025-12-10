export type AuditAction = 
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

export interface AuditEntry {
  id: number;
  timestamp: string;
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

export interface AuditFilters {
  action?: AuditAction | 'all';
  performedBy?: string;
  projectName?: string;
  fromDate?: string;
  toDate?: string;
  entityType?: 'slot' | 'booking' | 'assignment' | 'all';
  searchQuery?: string;
}
