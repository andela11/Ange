<?php
/**
 * AJAX / Form Notification Controller
 * 
 * Secure target that processes client-side commands to mark notifications 
 * as read without refreshing the active session pages.
 */
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/config/database.php';

// Direct output as JSON content type
header('Content-Type: application/json');

// Shield against unauthenticated execution
if (!is_logged_in()) {
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required.'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

if ($action === 'mark_read') {
    try {
        // Form or secure AJAX fetch updating notifications
        $stmt = $pdo->prepare("UPDATE notifications SET status = 'read' WHERE user_id = :user_id AND status = 'unread'");
        $stmt->execute([':user_id' => $user_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'All unread notifications marked as read.',
            'timestamp' => gmdate('Y-m-d H:i:s')
        ]);
        exit;
    } catch (PDOException $e) {
        error_log("Database error updating notifications read status: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Internal database error. Could not save status.'
        ]);
        exit;
    }
} else {
    // If accessed with no specific action, return current count and unread notification rows
    try {
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 10");
        $stmt->execute([':user_id' => $user_id]);
        $rows = $stmt->fetchAll();
        
        $unread_count = get_unread_notifications_count($pdo, $user_id);

        echo json_encode([
            'success' => true,
            'unread_count' => $unread_count,
            'notifications' => $rows
        ]);
        exit;
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Retrieval failed.'
        ]);
        exit;
    }
}
?>
