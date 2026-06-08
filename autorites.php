<?php
/**
 * Public Authorities Directory - Autorites.php
 * 
 * Lists political leaders and traditional chiefs with sorting capability.
 * Offers filtering inputs (All, Traditional Rulers, State Authorities) 
 * processed securely via server-side parameterized queries.
 */
require_once __DIR__ . '/includes/header.php';

// Fetch the filter parameter safely
$filter = $_GET['filter'] ?? 'all';
if (!in_array($filter, ['all', 'traditional', 'administrative'])) {
    $filter = 'all';
}

// Build SQL Statement according to active filter
try {
    if ($filter === 'all') {
        $sql = "SELECT * FROM autorites ORDER BY ordre_affichage ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    } else {
        $sql = "SELECT * FROM autorites WHERE type = :type ORDER BY ordre_affichage ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':type' => $filter]);
    }
    $authorities = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log("Error loading authorities list: " . $e->getMessage());
    $authorities = [];
}
?>

<div class="row align-items-center mb-4 border-bottom pb-3 g-2">
    <div class="col-md-8">
        <h2 class="fw-bold text-success m-0"><i class="bi bi-shield-shaded text-warning me-2"></i>Nos Autorités Traditionnelles & Administratives</h2>
        <p class="text-secondary small m-0">Directory of sovereign traditional councils, royal paragraph chiefs (Fons), and state regional administratives.</p>
    </div>
    <div class="col-md-4 text-md-end text-start">
        <?php if (is_admin()): ?>
            <a href="/admin/autorites.php" class="btn btn-warning btn-sm fw-bold"><i class="bi bi-pencil-square"></i> Gérer Autorités</a>
        <?php endif; ?>
    </div>
</div>

<!-- FILTER NAVIGATION ROW -->
<div class="row mb-5 justify-content-center">
    <div class="col-md-8">
        <div class="card p-2 bg-white shadow-sm" style="border-radius: 30px;">
            <div class="nav nav-pills nav-fill justify-content-center border-0">
                <a class="nav-link px-4 <?= $filter === 'all' ? 'active bg-success text-white' : 'text-dark' ?>" 
                   style="border-radius: 20px; font-weight: 500;" 
                   href="?filter=all"><i class="bi bi-grid-fill me-2"></i>Toutes les Autorités</a>
                <a class="nav-link px-4 <?= $filter === 'traditional' ? 'active bg-success text-white' : 'text-dark' ?>" 
                   style="border-radius: 20px; font-weight: 500;" 
                   href="?filter=traditional"><i class="bi bi-shield-fill me-2"></i>Règnes Traditionnels</a>
                <a class="nav-link px-4 <?= $filter === 'administrative' ? 'active bg-success text-white' : 'text-dark' ?>" 
                   style="border-radius: 20px; font-weight: 500;" 
                   href="?filter=administrative"><i class="bi bi-building-fill me-2"></i>Pouvoir Administratif</a>
            </div>
        </div>
    </div>
</div>

<!-- AUTHORITIES OUTPUT CARDS -->
<div class="row g-4 mb-5">
    <?php if (empty($authorities)): ?>
        <!-- Default list on clean databases -->
        <?php 
            $default_aut = [
                [
                    'nom' => 'His Royal Highness Fon Angwafo IV', 
                    'titre' => 'Grand Fon of Mankon', 
                    'type' => 'traditional', 
                    'photo' => 'https://picsum.photos/seed/fon1/400/400', 
                    'description' => 'Traditional paramount ruler representing the sovereign Mankon kingdom. Guardian of indigenous Grassfield lineages, local custom diplomacy, and traditional rites.'
                ],
                [
                    'nom' => 'His Excellency Adolphe Lele LAfrique', 
                    'titre' => 'Governor of the North West Region', 
                    'type' => 'administrative', 
                    'photo' => 'https://picsum.photos/seed/gov5/400/400', 
                    'description' => 'Executive civilian leader of the state administrative apparatus in the North West. Coordinates local governance policies, community-level policing, and regional budgets.'
                ],
                [
                    'nom' => 'His Majesty Fon Sehm Mbinglo I', 
                    'titre' => 'Paramount Fon of Nso', 
                    'type' => 'traditional', 
                    'photo' => 'https://picsum.photos/seed/nsofon/400/400', 
                    'description' => 'Spiritual sovereign of the historic Nso state, organizing community cultural councils and coordinating development works within Kumbo and associated clans.'
                ]
            ];
            
            // Apply filtering manually to the fallback array
            $display_aut = [];
            foreach ($default_aut as $item) {
                if ($filter === 'all' || $item['type'] === $filter) {
                    $display_aut[] = $item;
                }
            }
        ?>
        
        <?php foreach ($display_aut as $a): ?>
            <div class="col-lg-4 col-sm-6">
                <div class="card text-center h-100 hover-card-zoom bg-white shadow-sm border-0">
                    <div class="mx-auto mt-4 rounded-circle overflow-hidden shadow" style="width: 140px; height: 140px; border: 4px solid #fff;">
                        <img src="<?= $a['photo'] ?>" class="w-100 h-100 object-fit-cover" alt="<?= sanitize($a['nom']) ?>" referrerPolicy="no-referrer">
                    </div>
                    <div class="card-body p-4">
                        <span class="badge <?= $a['type'] === 'traditional' ? 'badge-traditional' : 'badge-administrative' ?> text-uppercase mb-2.5" style="font-size: 0.7rem; font-weight: 600;">
                            <?= $a['type'] === 'traditional' ? 'Traditional' : 'Administrative' ?>
                        </span>
                        <h5 class="card-title fw-bold text-dark mb-1"><?= sanitize($a['nom']) ?></h5>
                        <p class="text-success font-monospace small mb-3 fw-semibold"><?= sanitize($a['titre']) ?></p>
                        <p class="card-text text-secondary text-sm" style="text-align: justify;"><?= sanitize($a['description']) ?></p>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php else: ?>
        <?php foreach ($authorities as $a): ?>
            <?php 
                $photo_path = (str_starts_with($a['photo'], 'http://') || str_starts_with($a['photo'], 'https://')) 
                    ? $a['photo'] 
                    : '/uploads/' . $a['photo'];
            ?>
            <div class="col-lg-4 col-sm-6">
                <div class="card text-center h-100 hover-card-zoom bg-white shadow-sm border-0">
                    <div class="mx-auto mt-4 rounded-circle overflow-hidden shadow" style="width: 140px; height: 140px; border: 4px solid #fff;">
                        <img src="<?= sanitize($photo_path) ?>" class="w-100 h-100 object-fit-cover" alt="<?= sanitize($a['nom']) ?>" referrerPolicy="no-referrer">
                    </div>
                    <div class="card-body p-4">
                        <span class="badge <?= $a['type'] === 'traditional' ? 'badge-traditional' : 'badge-administrative' ?> text-uppercase mb-2.5" style="font-size: 0.7rem; font-weight: 600;">
                            <?= $a['type'] === 'traditional' ? 'Traditional' : 'Administrative' ?>
                        </span>
                        <h5 class="card-title fw-bold text-dark mb-1"><?= sanitize($a['nom']) ?></h5>
                        <p class="text-success font-monospace small mb-3 fw-semibold"><?= sanitize($a['titre']) ?></p>
                        <p class="card-text text-secondary text-sm" style="text-align: justify;"><?= sanitize($a['description']) ?></p>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
