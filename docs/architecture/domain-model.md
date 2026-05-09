# Domain Model

The MySQL schema in `backend/schema/mysql.sql` establishes the backend tables that map to the app plan.

## Tables

- `app_user`
  - users across guest, student, faculty, and admin roles
- `study_resource`
  - library seats and rooms
- `reservation`
  - booking records for seats and rooms
- `reservation_participant`
  - additional student IDs attached to a group booking
- `attendance_log`
  - check-in and check-out tracking for a reservation
- `issue_report`
  - broken desk reports and occupied-but-empty reports

## Why Keep Schema In Code

Committed SQL keeps schema changes versioned and repeatable.

That matters because:

- local environments need the same database shape
- CI needs a predictable schema
- future changes must be additive and reviewable
- database evolution should be committed like code, not applied manually

## Relationship Summary

- one `app_user` creates many `reservation` rows
- one `study_resource` can be referenced by many `reservation` rows over time
- one `reservation` can have many `reservation_participant` rows
- one `reservation` can have one `attendance_log`
- one `app_user` can create many `issue_report` rows
