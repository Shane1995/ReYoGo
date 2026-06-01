CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`setup_complete` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `units_of_measure` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `units_of_measure_name_account_idx` ON `units_of_measure` (`account_id`,`name`);--> statement-breakpoint
CREATE TABLE `inventory_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "inventory_categories_type_check" CHECK("inventory_categories"."type" IN ('food', 'beverage', 'non-food'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_categories_name_account_idx` ON `inventory_categories` (`account_id`,`name`);--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`category_id` text NOT NULL,
	`unit_of_measure_id` text,
	`sku` text,
	`reorder_point` real,
	`reorder_qty` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `business_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `inventory_categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`unit_of_measure_id`) REFERENCES `units_of_measure`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_items_name_group_idx` ON `inventory_items` (`group_id`,`name`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`name` text NOT NULL,
	`contact_name` text,
	`phone` text,
	`email` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_name_entity_idx` ON `suppliers` (`entity_id`,`name`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`entity_id` text NOT NULL,
	`supplier_id` text,
	`source_invoice_id` text,
	`invoice_number` text NOT NULL,
	`invoice_date` integer,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`vat_mode` text DEFAULT 'exclusive' NOT NULL,
	`vat_rate` real DEFAULT 15 NOT NULL,
	`total_excl_tax` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0 NOT NULL,
	`total_incl_tax` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`source_invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "invoices_status_check" CHECK("invoices"."status" IN ('DRAFT', 'POSTED', 'CREDIT_NOTE'))
);
--> statement-breakpoint
CREATE INDEX `invoices_supplier_idx` ON `invoices` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `invoices_entity_idx` ON `invoices` (`entity_id`);--> statement-breakpoint
CREATE INDEX `invoices_source_invoice_idx` ON `invoices` (`source_invoice_id`);--> statement-breakpoint
CREATE TABLE `invoice_line_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`item_name_snapshot` text DEFAULT '' NOT NULL,
	`qty` real NOT NULL,
	`unit_cost` real DEFAULT 0 NOT NULL,
	`total_cost` real DEFAULT 0 NOT NULL,
	`is_vatable` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `invoice_lines_invoice_idx` ON `invoice_line_items` (`invoice_id`);--> statement-breakpoint
CREATE TABLE `invoice_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`edited_at` integer NOT NULL,
	`note` text,
	`snapshot` text NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`entity_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`movement_type` text NOT NULL,
	`qty` real NOT NULL,
	`unit_cost_at_time` real,
	`total_cost` real,
	`weighted_avg_cost_after` real,
	`stock_qty_after` real NOT NULL,
	`reference_type` text,
	`reference_id` text,
	`notes` text,
	`occurred_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `stock_movements_entity_idx` ON `stock_movements` (`entity_id`);--> statement-breakpoint
CREATE INDEX `stock_movements_item_time_idx` ON `stock_movements` (`inventory_item_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `stock_movements_ref_idx` ON `stock_movements` (`reference_type`,`reference_id`);--> statement-breakpoint
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
CREATE TABLE `costing_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`snapshot_date` integer NOT NULL,
	`weighted_avg_cost` real,
	`stock_qty` real,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
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
