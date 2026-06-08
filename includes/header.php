<?php
/**
 * Global Header Component
 * 
 * Provides responsive Bootstrap 5 navbar, active state triggers, 
 * session awareness indicators, and notification drawer.
 */
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/../config/database.php';

// Prepare unread notification listings if logged in
$unread_count = 0;
$user_notifications = [];
if (is_logged_in()) {
    $unread_count = get_unread_notifications_count($pdo, $_SESSION['user_id']);
    
    // Fetch recent 5 notifications
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 5");
    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $user_notifications = $stmt->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cameroun Cultural Portal - North West & South West Heritage</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts: Playfair Display & Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <!-- Customs CSS -->
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-light d-flex flex-column min-vh-100">

<!-- Top Banner Line representing Cameroonian Colours -->
<div class="cameroun-colors-strip" style="height: 6px; background: linear-gradient(90deg, #007A5E 33.3%, #CE1126 33.3%, #CE1126 66.6%, #FCD116 66.6%);"></div>

<!-- Bootstrap 5 Navigation Bar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
    <div class="container">
        <!-- Brand / Identity -->
        <a class="navbar-brand d-flex align-items-center" href="/index.php">
            <span class="fs-4 py-1" style="font-family: 'Playfair Display', serif; font-weight: 700; color: #FCD116;">
                <i class="bi bi-star-fill text-warning me-2"></i>CamHeritage
            </span>
        </a>
        
        <!-- Mobile Toggle Button -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Links -->
        <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-item nav-link" href="/index.php"><i class="bi bi-house-door-fill me-1"></i> Accueil</a>
                </li>
                <li class="nav-item">
                    <a class="nav-item nav-link" href="/culture.php"><i class="bi bi-images me-1"></i> Culture & Galerie</a>
                </li>
                <li class="nav-item">
                    <a class="nav-item nav-link" href="/autorites.php"><i class="bi bi-people-fill me-1"></i> Autorités</a>
                </li>
                <li class="nav-item">
                    <a class="nav-item nav-link" href="/evenements.php"><i class="bi bi-calendar-event-fill me-1"></i> Événements</a>
                </li>
            </ul>
            
            <!-- Auth & Administration Section -->
            <ul class="navbar-nav align-items-lg-center">
                <?php if (is_logged_in()): ?>
                    
                    <!-- Notification Bell Dropdown -->
                    <li class="nav-item dropdown me-3 position-relative">
                        <a class="nav-link position-relative" href="#" id="notifDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-bell-fill fs-5" style="color: #FCD116;"></i>
                            <?php if ($unread_count > 0): ?>
                                <span class="position-absolute top-1 start-75 translate-middle badge rounded-pill bg-danger" id="notifBadge">
                                    <?= $unread_count ?>
                                    <span class="visually-hidden">unread notifications</span>
                                </span>
                            <?php endif; ?>
                        </a>
                        
                        <div class="dropdown-menu dropdown-menu-end p-0 shadow-lg border-0" aria-labelledby="notifDropdown" style="width: 320px; border-radius: 10px; overflow: hidden;">
                            <div class="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                <h6 class="m-0"><i class="bi bi-bell-fill text-warning me-2"></i>Notifications</h6>
                                <?php if ($unread_count > 0): ?>
                                    <button onclick="markAllNotificationsAsRead()" class="btn btn-xs btn-outline-warning py-1 px-2 border-0" style="font-size: 0.75rem;">
                                        Mark all read <i class="bi bi-check-all"></i>
                                    </button>
                                <?php endif; ?>
                            </div>
                            
                            <ul class="list-group list-group-flush" id="notificationList" style="max-height: 280px; overflow-y: auto;">
                                <?php if (empty($user_notifications)): ?>
                                    <li class="list-group-item text-center text-muted py-4">
                                        <i class="bi bi-bell-slash fs-2 mb-2 d-block"></i>
                                        Pas de notifications
                                    </li>
                                <?php else: ?>
                                    <?php foreach ($user_notifications as $notif): ?>
                                        <li class="list-group-item list-group-item-action d-flex flex-column align-items-start <?= $notif['status'] === 'unread' ? 'bg-light-yellow border-start border-warning border-3' : 'text-muted' ?>" style="font-size: 0.85rem;">
                                            <div class="d-flex w-100 justify-content-between">
                                                <strong class="text-dark"><?= sanitize($notif['titre']) ?></strong>
                                                <small class="text-muted" style="font-size: 10px;"><?= date('d M, H:i', strtotime($notif['created_at'])) ?></small>
                                            </div>
                                            <p class="mb-1 text-secondary mt-1" style="font-size: 0.8rem;"><?= sanitize($notif['message']) ?></p>
                                        </li>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </ul>
                            
                            <div class="bg-light text-center py-2">
                                <a href="/evenements.php" class="text-dark font-weight-bold" style="font-size: 0.8rem; text-decoration: none;">Voir tous les Événements</a>
                            </div>
                        </div>
                    </li>

                    <!-- User Account / Logout Actions -->
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-light d-flex align-items-center" href="#" id="userAccountDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="badge bg-secondary me-2"><i class="bi bi-person-circle"></i></span>
                            <span class="fw-medium text-warning"><?= sanitize($_SESSION['user_name']) ?></span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0" aria-labelledby="userAccountDropdown">
                            <li><h6 class="dropdown-header text-muted">Role: <?= strtoupper(sanitize($_SESSION['user_role'])) ?></h6></li>
                            <?php if (is_admin()): ?>
                                <li>
                                    <a class="dropdown-item bg-dark-subtle fw-semibold text-dark" href="/admin/index.php">
                                        <i class="bi bi-shield-lock-fill text-danger me-2"></i>Administration
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                            <?php endif; ?>
                            <li><a class="dropdown-item text-danger" href="/logout.php"><i class="bi bi-box-arrow-right me-2"></i>Déconnexion</a></li>
                        </ul>
                    </li>

                <?php else: ?>
                    <!-- Sign In & Register Buttons -->
                    <li class="nav-item">
                        <a class="btn btn-outline-light btn-sm me-2 my-1" href="/login.php"><i class="bi bi-box-arrow-in-right"></i> Connexion</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-warning btn-sm my-1" href="/register.php" style="color: #212529; font-weight: 600;"><i class="bi bi-person-plus-fill"></i> Inscription</a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>

<!-- Subheader Welcome Header Area (Shows only on public pages) -->
<?php if (!str_contains($_SERVER['PHP_SELF'], 'admin/')): ?>
<header class="bg-gradient text-white py-3 shadow-sm text-center" style="background: linear-gradient(135deg, #005a45, #1e3f34);">
    <div class="container d-flex justify-content-between align-items-center flex-wrap gap-2">
        <p class="m-0 text-white-50 small"><i class="bi bi-info-circle-fill me-1"></i> Promoting Cameroon North-West & South-West Cultural Grandeur</p>
        <div id="localClock" class="badge bg-dark-opacity text-warning" style="font-family: monospace; font-size: 0.85rem;">
            UTC Time: <?= gmdate('Y-m-d H:i:s') ?>
        </div>
    </div>
</header>
<?php endif; ?>

<!-- Main App Containment Body -->
<main class="container py-4 flex-grow-1">
