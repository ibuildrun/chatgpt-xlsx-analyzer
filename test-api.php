<?php
/**
 * API Test Script - Tests POST requests through the PHP proxy
 */

header('Content-Type: text/html; charset=utf-8');
echo "<h1>API Test Results</h1>";
echo "<pre>";

// Test 1: Direct POST to localhost:3000
echo "=== Test 1: Direct POST to localhost:3000/api/threads ===\n";
$ch = curl_init();
$testData = json_encode(['title' => 'Test Thread ' . date('H:i:s')]);

curl_setopt_array($ch, [
    CURLOPT_URL => 'http://127.0.0.1:3000/api/threads',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $testData,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($testData)
    ],
    CURLOPT_VERBOSE => true,
    CURLOPT_STDERR => $verbose = fopen('php://temp', 'w+'),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

rewind($verbose);
$verboseLog = stream_get_contents($verbose);
fclose($verbose);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
if ($error) echo "Error: $error\n";
echo "\nVerbose log:\n$verboseLog\n";

// Test 2: GET request to threads
echo "\n=== Test 2: GET /api/threads ===\n";
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'http://127.0.0.1:3000/api/threads',
    CURLOPT_RETURNTRANSFER => true,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: " . substr($response, 0, 500) . (strlen($response) > 500 ? '...' : '') . "\n";

// Test 3: Check what PHP receives
echo "\n=== Test 3: Current Request Info ===\n";
echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set') . "\n";
echo "Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'not set') . "\n";
echo "Raw Input: " . file_get_contents('php://input') . "\n";

// Test 4: Test POST to messages endpoint
echo "\n=== Test 4: POST to /api/messages (should fail - no threadId) ===\n";
$ch = curl_init();
$testData = json_encode(['content' => 'test']);

curl_setopt_array($ch, [
    CURLOPT_URL => 'http://127.0.0.1:3000/api/messages',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $testData,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($testData)
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

echo "</pre>";
