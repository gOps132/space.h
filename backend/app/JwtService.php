<?php

declare(strict_types=1);

namespace Spaceh;

final class JwtService
{
    public function issue(string $subject, array $claims = []): string
    {
        $now = time();
        $payload = array_merge($claims, [
            'sub' => $subject,
            'iat' => $now,
            'exp' => $now + Config::jwtExpirationSeconds(),
        ]);

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $segments = [
            self::base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR)),
            self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR)),
        ];
        $signature = hash_hmac('sha256', implode('.', $segments), Config::jwtSecret(), true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    public function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', "{$header}.{$payload}", Config::jwtSecret(), true));
        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $decoded = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($decoded) || !isset($decoded['sub'], $decoded['exp']) || time() >= (int) $decoded['exp']) {
            return null;
        }

        return $decoded;
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/'), true) ?: '';
    }
}
