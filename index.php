<?php
/**
 * PHP Proxy for Next.js application using cURL
 * Forwards all requests to localhost:3000
 */

// Debug mode - set to true to see debug info
$debugMode = isset($_GET['debug']) && $_GET['debug'] === '1';

$targetUrl = 'http://127.0.0.1:3000' . $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Check if cURL is available
if (!function_exists('curl_init')) {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo 'cURL extension is not available';
    exit;
}

$ch = curl_init();

// Set URL and basic options
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Get POST data first (needed for Content-Length)
$postData = '';
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $postData = file_get_contents('php://input');
    if (!empty($postData)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    }
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
    }
}

// Forward headers - include Content-Length for POST requests
$headers = [];
foreach (getallheaders() as $name => $value) {
    $lowerName = strtolower($name);
    // Skip headers that cURL manages or that we'll set manually
    if (in_array($lowerName, ['host', 'connection'])) {
        continue;
    }
    // For Content-Length, use actual body length
    if ($lowerName === 'content-length' && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        $headers[] = "Content-Length: " . strlen($postData);
        continue;
    }
    $headers[] = "$name: $value";
}

// Ensure Content-Type is set for POST requests with body
if (in_array($method, ['POST', 'PUT', 'PATCH']) && !empty($postData)) {
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
    // Ensure Content-Length is set
    $hasContentLength = false;
    foreach ($headers as $h) {
        if (stripos($h, 'Content-Length:') === 0) {
            $hasContentLength = true;
            break;
        }
    }
    if (!$hasContentLength) {
        $headers[] = 'Content-Length: ' . strlen($postData);
    }
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
    header('Content-Type: text/plain');
    echo "Proxy Error: $error (code: $errno)";
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

// Debug mode output
if ($debugMode) {
    header('Content-Type: application/json');
    echo json_encode([
        'debug' => true,
        'targetUrl' => $targetUrl,
        'method' => $method,
        'postDataLength' => strlen($postData),
        'postData' => $postData,
        'forwardedHeaders' => $headers,
        'responseCode' => $httpCode,
        'responseHeaderSize' => $headerSize,
        'responseBody' => $body,
        'responseHeaders' => $responseHeaders
    ], JSON_PRETTY_PRINT);
    exit;
}

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
