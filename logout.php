<?php
/**
 * Logout script - Logout.php
 * 
 * Flushes active PHP sessions safely and redirects the connection back to homepage.
 */
require_once __DIR__ . '/includes/functions.php';

// Flush session variables completely
$_SESSION = [];

// Securely wipe cookie tracking records
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Vaporize the active session server container
session_destroy();

// Route back to home
header("Location: index.php?status=logged_out");
exit;
?>
