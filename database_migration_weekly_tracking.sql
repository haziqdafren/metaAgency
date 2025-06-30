-- Database Migration Script for Weekly Performance Tracking
-- Run this script in your Supabase SQL editor or database console

-- Step 1: Add new columns to creator_performance table
ALTER TABLE creator_performance 
ADD COLUMN IF NOT EXISTS period_week integer,
ADD COLUMN IF NOT EXISTS period_start_date date,
ADD COLUMN IF NOT EXISTS period_end_date date;

-- Step 2: Update existing records to have proper period values
-- This sets existing records to week 1 of their respective months
UPDATE creator_performance 
SET 
  period_week = 1,
  period_start_date = DATE(period_year || '-' || LPAD(period_month::text, 2, '0') || '-01'),
  period_end_date = DATE(period_year || '-' || LPAD(period_month::text, 2, '0') || '-07')
WHERE 
  period_week IS NULL 
  AND period_year IS NOT NULL 
  AND period_month IS NOT NULL;

-- Step 3: Drop existing unique constraint if it exists
ALTER TABLE creator_performance 
DROP CONSTRAINT IF EXISTS creator_performance_creator_id_period_key;

-- Also drop any other period-related constraints
ALTER TABLE creator_performance 
DROP CONSTRAINT IF EXISTS creator_performance_creator_id_period_month_period_year_key;

-- Step 4: Add new unique constraint for weekly periods
ALTER TABLE creator_performance 
ADD CONSTRAINT creator_performance_creator_id_weekly_period_key 
UNIQUE (creator_id, period_year, period_month, period_week);

-- Step 5: Create index for better performance on weekly queries
CREATE INDEX IF NOT EXISTS idx_creator_performance_weekly 
ON creator_performance (creator_id, period_year DESC, period_month DESC, period_week DESC);

-- Step 6: Add comments to new columns for documentation
COMMENT ON COLUMN creator_performance.period_week IS 'Week number within the month (1-5)';
COMMENT ON COLUMN creator_performance.period_start_date IS 'Start date of the performance period';
COMMENT ON COLUMN creator_performance.period_end_date IS 'End date of the performance period';

-- Step 7: Create a view for easier querying of weekly performance
CREATE OR REPLACE VIEW creator_performance_weekly AS
SELECT 
  cp.*,
  c.username_tiktok,
  c.followers_count,
  c.konten_kategori,
  c.graduation_status,
  cp.period_year || '-' || LPAD(cp.period_month::text, 2, '0') || ' Week ' || cp.period_week AS period_display,
  CASE 
    WHEN cp.period_start_date IS NOT NULL AND cp.period_end_date IS NOT NULL 
    THEN cp.period_start_date || ' ~ ' || cp.period_end_date
    ELSE cp.period_year || '-' || LPAD(cp.period_month::text, 2, '0') || ' Week ' || cp.period_week
  END AS period_range
FROM creator_performance cp
JOIN creators c ON cp.creator_id = c.id
ORDER BY cp.period_year DESC, cp.period_month DESC, cp.period_week DESC, cp.diamonds DESC;

-- Step 8: Grant permissions (adjust role names as needed)
-- GRANT SELECT ON creator_performance_weekly TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON creator_performance TO authenticated;

-- Verification queries to run after migration:
-- SELECT * FROM creator_performance_weekly LIMIT 10;
-- SELECT COUNT(*) FROM creator_performance WHERE period_week IS NOT NULL;
-- SELECT creator_id, COUNT(*) FROM creator_performance GROUP BY creator_id HAVING COUNT(*) > 1;

COMMIT;