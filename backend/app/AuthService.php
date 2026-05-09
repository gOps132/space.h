<?php

declare(strict_types=1);

namespace Spaceh;

use PDO;

final class AuthService
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly JwtService $jwtService,
    ) {
    }

    public function login(array $body): array
    {
        $universityId = trim((string) ($body['universityId'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if (!preg_match('/^\d{2}-\d{4}(-\d{2})?$/', $universityId)) {
            return [
                'status' => 400,
                'body' => [
                    'message' => 'Validation failed.',
                    'fieldErrors' => [
                        'universityId' => 'University ID must match XX-XXXX or XX-XXXX-XX.',
                    ],
                ],
            ];
        }

        $user = $this->findUser($universityId);
        if ($user === null || !password_verify($password, $user['password_hash'])) {
            return [
                'status' => 401,
                'body' => ['message' => 'Invalid university ID or password.'],
            ];
        }

        if ($user['account_status'] !== 'ACTIVE') {
            return [
                'status' => 403,
                'body' => ['message' => 'Account is not active.'],
            ];
        }

        return [
            'status' => 200,
            'body' => [
                'token' => $this->jwtService->issue($user['university_id'], ['role' => $user['role']]),
                'user' => self::publicUser($user),
            ],
        ];
    }

    public function currentUserFromBearer(?string $header): ?array
    {
        if ($header === null || !str_starts_with($header, 'Bearer ')) {
            return null;
        }

        $claims = $this->jwtService->verify(substr($header, 7));
        if ($claims === null) {
            return null;
        }

        $user = $this->findUser((string) $claims['sub']);
        return $user === null ? null : self::publicUser($user);
    }

    private function findUser(string $universityId): ?array
    {
        $statement = $this->pdo->prepare(
            'select id, university_id, full_name, email, password_hash, role, account_status, banned_until from app_user where university_id = ? limit 1'
        );
        $statement->execute([$universityId]);
        $user = $statement->fetch();

        return $user === false ? null : $user;
    }

    private static function publicUser(array $user): array
    {
        return [
            'userId' => 'U' . str_pad((string) $user['id'], 3, '0', STR_PAD_LEFT),
            'universityId' => $user['university_id'],
            'fullName' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'accountStatus' => $user['account_status'],
            'bannedUntil' => $user['banned_until'],
        ];
    }
}
