ALTER TABLE `invoice_line_items` ADD `item_name_snapshot` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `invoice_line_items` ADD `vat_mode` text NOT NULL DEFAULT 'exclusive';--> statement-breakpoint
ALTER TABLE `invoice_line_items` ADD `vat_rate` real NOT NULL DEFAULT 15;
