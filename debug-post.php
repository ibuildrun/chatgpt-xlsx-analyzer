<?php
/**
 * Debug script to test POST request handling
 */

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
$rawInput = file_get_contents('php://input');

$response = [
    'method' => $method,
    'headers' => $headers,
    'raw_input' => $rawInput,
    'raw_input_length' => strlen($rawInput),
    'content_type' => $headers['Content-Type'] ?? $headers['content-type'] ?? 'not set',
    'content_length' => $headers['Content-Length'] ?? $headers['content-length'] ?? 'not set',
    'parsed_json' => null,
    'json_error' => null
];

if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $response['parsed_json'] = $decoded;
    } else {
        $response['json_error'] = json_last_error_msg();
    }
}

echo json_encode($response, JSON_PRETTY_PRINT);
