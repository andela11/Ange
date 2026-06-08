<?php
/**
 * PHP Procedural Database Connection File
 * 
 * Sets up a secure PDO (PHP Data Objects) connection to MySQL.
 * Configures explicit exception modes and security parameters.
 */

// Database Configuration Variables
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'cameroun_culture_db');
define('DB_CHARSET', 'utf8mb4');

try {
    // Construct DSN (Data Source Name) with Unicode support
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    
    // Explicit security and operational configuration attributes
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exceptions on SQL errors
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Retrieve rows as associative arrays
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Use real prepared queries for SQL Injection immunity
    ];
    
    // Instantiate PDO connection
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

} catch (PDOException $e) {
    // Security Best Practice: Never output raw system credentials/details on failure
    error_log("Database connection error: " . $e->getMessage());
    die("An error occurred connecting to the database. Please try again later.");
}
?>
