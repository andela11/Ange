<?php
/**
 * User Authentication login.php
 * 
 * Session-based member login panel. Collects credentials, queries the MySQL users table,
 * matches salts securely via password_verify(), and redirects to dashboard (admin) or home (member).
 */
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/config/database.php';

// Redirect if user already logged in
if (is_logged_in()) {
    header("Location: index.php");
    exit;
}

$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';

    // Verify token
    if (!verify_csrf_token($csrf_token)) {
        $error_message = "Session verification expired. Please retry submitting.";
    } 
    else if (empty($email) || empty($password)) {
         $error_message = "All fields are required.";
    } 
    else {
        try {
            // Perform parameterized email matching query
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();

            // Verify password using cryptographically stable password_verify algorithm
            if ($user && password_verify($password, $user['password'])) {
                // Safeguard against Session Fixation (re-generate active session ID)
                session_regenerate_id(true);

                // Elevate session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_role'] = $user['role']; // user or admin

                $success_message = "Welcome back, " . $user['name'] . "!";
                
                // Route according to user capability
                if ($user['role'] === 'admin') {
                    header("Refresh: 1.5; URL=admin/index.php");
                } else {
                    header("Refresh: 1.5; URL=index.php");
                }
            } else {
                $error_message = "Invalid email or password.";
            }

        } catch (PDOException $e) {
            error_log("Database exception during signin: " . $e->getMessage());
            $error_message = "Server error. Please try logging in again.";
        }
    }
}

// Generate secure anti-CSRF token
$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - Cameroun Cultural Portal</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-dark d-flex align-items-center justify-content-center min-vh-100" style="background: radial-gradient(circle, #212529 0%, #111416 100%) !important;">

<div class="container">
    <div class="row justify-content-center">
        <div class="col-lg-4 col-md-7">
            
            <!-- Logo Section -->
            <div class="text-center mb-4">
                <a href="/index.php" class="text-decoration-none">
                    <h2 class="display-font text-warning fw-bold m-0"><i class="bi bi-star-fill text-warning me-2"></i>CamHeritage</h2>
                </a>
                <p class="text-white-50 small mt-1">Cultural portal & events notification deck</p>
            </div>

            <div class="card border-0 shadow-lg bg-white" style="border-radius: 16px;">
                <div class="card-body p-4 p-md-5">
                    <h4 class="fw-bold text-dark text-center mb-4">Se connecter</h4>
                    
                    <?php if (!empty($error_message)): ?>
                        <div class="alert alert-danger d-flex align-items-center" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2 bg-transparent text-danger"></i>
                            <div class="small"><?= sanitize($error_message) ?></div>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($success_message)): ?>
                        <div class="alert alert-success d-flex align-items-center" role="alert">
                            <i class="bi bi-check-circle-fill me-2 bg-transparent text-success"></i>
                            <div class="small"><?= sanitize($success_message) ?></div>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="login.php" novalidate>
                        <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

                        <!-- Username/Email -->
                        <div class="mb-3">
                            <label class="form-label text-secondary small fw-bold">Adresse Email</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-envelope"></i></span>
                                <input type="email" name="email" class="form-control bg-light border-start-0 py-2.5" placeholder="ex: admin@culture.cm" value="<?= isset($_POST['email']) ? sanitize($_POST['email']) : '' ?>" required>
                            </div>
                        </div>

                        <!-- Password -->
                        <div class="mb-4">
                            <label class="form-label text-secondary small fw-bold">Mot de passe</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-lock"></i></span>
                                <input type="password" name="password" class="form-control bg-light border-start-0 py-2.5" placeholder="Saisir mot de passe" required>
                            </div>
                        </div>

                        <!-- Login button -->
                        <button type="submit" class="btn btn-success w-100 py-2.5 fw-bold mb-3 border-0 shadow-sm" style="border-radius: 8px;">
                            Connexion <i class="bi bi-box-arrow-in-right small ms-1"></i>
                        </button>
                        
                        <div class="text-center small mt-3">
                            <span class="text-muted">Pas encore membre ? </span>
                            <a href="register.php" class="text-success fw-bold text-decoration-none">S’inscrire gratuitement</a>
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
