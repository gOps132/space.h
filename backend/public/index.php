<?php

declare(strict_types=1);

use Spaceh\Database;
use Spaceh\Router;

require dirname(__DIR__) . '/bootstrap.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === \Spaceh\Config::allowedOrigin()) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}

header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if (!str_starts_with($path, '/api')) {
    serveReactApp($path);
    exit;
}

(new Router(Database::connect()))->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $path);

function serveReactApp(string $path): void
{
    $appRoot = __DIR__ . '/app';
    $assetPath = realpath($appRoot . $path);

    if (
        $assetPath !== false
        && str_starts_with($assetPath, $appRoot)
        && is_file($assetPath)
    ) {
        header('Content-Type: ' . contentType($assetPath));
        readfile($assetPath);
        return;
    }

    $index = $appRoot . '/index.html';
    if (!is_file($index)) {
        http_response_code(503);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Frontend build missing. Rebuild Docker image.';
        return;
    }

    header('Content-Type: text/html; charset=utf-8');
    readfile($index);
}

function contentType(string $path): string
{
    return match (pathinfo($path, PATHINFO_EXTENSION)) {
        'css' => 'text/css; charset=utf-8',
        'js' => 'text/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        default => 'application/octet-stream',
    };
}
