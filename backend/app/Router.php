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

            if ($method === 'GET' && $path === '/api/reservations') {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }
                Response::json(['reservations' => (new DataApi($this->pdo))->reservations()]);
                return;
            }

            if ($method === 'GET' && $path === '/api/attendance-logs') {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }
                Response::json(['attendanceLogs' => (new DataApi($this->pdo))->attendanceLogs()]);
                return;
            }

            if ($method === 'GET' && $path === '/api/dashboard') {
                if ($this->requireRoles(['ADMIN']) === null) {
                    return;
                }
                Response::json(['dashboard' => (new DataApi($this->pdo))->dashboard()]);
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

}
