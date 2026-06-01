PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`name` text NOT NULL,
	`category_id` text NOT NULL,
	`unit_of_measure_id` text,
	`sku` text,
	`reorder_point` real,
	`reorder_qty` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `inventory_categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`unit_of_measure_id`) REFERENCES `units_of_measure`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_inventory_items`("id", "entity_id", "name", "category_id", "unit_of_measure_id", "sku", "reorder_point", "reorder_qty", "created_at", "updated_at", "archived_at") SELECT "id", "group_id", "name", "category_id", "unit_of_measure_id", "sku", "reorder_point", "reorder_qty", "created_at", "updated_at", "archived_at" FROM `inventory_items`;--> statement-breakpoint
DROP TABLE `inventory_items`;--> statement-breakpoint
ALTER TABLE `__new_inventory_items` RENAME TO `inventory_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_items_name_entity_idx` ON `inventory_items` (`entity_id`,`name`);