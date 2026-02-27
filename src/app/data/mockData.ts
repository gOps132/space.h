// Mock data for the Library Booking System

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin';
}

export interface Resource {
  resource_id: string;
  resource_name: string;
  resource_type: 'Seat' | 'Room';
  zone: string;
  status: 'Available' | 'Reserved' | 'Occupied';
}

export interface Reservation {
  reservation_id: string;
  user_id: string;
  resource_id: string;
  start_time: string;
  end_time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'No-show';
}

export interface UsageLog {
  log_id: string;
  reservation_id: string;
  user_id: string;
  resource_id: string;
  check_in_time: string;
  check_out_time: string | null;
}

// Mock Users
export const mockUsers: User[] = [
  { user_id: '1', name: 'John Doe', email: 'john@student.edu', role: 'Student' },
  { user_id: '2', name: 'Jane Smith', email: 'jane@student.edu', role: 'Student' },
  { user_id: '3', name: 'Admin User', email: 'admin@library.edu', role: 'Admin' },
  { user_id: '4', name: 'Alice Johnson', email: 'alice@student.edu', role: 'Student' },
  { user_id: '5', name: 'Bob Williams', email: 'bob@student.edu', role: 'Student' },
];

// Mock Resources
export const mockResources: Resource[] = [
  { resource_id: 'R001', resource_name: 'Quiet Zone - Seat 1', resource_type: 'Seat', zone: 'Quiet Zone', status: 'Available' },
  { resource_id: 'R002', resource_name: 'Quiet Zone - Seat 2', resource_type: 'Seat', zone: 'Quiet Zone', status: 'Occupied' },
  { resource_id: 'R003', resource_name: 'Quiet Zone - Seat 3', resource_type: 'Seat', zone: 'Quiet Zone', status: 'Reserved' },
  { resource_id: 'R004', resource_name: 'Quiet Zone - Seat 4', resource_type: 'Seat', zone: 'Quiet Zone', status: 'Available' },
  { resource_id: 'R005', resource_name: 'Group Study - Seat 1', resource_type: 'Seat', zone: 'Group Study', status: 'Occupied' },
  { resource_id: 'R006', resource_name: 'Group Study - Seat 2', resource_type: 'Seat', zone: 'Group Study', status: 'Occupied' },
  { resource_id: 'R007', resource_name: 'Group Study - Seat 3', resource_type: 'Seat', zone: 'Group Study', status: 'Available' },
  { resource_id: 'R008', resource_name: 'Group Study - Seat 4', resource_type: 'Seat', zone: 'Group Study', status: 'Reserved' },
  { resource_id: 'R009', resource_name: 'Study Room A', resource_type: 'Room', zone: 'Private Rooms', status: 'Available' },
  { resource_id: 'R010', resource_name: 'Study Room B', resource_type: 'Room', zone: 'Private Rooms', status: 'Occupied' },
  { resource_id: 'R011', resource_name: 'Computer Zone - Seat 1', resource_type: 'Seat', zone: 'Computer Zone', status: 'Available' },
  { resource_id: 'R012', resource_name: 'Computer Zone - Seat 2', resource_type: 'Seat', zone: 'Computer Zone', status: 'Occupied' },
];

// Mock Reservations
export const mockReservations: Reservation[] = [
  {
    reservation_id: 'RES001',
    user_id: '1',
    resource_id: 'R002',
    start_time: '2026-02-27T09:00:00',
    end_time: '2026-02-27T11:00:00',
    status: 'Confirmed'
  },
  {
    reservation_id: 'RES002',
    user_id: '2',
    resource_id: 'R005',
    start_time: '2026-02-27T10:00:00',
    end_time: '2026-02-27T12:00:00',
    status: 'Confirmed'
  },
  {
    reservation_id: 'RES003',
    user_id: '4',
    resource_id: 'R006',
    start_time: '2026-02-27T08:00:00',
    end_time: '2026-02-27T10:00:00',
    status: 'Confirmed'
  },
  {
    reservation_id: 'RES004',
    user_id: '1',
    resource_id: 'R003',
    start_time: '2026-02-27T14:00:00',
    end_time: '2026-02-27T16:00:00',
    status: 'Pending'
  },
  {
    reservation_id: 'RES005',
    user_id: '5',
    resource_id: 'R008',
    start_time: '2026-02-27T13:00:00',
    end_time: '2026-02-27T15:00:00',
    status: 'No-show'
  },
  {
    reservation_id: 'RES006',
    user_id: '2',
    resource_id: 'R010',
    start_time: '2026-02-27T11:00:00',
    end_time: '2026-02-27T13:00:00',
    status: 'Confirmed'
  },
  {
    reservation_id: 'RES007',
    user_id: '4',
    resource_id: 'R012',
    start_time: '2026-02-27T15:00:00',
    end_time: '2026-02-27T17:00:00',
    status: 'Confirmed'
  },
];

// Mock Usage Logs
export const mockUsageLogs: UsageLog[] = [
  {
    log_id: 'LOG001',
    reservation_id: 'RES001',
    user_id: '1',
    resource_id: 'R002',
    check_in_time: '2026-02-27T09:05:00',
    check_out_time: null
  },
  {
    log_id: 'LOG002',
    reservation_id: 'RES002',
    user_id: '2',
    resource_id: 'R005',
    check_in_time: '2026-02-27T10:00:00',
    check_out_time: null
  },
  {
    log_id: 'LOG003',
    reservation_id: 'RES003',
    user_id: '4',
    resource_id: 'R006',
    check_in_time: '2026-02-27T08:00:00',
    check_out_time: null
  },
  {
    log_id: 'LOG004',
    reservation_id: 'RES006',
    user_id: '2',
    resource_id: 'R010',
    check_in_time: '2026-02-27T11:10:00',
    check_out_time: null
  },
  {
    log_id: 'LOG005',
    reservation_id: 'RES007',
    user_id: '4',
    resource_id: 'R012',
    check_in_time: '2026-02-27T15:00:00',
    check_out_time: null
  },
];

// Peak usage data (hourly reservations count)
export const peakUsageData = [
  { hour: '8 AM', count: 3 },
  { hour: '9 AM', count: 5 },
  { hour: '10 AM', count: 8 },
  { hour: '11 AM', count: 6 },
  { hour: '12 PM', count: 4 },
  { hour: '1 PM', count: 7 },
  { hour: '2 PM', count: 9 },
  { hour: '3 PM', count: 10 },
  { hour: '4 PM', count: 7 },
  { hour: '5 PM', count: 5 },
  { hour: '6 PM', count: 3 },
];
