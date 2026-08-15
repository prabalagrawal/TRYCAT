ALTER TABLE `consent_events` MODIFY COLUMN `purpose` enum('analytics','contact_request','rights_request','marketing') NOT NULL;
