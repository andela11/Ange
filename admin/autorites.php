<?php
/**
 * CRUD Controller - Manage Authorities (/admin/autorites.php)
 * 
 * Secure system managing political leaders, rulers and paramount Fons.
 * Implements PDO-prepared transactions, path-sanitization uploads, and ordinal
 * display ranking controls.
 */
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../config/database.php';

// Enforce admin validation
require_admin();

$success_msg = '';
$error_msg = '';

$edit_mode = false;
$aut_id = '';
$aut_nom = '';
$aut_titre = '';
$aut_type = 'traditional';
$aut_photo = '';
$aut_description = '';
$aut_ordre_affichage = 0;

// 1. Process Database Mutations (Form POSTs)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf_token($csrf_token)) {
        $error_msg = "CSRF verification mismatch. Modification denied.";
    } 
    else {
        // ACTION A: Delete authority record
        if ($action === 'delete') {
            $id = (int)($_POST['id'] ?? 0);
            try {
                $stmt = $pdo->prepare("DELETE FROM autorites WHERE id = :id");
                $stmt->execute([':id' => $id]);
                $success_msg = "L'autorité a été supprimée avec succès.";
            } catch (PDOException $e) {
                $error_msg = "Database delete error: " . $e->getMessage();
            }
        }
        // ACTION B: Insert / Save modifications
        else if ($action === 'save') {
            $id = $_POST['id'] ?? '';
            $nom = trim($_POST['nom'] ?? '');
            $titre = trim($_POST['titre'] ?? '');
            $type = $_POST['type'] ?? 'traditional';
            $description = trim($_POST['description'] ?? '');
            $ordre_affichage = (int)($_POST['ordre_affichage'] ?? 0);

            if (empty($nom) || empty($titre) || empty($description)) {
                $error_msg = "Please fill in all textual values.";
            } else {
                // Securely execute file upload
                $uploaded_photo = handle_image_upload($_FILES['photo'] ?? null, '../uploads/');
                
                try {
                    // Scenario B1: Editing existing authority
                    if (!empty($id)) {
                        $id = (int)$id;

                        // Retrieve original file path
                        $stmt_orig = $pdo->prepare("SELECT photo FROM autorites WHERE id = :id");
                        $stmt_orig->execute([':id' => $id]);
                        $orig_photo = $stmt_orig->fetchColumn();

                        // Fallbacks
                        $final_photo = ($uploaded_photo !== false) ? $uploaded_photo : ($orig_photo ? $orig_photo : '');

                        $stmt_update = $pdo->prepare("UPDATE autorites SET nom = :nom, titre = :titre, type = :type, photo = :photo, description = :description, ordre_affichage = :ordre_affichage WHERE id = :id");
                        $stmt_update->execute([
                            ':nom' => $nom,
                            ':titre' => $titre,
                            ':type' => $type,
                            ':photo' => $final_photo,
                            ':description' => $description,
                            ':ordre_affichage' => $ordre_affichage,
                            ':id' => $id
                        ]);
                        $success_msg = "L'autorité a été mise à jour avec succès.";
                    } 
                    // Scenario B2: Creating a new authority
                    else {
                        // Image upload is required for a new entry in our spec
                        if ($uploaded_photo === false) {
                            $error_msg = "Une photo officielle est requise pour insérer une nouvelle autorité.";
                        } else {
                            $stmt_insert = $pdo->prepare("INSERT INTO autorites (nom, titre, type, photo, description, ordre_affichage) VALUES (:nom, :titre, :type, :photo, :description, :ordre_affichage)");
                            $stmt_insert->execute([
                                ':nom' => $nom,
                                ':titre' => $titre,
                                ':type' => $type,
                                ':photo' => $uploaded_photo,
                                ':description' => $description,
                                ':ordre_affichage' => $ordre_affichage
                            ]);
                            $success_msg = "La nouvelle autorité administrative/traditionnelle a bien été ajoutée.";
                        }
                    }
                } catch (PDOException $e) {
                    error_log("Database execution exception: " . $e->getMessage());
                    $error_msg = "Query transaction failed. Could not write records.";
                }
            }
        }
    }
}

// 2. Query target details if loading in EDIT mode
if (isset($_GET['edit_id']) && empty($error_msg)) {
    $edit_id = (int)$_GET['edit_id'];
    try {
        $stmt_edit = $pdo->prepare("SELECT * FROM autorites WHERE id = :id LIMIT 1");
        $stmt_edit->execute([':id' => $edit_id]);
        $edit_aut = $stmt_edit->fetch();
        if ($edit_aut) {
            $edit_mode = true;
            $aut_id = $edit_aut['id'];
            $aut_nom = $edit_aut['nom'];
            $aut_titre = $edit_aut['titre'];
            $aut_type = $edit_aut['type'];
            $aut_photo = $edit_aut['photo'];
            $aut_description = $edit_aut['description'];
            $aut_ordre_affichage = $edit_aut['ordre_affichage'];
        }
    } catch (PDOException $e) {
        $error_msg = "Query failed loading edit record details.";
    }
}

// 3. Fetch listings of all authorities ordered by display priority ranks
try {
    $stmt_list = $pdo->query("SELECT * FROM autorites ORDER BY ordre_affichage ASC, nom ASC");
    $authorities_list = $stmt_list->fetchAll();
} catch (PDOException $e) {
    error_log("Error recovering list: " . $e->getMessage());
    $authorities_list = [];
}

$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gérer Autorités - Administration Panel</title>
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

<!-- Top header navigation -->
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
                        <a class="nav-link active d-flex align-items-center" href="/admin/autorites.php">
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

        <!-- MAIN CRUD COMPILER -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-4 border-bottom">
                <div>
                    <h1 class="h2 text-dark fw-bold"><i class="bi bi-shield-fill text-success me-2"></i>Gestion des Autorités</h1>
                    <p class="text-secondary small">Établissez et filtrez le répertoire des chefs traditionnels (Fons) et leaders officiels de la région.</p>
                </div>
            </div>

            <!-- MUTATIONAL STATUS MESSAGES -->
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
                
                <!-- COLUMN LEFT: CREATE OR EDIT ELEMENT (35%) -->
                <div class="col-xl-4 col-lg-5">
                    <div class="card shadow-sm border-0 rounded-3 bg-white">
                        <div class="card-header bg-dark text-white p-3">
                            <h5 class="card-title m-0 fw-bold">
                                <i class="bi <?= $edit_mode ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-success' ?> me-2"></i>
                                <?= $edit_mode ? "Modifier l'Autorité" : "Ajouter une Autorité" ?>
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <form method="POST" action="autorites.php" enctype="multipart/form-data">
                                <input type="hidden" name="action" value="save">
                                <input type="hidden" name="id" value="<?= sanitize($aut_id) ?>">
                                <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

                                <!-- Nom complet -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Nom de l'autorité</label>
                                    <input type="text" name="nom" class="form-control bg-light text-dark py-2" placeholder="ex: Fon Angwafo IV" value="<?= sanitize($aut_nom) ?>" required>
                                </div>

                                <!-- Titre / Rôle -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Titre ou Rôle Officiel</label>
                                    <input type="text" name="titre" class="form-control bg-light text-dark py-2" placeholder="ex: Grand Fon of Mankon" value="<?= sanitize($aut_titre) ?>" required>
                                </div>

                                <!-- Type -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Type de gouvernance</label>
                                    <select name="type" class="form-select bg-light text-dark py-2" required>
                                        <option value="traditional" <?= $aut_type === 'traditional' ? 'selected' : '' ?>>Traditionnelle (Fon, Chef, etc.)</option>
                                        <option value="administrative" <?= $aut_type === 'administrative' ? 'selected' : '' ?>>Administrative (Gouverneur, Maire, Préfet)</option>
                                    </select>
                                </div>

                                <!-- Ordre d'affichage -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Ordre d'affichage (Tri)</label>
                                    <input type="number" name="ordre_affichage" class="form-control bg-light text-dark py-2" value="<?= (int)$aut_ordre_affichage ?>" min="0" required>
                                    <small class="text-muted small">Les petits nombres s'affichent en premier.</small>
                                </div>

                                <!-- Description / Biographie -->
                                <div class="mb-3">
                                    <label class="form-label text-dark fw-semibold small">Aperçu biographique & Mission</label>
                                    <textarea name="description" class="form-control bg-light text-dark py-2" rows="4" placeholder="..." required><?= sanitize($aut_description) ?></textarea>
                                </div>

                                <!-- File Upload Image -->
                                <div class="mb-4">
                                    <label class="form-label text-dark fw-semibold small">Photo officielle</label>
                                    <input type="file" name="photo" class="form-control text-sm py-1.5" accept="image/*" <?= $edit_mode ? '' : 'required' ?>>
                                    <small class="text-muted d-block mt-1">Accepté: JPG, PNG, GIF, WEBP (Max: 5MB)</small>
                                    <?php if ($edit_mode && !empty($aut_photo)): ?>
                                        <div class="mt-2.5 p-2 bg-light border rounded text-center">
                                            <span class="small d-block text-muted mb-1">Photo Actuelle:</span>
                                            <?php 
                                                $path = (str_starts_with($aut_photo, 'http://') || str_starts_with($aut_photo, 'https://')) ? $aut_photo : '/uploads/' . $aut_photo;
                                            ?>
                                            <img src="<?= sanitize($path) ?>" style="max-height: 80px;" class="img-thumbnail" alt="Thumb" referrerPolicy="no-referrer">
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-success flex-grow-1 fw-bold border-0 py-2">
                                        <?= $edit_mode ? 'Sauvegarder Edition' : 'Ajouter l\'Autorité' ?>
                                    </button>
                                    <?php if ($edit_mode): ?>
                                        <a href="autorites.php" class="btn btn-outline-secondary py-2">Wipe</a>
                                    <?php endif; ?>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>

                <!-- COLUMN RIGHT: REGISTERED AUTHORITIES (65%) -->
                <div class="col-xl-8 col-lg-7">
                    <div class="card shadow-sm border-0 rounded-3 bg-white">
                        <div class="card-header bg-dark text-white p-3 border-0">
                            <h5 class="card-title m-0 fw-bold"><i class="bi bi-shield-shaded text-warning me-2"></i>Répertoire des Autorités</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover table-striped align-middle m-0 text-sm">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Photo</th>
                                            <th>Nom & Titre</th>
                                            <th>Type / Tri</th>
                                            <th class="text-center" style="width: 140px;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($authorities_list)): ?>
                                            <tr>
                                                <td colspan="4" class="text-center py-5 text-muted">
                                                    <i class="bi bi-people-fill fs-2 d-block mb-2"></i>
                                                    Aucune autorité répertoriée.
                                                </td>
                                            </tr>
                                        <?php else: ?>
                                            <?php foreach ($authorities_list as $auth): ?>
                                                <tr>
                                                    <td>
                                                        <?php 
                                                            $thumb_path = empty($auth['photo']) 
                                                                ? "https://picsum.photos/seed/" . urlencode($auth['nom']) . "/100/100"
                                                                : ((str_starts_with($auth['photo'], 'http://') || str_starts_with($auth['photo'], 'https://')) ? $auth['photo'] : '/uploads/' . $auth['photo']);
                                                        ?>
                                                        <img src="<?= sanitize($thumb_path) ?>" style="width: 55px; height: 55px; object-fit: cover; border-radius: 50%;" alt="Th" referrerPolicy="no-referrer">
                                                    </td>
                                                    <td>
                                                        <strong class="text-dark d-block text-base"><?= sanitize($auth['nom']) ?></strong>
                                                        <span class="text-success small fw-semibold font-monospace"><?= sanitize($auth['titre']) ?></span>
                                                    </td>
                                                    <td>
                                                        <span class="badge mb-1 d-block text-start <?= $auth['type'] === 'traditional' ? 'badge-traditional' : 'badge-administrative' ?>">
                                                            <?= $auth['type'] === 'traditional' ? 'Traditionnel' : 'Administratif' ?>
                                                        </span>
                                                        <span class="badge bg-light text-dark border d-block text-start small">Position Tri: <?= $auth['ordre_affichage'] ?></span>
                                                    </td>
                                                    <td class="text-center">
                                                        <div class="btn-group">
                                                            <a href="?edit_id=<?= $auth['id'] ?>" class="btn btn-outline-primary btn-sm" title="Modifier">
                                                                <i class="bi bi-pencil-fill"></i>
                                                            </a>
                                                            <form method="POST" action="autorites.php" class="d-inline" onsubmit="return confirmItemDeletion(event, 'retirer cet officiel')">
                                                                <input type="hidden" name="action" value="delete">
                                                                <input type="hidden" name="id" value="<?= $auth['id'] ?>">
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
