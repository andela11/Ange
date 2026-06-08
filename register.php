<?php
/**
 * User Registration System - Register.php
 * 
 * Secure member signup form. Enforces anti-CSRF protections, validates email uniqueness,
 * and performs cryptographically secure password salting/hashing via password_hash().
 */
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/config/database.php';

// Redirect if user is already authenticated
if (is_logged_in()) {
    header("Location: index.php");
    exit;
}

$error_message = '';
$success_message = '';

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $password_confirm = $_POST['password_confirm'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';

    // 1. Verify CSRF Token
    if (!verify_csrf_token($csrf_token)) {
        $error_message = "Security verification expired. Please try submitting again.";
    }
    // 2. Validate essential inputs
    else if (empty($name) || empty($email) || empty($password)) {
        $error_message = "All fields are required.";
    } 
    // 3. Match passwords
    else if ($password !== $password_confirm) {
        $error_message = "Passwords do not match.";
    } 
    // 4. Validate email syntax
    else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_message = "Invalid email format.";
    } 
    // 5. Enforce password strength minimums
    else if (strlen($password) < 6) {
        $error_message = "Password must be at least 6 characters long.";
    } 
    else {
        try {
            // Check if email already registered
            $stmt_check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $stmt_check->execute([':email' => $email]);
            
            if ($stmt_check->fetch()) {
                $error_message = "An account with this email address already exists.";
            } else {
                // Hash with standard Bcrypt algorithms
                $hashed_password = password_hash($password, PASSWORD_BCRYPT);
                
                // Construct insertion (default role: user)
                $sql = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, 'user')";
                $stmt_insert = $pdo->prepare($sql);
                $stmt_insert->execute([
                    ':name' => $name,
                    ':email' => $email,
                    ':password' => $hashed_password
                ]);
                
                // Clear state
                $success_message = "Congratulations! Registration was successful. Please log in.";
                header("Refresh: 2; URL=login.php");
            }
        } catch (PDOException $e) {
            error_log("Database error during registration: " . $e->getMessage());
            $error_message = "An unexpected server error occurred. Please try again later.";
        }
    }
}

// Generate new secure CSRF token
$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S’enregistrer - Cameroun Cultural Portal</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-dark d-flex align-items-center justify-content-center min-vh-100" style="background: radial-gradient(circle, #212529 0%, #111416 100%) !important;">

<div class="container my-5">
    <div class="row justify-content-center">
        <div class="col-lg-5 col-md-8">
            
            <!-- Branding Header -->
            <div class="text-center mb-4">
                <a href="/index.php" class="text-decoration-none">
                    <h2 class="display-font text-warning fw-bold m-0"><i class="bi bi-star-fill text-warning me-2"></i>CamHeritage</h2>
                </a>
                <p class="text-white-50 small mt-1">Preserving Grassfields and Coastland Lineages</p>
            </div>

            <!-- Form Card wrap -->
            <div class="card border-0 shadow-lg bg-white" style="border-radius: 16px;">
                <div class="card-body p-4 p-md-5">
                    <h4 class="fw-bold text-dark text-center mb-4">Créer un compte</h4>
                    
                    <?php if (!empty($error_message)): ?>
                        <div class="alert alert-danger d-flex align-items-center" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            <div class="small"><?= sanitize($error_message) ?></div>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($success_message)): ?>
                        <div class="alert alert-success d-flex align-items-center" role="alert">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            <div class="small"><?= sanitize($success_message) ?></div>
                        </div>
                    <?php endif; ?>

                    <!-- Signup Form -->
                    <form method="POST" action="register.php" novalidate>
                        <!-- Anti-CSRF verification -->
                        <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

                        <!-- Nom complet -->
                        <div class="mb-3">
                            <label class="form-label text-secondary small fw-bold">Nom complet</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-person"></i></span>
                                <input type="text" name="name" class="form-control bg-light border-start-0 py-2.5" placeholder="ex: Fon Paul" value="<?= isset($_POST['name']) ? sanitize($_POST['name']) : '' ?>" required>
                            </div>
                        </div>

                        <!-- Adresse Email -->
                        <div class="mb-3">
                            <label class="form-label text-secondary small fw-bold">Adresse Email</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-envelope"></i></span>
                                <input type="email" name="email" class="form-control bg-light border-start-0 py-2.5" placeholder="ex: chef@culture.cm" value="<?= isset($_POST['email']) ? sanitize($_POST['email']) : '' ?>" required>
                            </div>
                        </div>

                        <!-- Mot de passe -->
                        <div class="mb-3">
                            <label class="form-label text-secondary small fw-bold">Mot de passe</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-lock"></i></span>
                                <input type="password" name="password" class="form-control bg-light border-start-0 py-2.5" placeholder="Min. 6 caractères" required>
                            </div>
                        </div>

                        <!-- Confirmer Mot de passe -->
                        <div class="mb-4">
                            <label class="form-label text-secondary small fw-bold">Confirmer le Mot de passe</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-shield-lock"></i></span>
                                <input type="password" name="password_confirm" class="form-control bg-light border-start-0 py-2.5" placeholder="Ressaisir mot de passe" required>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" class="btn btn-success w-100 py-2.5 fw-bold mb-3 border-0 shadow-sm" style="border-radius: 8px;">
                            S’inscrire <i class="bi bi-chevron-right small ms-1"></i>
                        </button>
                        
                        <div class="text-center small mt-3">
                            <span class="text-muted">Déjà membre ? </span>
                            <a href="login.php" class="text-success fw-bold text-decoration-none">Se connecter</a>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="text-center mt-3">
                <a href="/index.php" class="text-white-50 text-decoration-none small"><i class="bi bi-arrow-left"></i> Retour au site public</a>
            </div>

        </div>
    </div>
</div>

</body>
</html>
