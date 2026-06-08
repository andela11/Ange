</main> <!-- Finalizing Main container opened in header.php -->

<!-- Global Footer Component -->
<footer class="bg-dark text-white mt-auto py-5 shadow-lg border-top border-warning border-3">
    <div class="container">
        <div class="row g-4 justify-content-between">
            
            <!-- Column 1: Cultured Identity -->
            <div class="col-lg-5 col-md-12">
                <h5 class="text-warning mb-3" style="font-family: 'Playfair Display', serif; font-weight: 700;">
                    <i class="bi bi-star-fill text-warning me-2"></i>Cameroon Anglophone Heritage
                </h5>
                <p class="text-white-50 small leading-relaxed" style="text-align: justify;">
                    This platform serves coordinates, galleries, event calendars, and administration resources focused on preserving and propagating the unique traditional customs, linguistic expressions, governance, and visual history of the Grassfields of North West and coastal coastal beauties of South West Cameroon.
                </p>
                <div class="mt-3">
                    <span class="badge bg-success me-1 text-white"><i class="bi bi-shield-check"></i> Authentic Customs</span>
                    <span class="badge bg-danger me-1 text-white"><i class="bi bi-bell"></i> Instant Alerts</span>
                    <span class="badge bg-warning me-1 text-dark"><i class="bi bi-people"></i> Royal Councils</span>
                </div>
            </div>

            <!-- Column 2: Navigational Shortcuts -->
            <div class="col-lg-3 col-md-6 col-6">
                <h6 class="text-uppercase text-white fw-bold mb-3 small" style="letter-spacing: 1px;">Ressources</h6>
                <ul class="list-unstyled text-white-50 small">
                    <li class="mb-2"><a href="/index.php" class="text-white-50 text-decoration-none hover-warning"><i class="bi bi-chevron-right text-warning small"></i> Page d'accueil</a></li>
                    <li class="mb-2"><a href="/culture.php" class="text-white-50 text-decoration-none hover-warning"><i class="bi bi-chevron-right text-warning small"></i> Galerie Culturelle</a></li>
                    <li class="mb-2"><a href="/autorites.php" class="text-white-50 text-decoration-none hover-warning"><i class="bi bi-chevron-right text-warning small"></i> Autorités Traditionnelles</a></li>
                    <li class="mb-2"><a href="/evenements.php" class="text-white-50 text-decoration-none hover-warning"><i class="bi bi-chevron-right text-warning small"></i> Conseil des Événements</a></li>
                </ul>
            </div>

            <!-- Column 3: Regional Hubs -->
            <div class="col-lg-3 col-md-6 col-6">
                <h6 class="text-uppercase text-white fw-bold mb-3 small" style="letter-spacing: 1px;">Contact Hub</h6>
                <p class="text-white-50 small mb-2">
                    <i class="bi bi-geo-alt-fill text-warning me-2"></i> Bamenda & Buea Centers, Cameroun
                </p>
                <p class="text-white-50 small mb-2">
                    <i class="bi bi-envelope-fill text-warning me-2"></i> contact@culture.cm
                </p>
                <!-- Social Pillars -->
                <div class="d-flex gap-2 mt-3 fs-5">
                    <a href="#" class="text-white-50 hover-warning me-2"><i class="bi bi-facebook"></i></a>
                    <a href="#" class="text-white-50 hover-warning me-2"><i class="bi bi-youtube"></i></a>
                    <a href="#" class="text-white-50 hover-warning"><i class="bi bi-whatsapp"></i></a>
                </div>
            </div>

        </div>
        
        <hr class="my-4 border-secondary">
        
        <!-- Copyright & Credits -->
        <div class="d-flex flex-wrap justify-content-between align-items-center small text-white-50">
            <p class="m-0">&copy; <?= date('Y') ?> CamHeritage. All rights reserved. Registered Communal Portal.</p>
            <p class="m-0 text-warning" style="font-size: 0.8rem;">Developed under Traditional Guardianship</p>
        </div>
    </div>
</footer>

<!-- Bootstrap 5 CDN JS Bundle (Includes Popper) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<!-- Global Script for Notifications AJAX and interactions -->
<script>
/**
 * AJAX routine to instantly mark all active user notifications as Read
 * Calls the notifications.php api endpoint and refreshes notification elements
 */
async function markAllNotificationsAsRead() {
    try {
        const response = await fetch('/notifications.php?action=mark_read', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const data = await response.json();
        
        if (data && data.success) {
            // Extinguish active visual badges
            const badge = document.getElementById('notifBadge');
            if (badge) {
                badge.style.transition = 'all 0.3s ease';
                badge.style.opacity = '0';
                setTimeout(() => badge.remove(), 300);
            }
            
            // Re-style individual list notification stripes
            const items = document.querySelectorAll('#notificationList li');
            items.forEach(item => {
                item.classList.remove('bg-light-yellow', 'border-start', 'border-warning', 'border-3');
                item.classList.add('text-muted');
            });
            
            console.log("All notifications updated to READ.");
        } else {
            console.error("Failed to update notification states:", data.message);
        }
    } catch (error) {
        console.error("Network communication exception updating notifications:", error);
    }
}

/**
 * JS helper to prompt for destructive confirmation warnings before admin deletions
 */
function confirmItemDeletion(event, actionDescription = 'delete this item') {
    if (!confirm('Are you absolutely sure you want to ' + actionDescription + '? \nThis cannot be undone!')) {
        event.preventDefault();
        return false;
    }
    return true;
}
</script>
</body>
</html>
