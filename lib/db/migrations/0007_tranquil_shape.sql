PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`entity_id` text NOT NULL,
	`supplier_id` text,
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
	CONSTRAINT "invoices_status_check" CHECK("__new_invoices"."status" IN ('DRAFT', 'POSTED'))
);
--> statement-breakpoint
UPDATE `invoices` SET `invoice_number` = 'UNKNOWN-' || substr(`id`, 1, 8) WHERE `invoice_number` IS NULL;--> statement-breakpoint
INSERT INTO `__new_invoices`("id", "account_id", "entity_id", "supplier_id", "invoice_number", "invoice_date", "status", "vat_mode", "vat_rate", "total_excl_tax", "tax_amount", "total_incl_tax", "created_at", "updated_at") SELECT "id", "account_id", "entity_id", "supplier_id", "invoice_number", "invoice_date", "status", "vat_mode", "vat_rate", "total_excl_tax", "tax_amount", "total_incl_tax", "created_at", "updated_at" FROM `invoices`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
ALTER TABLE `__new_invoices` RENAME TO `invoices`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `invoices_supplier_idx` ON `invoices` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `invoices_entity_idx` ON `invoices` (`entity_id`);