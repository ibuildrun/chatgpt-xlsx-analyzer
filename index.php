<?php
/**
 * PHP Proxy for Next.js application
 * Handles chunked transfer encoding properly
 */

error_reporting(0);
ini_set('display_errors', 0);

$postData = file_get_contents('php://input');
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$targetUrl = 'http://127.0.0.1:3000' . $uri;

if (!function_exists('curl_init')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo '{"error":"cURL not available"}';
    exit;
}

// Collect headers to forward
$headers = [];
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        $name = str_replace('_', '-', substr($key, 5));
        $upperName = strtoupper($name);
        if (!in_array($upperName, ['HOST', 'CONNECTION', 'CONTENT-LENGTH', 'TRANSFER-ENCODING', 'ACCEPT-ENCODING'])) {
            $headers[] = "$name: $value";
        }
    }
}
if (isset($_SERVER['CONTENT_TYPE'])) {
    $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
}
if ($postData && in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $headers[] = 'Content-Length: ' . strlen($postData);
}

// Force identity encoding to avoid chunked issues
$headers[] = 'Accept-Encoding: identity';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $targetUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
]);

if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($postData) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    }
}

// Execute with retry
$response = false;
$errno = 0;
for ($i = 0; $i < 2; $i++) {
    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    if ($errno === 0) break;
    if ($errno !== CURLE_COULDNT_CONNECT && $errno !== CURLE_OPERATION_TIMEDOUT) break;
    usleep(300000);
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

if ($errno) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => $error, 'code' => $errno]);
    exit;
}

$responseHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

http_response_code($httpCode);

foreach (explode("\r\n", $responseHeaders) as $header) {
    $header = trim($header);
    if (empty($header)) continue;
    
    $lower = strtolower($header);
    if (strpos($lower, 'http/') === 0) continue;
    if (strpos($lower, 'transfer-encoding:') === 0) continue;
    if (strpos($lower, 'connection:') === 0) continue;
    if (strpos($lower, 'keep-alive:') === 0) continue;
    
    header($header);
}

echo $body;
