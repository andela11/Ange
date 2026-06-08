<?php
/**
 * Public Cultural Gallery - Culture.php
 * 
 * Lists all historical and cultural snapshot images.
 * Uses a responsive Bootstrap 5 Modal as a light-weight vanilla light-box 
 * to preview high-resolution images.
 */
require_once __DIR__ . '/includes/header.php';

// Fetch all gallery items from the database
try {
    $stmt = $pdo->query("SELECT * FROM galerie ORDER BY date_evenement DESC");
    $gallery_items = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log("Failed loading cultural gallery items: " . $e->getMessage());
    $gallery_items = [];
}
?>

<div class="row align-items-center mb-4 border-bottom pb-3 g-2">
    <div class="col-md-8">
        <h2 class="fw-bold text-success m-0"><i class="bi bi-images text-warning me-2"></i>Galerie d'Art & Culture</h2>
        <p class="text-secondary small m-0">Explore visual remnants, royal garments, sacred gongs, and regional festivals from Cameroon's Grassfields.</p>
    </div>
    <div class="col-md-4 text-md-end text-start">
        <?php if (is_admin()): ?>
            <a href="/admin/galerie.php" class="btn btn-warning btn-sm fw-bold"><i class="bi bi-pencil-square"></i> Gérer Galerie</a>
        <?php endif; ?>
    </div>
</div>

<!-- Gallery Container -->
<div class="row g-4 mb-5">
    <?php if (empty($gallery_items)): ?>
        <!-- Default Cultural Placeholders if Database is clean -->
        <?php 
            $default_gallery = [
                ['titre' => 'Toghu Royal Attire Showcase', 'photo' => 'https://picsum.photos/seed/toghu/800/600', 'date_evenement' => '2025-12-18'],
                ['titre' => 'Sacred Traditional Palatial Gongs', 'photo' => 'https://picsum.photos/seed/gongs12/800/600', 'date_evenement' => '2025-07-25'],
                ['titre' => 'Bamenda Highlands Sacred Forest', 'photo' => 'https://picsum.photos/seed/bamenda7/800/600', 'date_evenement' => '2025-11-10'],
                ['titre' => 'Foumban Royal Palace Entrance', 'photo' => 'https://picsum.photos/seed/foumban/800/600', 'date_evenement' => '2025-05-14'],
                ['titre' => 'Coastal Ndian Traditional Dance', 'photo' => 'https://picsum.photos/seed/coastalndian/800/600', 'date_evenement' => '2025-09-02'],
                ['titre' => 'Nso Palace Cultural Display', 'photo' => 'https://picsum.photos/seed/nsopal/800/600', 'date_evenement' => '2025-10-30']
            ];
        ?>
        <?php foreach ($default_gallery as $index => $item): ?>
            <div class="col-lg-4 col-md-6">
                <div class="gallery-thumbnail shadow-sm hover-card-zoom position-relative" 
                     onclick="openGalleryLightbox('<?= $item['photo'] ?>', '<?= sanitize($item['titre']) ?>', '<?= date('d M, Y', strtotime($item['date_evenement'])) ?>')">
                    <img src="<?= $item['photo'] ?>" class="w-100 h-100 object-fit-cover card-scale-img" alt="<?= sanitize($item['titre']) ?>" referrerPolicy="no-referrer">
                    <!-- Hover text details acting as overlay -->
                    <div class="gallery-hover-overlay">
                        <i class="bi bi-eye-fill fs-3 text-warning mb-2"></i>
                        <h6 class="m-0 fw-bold"><?= sanitize($item['titre']) ?></h6>
                        <small class="text-white-50 mt-1"><?= date('d M, Y', strtotime($item['date_evenement'])) ?></small>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php else: ?>
        <?php foreach ($gallery_items as $item): ?>
            <?php 
                $img_path = (str_starts_with($item['photo'], 'http://') || str_starts_with($item['photo'], 'https://')) 
                    ? $item['photo'] 
                    : '/uploads/' . $item['photo'];
            ?>
            <div class="col-lg-4 col-md-6">
                <div class="gallery-thumbnail shadow-sm hover-card-zoom position-relative" 
                     onclick="openGalleryLightbox('<?= sanitize($img_path) ?>', '<?= sanitize($item['titre']) ?>', '<?= date('d M, Y', strtotime($item['date_evenement'])) ?>')">
                    <img src="<?= sanitize($img_path) ?>" class="w-100 h-100 object-fit-cover card-scale-img" alt="<?= sanitize($item['titre']) ?>" referrerPolicy="no-referrer">
                    <div class="gallery-hover-overlay">
                        <i class="bi bi-eye-fill fs-3 text-warning mb-2"></i>
                        <h6 class="m-0 fw-bold"><?= sanitize($item['titre']) ?></h6>
                        <small class="text-white-50 mt-1">Événement: <?= date('d M, Y', strtotime($item['date_evenement'])) ?></small>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<!-- ==============================================
     LIGHTBOX BOOTSTRAP 5 MODAL LAYER
     ============================================== -->
<div class="modal fade" id="galleryLightboxModal" tabindex="-1" aria-labelledby="galleryLightboxModalTitle" aria-hidden="true" style="background-color: rgba(0,0,0,0.85);">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content bg-dark border-secondary overflow-hidden shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-0 pb-0 d-flex justify-content-between text-white p-3">
                <h5 class="modal-title fw-bold" id="galleryLightboxModalTitle">Modal Title</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>
            </div>
            <div class="modal-body p-0 text-center bg-black d-flex align-items-center justify-content-center" style="min-height: 350px;">
                <img id="lightboxImage" src="" class="img-fluid w-100" style="max-height: 520px; object-fit: contain;" alt="Lightbox Preview" referrerPolicy="no-referrer">
            </div>
            <div class="modal-footer border-0 p-3 d-flex justify-content-between align-items-center text-white bg-dark">
                <span class="small text-white-50" id="lightboxDate">Event Date</span>
                <span class="badge bg-success small"><i class="bi bi-star"></i> Heritage Cameroon</span>
            </div>
        </div>
    </div>
</div>

<script>
/**
 * Triggers and populates the vanilla Javascript lightbox from thumbnail attributes
 */
function openGalleryLightbox(imgSrc, title, dateStr) {
    // Populate dynamic properties
    document.getElementById('lightboxImage').src = imgSrc;
    document.getElementById('galleryLightboxModalTitle').innerText = title;
    document.getElementById('lightboxDate').innerText = "Date d'événement associé: " + dateStr;
    
    // Instantiate Bootstrap modal programmatically
    const myModal = new bootstrap.Modal(document.getElementById('galleryLightboxModal'), {});
    myModal.show();
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
