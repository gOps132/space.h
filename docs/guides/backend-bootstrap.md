# Backend Bootstrap Notes

This project now includes a minimal Spring Boot backend under `backend/`.

## What Exists Right Now

- `SpacehApplication`
  - the backend entry point
  - starts the Spring application context
- `SecurityConfig`
  - defines the initial HTTP security rules
  - public routes under `/api/public/**` are open
  - everything else requires authentication
- `PublicHealthController`
  - a simple public endpoint used to verify that the app boots and serves HTTP responses
- `SpacehApplicationTests`
  - proves the Spring context loads
  - proves the public health endpoint responds successfully

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

## Current Limitations

- security still uses Spring's generated development password
- there are no real domain entities yet
- there is no database schema yet
- there is no JWT auth yet

These are expected for the current bootstrap stage.
