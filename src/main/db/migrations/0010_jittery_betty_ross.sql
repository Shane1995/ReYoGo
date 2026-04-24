CREATE TABLE `app_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoice_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`edited_at` integer NOT NULL,
	`note` text,
	`snapshot` text NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `captured_invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`item_name_snapshot` text NOT NULL,
	`type` text NOT NULL,
	`quantity` real NOT NULL,
	`source` text NOT NULL,
	`reference_id` text,
	`cost_at_time` real,
	`cogs_amount` real,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `units_of_measure` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `captured_invoices` ADD `invoice_number` text;--> statement-breakpoint
ALTER TABLE `captured_invoices` ADD `invoice_date` integer;--> statement-breakpoint
ALTER TABLE `captured_invoices` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `weighted_avg_cost` real;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `total_stock` real;