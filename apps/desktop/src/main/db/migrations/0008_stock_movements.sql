CREATE TABLE `stock_movements` (
  `id` text PRIMARY KEY NOT NULL,
  `item_id` text NOT NULL,
  `item_name_snapshot` text NOT NULL,
  `type` text NOT NULL,
  `quantity` real NOT NULL,
  `source` text NOT NULL,
  `reference_id` text,
  `cost_at_time` real,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT
);
