-- SQL to simplify the bonus_rules table
-- This removes the bonus_table column since we're using simplified percentage-based rules

-- Option 1: Drop the bonus_table column (if you want to clean up)
ALTER TABLE bonus_rules DROP COLUMN IF EXISTS bonus_table;

-- Option 2: If you want to keep the column but just not use it, do nothing
-- The current structure will work fine with just the requirements column

-- Verify the table structure
-- \d bonus_rules

-- Example of what the requirements column should contain:
-- {
--   "A": { "days": 22, "hours": 100, "bonusPercentage": 30 },
--   "B": { "days": 20, "hours": 60, "bonusPercentage": 25 },
--   "C": { "days": 15, "hours": 40, "bonusPercentage": 20 }
-- }
