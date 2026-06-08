<?php
/**
 * CRUD Controller - Manage Cultural Gallery (/admin/galerie.php)
 * 
 * Facilitates the uploading and deletion of visual heritage assets.
 * Each asset is associated with an active event title and date parameter.
 */
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../config/database.php';

// Safe check admin authorization
require_admin();

$success_msg = '';
$error_msg = '';

// 1. Process mutations (Insertion or Deletion)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf_token($csrf_token)) {
        $error_msg = "CSRF verification mismatch. Modification denied.";
    } 
    else {
        // ACTION A: Delete archive photo
        if ($action === 'delete') {
            $id = (int)($_POST['id'] ?? 0);
            try {
                // Determine image filename first to also clear the disk asset if we want
                $stmt_file = $pdo->prepare("SELECT photo FROM galerie WHERE id = :id");
                $stmt_file->execute([':id' => $id]);
                $filename = $stmt_file->fetchColumn();

                // Delete query
                $stmt = $pdo->prepare("DELETE FROM galerie WHERE id = :id");
                $stmt->execute([':id' => $id]);

                // Clear disk if applicable
                if ($filename && !str_starts_with($filename, 'http') && file_exists('../uploads/' . $filename)) {
                    @unlink('../uploads/' . $filename);
                }

                $success_msg = "La photo a été retirée de la galerie.";
            } catch (PDOException $e) {
                $error_msg = "Database delete error: " . $e->getMessage();
            }
        }
        // ACTION B: Upload and register new photo
        else if ($action === 'upload') {
            $titre = trim($_POST['titre'] ?? '');
            $date_evenement = $_POST['date_evenement'] ?? '';

            if (empty($titre) || empty($date_evenement)) {
                $error_msg = "Le titre et la date d'événement sont obligatoires.";
            } else {
                // Execute file upload
                $uploaded_filename = handle_image_upload($_FILES['photo'] ?? null, '../uploads/');

                if ($uploaded_filename === false) {
                    $error_msg = "Le téléversement de la photo a échoué. Assurez-vous d'avoir choisi un fichier image valide (jpeg, png, gif, webp - max 5MB).";
                } else {
                    try {
                        $stmt_insert = $pdo->prepare("INSERT INTO galerie (titre, photo, date_evenement) VALUES (:titre, :photo, :date_evenement)");
                        $stmt_insert->execute([
                            ':titre' => $titre,
                            ':photo' => $uploaded_filename,
                            ':date_evenement' => $date_evenement
                        ]);
                        $success_msg = "L'image a été importée et ajoutée à la galerie publique avec succès.";
                    } catch (PDOException $e) {
                        error_log("Failed storing gallery file row: " . $e->getMessage());
                        $error_msg = "La photo a été uploadée mais l'enregistrement en BDD a échoué.";
                    }
                }
            }
        }
    }
}

// 2. Fetch all current gallery pictures for list table
try {
    $stmt_list = $pdo->query("SELECT * FROM galerie ORDER BY date_evenement DESC");
    $gallery_list = $stmt_list->fetchAll();
} catch (PDOException $e) {
    error_log("Error recovering gallery: " . $e->getMessage());
    $gallery_list = [];
}

$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gérer Galerie - Administration Panel</title>
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

<!-- Top header navigation bar -->
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
                        <a class="nav-link active d-flex align-items-center" href="/admin/galerie.php">
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

        <!-- MAIN WORKSPACE PORTAL -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-4 border-bottom">
                <div>
                    <h1 class="h2 text-dark fw-bold"><i class="bi bi-images text-success me-2"></i>Gestion de la Galerie Culturelle</h1>
                    <p class="text-secondary small">Téléversez des photos d'artifices, cérémonies traditionnels et mœurs pour alimenter la galerie publique et le carousel.</p>
                </div>
            </div>

            <!-- MUTATIONAL ALERTS -->
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
                
                <!-- ROW LEFT COLUMN: TELEFERIQUE UPLOAD FORM (35%) -->
                <div class="col-xl-4 col-lg-5">
                    <div class="card shadow-sm border-0 rounded-3 bg-white">
                        <div class="card-header bg-dark text-white p-3">
                            <h5 class="card-title m-0 fw-bold"><i class="bi bi-cloud-upload-fill text-success me-2"></i>Téléverser une Photo</h5>
                        </div>
                        <div class="card-body p-4">
                            <form method="POST" action="galerie.php" enctype="multipart/form-data">
                                <input type="hidden" name="action" value="upload">
                                <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

                                <!-- Titre de la photo -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Légende de la photo</label>
                                    <input type="text" name="titre" class="form-control bg-light text-dark py-2" placeholder="ex: Showcase d'atours Bamileke" required>
                                </div>

                                <!-- Date d'événement -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Date d'événement associée</label>
                                    <input type="date" name="date_evenement" class="form-control bg-light text-dark py-2" required>
                                </div>

                                <!-- Fichier Image -->
                                <div class="mb-4">
                                    <label class="form-label text-dark fw-semibold small">Fichier Image</label>
                                    <input type="file" name="photo" class="form-control text-sm py-1.5" accept="image/*" required>
                                    <small class="text-muted d-block mt-1">Accepté: JPG, PNG, GIF, WEBP (Max: 5MB)</small>
                                </div>

                                <button type="submit" class="btn btn-success w-100 fw-bold border-0 py-2">
                                    Téléverser & Enregistrer <i class="bi bi-plus-circle-fill small ms-1"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- ROW RIGHT COLUMN: CURRENT GALLERY LISTS (65%) -->
                <div class="col-xl-8 col-lg-7">
                    <div class="card shadow-sm border-0 rounded-3 bg-white">
                        <div class="card-header bg-dark text-white p-3 border-0">
                            <h5 class="card-title m-0 fw-bold"><i class="bi bi-images text-warning me-2"></i>Photos de l'Album Communautaire</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover table-striped align-middle m-0 text-sm">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Aperçu</th>
                                            <th>Légende / Titre</th>
                                            <th>Date Associée</th>
                                            <th class="text-center" style="width: 120px;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($gallery_list)): ?>
                                            <tr>
                                                <td colspan="4" class="text-center py-5 text-muted">
                                                    <i class="bi bi-images fs-2 d-block mb-2"></i>
                                                    Aucune photo n'est présente dans l'album.
                                                </td>
                                            </tr>
                                        <?php else: ?>
                                            <?php foreach ($gallery_list as $img): ?>
                                                <tr>
                                                    <td>
                                                        <?php 
                                                            $img_src = (str_starts_with($img['photo'], 'http://') || str_starts_with($img['photo'], 'https://')) 
                                                                ? $img['photo'] 
                                                                : '/uploads/' . $img['photo'];
                                                        ?>
                                                        <img src="<?= sanitize($img_src) ?>" style="width: 65px; height: 50px; object-fit: cover; border-radius: 4px;" alt="Th" referrerPolicy="no-referrer">
                                                    </td>
                                                    <td>
                                                        <strong class="text-dark d-block text-base"><?= sanitize($img['titre']) ?></strong>
                                                        <span class="text-muted small">ID: #<?= $img['id'] ?></span>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-success-subtle text-success border"><i class="bi bi-calendar-event"></i> <?= date('d M Y', strtotime($img['date_evenement'])) ?></span>
                                                    </td>
                                                    <td class="text-center">
                                                        <!-- Delete Trigger -->
                                                        <form method="POST" action="galerie.php" class="d-inline" onsubmit="return confirmItemDeletion(event, 'supprimer cette photo de l\'album')">
                                                            <input type="hidden" name="action" value="delete">
                                                            <input type="hidden" name="id" value="<?= $img['id'] ?>">
                                                            <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
                                                            <button type="submit" class="btn btn-outline-danger btn-sm" title="Retirer">
                                                                <i class="bi bi-trash3-fill"></i> Supprimer
                                                            </button>
                                                        </form>
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
