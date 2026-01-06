<?php
/**
 * Simple echo script to debug POST requests
 */

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$headers = getallheaders();

$response = [
    'method' => $method,
    'raw_input' => $rawInput,
    'raw_input_length' => strlen($rawInput),
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'content_length' => $_SERVER['CONTENT_LENGTH'] ?? 'not set',
    'headers' => $headers,
    'post_data' => $_POST,
    'request_uri' => $_SERVER['REQUEST_URI'],
    'query_string' => $_SERVER['QUERY_STRING'] ?? ''
];

echo json_encode($response, JSON_PRETTY_PRINT);
