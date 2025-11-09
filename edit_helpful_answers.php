<?php
$file = 'helpful_answers.json';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'load') {
    header('Content-Type: application/json');
    echo file_get_contents($file);
    exit;
}

if ($action === 'save') {
    $data = file_get_contents('php://input');
    // Validate JSON
    if (json_decode($data) === null) {
        http_response_code(400);
        echo 'Invalid JSON';
        exit;
    }
    file_put_contents($file, $data);
    echo 'Saved';
    exit;
}

// If we get here, no valid action was specified
http_response_code(400);
echo 'No valid action specified';
