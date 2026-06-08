-- ====================================================================
-- CAMEROON CULTURAL PORTAL DATABASE SCHEMA
-- This SQL script creates the database and all necessary tables 
-- for the procedural PHP application.
-- ====================================================================

-- Create the database (if not already existing)
CREATE DATABASE IF NOT EXISTS `cameroun_culture_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cameroun_culture_db`;

-- --------------------------------------------------------------------
-- TABLE: users
-- Holds both regular community members and administrators
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- TABLE: evenements
-- Cultural and community events, scheduled and managed by administrative users
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `evenements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `titre` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `date_evenement` DATE NOT NULL,
    `lieu` VARCHAR(150) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- TABLE: autorites
-- Traditional rulers (Fons, Chiefs) and administrative officials
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `autorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nom` VARCHAR(150) NOT NULL,
    `titre` VARCHAR(150) NOT NULL,
    `type` ENUM('traditional', 'administrative') NOT NULL,
    `photo` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `ordre_affichage` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- TABLE: galerie
-- Photo gallery of cultural events and community heritage
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `galerie` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `titre` VARCHAR(150) NOT NULL,
    `photo` VARCHAR(255) NOT NULL,
    `date_evenement` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- TABLE: notifications
-- Tracks notifications created for users when a new event is scheduled.
-- When a user is connected, they can view their notifications.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `titre` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- DEFAULT SEED DATA
-- Insert initial system setup records
-- Note: Admin password is "Admin@Cam2026" (hashed using password_hash inside PHP)
-- --------------------------------------------------------------------

-- Seed administrative user (password: Admin@Cam2026)
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Cameroun Culture Admin', 'admin@culture.cm', '$2y$10$wO3tO8GvA2v9pG0XgRymSuE0v3v9pG0XgRymSuE0v3v9pG0XgRymS', 'admin'),
('Fon Paul', 'member@culture.cm', '$2y$10$wO3tO8GvA2v9pG0XgRymSuE0v3v9pG0XgRymSuE0v3v9pG0XgRymS', 'user');

-- Seed sample Traditional and Administrative Authorities
INSERT INTO `autorites` (`nom`, `titre`, `type`, `photo`, `description`, `ordre_affichage`) VALUES
('His Royal Highness Fon Angwafo IV', 'Grand Fon of Mankon', 'traditional', 'mankon_fon.jpg', 'Traditional paramount ruler of the Mankon kingdom. Custodian of ancestral customs, heritage, and the cultural beacon of the region.', 1),
('His Excellency Adolphe Lele LAfrique', 'Governor of the North West Region', 'administrative', 'governor_northwest.jpg', 'State administrative executive managing administrative affairs, ensuring public order, and coordinating regional activities.', 2),
('Their Royal Highnesses of Southern Cameroons', 'Traditional Council of Rulers', 'traditional', 'council_rulers.jpg', 'Sovereign advisory council overseeing community rituals, resolving traditional boundary claims, and acting as primary diplomats.', 3);

-- Seed initial events
INSERT INTO `evenements` (`titre`, `description`, `date_evenement`, `lieu`, `image_url`) VALUES
('Lela Cultural Festival', 'Annual majestic gathering of the Bali Nyonga people. Feathers, drumming, traditional military marches, and royal parade in full cultural attire.', '2026-12-18', 'Bali Nyonga Palace Ground', 'lela_festival.jpg'),
('Toko-Kunda Dance Ceremony', 'A grand festival honoring ancestors and community bonding featuring specific traditional dances from the Anglophone highlands.', '2026-07-25', 'Fako Community Hall, Buea', 'dance_ceremony.jpg'),
('Traditional Rulers Council Summit', 'An administrative and cultural integration workshop for North West and South West region chefs to coordinate heritage protection.', '2025-11-10', 'Bamenda Cultural Center', 'rulers_summit.jpg');

-- Seed Initial Gallery Images
INSERT INTO `galerie` (`titre`, `photo`, `date_evenement`) VALUES
('Toghu Royal Attire Showcase', 'toghu_royal.jpg', '2025-12-18'),
('Traditional Gong and Drumming', 'gong_drums.jpg', '2025-07-25'),
('Bamenda Highlands Landscape', 'highlands.jpg', '2025-11-10');
