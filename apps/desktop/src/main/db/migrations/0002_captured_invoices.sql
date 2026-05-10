CREATE TABLE `captured_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `captured_invoice_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`item_id` text NOT NULL,
	`item_name_snapshot` text NOT NULL,
	`quantity` real NOT NULL,
	`include_vat` integer NOT NULL,
	`vat_rate` real NOT NULL,
	`total_vat_exclude` real NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `captured_invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `captured_invoice_lines_invoice_id_idx` ON `captured_invoice_lines` (`invoice_id`);
--> statement-breakpoint
CREATE INDEX `captured_invoices_created_at_idx` ON `captured_invoices` (`created_at`);
