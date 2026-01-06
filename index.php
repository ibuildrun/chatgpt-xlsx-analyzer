<?php
/**
 * PHP Proxy for Next.js application using cURL
 * Forwards all requests to localhost:3000 with retry logic
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$requestUri = $_SERVER['REQUEST_URI'];
$targetUrl = 'http://127.0.0.1:3000' . $requestUri;
$method = $_SERVER['REQUEST_METHOD'];

if (!function_exists('curl_init')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'cURL extension is not available']);
    exit;
}

// Read POST data FIRST before any other operations
$postData = '';
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $postData = file_get_contents('php://input');
}

// Get incoming headers
$incomingHeaders = [];
if (function_exists('getallheaders')) {
    $incomingHeaders = getallheaders();
} else {
    // Fallback for servers without getallheaders
    foreach ($_SERVER as $key => $value) {
        if (substr($key, 0, 5) === 'HTTP_') {
            $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
            $incomingHeaders[$header] = $value;
        }
    }
}

// Build headers array
$headers = [];
foreach ($incomingHeaders as $name => $value) {
    $lowerName = strtolower($name);
    if (in_array($lowerName, ['host', 'connection', 'content-length', 'transfer-encoding'])) {
        continue;
    }
    $headers[] = "$name: $value";
}

// Ensure Content-Type for POST/PUT/PATCH
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
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
    $headers[] = 'Content-Length: ' . strlen($postData);
}

// Retry logic for connection issues
$maxRetries = 3;
$retryDelay = 500000; // 0.5 seconds in microseconds
$response = false;
$errno = 0;
$error = '';

for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $targetUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    
    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($postData !== '') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        }
    }
    
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    
    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    
    curl_close($ch);
    
    // Success or non-connection error
    if ($errno === 0 || !in_array($errno, [CURLE_COULDNT_CONNECT, CURLE_OPERATION_TIMEDOUT])) {
        break;
    }
    
    // Wait before retry
    if ($attempt < $maxRetries) {
        usleep($retryDelay);
    }
}

if ($errno) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => "Proxy Error: $error (code: $errno)", 'retries' => $maxRetries]);
    exit;
}

// Split headers and body
$responseHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

http_response_code($httpCode);

// Forward response headers
foreach (explode("\r\n", $responseHeaders) as $header) {
    if (empty($header)) continue;
    if (stripos($header, 'HTTP/') === 0) continue;
    if (stripos($header, 'Transfer-Encoding:') === 0) continue;
    if (stripos($header, 'Connection:') === 0) continue;
    if (stripos($header, 'Content-Length:') === 0) continue;
    header($header);
}

echo $body;
