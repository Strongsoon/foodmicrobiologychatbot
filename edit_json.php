<?php
// edit_json.php

// ─── 1) Set headers ───────────────────────────────────────────────────
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// ─── 2) Whitelist allowed files ─────────────────────────────────────
$allowed = [
    'Q&A.json',
    'quiz.json',
    'thoughts.json',
    'Tips.json'
];

// ─── 3) Determine which file to operate on ──────────────────────────
$fileParam = $_GET['file'] ?? '';
$fileName  = in_array($fileParam, $allowed) ? $fileParam : 'Q&A.json';
$filePath  = __DIR__ . DIRECTORY_SEPARATOR . $fileName;

// ─── 4) Handle loading ───────────────────────────────────────────────
if ( ($_GET['action'] ?? '') === 'load' ) {
    if (! file_exists($filePath)) {
        http_response_code(404);
        echo json_encode([]);
    } else {
        echo file_get_contents($filePath);
    }
    exit;
}

// ─── 5) Handle saving ───────────────────────────────────────────────
if ( ($_GET['action'] ?? '') === 'save' ) {
    $raw = file_get_contents('php://input');
    if (json_decode($raw) === null) {
        http_response_code(400);
        echo json_encode(['error'=>'Invalid JSON.']);
    } else {
        file_put_contents($filePath, $raw);
        echo json_encode(['success'=> "{$fileName} updated."]);
    }
    exit;
}

// ─── 6) Nothing matched ─────────────────────────────────────────────
http_response_code(400);
echo json_encode(['error'=>'No valid action specified.']);
