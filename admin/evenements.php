<?php
/**
 * CRUD Controller - Manage Events (/admin/evenements.php)
 * 
 * Implements create, read, update, and delete actions for communal events.
 * Crucial trigger: Creating an event automatically broadcasts a system-wide
 * notification row to ALL registered database users instantly.
 */
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../config/database.php';

// Safe check for admin authorization
require_admin();

$success_msg = '';
$error_msg = '';

// Holds placeholder/object properties for editing
$edit_mode = false;
$ev_id = '';
$ev_titre = '';
$ev_description = '';
$ev_date_evenement = '';
$ev_lieu = '';
$ev_image_url = '';

// 1. Process Mutating Submissions (Create, Edit, Delete)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';

    // Verify token legitimacy
    if (!verify_csrf_token($csrf_token)) {
        $error_msg = "CSRF verification expired. Mutation aborted.";
    } 
    else {
        // ACTION A: Delete event
        if ($action === 'delete') {
            $id = (int)($_POST['id'] ?? 0);
            try {
                // Delete event entry
                $stmt = $pdo->prepare("DELETE FROM evenements WHERE id = :id");
                $stmt->execute([':id' => $id]);
                $success_msg = "L'événement a été supprimé avec succès.";
            } catch (PDOException $e) {
                $error_msg = "Database delete exception: " . $e->getMessage();
            }
        }
        // ACTION B: Create or Edit event
        else if ($action === 'save') {
            $id = $_POST['id'] ?? '';
            $titre = trim($_POST['titre'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $date_evenement = $_POST['date_evenement'] ?? '';
            $lieu = trim($_POST['lieu'] ?? '');
            
            // Validate minimum expectations
            if (empty($titre) || empty($description) || empty($date_evenement) || empty($lieu)) {
                $error_msg = "All text inputs are required.";
            } else {
                // Process image file upload securely if provided
                $uploaded_filename = handle_image_upload($_FILES['image'] ?? null, '../uploads/');
                
                try {
                    // Scenario B1: Editing an existing event
                    if (!empty($id)) {
                        $id = (int)$id;
                        
                        // Extract original details to maintain assets
                        $stmt_orig = $pdo->prepare("SELECT image_url FROM evenements WHERE id = :id");
                        $stmt_orig->execute([':id' => $id]);
                        $orig_image = $stmt_orig->fetchColumn();

                        $final_image = ($uploaded_filename !== false) ? $uploaded_filename : ($orig_image ? $orig_image : '');

                        $sql_update = "UPDATE evenements SET titre = :titre, description = :description, date_evenement = :date_evenement, lieu = :lieu, image_url = :image_url WHERE id = :id";
                        $stmt_update = $pdo->prepare($sql_update);
                        $stmt_update->execute([
                            ':titre' => $titre,
                            ':description' => $description,
                            ':date_evenement' => $date_evenement,
                            ':lieu' => $lieu,
                            ':image_url' => $final_image,
                            ':id' => $id
                        ]);
                        $success_msg = "L'événement a été mis à jour avec succès.";
                    } 
                    // Scenario B2: Creating a brand new event
                    else {
                        $final_image = ($uploaded_filename !== false) ? $uploaded_filename : '';

                        $sql_insert = "INSERT INTO evenements (titre, description, date_evenement, lieu, image_url) VALUES (:titre, :description, :date_evenement, :lieu, :image_url)";
                        $stmt_insert = $pdo->prepare($sql_insert);
                        $stmt_insert->execute([
                            ':titre' => $titre,
                            ':description' => $description,
                            ':date_evenement' => $date_evenement,
                            ':lieu' => $lieu,
                            ':image_url' => $final_image
                        ]);

                        // TRIGGER AUTO BROADCAST NOTIFICATION:
                        // Automatically alerts all users about this new event!
                        $notif_title = "Nouvel Événement: " . $titre;
                        $notif_body = "Un nouvel événement culturel est prévu le " . date('d M Y', strtotime($date_evenement)) . " à " . $lieu . ". Cliquez pour en savoir plus.";
                        
                        create_global_notification($pdo, $notif_title, $notif_body);

                        $success_msg = "Événement planifié ! Une notification communautaire a été émise à tous les inscrits.";
                    }
                } catch (PDOException $e) {
                    error_log("Database exceptions executing event manipulation actions: " . $e->getMessage());
                    $error_msg = "An internal query failure occurred storing event settings.";
                }
            }
        }
    }
}

// 2. Fetch specific event details if loading in EDIT mode
if (isset($_GET['edit_id']) && empty($error_msg)) {
    $edit_id = (int)$_GET['edit_id'];
    try {
        $stmt_edit = $pdo->prepare("SELECT * FROM evenements WHERE id = :id LIMIT 1");
        $stmt_edit->execute([':id' => $edit_id]);
        $edit_event = $stmt_edit->fetch();
        if ($edit_event) {
            $edit_mode = true;
            $ev_id = $edit_event['id'];
            $ev_titre = $edit_event['titre'];
            $ev_description = $edit_event['description'];
            $ev_date_evenement = $edit_event['date_evenement'];
            $ev_lieu = $edit_event['lieu'];
            $ev_image_url = $edit_event['image_url'];
        }
    } catch (PDOException $e) {
        $error_msg = "Failed loading target edit entry data.";
    }
}

// 3. Fetch list of all events chronologically for listings display
try {
    $stmt_list = $pdo->query("SELECT * FROM evenements ORDER BY date_evenement DESC");
    $events_list = $stmt_list->fetchAll();
} catch (PDOException $e) {
    error_log("Error recovering overall listings: " . $e->getMessage());
    $events_list = [];
}

$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gérer Événements - administration Panel</title>
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

<!-- Nav Bar header -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow">
    <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center" href="/index.php">
            <span class="fs-4" style="font-family: 'Playfair Display', serif; font-weight: 700; color: #FCD116;">
                <i class="bi bi-shield-fill-check text-warning me-2"></i>CamHeritage <span class="badge bg-danger fs-8" style="font-family: sans-serif;">Admin Dashboard</span>
            </span>
        </a>
        <div class="d-flex align-items-center">
            <span class="text-white-50 me-3 small"><i class="bi bi-shield-lock text-warning"></i> Administration Panel</span>
            <a href="/admin/index.php" class="btn btn-outline-warning btn-sm me-2"><i class="bi bi-speedometer"></i> Dashboard</a>
            <a href="/logout.php" class="btn btn-outline-danger btn-sm">Log Out</a>
        </div>
    </div>
</nav>

<div class="container-fluid">
    <div class="row">
        
        <!-- SIDEBAR CONTAINER -->
        <nav class="col-md-3 col-lg-2 d-md-block admin-sidebar collapse show p-3" id="adminSidebar">
            <div class="sticky-top pt-2">
                <h6 class="text-uppercase text-secondary fw-bold px-3 mb-3 small">Navigation</h6>
                <ul class="nav flex-column px-2">
                    <li class="nav-item">
                        <a class="nav-link d-flex align-items-center" href="/admin/index.php">
                            <i class="bi bi-speedometer2 me-2 fs-5"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active d-flex align-items-center" href="/admin/evenements.php">
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

        <!-- CRUD WORKSPACE CONTENT -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-4 border-bottom">
                <div>
                    <h1 class="h2 text-dark fw-bold"><i class="bi bi-calendar-event-fill text-danger me-2"></i>Gestion des Événements</h1>
                    <p class="text-secondary small">Ajoutez, modifiez ou retirez des programmes communautaires et alertes de rassemblement.</p>
                </div>
            </div>

            <!-- STATUS RESPONSES -->
            <?php if (!empty($success_msg)): ?>
                <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
                    <i class="bi bi-check-circle-fill me-2 fs-5 bg-transparent text-success"></i>
                    <div><?= sanitize($success_msg) ?></div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            <?php endif; ?>

            <?php if (!empty($error_msg)): ?>
                <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2 fs-5 bg-transparent text-danger"></i>
                    <div><?= sanitize($error_msg) ?></div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            <?php endif; ?>

            <div class="row g-4 mb-5">
                
                <!-- ROW LEFT COLUMN: CREATE/EDIT FORM (35%) -->
                <div class="col-xl-4 col-lg-5">
                    <div class="card shadow-sm border-0 rounded-3 bg-white">
                        <div class="card-header bg-dark text-white p-3">
                            <h5 class="card-title m-0 fw-bold">
                                <i class="bi <?= $edit_mode ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-success' ?> me-2"></i>
                                <?= $edit_mode ? "Modifier l'Événement" : "Ajouter un Événement" ?>
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <form method="POST" action="evenements.php" enctype="multipart/form-data">
                                <input type="hidden" name="action" value="save">
                                <input type="hidden" name="id" value="<?= sanitize($ev_id) ?>">
                                <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

                                <!-- Titre de l'événement -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Titre de l'événement</label>
                                    <input type="text" name="titre" class="form-control bg-light text-dark py-2" placeholder="ex: Toko-Kunda Dance Ceremony" value="<?= sanitize($ev_titre) ?>" required>
                                </div>

                                <!-- Lieu -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Lieu d'organisation</label>
                                    <input type="text" name="lieu" class="form-control bg-light text-dark py-2" placeholder="ex: Buea Civic Center" value="<?= sanitize($ev_lieu) ?>" required>
                                </div>

                                <!-- Date de l'événement -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Date de l'événement</label>
                                    <input type="date" name="date_evenement" class="form-control bg-light text-dark py-2" value="<?= sanitize($ev_date_evenement) ?>" required>
                                </div>

                                <!-- Description -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Description descriptive</label>
                                    <textarea name="description" class="form-control bg-light text-dark py-2" rows="4" placeholder="..." required><?= sanitize($ev_description) ?></textarea>
                                </div>

                                <!-- Image Upload (Facultative) -->
                                <div class="mb-4">
                                    <label class="form-label text-dark fw-semibold small">Photo illustrative (facultative)</label>
                                    <input type="file" name="image" class="form-control text-sm py-1.5" accept="image/*">
                                    <small class="text-muted d-block mt-1">Accepté: JPG, PNG, GIF, WEBP (Max: 5MB)</small>
                                    <?php if ($edit_mode && !empty($ev_image_url)): ?>
                                        <div class="mt-2.5 p-2 bg-light border rounded text-center">
                                            <span class="small d-block text-muted mb-1">Image Actuelle:</span>
                                            <?php 
                                                $path = (str_starts_with($ev_image_url, 'http://') || str_starts_with($ev_image_url, 'https://')) ? $ev_image_url : '/uploads/' . $ev_image_url;
                                            ?>
                                            <img src="<?= sanitize($path) ?>" style="max-height: 80px;" class="img-thumbnail" alt="Thumb" referrerPolicy="no-referrer">
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <!-- Submit details button row -->
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-success flex-grow-1 fw-bold border-0 py-2">
                                        <?= $edit_mode ? 'Enregistrer Modifications' : 'Planifier & Notifier' ?>
                                    </button>
                                    <?php if ($edit_mode): ?>
                                        <a href="evenements.php" class="btn btn-outline-secondary py-2">Wipe</a>
                                    <?php endif; ?>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>

                <!-- ROW RIGHT COLUMN: CURRENT PLANNED EVENTS (65%) -->
                <div class="col-xl-8 col-lg-7">
                    <div class="card shadow-sm border-0 rounded-3 bg-white">
                        <div class="card-header bg-dark text-white p-3 border-0">
                            <h5 class="card-title m-0 fw-bold"><i class="bi bi-list-ul text-warning me-2"></i>Liste des Événements Planifiés</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover table-striped align-middle m-0 text-sm">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Image</th>
                                            <th>Détails de l'événement</th>
                                            <th>Lieu / Date</th>
                                            <th class="text-center" style="width: 140px;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($events_list)): ?>
                                            <tr>
                                                <td colspan="4" class="text-center py-5 text-muted">
                                                    <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
                                                    Aucun événement configuré.
                                                </td>
                                            </tr>
                                        <?php else: ?>
                                            <?php foreach ($events_list as $ev): ?>
                                                <tr>
                                                    <td>
                                                        <?php 
                                                            $thumb_path = empty($ev['image_url']) 
                                                                ? "https://picsum.photos/seed/" . urlencode($ev['titre']) . "/100/100"
                                                                : ((str_starts_with($ev['image_url'], 'http://') || str_starts_with($ev['image_url'], 'https://')) ? $ev['image_url'] : '/uploads/' . $ev['image_url']);
                                                        ?>
                                                        <img src="<?= sanitize($thumb_path) ?>" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;" alt="Th" referrerPolicy="no-referrer">
                                                    </td>
                                                    <td>
                                                        <strong class="text-dark d-block text-base"><?= sanitize($ev['titre']) ?></strong>
                                                        <span class="text-secondary small d-inline-block text-truncate" style="max-width:320px;"><?= sanitize($ev['description']) ?></span>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-secondary-subtle text-dark border d-block mb-1 text-start"><i class="bi bi-geo-alt-fill text-danger"></i> <?= sanitize($ev['lieu']) ?></span>
                                                        <span class="badge bg-success-subtle text-success border d-block text-start"><i class="bi bi-calendar-event"></i> <?= date('d M Y', strtotime($ev['date_evenement'])) ?></span>
                                                    </td>
                                                    <td class="text-center">
                                                        <div class="btn-group">
                                                            <!-- Edit Trigger -->
                                                            <a href="?edit_id=<?= $ev['id'] ?>" class="btn btn-outline-primary btn-sm" title="Modifier">
                                                                <i class="bi bi-pencil-fill"></i>
                                                            </a>
                                                            <!-- Delete Trigger -->
                                                            <form method="POST" action="evenements.php" class="d-inline" onsubmit="return confirmItemDeletion(event, 'supprimer cet événement')">
                                                                <input type="hidden" name="action" value="delete">
                                                                <input type="hidden" name="id" value="<?= $ev['id'] ?>">
                                                                <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
                                                                <button type="submit" class="btn btn-outline-danger btn-sm" title="Supprimer">
                                                                    <i class="bi bi-trash-fill"></i>
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </main>
        
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
