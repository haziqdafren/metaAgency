-- CORRECTED Database Migration for Period Tracking
-- This fixes the mismatch between migration and new code

-- Step 1: Add new columns
ALTER TABLE creator_performance 
ADD COLUMN IF NOT EXISTS period_identifier varchar(100),
ADD COLUMN IF NOT EXISTS period_type varchar(20),
ADD COLUMN IF NOT EXISTS period_duration_days integer;

-- Step 2: Drop old unique constraint first
ALTER TABLE creator_performance 
DROP CONSTRAINT IF EXISTS creator_performance_creator_id_weekly_period_key;

-- Step 3: Clear existing test data to avoid conflicts (RECOMMENDED)
-- Uncomment the next line if you want to start fresh:
-- DELETE FROM creator_performance WHERE created_at > '2025-06-29 00:00:00';

-- Step 4: Add new unique constraint for period_identifier
ALTER TABLE creator_performance 
ADD CONSTRAINT creator_performance_creator_id_period_identifier_key 
UNIQUE (creator_id, period_identifier);

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_creator_performance_period_identifier 
ON creator_performance (creator_id, period_identifier, period_year DESC, period_month DESC);

-- Step 6: Add comments
COMMENT ON COLUMN creator_performance.period_identifier IS 'Unique identifier for the performance period (e.g., "2025-06-01_2025-06-17")';
COMMENT ON COLUMN creator_performance.period_type IS 'Type of period: weekly, bi-weekly, monthly, custom';
COMMENT ON COLUMN creator_performance.period_duration_days IS 'Duration of the period in days';

-- Step 7: Update the view
DROP VIEW IF EXISTS creator_performance_weekly;
DROP VIEW IF EXISTS creator_performance_periods;

CREATE OR REPLACE VIEW creator_performance_periods AS
SELECT 
  cp.*,
  c.username_tiktok,
  c.followers_count,
  c.konten_kategori,
  c.graduation_status,
  COALESCE(
    CASE 
      WHEN cp.period_start_date IS NOT NULL AND cp.period_end_date IS NOT NULL 
      THEN cp.period_start_date || ' ~ ' || cp.period_end_date
      ELSE cp.period_identifier
    END,
    cp.period_year || '-' || LPAD(cp.period_month::text, 2, '0')
  ) AS period_display,
  CASE 
    WHEN cp.period_duration_days IS NULL THEN 'Legacy'
    WHEN cp.period_duration_days <= 7 THEN 'Weekly'
    WHEN cp.period_duration_days <= 14 THEN 'Bi-weekly'
    WHEN cp.period_duration_days <= 31 THEN 'Monthly'
    ELSE 'Custom'
  END AS period_description
FROM creator_performance cp
JOIN creators c ON cp.creator_id = c.id
ORDER BY cp.created_at DESC;

-- Verification queries:
-- SELECT period_identifier, period_type, period_duration_days, period_start_date, period_end_date FROM creator_performance ORDER BY created_at DESC LIMIT 5;

COMMIT;