CREATE UNIQUE INDEX `units_of_measure_name_account_idx` ON `units_of_measure` (`account_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_categories_name_account_idx` ON `inventory_categories` (`account_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_items_name_entity_idx` ON `inventory_items` (`entity_id`,`name`);
