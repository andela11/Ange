<?php
/**
 * Public Events Council - Evenements.php
 * 
 * Aggregates all regional developmental and cultural events.
 * Organizes events chronologically. Provides filters for "All", 
 * "Upcoming Events" (future-scheduled) and "Past Celebrations" (archived history).
 */
require_once __DIR__ . '/includes/header.php';

// Safe extraction of filter parameters
$filter = $_GET['filter'] ?? 'all';
if (!in_array($filter, ['all', 'upcoming', 'past'])) {
    $filter = 'all';
}

$today = gmdate('Y-m-d');

// Construct PDO queries based on filtration demands
try {
    if ($filter === 'upcoming') {
        $sql = "SELECT * FROM evenements WHERE date_evenement >= :today ORDER BY date_evenement ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':today' => $today]);
    } else if ($filter === 'past') {
        $sql = "SELECT * FROM evenements WHERE date_evenement < :today ORDER BY date_evenement DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':today' => $today]);
    } else {
        $sql = "SELECT * FROM evenements ORDER BY date_evenement DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }
    $events = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log("Error loading events directory: " . $e->getMessage());
    $events = [];
}
?>

<div class="row align-items-center mb-4 border-bottom pb-3 g-2">
    <div class="col-md-8">
        <h2 class="fw-bold text-success m-0"><i class="bi bi-calendar-event text-warning me-2"></i>Programme des Événements & Réunions</h2>
        <p class="text-secondary small m-0">Stay informed about cultural assemblies, developmental council forums, workshops, and traditional dances.</p>
    </div>
    <div class="col-md-4 text-md-end text-start">
        <?php if (is_admin()): ?>
            <a href="/admin/evenements.php" class="btn btn-warning btn-sm fw-bold"><i class="bi bi-plus-circle-fill"></i> Gérer Événements</a>
        <?php endif; ?>
    </div>
</div>

<!-- Chronological Filter Switches -->
<div class="row mb-5 justify-content-center">
    <div class="col-md-7">
        <div class="card p-2 bg-white shadow-sm" style="border-radius: 30px;">
            <div class="nav nav-pills nav-fill justify-content-center border-0">
                <a class="nav-link px-3 <?= $filter === 'all' ? 'active bg-success text-white' : 'text-dark' ?>" 
                   style="border-radius: 20px; font-weight: 500;" 
                   href="?filter=all"><i class="bi bi-collection-fill me-1"></i>Tous</a>
                <a class="nav-link px-3 <?= $filter === 'upcoming' ? 'active bg-success text-white' : 'text-dark' ?>" 
                   style="border-radius: 20px; font-weight: 500;" 
                   href="?filter=upcoming"><i class="bi bi-hourglass-split me-1"></i>À Venir (Futurs)</a>
                <a class="nav-link px-3 <?= $filter === 'past' ? 'active bg-success text-white' : 'text-dark' ?>" 
                   style="border-radius: 20px; font-weight: 500;" 
                   href="?filter=past"><i class="bi bi-calendar-check-fill me-1"></i>Passés (Archives)</a>
            </div>
        </div>
    </div>
</div>

<!-- Sequential Listings of Events -->
<div class="row g-4 mb-5">
    <?php if (empty($events)): ?>
        <div class="col-12 text-center py-5 bg-white rounded-3 shadow-sm border border-light-subtle">
            <i class="bi bi-calendar-minus text-warning display-2 mb-3"></i>
            <h4 class="fw-bold">Aucun Événement Trouvé</h4>
            <p class="text-muted small">Aucun événement ne correspond à ce filtre pour le moment.</p>
            <a href="?filter=all" class="btn btn-success btn-sm mt-2">Réinitialiser les filtres</a>
        </div>
    <?php else: ?>
        <?php foreach ($events as $event): ?>
            <?php 
                $is_upcoming = strtotime($event['date_evenement']) >= strtotime($today);
                $img_src = empty($event['image_url']) 
                    ? "https://picsum.photos/seed/" . urlencode($event['titre']) . "/800/500" 
                    : ((str_starts_with($event['image_url'], 'http://') || str_starts_with($event['image_url'], 'https://')) ? $event['image_url'] : '/uploads/' . $event['image_url']);
            ?>
            <div class="col-12">
                <div class="card bg-white shadow-sm h-100 hover-card-zoom border-0">
                    <div class="row g-0">
                        
                        <!-- Col 1: Visual Event Banner -->
                        <div class="col-md-4 position-relative overflow-hidden" style="min-height: 200px;">
                            <img src="<?= sanitize($img_src) ?>" class="w-100 h-100 object-fit-cover card-scale-img position-absolute" alt="<?= sanitize($event['titre']) ?>" referrerPolicy="no-referrer">
                            
                            <!-- Badges of Urgency on Image -->
                            <div class="position-absolute top-3 start-3">
                                <?php if ($is_upcoming): ?>
                                    <span class="badge bg-danger shadow-sm text-uppercase px-2.5 py-1.5"><i class="bi bi-clock-fill"></i> À venir</span>
                                <?php else: ?>
                                    <span class="badge bg-secondary shadow-sm text-uppercase px-2.5 py-1.5"><i class="bi bi-archive-fill"></i> Passé</span>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Col 2: Content Breakdown -->
                        <div class="col-md-8">
                            <div class="card-body p-4 d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                        <div class="text-success small fw-bold font-monospace">
                                            <i class="bi bi-calendar3"></i> <?= date('l, d F Y', strtotime($event['date_evenement'])) ?>
                                        </div>
                                        <span class="badge bg-dark-subtle text-dark border"><i class="bi bi-geo-alt-fill text-danger"></i> <?= sanitize($event['lieu']) ?></span>
                                    </div>
                                    <h4 class="card-title fw-bold text-dark mb-3"><?= sanitize($event['titre']) ?></h4>
                                    <p class="card-text text-secondary mb-4 small leading-relaxed" style="text-align: justify;"><?= sanitize($event['description']) ?></p>
                                </div>
                                
                                <div class="border-top pt-3 d-flex justify-content-between align-items-center">
                                    <span class="small text-muted font-monospace" style="font-size: 11px;">Créé le: <?= date('d M Y', strtotime($event['created_at'])) ?></span>
                                    <?php if ($is_upcoming): ?>
                                        <button class="btn btn-warning btn-sm" onclick="alert('Inscription confirmée ! Vous recevrez un rappel automatique.')" style="color:#000; font-weight:600;"><i class="bi bi-check2-circle"></i> S'inscrire à l'Événement</button>
                                    <?php else: ?>
                                        <a href="/culture.php" class="btn btn-outline-secondary btn-sm"><i class="bi bi-images"></i> Voir les photos</a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
