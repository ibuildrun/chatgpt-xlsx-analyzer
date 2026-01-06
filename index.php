<?php
/**
 * PHP Proxy for Next.js application using cURL
 * Forwards all requests to localhost:3000
 */

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

// Forward headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    $lowerName = strtolower($name);
    if (!in_array($lowerName, ['host', 'connection', 'content-length'])) {
        $headers[] = "$name: $value";
    }
}

// Forward POST/PUT/PATCH data
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $postData = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
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
