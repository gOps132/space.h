// Enhanced mock data for LibSpace

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: 'Guest' | 'Student' | 'Faculty' | 'Admin';
  account_status: 'Active' | 'Suspended' | 'Inactive';
  is_banned_until?: string | null; // For penalty system
}

export interface StudyResource {
  resource_id: string;
  resource_name: string;
  resource_type: 'Individual Seat' | 'Group Study Room';
  zone_location: string;
  current_status: 'Available' | 'Reserved' | 'Occupied' | 'Under Maintenance';
  floor: number;
  has_power_outlet?: boolean;
  capacity?: number; // For group study rooms
  is_faculty_exclusive?: boolean;
}

export interface ReservationTransaction {
  reservation_id: string;
  user_id: string;
  resource_id: string;
  start_time: string;
  end_time: string;
  booking_status: 'Pending' | 'Active' | 'Completed' | 'Cancelled' | 'No-show';
  created_at: string;
  co_bookers?: string[]; // For group study rooms (student IDs)
}

export interface AttendanceLogTransaction {
  log_id: string;
  reservation_id: string;
  actual_check_in: string | null;
  actual_check_out: string | null;
  session_notes?: string;
}

export interface OrganizationDashboard {
  dashboard_id: string;
  total_active_users: number;
  occupancy_rate: number;
  peak_time_data: { hour: string; count: number }[];
  top_performing_zone: string;
}

// Enhanced Users
export const enhancedUsers: User[] = [
  { user_id: 'U001', full_name: 'John Doe', email: 'john.doe@univ.edu', role: 'Student', account_status: 'Active' },
  { user_id: 'U002', full_name: 'Jane Smith', email: 'jane.smith@univ.edu', role: 'Student', account_status: 'Active' },
  { user_id: 'U003', full_name: 'Dr. Robert Brown', email: 'r.brown@univ.edu', role: 'Faculty', account_status: 'Active' },
  { user_id: 'U004', full_name: 'Alice Johnson', email: 'alice.j@univ.edu', role: 'Student', account_status: 'Active' },
  { user_id: 'U005', full_name: 'Bob Wilson', email: 'bob.w@univ.edu', role: 'Student', account_status: 'Active' },
  { user_id: 'U006', full_name: 'Library Admin', email: 'admin@library.univ.edu', role: 'Admin', account_status: 'Active' },
  { user_id: 'U007', full_name: 'Guest User', email: 'guest@temp.com', role: 'Guest', account_status: 'Active' },
  { user_id: 'U008', full_name: 'Prof. Sarah Lee', email: 's.lee@univ.edu', role: 'Faculty', account_status: 'Active' },
  { user_id: 'U009', full_name: 'Mike Chen', email: 'mike.c@univ.edu', role: 'Student', account_status: 'Active' },
  { user_id: 'U010', full_name: 'Emma Davis', email: 'emma.d@univ.edu', role: 'Student', account_status: 'Active' },
];

// Enhanced Study Resources
export const enhancedResources: StudyResource[] = [
  // Floor 1 - Silent Zone
  { resource_id: 'SR001', resource_name: 'Floor 1 - Desk 1', resource_type: 'Individual Seat', zone_location: 'Silent Zone', floor: 1, current_status: 'Available', has_power_outlet: true },
  { resource_id: 'SR002', resource_name: 'Floor 1 - Desk 2', resource_type: 'Individual Seat', zone_location: 'Silent Zone', floor: 1, current_status: 'Occupied', has_power_outlet: true },
  { resource_id: 'SR003', resource_name: 'Floor 1 - Desk 3', resource_type: 'Individual Seat', zone_location: 'Silent Zone', floor: 1, current_status: 'Reserved', has_power_outlet: false },
  { resource_id: 'SR004', resource_name: 'Floor 1 - Desk 4', resource_type: 'Individual Seat', zone_location: 'Silent Zone', floor: 1, current_status: 'Available', has_power_outlet: true },
  { resource_id: 'SR005', resource_name: 'Floor 1 - Desk 5', resource_type: 'Individual Seat', zone_location: 'Silent Zone', floor: 1, current_status: 'Occupied', has_power_outlet: false },
  
  // Floor 2 - Collaborative Zone
  { resource_id: 'SR006', resource_name: 'Floor 2 - Desk 10', resource_type: 'Individual Seat', zone_location: 'Collaborative Zone', floor: 2, current_status: 'Available', has_power_outlet: true },
  { resource_id: 'SR007', resource_name: 'Floor 2 - Desk 11', resource_type: 'Individual Seat', zone_location: 'Collaborative Zone', floor: 2, current_status: 'Occupied', has_power_outlet: true },
  { resource_id: 'SR008', resource_name: 'Floor 2 - Desk 12', resource_type: 'Individual Seat', zone_location: 'Collaborative Zone', floor: 2, current_status: 'Available', has_power_outlet: false },
  { resource_id: 'SR009', resource_name: 'Floor 2 - Desk 13', resource_type: 'Individual Seat', zone_location: 'Collaborative Zone', floor: 2, current_status: 'Reserved', has_power_outlet: true },
  
  // Floor 3 - Computer Lab
  { resource_id: 'SR010', resource_name: 'Floor 3 - Station 1', resource_type: 'Individual Seat', zone_location: 'Computer Lab', floor: 3, current_status: 'Occupied', has_power_outlet: true },
  { resource_id: 'SR011', resource_name: 'Floor 3 - Station 2', resource_type: 'Individual Seat', zone_location: 'Computer Lab', floor: 3, current_status: 'Available', has_power_outlet: true },
  { resource_id: 'SR012', resource_name: 'Floor 3 - Station 3', resource_type: 'Individual Seat', zone_location: 'Computer Lab', floor: 3, current_status: 'Available', has_power_outlet: true },
  
  // Group Study Rooms
  { resource_id: 'SR013', resource_name: 'Group Study Room A', resource_type: 'Group Study Room', zone_location: 'Floor 2', floor: 2, current_status: 'Available', capacity: 6, is_faculty_exclusive: false },
  { resource_id: 'SR014', resource_name: 'Group Study Room B', resource_type: 'Group Study Room', zone_location: 'Floor 2', floor: 2, current_status: 'Occupied', capacity: 8, is_faculty_exclusive: false },
  { resource_id: 'SR015', resource_name: 'Group Study Room C', resource_type: 'Group Study Room', zone_location: 'Floor 3', floor: 3, current_status: 'Available', capacity: 4, is_faculty_exclusive: false },
  
  // Faculty Exclusive Rooms
  { resource_id: 'SR016', resource_name: 'Faculty Meeting Room 1', resource_type: 'Group Study Room', zone_location: 'Floor 3', floor: 3, current_status: 'Available', capacity: 10, is_faculty_exclusive: true },
  { resource_id: 'SR017', resource_name: 'Faculty Consultation Room', resource_type: 'Group Study Room', zone_location: 'Floor 3', floor: 3, current_status: 'Reserved', capacity: 6, is_faculty_exclusive: true },
  
  // Under Maintenance
  { resource_id: 'SR018', resource_name: 'Floor 1 - Desk 6', resource_type: 'Individual Seat', zone_location: 'Silent Zone', floor: 1, current_status: 'Under Maintenance', has_power_outlet: true },
];

// Reservations
export const enhancedReservations: ReservationTransaction[] = [
  {
    reservation_id: 'RES001',
    user_id: 'U001',
    resource_id: 'SR002',
    start_time: '2026-02-27T09:00:00',
    end_time: '2026-02-27T13:00:00',
    booking_status: 'Active',
    created_at: '2026-02-27T08:00:00',
  },
  {
    reservation_id: 'RES002',
    user_id: 'U002',
    resource_id: 'SR007',
    start_time: '2026-02-27T10:00:00',
    end_time: '2026-02-27T14:00:00',
    booking_status: 'Active',
    created_at: '2026-02-27T09:00:00',
  },
  {
    reservation_id: 'RES003',
    user_id: 'U004',
    resource_id: 'SR014',
    start_time: '2026-02-27T11:00:00',
    end_time: '2026-02-27T15:00:00',
    booking_status: 'Active',
    created_at: '2026-02-27T10:00:00',
    co_bookers: ['U005', 'U009', 'U010'],
  },
  {
    reservation_id: 'RES004',
    user_id: 'U003',
    resource_id: 'SR017',
    start_time: '2026-02-27T14:00:00',
    end_time: '2026-02-27T16:00:00',
    booking_status: 'Pending',
    created_at: '2026-02-27T12:00:00',
  },
  {
    reservation_id: 'RES005',
    user_id: 'U005',
    resource_id: 'SR010',
    start_time: '2026-02-27T08:00:00',
    end_time: '2026-02-27T12:00:00',
    booking_status: 'Active',
    created_at: '2026-02-26T20:00:00',
  },
];

// Attendance Logs
export const enhancedAttendanceLogs: AttendanceLogTransaction[] = [
  {
    log_id: 'LOG001',
    reservation_id: 'RES001',
    actual_check_in: '2026-02-27T09:05:00',
    actual_check_out: null,
    session_notes: 'Studying for midterms',
  },
  {
    log_id: 'LOG002',
    reservation_id: 'RES002',
    actual_check_in: '2026-02-27T10:02:00',
    actual_check_out: null,
  },
  {
    log_id: 'LOG003',
    reservation_id: 'RES003',
    actual_check_in: '2026-02-27T11:10:00',
    actual_check_out: null,
  },
  {
    log_id: 'LOG004',
    reservation_id: 'RES005',
    actual_check_in: '2026-02-27T08:00:00',
    actual_check_out: null,
  },
];

// Dashboard Data
export const dashboardData: OrganizationDashboard = {
  dashboard_id: 'DASH001',
  total_active_users: 150,
  occupancy_rate: 68.5,
  peak_time_data: [
    { hour: '8 AM', count: 15 },
    { hour: '9 AM', count: 35 },
    { hour: '10 AM', count: 52 },
    { hour: '11 AM', count: 48 },
    { hour: '12 PM', count: 30 },
    { hour: '1 PM', count: 45 },
    { hour: '2 PM', count: 68 },
    { hour: '3 PM', count: 72 },
    { hour: '4 PM', count: 55 },
    { hour: '5 PM', count: 40 },
    { hour: '6 PM', count: 25 },
    { hour: '7 PM', count: 18 },
    { hour: '8 PM', count: 10 },
  ],
  top_performing_zone: 'Collaborative Zone',
};

// Helper function to calculate heatmap data by floor
export const getFloorHeatmap = () => {
  const floors = [1, 2, 3];
  return floors.map(floor => {
    const floorResources = enhancedResources.filter(r => r.floor === floor);
    const total = floorResources.length;
    const occupied = floorResources.filter(r => r.current_status === 'Occupied' || r.current_status === 'Reserved').length;
    const available = floorResources.filter(r => r.current_status === 'Available').length;
    const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
    
    return {
      floor,
      total,
      occupied,
      available,
      occupancyRate,
      status: occupancyRate > 80 ? 'Full' : occupancyRate > 50 ? 'Moderate' : 'Empty',
      color: occupancyRate > 80 ? 'red' : occupancyRate > 50 ? 'yellow' : 'green',
    };
  });
};
