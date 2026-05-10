import type {
  AttendanceLogTransaction,
  LibraryHours,
  OrganizationDashboard,
  ReservationTransaction,
  StudyResource,
} from "../data/enhancedMockData";

const API_BASE = (import.meta.env.VITE_SPACEH_API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
export const TOKEN_KEY = "spaceh.authToken";
export const USER_KEY = "spaceh.currentUser";

export interface CurrentUser {
  userId: string;
  universityId: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN" | "GUEST";
  accountStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  bannedUntil?: string | null;
}

export interface LoginResponse {
  token: string;
  user: CurrentUser;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function hasStoredSession(): boolean {
  const user = getStoredUser();
  return Boolean(getStoredToken() && user?.accountStatus === "ACTIVE");
}

export function storeSession(session: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(universityId: string, password: string): Promise<LoginResponse> {
  const session = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ universityId, password }),
  });
  storeSession(session);
  return session;
}

export async function currentUser(): Promise<CurrentUser> {
  return request<CurrentUser>("/api/auth/me", { auth: true });
}

export async function getResources(): Promise<StudyResource[]> {
  const payload = await request<{ resources: StudyResource[] }>("/api/resources");
  return payload.resources;
}

export async function getReservations(): Promise<ReservationTransaction[]> {
  const payload = await request<{ reservations: ReservationTransaction[] }>("/api/reservations", { auth: true });
  return payload.reservations;
}

export async function getAttendanceLogs(): Promise<AttendanceLogTransaction[]> {
  const payload = await request<{ attendanceLogs: AttendanceLogTransaction[] }>("/api/attendance-logs", { auth: true });
  return payload.attendanceLogs;
}

export async function getDashboard(): Promise<OrganizationDashboard> {
  const payload = await request<{ dashboard: OrganizationDashboard }>("/api/dashboard", { auth: true });
  return payload.dashboard;
}

export async function getLibraryHours(): Promise<LibraryHours> {
  const payload = await request<{ libraryHours: LibraryHours }>("/api/library-hours");
  return payload.libraryHours;
}

export async function updateLibraryHours(input: { openTime: string; closeTime: string }) {
  return request<{ message: string; libraryHours: LibraryHours }>("/api/library-hours", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export async function createReservation(input: {
  resourceId: string;
  startTime: string;
  endTime: string;
  coBookers?: string[];
}) {
  return request<{ message: string; reservationId: string }>("/api/reservations", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export async function cancelReservation(reservationId: string) {
  return request<{ message: string }>(`/api/reservations/${reservationId}/cancel`, { method: "POST", auth: true });
}

export async function checkInReservation(reservationId: string) {
  return request<{ message: string }>(`/api/reservations/${reservationId}/check-in`, { method: "POST", auth: true });
}

export async function checkOutReservation(reservationId: string) {
  return request<{ message: string }>(`/api/reservations/${reservationId}/check-out`, { method: "POST", auth: true });
}

export async function updateResourceStatus(resourceId: string, status: StudyResource["current_status"]) {
  return request<{ message: string }>(`/api/resources/${resourceId}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ status }),
  });
}

export async function createResource(input: {
  resourceName: string;
  resourceType: StudyResource["resource_type"];
  zoneLocation: string;
  floor: number;
  hasPowerOutlet?: boolean;
  capacity?: number;
  minParticipants?: number;
  isFacultyExclusive?: boolean;
}) {
  return request<{ message: string; resourceId: string }>("/api/resources", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export async function updateResource(resourceId: string, input: {
  resourceName: string;
  resourceType: StudyResource["resource_type"];
  zoneLocation: string;
  floor: number;
  hasPowerOutlet?: boolean;
  capacity?: number;
  minParticipants?: number;
  isFacultyExclusive?: boolean;
}) {
  return request<{ message: string }>(`/api/resources/${resourceId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export async function deleteResource(resourceId: string) {
  return request<{ message: string }>(`/api/resources/${resourceId}`, {
    method: "DELETE",
    auth: true,
  });
}

async function request<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Backend is unavailable.", 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    throw new ApiError(payload.message ?? "Request failed.", response.status, payload.fieldErrors);
  }

  return payload as T;
}
