CREATE TABLE `stock_count_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`counted_qty` real NOT NULL,
	`notes` text,
	FOREIGN KEY (`session_id`) REFERENCES `stock_count_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `stock_count_lines_session_idx` ON `stock_count_lines` (`session_id`);--> statement-breakpoint
CREATE TABLE `stock_count_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`label` text,
	`status` text DEFAULT 'open' NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `yield_factor` real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `par_level` real;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `reorder_point` real;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `reorder_qty` real;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inventory_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "inventory_categories_type_check" CHECK("__new_inventory_categories"."type" IN ('food', 'beverage', 'non-food'))
);
--> statement-breakpoint
INSERT INTO `__new_inventory_categories`("id", "account_id", "name", "type", "created_at", "updated_at") SELECT "id", "account_id", "name", "type", "created_at", "updated_at" FROM `inventory_categories`;--> statement-breakpoint
DROP TABLE `inventory_categories`;--> statement-breakpoint
ALTER TABLE `__new_inventory_categories` RENAME TO `inventory_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;