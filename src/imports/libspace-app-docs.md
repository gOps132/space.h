1.) Identify one pain point in the university.
The Pain Point: Inefficient Library Space Utilization.
During peak periods (midterms and finals), students spend significant time wandering through different floors of the library to find an available seat or a vacant group study room. This results in wasted study time, overcrowding in certain zones while others remain underutilized, and frequent conflicts over "saved" seats (leaving a bag to claim a desk for hours).
2.) Using this pain point, identify a solution.
The Solution: LibSpace – A Real-Time Seat & Room Reservation App.
A web-based platform that allows students to view a live map of the library, check real-time availability of individual desks and group study rooms, and reserve them in advance. The system uses a Check-in/Check-out mechanism to ensure that "ghost bookings" (reserved but empty seats) are automatically released for others to use.

3.) Solution Details
3.1.) Target Users
Guest User: Can view the real-time occupancy "Heatmap" of the library but cannot make reservations.
Student User: Can search for available seats, book a slot (Transaction 1), and check in/out (Transaction 2).
Faculty User: Has priority access to reserve large Group Study Rooms for department meetings or consultations.
Admin (Library Staff): Manages the physical layout (CRUD resources), monitors usage, and handles reports of "occupied but empty" seats.
3.2.) 10 Business Rules
All users (except Guests) must authenticate using their University ID and password.
A student is limited to a maximum of one (1) active reservation at any given time to prevent hoarding.
Reservations for individual seats can be made for a maximum duration of 4 hours per session.
The system displays a dashboard to show summary of statistics of the organization, including the current total occupancy percentage, the most popular study zones, and a bar chart of peak usage hours.
If a user does not "Check-in" via the app within 15 minutes of their start time, the reservation is automatically cancelled and the seat is marked "Available."
Group Study Rooms require a minimum of 3 "Student IDs" to be entered during the booking process.
Users can cancel their reservation at least 30 minutes before the start time without penalty.
The system shall prevent any booking that overlaps with an existing approved reservation for the same resource.
Admin users have the authority to "Freeze" or mark a seat/room as "Under Maintenance," making it unavailable for booking.
A "Check-out" transaction must be completed to end a session; otherwise, the user is barred from booking for the next 24 hours (Penalty rule).

4.) Diagrams
4.1.) Entity Relationship Diagram (No FKs)
code Mermaid
downloadcontent_copy
expand_less
erDiagram
    USER {
        int user_id
        string full_name
        string email
        string role
        string account_status
    }

    STUDY_RESOURCE {
        int resource_id
        string resource_name
        string resource_type
        string zone_location
        string current_status
    }

    RESERVATION_TRANSACTION {
        int reservation_id
        datetime start_time
        datetime end_time
        string booking_status
        datetime created_at
    }

    ATTENDANCE_LOG_TRANSACTION {
        int log_id
        datetime actual_check_in
        datetime actual_check_out
        string session_notes
    }

    ORGANIZATION_DASHBOARD {
        int dashboard_id
        int total_active_users
        float occupancy_rate
        string peak_time_data
        string top_performing_zone
    }

    USER ||--o{ RESERVATION_TRANSACTION : "initiates"
    STUDY_RESOURCE ||--o{ RESERVATION_TRANSACTION : "is the subject of"
    RESERVATION_TRANSACTION ||--|| ATTENDANCE_LOG_TRANSACTION : "tracks"
4.2.) Prototype (Figma) Description of Landing Pages
A. Guest Landing Page
Header: LibSpace Logo, Login/Sign-up buttons.
Hero Section: A "Live Heatmap" of the Library floors (Green for empty, Red for full).
Call to Action: "Want to study here? Log in to reserve your spot."
Footer: Library hours and contact info.
B. Student Landing Page
Header: User Profile (Name/ID), Logout.
Main Section: "Find a Seat" Search Bar (Filters: Floor, Zone, Power Outlet availability).
Active Booking Card: If a booking exists, shows: "Your Seat: Floor 2 - Desk 42" with a large "CHECK-IN" button (Transaction 2).
Quick Actions: "View My History," "Report a Broken Desk."
C. Faculty Landing Page
Header: Faculty Portal Branding.
Main Section: "Reserve Group Study/Meeting Room" calendar view.
Priority Feature: A list of rooms exclusive to faculty for academic consultations.
Booking Summary: List of upcoming student consultations linked to room bookings.
D. Admin Landing Page (The Dashboard)
Top Row (Cards): Total Seats (500) | Currently Occupied (340) | Pending Reservations (25) | Maintenance Alerts (3).
Middle Row (Charts):
Line Graph: Traffic flow throughout the day (Peak Hours).
Pie Chart: Occupancy by Zone (Silent Zone vs. Collaborative Zone).


Bottom Row (Management): CRUD Table for Library Resources (Edit seat numbers, change room status, delete retired equipment).

CRUD & Transaction Implementation Goal:
CRUD: The Admin can Create, Read, Update, and Delete Library Resources (Seats/Rooms).
Transaction 1 (Booking): A Student creates a RESERVATION_TRANSACTION record, which updates the STUDY_RESOURCE status to "Reserved."
Transaction 2 (Check-in/Out): The system updates the RESERVATION_TRANSACTION to "Active" and creates an ATTENDANCE_LOG_TRANSACTION entry to record the exact usage time.
Dashboard: The Admin landing page pulls data from all entities to calculate the occupancy rate and peak hours.

