<?php
/**
 * PHP Procedural Utility & Security functions
 * 
 * Provides global reusable functions including output sanitization, 
 * authentication safeguards, CSRF prevention, safe file uploading,
 * and automatic global notifications.
 */

// Ensure session is started safely
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Escape HTML outputs to mitigate Cross-Site Scripting (XSS)
 * 
 * @param string $string Raw string input
 * @return string Safe schema escaped string
 */
function sanitize($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Generate a cryptographically secure anti-CSRF token
 * 
 * @return string Hex token saved in session
 */
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify anti-CSRF token against session
 * 
 * @param string $token Token from form submission
 * @return bool True if authentic match, false otherwise
 */
function verify_csrf_token($token) {
    if (!isset($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Check if current user session is active
 * 
 * @return bool
 */
function is_logged_in() {
    return isset($_SESSION['user_id']);
}

/**
 * Check if logged in user holds administratorship
 * 
 * @return bool
 */
function is_admin() {
    return is_logged_in() && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

/**
 * Restrict page access to authenticated administrators only
 */
function require_admin() {
    if (!is_admin()) {
        header("Location: ../login.php?error=unauthorized");
        exit;
    }
}

/**
 * Restrict page access to logged in members
 */
function require_login() {
    if (!is_logged_in()) {
        header("Location: login.php?error=login_required");
        exit;
    }
}

/**
 * Securely process image file uploads with validation
 * 
 * @param array $file The $_FILES['fieldname'] array
 * @param string $target_dir Target directory to write to
 * @return string|false Sanity-cleansed filename relative to uploads directory on success, false on failure
 */
function handle_image_upload($file, $target_dir = '../uploads/') {
    // Check if upload error occurred
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }

    // Ensure upload directory exists
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0755, true);
    }

    // Limit size (e.g., maximum 5 Megabytes)
    $max_size = 5 * 1024 * 1024;
    if ($file['size'] > $max_size) {
        return false;
    }

    // Restrict File Extensions & Validate actual MIME-type
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $file_info = pathinfo($file['name']);
    $extension = strtolower($file_info['extension']);

    if (!in_array($extension, $allowed_extensions)) {
        return false;
    }

    // Validate actual file signature / MIME content
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowed_mimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($mime_type, $allowed_mimes)) {
        return false;
    }

    // Reconstruct unique sanitized file name to guard against directory traversal attacks
    $new_filename = uniqid('img_', true) . '.' . $extension;
    $destination_path = $target_dir . $new_filename;

    if (move_uploaded_file($file['tmp_name'], $destination_path)) {
        return $new_filename;
    }

    return false;
}

/**
 * Propagate a global notification to all standard registered users
 * 
 * @param PDO $pdo Connection object
 * @param string $titre Title of notification
 * @param string $message Narrative detail of notification
 * @return bool
 */
function create_global_notification($pdo, $titre, $message) {
    try {
        // Query all registered users
        $stmt_users = $pdo->query("SELECT id FROM users");
        $users = $stmt_users->fetchAll();
        
        if (empty($users)) {
            return true;
        }

        // Prepare insertion statement
        $sql = "INSERT INTO notifications (user_id, titre, message, status) VALUES (:user_id, :titre, :message, 'unread')";
        $stmt_notif = $pdo->prepare($sql);

        // Batch insert
        $pdo->beginTransaction();
        foreach ($users as $user) {
            $stmt_notif->execute([
                ':user_id' => $user['id'],
                ':titre'   => $titre,
                ':message' => $message
            ]);
        }
        $pdo->commit();
        return true;
        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Error creating global notifications: " . $e->getMessage());
        return false;
    }
}

/**
 * Query count of unread notifications for logged-in user
 * 
 * @param PDO $pdo Connection object
 * @param int $user_id Logged in user ID
 * @return int Active notifications count
 */
function get_unread_notifications_count($pdo, $user_id) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND status = 'unread'");
    $stmt->execute([':user_id' => $user_id]);
    return (int)$stmt->fetchColumn();
}
?>
