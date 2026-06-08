<?php
/**
 * Public Landing HomePage - Index.php
 * 
 * Showcases a dynamic Bootstrap Carousel fetched from the Database gallery,
 * previews the top 3 upcoming community events, and displays a summary of 
 * traditional and administrative regional authorities.
 */
require_once __DIR__ . '/includes/header.php';

// 1. Fetch Carousel Images from 'galerie' Table
try {
    $stmt_gallery = $pdo->query("SELECT * FROM galerie ORDER BY date_evenement DESC LIMIT 5");
    $carousel_images = $stmt_gallery->fetchAll();
} catch (PDOException $e) {
    error_log("Error loading gallery carousel: " . $e->getMessage());
    $carousel_images = [];
}

// 2. Fetch the 3 Next Upcoming Events
try {
    // Select upcoming events or latest events as fallback
    $stmt_events = $pdo->prepare("SELECT * FROM evenements ORDER BY date_evenement ASC LIMIT 3");
    $stmt_events->execute();
    $upcoming_events = $stmt_events->fetchAll();
} catch (PDOException $e) {
    error_log("Error loading upcoming events: " . $e->getMessage());
    $upcoming_events = [];
}

// 3. Fetch Top Authorities sorted by display rank 'ordre_affichage'
try {
    $stmt_authorities = $pdo->query("SELECT * FROM autorites ORDER BY ordre_affichage ASC LIMIT 3");
    $key_authorities = $stmt_authorities->fetchAll();
} catch (PDOException $e) {
    error_log("Error loading authorities: " . $e->getMessage());
    $key_authorities = [];
}
?>

<!-- ==============================================
     1. MAIN CULTURAL CAROUSEL / SLIDER
     ============================================== -->
<section class="mb-5 rounded-4 overflow-hidden shadow-lg border-bottom border-success border-3">
    <div id="culturalCarousel" class="carousel slide" data-bs-ride="carousel">
        <!-- Indicators -->
        <div class="carousel-indicators">
            <?php if (empty($carousel_images)): ?>
                <button type="button" data-bs-target="#culturalCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#culturalCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <?php else: ?>
                <?php foreach ($carousel_images as $index => $img): ?>
                    <button type="button" data-bs-target="#culturalCarousel" data-bs-slide-to="<?= $index ?>" class="<?= $index === 0 ? 'active' : '' ?>" aria-current="<?= $index === 0 ? 'true' : 'false' ?>" aria-label="Slide <?= $index + 1 ?>"></button>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
        
        <!-- Slides content -->
        <div class="carousel-inner">
            <?php if (empty($carousel_images)): ?>
                <!-- Fallback Carousel Slide 1: Mankon Toghu -->
                <div class="carousel-item active">
                    <div class="cultural-slider-item d-flex align-items-end" style="background-image: url('https://picsum.photos/seed/mankon/1920/1080?blur=1');">
                        <div class="carousel-caption text-start mb-4 px-3 px-md-5">
                            <div class="carousel-caption-overlay">
                                <span class="badge bg-success mb-2 px-3 py-2 text-uppercase fs-7" style="color:#fff;"><i class="bi bi-star-fill text-warning me-1"></i> Heritage Grassfields</span>
                                <h1 class="display-4 fw-bold text-white mb-2 leading-tight">Celebrate Mankon Traditional Toghu Attire</h1>
                                <p class="lead text-light mb-4 d-none d-md-block">The unique geometric patterns and golden-threaded embroideries depicting royal authority and unity among the Western highlanders of Cameroon.</p>
                                <a href="/culture.php" class="btn btn-warning btn-lg px-4" style="font-weight: 600;">Découvrir la Galerie <i class="bi bi-chevron-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Fallback Carousel Slide 2: Lela Festival -->
                <div class="carousel-item">
                    <div class="cultural-slider-item d-flex align-items-end" style="background-image: url('https://picsum.photos/seed/lelawave/1920/1080?blur=1');">
                        <div class="carousel-caption text-start mb-4 px-3 px-md-5">
                            <div class="carousel-caption-overlay">
                                <span class="badge bg-danger mb-2 px-3 py-2 text-uppercase fs-7"><i class="bi bi-calendar2-event me-1"></i> Rhythms of Bali</span>
                                <h1 class="display-4 fw-bold text-white mb-2 leading-tight">Lela Festival Drums & Shields</h1>
                                <p class="lead text-light mb-4 d-none d-md-block">A majestic ceremony honoring royal strength, ancestral shields, and unity dances representing noble Grassfields warriors.</p>
                                <a href="/evenements.php" class="btn btn-warning btn-lg px-4" style="font-weight: 600;">Calendrier Événements <i class="bi bi-chevron-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <?php foreach ($carousel_images as $index => $img): ?>
                    <div class="carousel-item <?= $index === 0 ? 'active' : '' ?>">
                        <!-- Check if path is URL or upload name -->
                        <?php 
                            $img_src = (str_starts_with($img['photo'], 'http://') || str_starts_with($img['photo'], 'https://')) 
                                ? $img['photo'] 
                                : '/uploads/' . $img['photo'];
                        ?>
                        <div class="cultural-slider-item d-flex align-items-end" style="background-image: url('<?= sanitize($img_src) ?>');">
                            <div class="carousel-caption text-start mb-4 px-3 px-md-5">
                                <div class="carousel-caption-overlay">
                                    <span class="badge bg-success mb-2 px-3 py-2 text-uppercase fs-7" style="color:#fff;"><i class="bi bi-star-fill text-warning me-1"></i> Cameroun Culture</span>
                                    <h1 class="display-4 fw-bold text-white mb-2 leading-tight"><?= sanitize($img['titre']) ?></h1>
                                    <p class="lead text-light mb-4 d-none d-md-block">Événement associé le <?= date('d M, Y', strtotime($img['date_evenement'])) ?>. Captured under community stewardship.</p>
                                    <a href="/culture.php" class="btn btn-warning btn-lg px-4" style="font-weight: 600;">Explorer <i class="bi bi-arrow-right"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
        
        <!-- Controls -->
        <button class="carousel-control-prev" type="button" data-bs-target="#culturalCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon shadow-lg bg-dark rounded-circle p-3" aria-hidden="true"></span>
            <span class="visually-hidden">Précédent</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#culturalCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon shadow-lg bg-dark rounded-circle p-3" aria-hidden="true"></span>
            <span class="visually-hidden">Suivant</span>
        </button>
    </div>
</section>

<!-- Welcome Statement -->
<div class="row align-items-center mb-5 g-4">
    <div class="col-md-8">
        <h2 class="text-success fw-bold display-6 mb-2">Preserving the Cameroonian Heritage</h2>
        <p class="text-secondary leading-relaxed m-0">
            Welcome to the community platform dedicated to sharing local traditions, public administrations, and developmental events. Connecting our traditional chief palaces (Fons) and regional government to preserve Grassfields lineage and maritime coastal heritages.
        </p>
    </div>
    <div class="col-md-4 text-md-end text-start">
        <?php if (!is_logged_in()): ?>
            <a href="/register.php" class="btn btn-success btn-lg shadow-sm px-4 fw-bold">Sign Up & Stay Notified</a>
        <?php else: ?>
            <a href="/evenements.php" class="btn btn-success btn-lg shadow-sm px-4 fw-bold">Parcourir les Événements</a>
        <?php endif; ?>
    </div>
</div>


<!-- ==============================================
     2. UPCOMING COMMUNITY EVENTS (3 PROCHAINS)
     ============================================== -->
<section class="mb-5">
    <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
        <h3 class="fw-bold text-dark m-0"><i class="bi bi-calendar2-week-fill text-danger me-2"></i>Événements à Venir</h3>
        <a href="/evenements.php" class="text-success fw-semibold text-decoration-none">Voir tout <i class="bi bi-arrow-right"></i></a>
    </div>
    
    <div class="row g-4">
        <?php if (empty($upcoming_events)): ?>
            <div class="col-12">
                <div class="alert alert-warning text-center border-dashed py-4">
                    <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
                    Pas d’événements enregistrés pour le moment.
                </div>
            </div>
        <?php else: ?>
            <?php foreach ($upcoming_events as $event): ?>
                <div class="col-lg-4 col-md-6">
                    <div class="card h-100 hover-card-zoom bg-white shadow-sm">
                        <!-- Card Image -->
                        <div class="position-relative overflow-hidden" style="height: 180px;">
                            <?php 
                                $ev_img = empty($event['image_url']) 
                                    ? "https://picsum.photos/seed/" . urlencode($event['titre']) . "/600/400" 
                                    : ((str_starts_with($event['image_url'], 'http://') || str_starts_with($event['image_url'], 'https://')) ? $event['image_url'] : '/uploads/' . $event['image_url']);
                            ?>
                            <img src="<?= sanitize($ev_img) ?>" class="card-img-top w-full h-full object-fit-cover card-scale-img" alt="<?= sanitize($event['titre']) ?>" referrerPolicy="no-referrer">
                            <span class="position-absolute top-3 end-3 badge bg-danger text-uppercase px-2.5 py-1.5 fs-8" style="font-weight: 500;">
                                <i class="bi bi-geo-alt-fill"></i> <?= sanitize($event['lieu']) ?>
                            </span>
                        </div>
                        
                        <!-- Card Body -->
                        <div class="card-body d-flex flex-column p-4">
                            <div class="text-muted small mb-2 font-monospace fw-semibold" style="color:var(--primary-color) !important;">
                                <i class="bi bi-calendar3"></i> <?= date('d F, Y', strtotime($event['date_evenement'])) ?>
                            </div>
                            <h5 class="card-title text-dark fw-bold mb-2 h-12 overflow-hidden leading-snug"><?= sanitize($event['titre']) ?></h5>
                            <p class="card-text text-secondary line-clamp-3 text-sm flex-grow-1" style="text-align: justify;"><?= sanitize($event['description']) ?></p>
                            <a href="/evenements.php" class="btn btn-outline-success btn-sm mt-3 w-100 fw-semibold align-self-end">Prendre part & Détails</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</section>

<!-- ==============================================
     3. REACTIONARY LEADERSHIP / AUTHORITIES PREVIEW
     ============================================== -->
<section class="mb-4">
    <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
        <h3 class="fw-bold text-dark m-0"><i class="bi bi-shield-shaded text-success me-2"></i>Autorités Administratives & Traditionnelles</h3>
        <a href="/autorites.php" class="text-success fw-semibold text-decoration-none">Voir tout le Conseil <i class="bi bi-arrow-right"></i></a>
    </div>

    <div class="row g-4 justify-content-center">
        <?php if (empty($key_authorities)): ?>
            <!-- Fallback authorities if db empty -->
            <div class="col-md-4">
                <div class="card text-center h-100 hover-card-zoom bg-white shadow-sm">
                    <div class="mx-auto mt-4 rounded-circle overflow-hidden bg-secondary d-flex align-items-center justify-content-center" style="width: 130px; height: 130px;">
                        <i class="bi bi-person-fill fs-1 text-white"></i>
                    </div>
                    <div class="card-body p-4">
                        <span class="badge badge-traditional text-uppercase mb-2" style="font-size:0.75rem;">Traditionnel</span>
                        <h5 class="card-title fw-bold text-dark m-0">Fon Angwafo IV</h5>
                        <p class="text-muted font-monospace small mb-3">Grand Fon of Mankon</p>
                        <p class="card-text text-secondary text-sm">Paramount ruler and supreme spiritual guide coordinating community traditions and festivals.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-center h-100 hover-card-zoom bg-white shadow-sm">
                    <div class="mx-auto mt-4 rounded-circle overflow-hidden bg-secondary d-flex align-items-center justify-content-center" style="width: 130px; height: 130px;">
                        <i class="bi bi-person-fill fs-1 text-white"></i>
                    </div>
                    <div class="card-body p-4">
                        <span class="badge badge-administrative text-uppercase mb-2" style="font-size:0.75rem;">Administratif</span>
                        <h5 class="card-title fw-bold text-dark m-0">Adolphe Lele LAfrique</h5>
                        <p class="text-muted font-monospace small mb-3">Governor North West</p>
                        <p class="card-text text-secondary text-sm">State representative organizing development actions and upholding laws and institutions.</p>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <?php foreach ($key_authorities as $aut): ?>
                <div class="col-lg-4 col-md-6">
                    <div class="card text-center h-100 hover-card-zoom bg-white shadow-sm border-0">
                        <!-- Authority Photo -->
                        <div class="mx-auto mt-4 rounded-circle overflow-hidden shadow" style="width: 140px; height: 140px;">
                            <?php 
                                $aut_photo = empty($aut['photo']) 
                                    ? "https://picsum.photos/seed/" . urlencode($aut['nom']) . "/300/300" 
                                    : ((str_starts_with($aut['photo'], 'http://') || str_starts_with($aut['photo'], 'https://')) ? $aut['photo'] : '/uploads/' . $aut['photo']);
                            ?>
                            <img src="<?= sanitize($aut_photo) ?>" class="w-100 h-100 object-fit-cover" alt="<?= sanitize($aut['nom']) ?>" referrerPolicy="no-referrer">
                        </div>
                        
                        <!-- Details -->
                        <div class="card-body p-4">
                            <!-- Type Badge -->
                            <span class="badge <?= $aut['type'] === 'traditional' ? 'badge-traditional' : 'badge-administrative' ?> text-uppercase mb-2.5" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">
                                <?= $aut['type'] === 'traditional' ? 'Traditional' : 'Administrative' ?>
                            </span>
                            <h5 class="card-title fw-bold text-dark mb-1"><?= sanitize($aut['nom']) ?></h5>
                            <p class="text-muted font-monospace small mb-3 fw-medium" style="color:var(--primary-color) !important;"><?= sanitize($aut['titre']) ?></p>
                            <p class="card-text text-secondary text-sm line-clamp-3" style="text-align: justify;"><?= sanitize($aut['description']) ?></p>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
