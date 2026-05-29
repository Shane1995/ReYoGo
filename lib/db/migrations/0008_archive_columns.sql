ALTER TABLE `inventory_items` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `inventory_categories` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `units_of_measure` ADD `archived_at` integer;
