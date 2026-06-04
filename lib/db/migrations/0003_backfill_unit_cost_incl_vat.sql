UPDATE `invoice_line_items`
SET `unit_cost_incl_vat` = CASE
  WHEN `is_vatable` = 1
    THEN `unit_cost` * (1 + (SELECT `vat_rate` FROM `invoices` WHERE `invoices`.`id` = `invoice_line_items`.`invoice_id`) / 100.0)
  ELSE `unit_cost`
END
WHERE `unit_cost_incl_vat` IS NULL;
