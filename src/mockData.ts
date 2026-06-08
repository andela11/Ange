export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Evenement {
  id: number;
  titre: string;
  description: string;
  date_evenement: string;
  lieu: string;
  image_url: string;
  created_at: string;
}

export interface Autorite {
  id: number;
  nom: string;
  titre: string;
  type: 'traditional' | 'administrative';
  photo: string;
  description: string;
  ordre_affichage: number;
}

export interface GalerieItem {
  id: number;
  titre: string;
  photo: string;
  date_evenement: string;
}

export interface Notification {
  id: number;
  user_id: number;
  titre: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Cameroun Culture Admin', email: 'admin@culture.cm', role: 'admin' },
  { id: 2, name: 'Fon Paul', email: 'member@culture.cm', role: 'user' },
];

export const INITIAL_AUTORITES: Autorite[] = [
  {
    id: 1,
    nom: 'His Royal Highness Fon Angwafo IV',
    titre: 'Grand Fon of Mankon',
    type: 'traditional',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    description: 'Traditional paramount ruler of the Mankon kingdom. Custodian of ancestral customs, heritage, and the cultural beacon of the region.',
    ordre_affichage: 1
  },
  {
    id: 2,
    nom: 'His Excellency Adolphe Lele L\'Afrique',
    titre: 'Governor of the North West Region',
    type: 'administrative',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    description: 'State administrative executive managing administrative affairs, ensuring public order, and coordinating regional activities.',
    ordre_affichage: 2
  },
  {
    id: 3,
    nom: 'Their Royal Highnesses of Southern Grassfields',
    titre: 'Traditional Council of Rulers',
    type: 'traditional',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    description: 'Sovereign advisory council overseeing community rituals, resolving traditional boundary claims, and acting as primary diplomats.',
    ordre_affichage: 3
  }
];

export const INITIAL_EVENEMENTS: Evenement[] = [
  {
    id: 1,
    titre: 'Lela Cultural Festival',
    description: 'Annual majestic gathering of the Bali Nyonga people. Feathers, drumming, traditional military marches, and royal parade in full cultural attire.',
    date_evenement: '2026-12-18',
    lieu: 'Bali Nyonga Palace Ground',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
    created_at: '2026-06-01T12:00:00Z'
  },
  {
    id: 2,
    titre: 'Toko-Kunda Dance Ceremony',
    description: 'A grand festival honoring ancestors and community bonding featuring specific traditional dances from the Anglophone highlands.',
    date_evenement: '2026-07-25',
    lieu: 'Fako Community Hall, Buea',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    created_at: '2026-06-03T10:30:00Z'
  },
  {
    id: 3,
    titre: 'Traditional Rulers Council Summit',
    description: 'An administrative and cultural integration workshop for North West and South West region chefs to coordinate heritage protection.',
    date_evenement: '2025-11-10',
    lieu: 'Bamenda Cultural Center',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    created_at: '2025-11-01T09:15:00Z'
  }
];

export const INITIAL_GALERIE: GalerieItem[] = [
  {
    id: 1,
    titre: 'Toghu Royal Attire Showcase',
    photo: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800',
    date_evenement: '2025-12-18'
  },
  {
    id: 2,
    titre: 'Traditional Gong and Drumming',
    photo: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800',
    date_evenement: '2025-07-25'
  },
  {
    id: 3,
    titre: 'Bamenda Highlands Landscape',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    date_evenement: '2025-11-10'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 2,
    titre: 'Nouvel Événement: Lela Cultural Festival',
    message: 'Un nouvel événement culturel est prévu le 18 Dec 2026 à Bali Nyonga Palace Ground. Cliquez pour en savoir plus.',
    status: 'unread',
    created_at: '2026-06-08T09:30:00Z'
  },
  {
    id: 2,
    user_id: 2,
    titre: 'Rappel d\'Assemblée',
    message: 'N\'oubliez pas la réunion du Conseil des Rulers ce soir à 18h.',
    status: 'read',
    created_at: '2026-06-07T14:15:00Z'
  }
];

// PHP Source code contents to show in browser
export const PHP_CODEBASE = {
  'schema.sql': {
    title: 'Database Schema (SQL)',
    lang: 'sql',
    path: '/schema.sql',
    code: `-- ====================================================================
-- CAMEROON CULTURAL PORTAL DATABASE SCHEMA
-- This SQL script creates the database and all necessary tables 
-- for the procedural PHP application.
-- ====================================================================

CREATE DATABASE IF NOT EXISTS \`cameroun_culture_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`cameroun_culture_db\`;

-- 1. TABLE: users
CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`name\` VARCHAR(100) NOT NULL,
    \`email\` VARCHAR(150) NOT NULL UNIQUE,
    \`password\` VARCHAR(255) NOT NULL,
    \`role\` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABLE: evenements
CREATE TABLE IF NOT EXISTS \`evenements\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`titre\` VARCHAR(150) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`date_evenement\` DATE NOT NULL,
    \`lieu\` VARCHAR(150) NOT NULL,
    \`image_url\` VARCHAR(255) NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABLE: autorites
CREATE TABLE IF NOT EXISTS \`autorites\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`nom\` VARCHAR(150) NOT NULL,
    \`titre\` VARCHAR(150) NOT NULL,
    \`type\` ENUM('traditional', 'administrative') NOT NULL,
    \`photo\` VARCHAR(255) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`ordre_affichage\` INT DEFAULT 0,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABLE: galerie
CREATE TABLE IF NOT EXISTS \`galerie\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`titre\` VARCHAR(150) NOT NULL,
    \`photo\` VARCHAR(255) NOT NULL,
    \`date_evenement\` DATE NOT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABLE: notifications
CREATE TABLE IF NOT EXISTS \`notifications\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`user_id\` INT NOT NULL,
    \`titre\` VARCHAR(150) NOT NULL,
    \`message\` TEXT NOT NULL,
    \`status\` ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`fk_notifications_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  'database.php': {
    title: 'Database connection config',
    lang: 'php',
    path: '/config/database.php',
    code: `<?php
/**
 * PHP Procedural Database Connection File
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'cameroun_culture_db');
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    die("An error occurred connecting to the database.");
}
?>`
  },
  'functions.php': {
    title: 'Security helper functions',
    lang: 'php',
    path: '/includes/functions.php',
    code: `<?php
/**
 * Global helper security procedures and auth guards
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function sanitize($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    if (!isset($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

function is_logged_in() {
    return isset($_SESSION['user_id']);
}

function is_admin() {
    return is_logged_in() && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

function require_admin() {
    if (!is_admin()) {
        header("Location: ../login.php?error=unauthorized");
        exit;
    }
}

function handle_image_upload($file, $target_dir = '../uploads/') {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    $max_size = 5 * 1024 * 1024;
    if ($file['size'] > $max_size) {
        return false;
    }
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowed_extensions)) {
        return false;
    }
    $new_filename = uniqid('img_', true) . '.' . $extension;
    if (move_uploaded_file($file['tmp_name'], $target_dir . $new_filename)) {
        return $new_filename;
    }
    return false;
}

function create_global_notification($pdo, $titre, $message) {
    $stmt_users = $pdo->query("SELECT id FROM users");
    $users = $stmt_users->fetchAll();
    if (empty($users)) return true;

    $stmt_notif = $pdo->prepare("INSERT INTO notifications (user_id, titre, message, status) VALUES (:user_id, :titre, :message, 'unread')");
    $pdo->beginTransaction();
    foreach ($users as $user) {
        $stmt_notif->execute([':user_id' => $user['id'], ':titre' => $titre, ':message' => $message]);
    }
    $pdo->commit();
    return true;
}
?>`
  },
  'index.php': {
    title: 'Landing Page (home)',
    lang: 'php',
    path: '/index.php',
    code: `<?php
/**
 * Public Landing HomePage
 */
require_once __DIR__ . '/includes/header.php';

// Fetch carousel, upcoming events (3 next ones), and main traditional authorities
$stmt_gallery = $pdo->query("SELECT * FROM galerie ORDER BY date_evenement DESC LIMIT 5");
$carousel_images = $stmt_gallery->fetchAll();

$stmt_events = $pdo->query("SELECT * FROM evenements ORDER BY date_evenement ASC LIMIT 3");
$upcoming_events = $stmt_events->fetchAll();

$stmt_authorities = $pdo->query("SELECT * FROM autorites ORDER BY ordre_affichage ASC LIMIT 3");
$key_authorities = $stmt_authorities->fetchAll();
?>

<h3>Carousel Culturel</h3>
<!-- Carousel of $carousel_images -->

<h3>Événements à Venir</h3>
<!-- Listing of $upcoming_events -->

<h3>Autorités de la Région</h3>
<!-- Cards of $key_authorities -->

<?php require_once __DIR__ . '/includes/footer.php'; ?>`
  },
  'culture.php': {
    title: 'Cultural Image Gallery',
    lang: 'php',
    path: '/culture.php',
    code: `<?php
/**
 * Gallery and Lightbox Listing
 */
require_once __DIR__ . '/includes/header.php';
$stmt = $pdo->query("SELECT * FROM galerie ORDER BY date_evenement DESC");
$gallery_items = $stmt->fetchAll();
?>
<h2>Galerie d'Art & Culture</h2>
<div class="row">
    <?php foreach($gallery_items as $item): ?>
        <div class="col-md-4" onclick="openLightbox('<?= sanitize($item['photo']) ?>', '<?= sanitize($item['titre']) ?>')">
            <img src="/uploads/<?= sanitize($item['photo']) ?>">
            <p><?= sanitize($item['titre']) ?></p>
        </div>
    <?php endforeach; ?>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>`
  },
  'admin_evenements.php': {
    title: 'Events CRUD & Auto Notifications',
    lang: 'php',
    path: '/admin/evenements.php',
    code: `<?php
/**
 * Admin Panel for Events CRUD
 * Automatically launches a notification row to all registered users
 */
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../config/database.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && verify_csrf_token($_POST['csrf_token'])) {
    if ($_POST['action'] === 'save') {
        // Insertion logic
        $uploaded_file = handle_image_upload($_FILES['image']);
        $stmt_insert = $pdo->prepare("INSERT INTO evenements (titre, description, date_evenement, lieu, image_url) VALUES (...)");
        $stmt_insert->execute(...);

        // Instant Notification Broadcast
        create_global_notification($pdo, "Nouvel Événement: " . $_POST['titre'], "Un nouvel événement est planifié le " . $_POST['date_evenement']);
    }
}
?>`
  }
};
