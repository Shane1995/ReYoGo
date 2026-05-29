CREATE TABLE `business_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`default_vat_rate` integer DEFAULT 15 NOT NULL,
	`default_vat_mode` text DEFAULT 'exclusive' NOT NULL,
	`created_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `business_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT OR IGNORE INTO business_groups (id, account_id, name, created_at)
  VALUES ('default-group', 'default', 'My Business', strftime('%s', 'now') * 1000);
--> statement-breakpoint
INSERT OR IGNORE INTO entities (id, group_id, name, default_vat_rate, default_vat_mode, created_at)
  VALUES ('default', 'default-group', 'My Venue', 15, 'exclusive', strftime('%s', 'now') * 1000);
--> statement-breakpoint
ALTER TABLE `accounts` ADD `setup_complete` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `entity_id` text NOT NULL DEFAULT 'default' REFERENCES entities(id);--> statement-breakpoint
ALTER TABLE `invoices` ADD `entity_id` text NOT NULL DEFAULT 'default' REFERENCES entities(id);--> statement-breakpoint
CREATE INDEX `invoices_entity_idx` ON `invoices` (`entity_id`);--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `entity_id` text NOT NULL DEFAULT 'default' REFERENCES entities(id);--> statement-breakpoint
CREATE INDEX `stock_movements_entity_idx` ON `stock_movements` (`entity_id`);
