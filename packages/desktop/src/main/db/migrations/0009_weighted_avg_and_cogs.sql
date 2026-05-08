ALTER TABLE `inventory_items` ADD `weighted_avg_cost` real;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `total_stock` real;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `cogs_amount` real;
