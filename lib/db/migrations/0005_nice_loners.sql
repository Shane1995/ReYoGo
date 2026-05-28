PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoice_line_items` (
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
);--> statement-breakpoint
INSERT INTO `__new_invoice_line_items` (`id`, `invoice_id`, `inventory_item_id`, `item_name_snapshot`, `qty`, `unit_cost`, `total_cost`, `is_vatable`)
	SELECT `id`, `invoice_id`, `inventory_item_id`, `item_name_snapshot`, `qty`, `unit_cost`, `total_cost`,
		CASE WHEN `vat_mode` = 'non-taxable' THEN 0 ELSE 1 END
	FROM `invoice_line_items`;--> statement-breakpoint
DROP TABLE `invoice_line_items`;--> statement-breakpoint
ALTER TABLE `__new_invoice_line_items` RENAME TO `invoice_line_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `invoice_lines_invoice_idx` ON `invoice_line_items` (`invoice_id`);--> statement-breakpoint
ALTER TABLE `invoices` ADD `vat_mode` text DEFAULT 'exclusive' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `vat_rate` real DEFAULT 15 NOT NULL;
