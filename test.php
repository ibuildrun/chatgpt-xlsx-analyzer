<?php
// Simple test to check PHP is working
header('Content-Type: text/plain');
echo "PHP is working!\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Script: " . $_SERVER['SCRIPT_FILENAME'] . "\n";
echo "\nExtensions:\n";
echo "- curl: " . (extension_loaded('curl') ? 'YES' : 'NO') . "\n";
echo "- allow_url_fopen: " . (ini_get('allow_url_fopen') ? 'YES' : 'NO') . "\n";
