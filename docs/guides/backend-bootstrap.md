# Backend Bootstrap Notes

This project now includes a Spring Boot backend under `backend/`.

## What Exists Right Now

- `SpacehApplication`
  - the backend entry point
  - starts the Spring application context
- `SecurityConfig`
  - defines the HTTP security rules
  - public routes under `/api/public/**` and `/api/auth/login` are open
  - everything else requires a valid JWT bearer token
- `PublicHealthController`
  - a simple public endpoint used to verify that the app boots and serves HTTP responses
- `AuthController`
  - exposes `POST /api/auth/login` and `GET /api/auth/me`
- `AuthService`
  - handles credential verification and token issuing
- `JwtAuthenticationFilter`
  - reads bearer tokens from incoming requests and restores the authenticated user
- `SpacehApplicationTests`
  - proves the Spring context loads
  - proves the public health endpoint responds successfully
- `AuthIntegrationTest`
  - proves login validation, invalid-credential handling, token issuing, and `/me`

## Why Start This Small

The first goal is not business features yet. It is to establish a reliable backend foundation:

- build tool
- dependency management
- application startup
- HTTP routing
- security defaults
- repeatable tests

Once those are stable, we can add the real domain slices:

- auth
- users
- resources
- reservations
- attendance
- reports
- dashboard

## Spring Fundamentals in This Scaffold

### `@SpringBootApplication`

This tells Spring Boot to:

- start the application
- auto-configure common infrastructure
- scan the package tree for Spring-managed classes

Because the main class is in `com.spaceh`, Spring will also find subpackages like `com.spaceh.config` and `com.spaceh.health`.

### `@Configuration`

Marks a class that defines beans for the application context.

In this project, `SecurityConfig` is a configuration class because it provides the `SecurityFilterChain` bean.

### `@Bean`

A bean is an object managed by Spring's dependency injection container.

When `securityFilterChain(...)` is marked with `@Bean`, Spring creates it at startup and uses it to secure requests.

### `@RestController`

Marks a class as a web controller whose methods return response bodies directly.

This is why `PublicHealthController` can return a `Map` and Spring automatically serializes it as JSON.

### `@RequestMapping` and `@GetMapping`

These map Java methods to HTTP routes.

- class-level `@RequestMapping("/api/public/health")`
- method-level `@GetMapping`

Together they create `GET /api/public/health`.

### `@SpringBootTest`

Starts the real Spring application context during tests.

This is heavier than a small unit test, but it is the right first test because it proves the backend actually boots.

### `@Entity`

An entity is a Java class that maps to a database table.

Examples now in the project:

- `AppUser -> app_user`
- `StudyResource -> study_resource`
- `Reservation -> reservation`

The annotations on each field tell JPA how Java properties line up with table columns.

### `JpaRepository`

Repository interfaces give you common persistence operations without writing SQL by hand.

For example, `AppUserRepository extends JpaRepository<AppUser, Long>` gives you methods like:

- `save(...)`
- `findById(...)`
- `findAll(...)`
- `deleteById(...)`

This is one of the core productivity features of Spring Data JPA.

## Current Limitations

- the JWT secret still defaults to a development value unless overridden by environment variables
- there is no refresh-token flow yet
- there is no university-side ID verification yet, only format validation
- role-based route restrictions beyond basic authentication still need to be added as we build the feature slices

These are expected for the current stage.

## Authentication Fundamentals

### `PasswordEncoder`

Spring Security never compares raw passwords directly. It delegates that job to a `PasswordEncoder`.

In this project we use `BCryptPasswordEncoder`, which means:

- passwords are stored as hashes, not plain text
- login works by hashing the submitted password and comparing it safely
- the same raw password will not always produce the same stored hash because BCrypt uses salt

This is why the auth tests seed users by calling `passwordEncoder.encode(...)` before saving them.

### `UserDetailsService`

Spring Security needs a way to load a user record during login. `AppUserDetailsService` is that bridge.

Its job is simple:

- receive the username value used for login
- find the matching `AppUser`
- wrap it in `AppUserPrincipal`

In this backend, the "username" is actually the university ID.

### `UserDetails`

`AppUserPrincipal` adapts your `AppUser` entity into the shape Spring Security expects.

That wrapper tells Spring:

- what the login identifier is
- what hashed password to compare
- what authorities the user has
- whether the account is enabled

This adapter pattern is common in Spring projects because your database model rarely matches `UserDetails` exactly.

### `AuthenticationManager`

The `AuthenticationManager` is the component that answers one core question:

"Are these credentials valid?"

When `AuthService` calls:

- `authenticationManager.authenticate(...)`

Spring forwards the request to the configured authentication provider, which:

- uses `AppUserDetailsService` to load the user
- uses `PasswordEncoder` to compare the password
- returns an authenticated principal if everything matches

### JWT in This Project

After a successful login, the backend creates a JSON Web Token instead of creating a server-side session.

That means:

- the backend stays stateless
- the frontend stores the token and sends it on later requests
- every protected request can be authenticated independently

The flow is:

1. `POST /api/auth/login`
2. `AuthService` authenticates the university ID and password
3. `JwtService` creates a signed token
4. the frontend sends `Authorization: Bearer <token>`
5. `JwtAuthenticationFilter` validates the token and restores the authenticated user
6. controllers can access that user with `@AuthenticationPrincipal`

### Request Validation

`LoginRequest` uses Bean Validation annotations to reject malformed payloads before the service layer runs.

For university IDs we currently enforce only the format:

- `XX-XXXX`
- `XX-XXXX-XX`

where each `X` must be a digit.

That is why invalid payloads return `400 Bad Request` with field-level validation messages.
