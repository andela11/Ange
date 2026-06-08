<?php
/**
 * Admin Panel Dashboard Home - /admin/index.php
 * 
 * Secure control deck for managing portal content. Shows database counts,
 * administrative alerts, and high-contrast sidebar navigations.
 */
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../config/database.php';

// Enforce admin privileges
require_admin();

// Fetch Simple Database Statistics
$counts = ['users' => 0, 'events' => 0, 'authorities' => 0, 'gallery' => 0];
try {
    $counts['users'] = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $counts['events'] = (int)$pdo->query("SELECT COUNT(*) FROM evenements")->fetchColumn();
    $counts['authorities'] = (int)$pdo->query("SELECT COUNT(*) FROM autorites")->fetchColumn();
    $counts['gallery'] = (int)$pdo->query("SELECT COUNT(*) FROM galerie")->fetchColumn();
} catch (PDOException $e) {
    error_log("Failed calculating dashboard metrics: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration Panel - CamHeritage</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-light">

<!-- Cameroonian Colours top layout -->
<div class="cameroun-colors-strip" style="height: 6px; background: linear-gradient(90deg, #007A5E 33.3%, #CE1126 33.3%, #CE1126 66.6%, #FCD116 66.6%);"></div>

<!-- Admin Top Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow">
    <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center" href="/index.php">
            <span class="fs-4" style="font-family: 'Playfair Display', serif; font-weight: 700; color: #FCD116;">
                <i class="bi bi-shield-fill-check text-warning me-2"></i>CamHeritage <span class="badge bg-danger fs-8" style="font-family: sans-serif;">Admin Dashboard</span>
            </span>
        </a>
        <div class="d-flex align-items-center">
            <span class="text-white-50 me-3 small"><i class="bi bi-person-fill text-warning"></i> Admin: <strong><?= sanitize($_SESSION['user_name']) ?></strong></span>
            <a href="/logout.php" class="btn btn-outline-danger btn-sm"><i class="bi bi-box-arrow-right"></i> Sign Out</a>
        </div>
    </div>
</nav>

<div class="container-fluid">
    <div class="row">
        
        <!-- SIDEBAR NAVIGATION PANEL -->
        <nav class="col-md-3 col-lg-2 d-md-block admin-sidebar collapse show p-3" id="adminSidebar">
            <div class="sticky-top pt-2">
                <h6 class="text-uppercase text-secondary fw-bold px-3 mb-3 small" style="letter-spacing:1px;">Navigation</h6>
                <ul class="nav flex-column px-2">
                    <li class="nav-item">
                        <a class="nav-link active d-flex align-items-center" href="/admin/index.php">
                            <i class="bi bi-speedometer2 me-2 fs-5"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link d-flex align-items-center" href="/admin/evenements.php">
                            <i class="bi bi-calendar2-event me-2 fs-5"></i> Événements (CRUD)
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link d-flex align-items-center" href="/admin/autorites.php">
                            <i class="bi bi-shield-shaded me-2 fs-5"></i> Autorités (CRUD)
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link d-flex align-items-center" href="/admin/galerie.php">
                            <i class="bi bi-images me-2 fs-5"></i> Galerie & Upload
                        </a>
                    </li>
                </ul>
                <hr class="text-secondary my-4">
                <div class="text-center px-2">
                    <a href="/index.php" class="btn btn-success btn-sm w-100 fw-bold"><i class="bi bi-eye"></i> Voir le Site Public</a>
                </div>
            </div>
        </nav>

        <!-- MAIN DASHBOARD CONTENT AREA -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
                <div>
                    <h1 class="h2 text-dark fw-bold">Overview Statistics</h1>
                    <p class="text-secondary small">System statistics and shortcuts for administrative activities.</p>
                </div>
                <!-- Mini Server Clock -->
                <div class="btn-toolbar mb-2 mb-md-0">
                    <span class="badge bg-dark py-2 px-3 fw-mono text-warning"><i class="bi bi-clock"></i> GMT Current Time: <?= gmdate('Y-m-d H:i:s') ?></span>
                </div>
            </div>

            <!-- STATS CARDS GRID -->
            <div class="row g-4 mb-4">
                <!-- Col 1: Users count -->
                <div class="col-xl-3 col-sm-6">
                    <div class="card bg-white border-0 shadow-sm rounded-3">
                        <div class="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted text-uppercase mb-1 small fw-bold">Utilisateurs</h6>
                                <h2 class="display-6 fw-bold m-0 text-success"><?= $counts['users'] ?></h2>
                            </div>
                            <div class="rounded-circle bg-success-subtle text-success p-3"><i class="bi bi-people fs-3"></i></div>
                        </div>
                    </div>
                </div>
                <!-- Col 2: Events count -->
                <div class="col-xl-3 col-sm-6">
                    <div class="card bg-white border-0 shadow-sm rounded-3">
                        <div class="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted text-uppercase mb-1 small fw-bold">Événements</h6>
                                <h2 class="display-6 fw-bold m-0 text-danger"><?= $counts['events'] ?></h2>
                            </div>
                            <div class="rounded-circle bg-danger-subtle text-danger p-3"><i class="bi bi-calendar2-event fs-3"></i></div>
                        </div>
                    </div>
                </div>
                <!-- Col 3: Authorities count -->
                <div class="col-xl-3 col-sm-6">
                    <div class="card bg-white border-0 shadow-sm rounded-3">
                        <div class="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted text-uppercase mb-1 small fw-bold">Autorités</h6>
                                <h2 class="display-6 fw-bold m-0 text-warning"><?= $counts['authorities'] ?></h2>
                            </div>
                            <div class="rounded-circle bg-warning-subtle text-warning p-3"><i class="bi bi-shield fs-3"></i></div>
                        </div>
                    </div>
                </div>
                <!-- Col 4: Gallery image counts -->
                <div class="col-xl-3 col-sm-6">
                    <div class="card bg-white border-0 shadow-sm rounded-3">
                        <div class="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted text-uppercase mb-1 small fw-bold">Photos Galerie</h6>
                                <h2 class="display-6 fw-bold m-0 text-info"><?= $counts['gallery'] ?></h2>
                            </div>
                            <div class="rounded-circle bg-info-subtle text-info p-3"><i class="bi bi-images fs-3"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ADMIN COMMAND ACTIONS BANNER -->
            <div class="card border-0 shadow-sm bg-white mb-4 rounded-3">
                <div class="card-header bg-dark text-white p-3 border-0">
                    <h5 class="card-title m-0 fw-bold"><i class="bi bi-gear-fill text-warning me-2"></i>Quick Administrative Portals</h5>
                </div>
                <div class="card-body p-4">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-3 d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <h6 class="fw-bold mb-1"><i class="bi bi-calendar-event text-danger"></i> Gérer événements</h6>
                                    <p class="text-muted small mb-3">Créez, éditez ou supprimez des événements. Les créations alertent instantanément la communauté connectée.</p>
                                </div>
                                <a href="/admin/evenements.php" class="btn btn-outline-danger btn-sm align-self-start fw-bold">Manage Events</a>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-3 d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <h6 class="fw-bold mb-1"><i class="bi bi-shield-shaded text-success"></i> Gérer Autorités</h6>
                                    <p class="text-muted small mb-3">Intégrez ou organisez la visibilité des fons traditionnels et du conseil d'administration régional.</p>
                                </div>
                                <a href="/admin/autorites.php" class="btn btn-outline-success btn-sm align-self-start fw-bold">Manage Authorities</a>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-3 d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <h6 class="fw-bold mb-1"><i class="bi bi-camera text-info"></i> Gérer Galerie d'Art</h6>
                                    <p class="text-muted small mb-3">Téléversez des images d'événements culturels récents, validez leurs dates, ou supprimez les obsolètes.</p>
                                </div>
                                <a href="/admin/galerie.php" class="btn btn-outline-info btn-sm align-self-start fw-bold">Manage Gallery</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECURITY PRINCIPLES COMPLIANCE NOTE -->
            <div class="alert alert-success d-flex flex-column p-4 border-start border-success border-4" role="alert">
                <h5 class="fw-bold text-success mb-2"><i class="bi bi-shield-lock-fill"></i> Secure Administration Operations Guidelines</h5>
                <p class="m-0 text-secondary leading-relaxed small">
                    This backoffice panel implements <strong>Anti-CSRF Tokens</strong> on all mutation actions, executes type checking on all teleports/uploads, and strips HTML output with special chars. Deleted assets are cleared completely. All SQL processes strictly run inside <strong>PDO Parameterized Prepared Statements</strong> to immunize against SQL Injection vectors.
                </p>
            </div>

        </main>
        
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
