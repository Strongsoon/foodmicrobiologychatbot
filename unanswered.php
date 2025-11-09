<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$action = $_GET['action'] ?? '';

if ($action === 'load') {
    header('Content-Type: application/json');
    echo file_get_contents(__DIR__ . '/unanswered.json');
    exit;
}

if ($action === 'answer') {
    $p = json_decode(file_get_contents('php://input'), true);
    if (empty($p['question']) || empty($p['timestamp']) || empty($p['answer'])) {
        http_response_code(400);
        echo 'Invalid payload';
        exit;
    }
    $q  = $p['question'];
    $ts = $p['timestamp'];
    $a  = $p['answer'];

    // Load 
    $uf = __DIR__ . '/unanswered.json';
    $ud = json_decode(file_get_contents($uf), true);

    $filtered = [];
    foreach ($ud['questions'] ?? [] as $entry) {
        if (!($entry['question'] === $q && $entry['timestamp'] === $ts)) {
            $filtered[] = $entry;
        }
    }
    // Re-index
    $ud['questions'] = $filtered;
    file_put_contents($uf, json_encode($ud, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    //Append to Q&A.json
    $qaFile = __DIR__ . '/Q&A.json';
    $qaData = json_decode(file_get_contents($qaFile), true);
    if (!isset($qaData[$q]) || !is_array($qaData[$q])) {
        $qaData[$q] = [];
    }
    $qaData[$q][] = $a;
    file_put_contents($qaFile, json_encode($qaData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    header('Content-Type: text/plain');
    echo 'Answer published successfully.';
    exit;
}

http_response_code(400);
echo 'Unknown action';
exit;
?>
