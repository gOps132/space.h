<?php

declare(strict_types=1);

namespace Spaceh;

use PDO;
use Throwable;

final class Router
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function dispatch(string $method, string $path): void
    {
        try {
            SeedData::ensure($this->pdo);

            if ($method === 'GET' && $path === '/api/public/health') {
                Response::json(['service' => 'spaceh-backend', 'status' => 'UP']);
                return;
            }

            if ($method === 'POST' && $path === '/api/auth/login') {
                $body = json_decode(file_get_contents('php://input') ?: '{}', true);
                if (!is_array($body)) {
                    Response::json(['message' => 'Malformed JSON request body.'], 400);
                    return;
                }

                $result = (new AuthService($this->pdo, new JwtService()))->login($body);
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'GET' && $path === '/api/auth/me') {
                $user = $this->authenticatedUser();
                if ($user === null) {
                    Response::json(['message' => 'Unauthorized.'], 401);
                    return;
                }

                Response::json($user);
                return;
            }

            if ($method === 'GET' && $path === '/api/resources') {
                Response::json(['resources' => (new DataApi($this->pdo))->resources()]);
                return;
            }

            if ($method === 'GET' && $path === '/api/library-hours') {
                Response::json(['libraryHours' => (new LibraryHoursService($this->pdo))->get()]);
                return;
            }

            if ($method === 'GET' && $path === '/api/reservations') {
                $user = $this->requireRoles(['STUDENT', 'FACULTY', 'ADMIN']);
                if ($user === null) {
                    return;
                }
                Response::json(['reservations' => (new DataApi($this->pdo))->reservations($user)]);
                return;
            }

            if ($method === 'GET' && $path === '/api/attendance-logs') {
                $user = $this->requireRoles(['STUDENT', 'FACULTY', 'ADMIN']);
                if ($user === null) {
                    return;
                }
                Response::json(['attendanceLogs' => (new DataApi($this->pdo))->attendanceLogs($user)]);
                return;
            }

            if ($method === 'GET' && $path === '/api/dashboard') {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }
                Response::json(['dashboard' => (new DataApi($this->pdo))->dashboard()]);
                return;
            }

            if ($method === 'POST' && $path === '/api/reservations') {
                $user = $this->requireRoles(['STUDENT', 'FACULTY', 'ADMIN']);
                if ($user === null) {
                    return;
                }

                $result = (new ReservationService($this->pdo))->create($user, $this->jsonBody());
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/reservations/(RES\d+|\d+)/cancel$#', $path, $matches)) {
                $user = $this->requireRoles(['STUDENT', 'FACULTY', 'ADMIN']);
                if ($user === null) {
                    return;
                }

                $result = (new ReservationService($this->pdo))->cancel($user, $matches[1]);
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/reservations/(RES\d+|\d+)/check-in$#', $path, $matches)) {
                $user = $this->requireRoles(['STUDENT', 'FACULTY', 'ADMIN']);
                if ($user === null) {
                    return;
                }

                $result = (new ReservationService($this->pdo))->checkIn($user, $matches[1]);
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/reservations/(RES\d+|\d+)/check-out$#', $path, $matches)) {
                $user = $this->requireRoles(['STUDENT', 'FACULTY', 'ADMIN']);
                if ($user === null) {
                    return;
                }

                $result = (new ReservationService($this->pdo))->checkOut($user, $matches[1]);
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'POST' && $path === '/api/resources') {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }

                $result = (new ResourceService($this->pdo))->create($this->jsonBody());
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/resources/(SR\d+|\d+)$#', $path, $matches)) {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }

                $result = (new ResourceService($this->pdo))->update($matches[1], $this->jsonBody());
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/resources/(SR\d+|\d+)/status$#', $path, $matches)) {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }

                $result = (new ResourceService($this->pdo))->updateStatus($matches[1], $this->jsonBody());
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'PATCH' && $path === '/api/library-hours') {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }

                $result = (new LibraryHoursService($this->pdo))->update($this->jsonBody());
                Response::json($result['body'], $result['status']);
                return;
            }

            if ($method === 'DELETE' && preg_match('#^/api/resources/(SR\d+|\d+)$#', $path, $matches)) {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }

                $result = (new ResourceService($this->pdo))->delete($matches[1]);
                Response::json($result['body'], $result['status']);
                return;
            }

            Response::json(['message' => 'Not found.'], 404);
        } catch (Throwable $exception) {
            Response::json([
                'message' => 'Internal server error.',
                'detail' => getenv('SPACEH_DEBUG') ? $exception->getMessage() : null,
            ], 500);
        }
    }

    private function requireRoles(array $roles): ?array
    {
        $user = $this->authenticatedUser();
        if ($user === null) {
            Response::json(['message' => 'Unauthorized.'], 401);
            return null;
        }

        if (!in_array($user['role'], $roles, true)) {
            Response::json(['message' => 'Forbidden.'], 403);
            return null;
        }

        return $user;
    }

    private function authenticatedUser(): ?array
    {
        return (new AuthService($this->pdo, new JwtService()))->currentUserFromBearer($this->authorizationHeader());
    }

    private function authorizationHeader(): ?string
    {
        return $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    }

    private function jsonBody(): array
    {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        return is_array($body) ? $body : [];
    }

}
