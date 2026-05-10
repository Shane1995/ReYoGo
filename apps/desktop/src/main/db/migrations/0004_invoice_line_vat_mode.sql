-- Replace include_vat with vat_mode: 'inclusive' | 'exclusive' | 'non-taxable'
CREATE TABLE `captured_invoice_lines_new` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`item_id` text NOT NULL,
	`item_name_snapshot` text NOT NULL,
	`unit_of_measure` text,
	`quantity` real NOT NULL,
	`vat_mode` text NOT NULL,
	`vat_rate` real NOT NULL,
	`total_vat_exclude` real NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `captured_invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `captured_invoice_lines_new` (
	`id`, `invoice_id`, `item_id`, `item_name_snapshot`, `unit_of_measure`,
	`quantity`, `vat_mode`, `vat_rate`, `total_vat_exclude`
)
SELECT
	`id`, `invoice_id`, `item_id`, `item_name_snapshot`, `unit_of_measure`,
	`quantity`,
	CASE WHEN `include_vat` = 1 THEN 'inclusive' ELSE 'exclusive' END,
	`vat_rate`, `total_vat_exclude`
FROM `captured_invoice_lines`;
--> statement-breakpoint
DROP TABLE `captured_invoice_lines`;
--> statement-breakpoint
ALTER TABLE `captured_invoice_lines_new` RENAME TO `captured_invoice_lines`;
--> statement-breakpoint
CREATE INDEX `captured_invoice_lines_invoice_id_idx` ON `captured_invoice_lines` (`invoice_id`);
