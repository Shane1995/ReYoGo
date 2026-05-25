PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoice_line_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`qty` real NOT NULL,
	`unit_cost` real DEFAULT 0 NOT NULL,
	`total_cost` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_invoice_line_items`("id", "invoice_id", "inventory_item_id", "qty", "unit_cost", "total_cost") SELECT "id", "invoice_id", "item_id", "quantity", CASE WHEN "quantity" > 0 THEN "total_vat_exclude" / "quantity" ELSE 0 END, "total_vat_exclude" FROM `invoice_line_items`;--> statement-breakpoint
DROP TABLE `invoice_line_items`;--> statement-breakpoint
ALTER TABLE `__new_invoice_line_items` RENAME TO `invoice_line_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `invoice_lines_invoice_idx` ON `invoice_line_items` (`invoice_id`);--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `unit_of_measure_id` text REFERENCES units_of_measure(id);--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `sku` text;--> statement-breakpoint
ALTER TABLE `inventory_items` DROP COLUMN `unit_of_measure`;--> statement-breakpoint
ALTER TABLE `inventory_items` DROP COLUMN `yield_factor`;--> statement-breakpoint
ALTER TABLE `inventory_items` DROP COLUMN `par_level`;--> statement-breakpoint
CREATE TABLE `__new_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`supplier_id` text,
	`invoice_number` text,
	`invoice_date` integer,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`total_excl_tax` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0 NOT NULL,
	`total_incl_tax` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "invoices_status_check" CHECK("__new_invoices"."status" IN ('DRAFT', 'POSTED'))
);
--> statement-breakpoint
INSERT INTO `__new_invoices`("id", "account_id", "supplier_id", "invoice_number", "invoice_date", "status", "total_excl_tax", "tax_amount", "total_incl_tax", "created_at", "updated_at") SELECT "id", "account_id", "supplier_id", "invoice_number", "invoice_date", 'DRAFT', 0, 0, 0, "created_at", "updated_at" FROM `invoices`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
ALTER TABLE `__new_invoices` RENAME TO `invoices`;--> statement-breakpoint
CREATE INDEX `invoices_supplier_idx` ON `invoices` (`supplier_id`);