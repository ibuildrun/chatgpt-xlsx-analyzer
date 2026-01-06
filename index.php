<?php
/**
 * PHP Proxy for Next.js application using cURL
 * Forwards all requests to localhost:3000
 */

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$requestUri = $_SERVER['REQUEST_URI'];
$targetUrl = 'http://127.0.0.1:3000' . $requestUri;
$method = $_SERVER['REQUEST_METHOD'];

// Check if cURL is available
if (!function_exists('curl_init')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'cURL extension is not available']);
    exit;
}

$ch = curl_init();

// Set URL and basic options
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Get POST data - try reading from php://input
$postData = '';
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    // Open php://input as a stream and read it
    $inputStream = fopen('php://input', 'r');
    if ($inputStream) {
        $postData = stream_get_contents($inputStream);
        fclose($inputStream);
    }
    
    // Set the request method
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    // Set POST data
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
}

// Forward headers
$headers = [];
$incomingHeaders = function_exists('getallheaders') ? getallheaders() : [];

foreach ($incomingHeaders as $name => $value) {
    $lowerName = strtolower($name);
    // Skip headers that shouldn't be forwarded
    if (in_array($lowerName, ['host', 'connection', 'content-length', 'transfer-encoding'])) {
        continue;
    }
    $headers[] = "$name: $value";
}

// Set Content-Type and Content-Length for POST/PUT/PATCH
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    // Check if Content-Type is already set
    $hasContentType = false;
    foreach ($headers as $h) {
        if (stripos($h, 'Content-Type:') === 0) {
            $hasContentType = true;
            break;
        }
    }
    if (!$hasContentType) {
        $headers[] = 'Content-Type: application/json';
    }
    
    // Always set Content-Length
    $headers[] = 'Content-Length: ' . strlen($postData);
}

if (!empty($headers)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}

// Execute request
$response = curl_exec($ch);
$error = curl_error($ch);
$errno = curl_errno($ch);

if ($errno) {
    curl_close($ch);
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => "Proxy Error: $error (code: $errno)"]);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Split headers and body
$responseHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

// Set response code
http_response_code($httpCode);

// Forward response headers
$headerLines = explode("\r\n", $responseHeaders);
foreach ($headerLines as $header) {
    if (empty($header)) continue;
    if (stripos($header, 'HTTP/') === 0) continue;
    if (stripos($header, 'Transfer-Encoding:') === 0) continue;
    if (stripos($header, 'Connection:') === 0) continue;
    if (stripos($header, 'Content-Length:') === 0) continue;
    header($header);
}

echo $body;
