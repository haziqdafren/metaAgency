-- Improved Database Migration for Better Period Handling
-- This fixes the issue where different periods with same start date overwrite each other

-- Step 1: Add new columns for better period identification
ALTER TABLE creator_performance 
ADD COLUMN IF NOT EXISTS period_identifier varchar(100),
ADD COLUMN IF NOT EXISTS period_type varchar(20),
ADD COLUMN IF NOT EXISTS period_duration_days integer;

-- Step 2: Update existing records with proper period identifiers
UPDATE creator_performance 
SET 
  period_identifier = period_year || '-' || LPAD(period_month::text, 2, '0') || '_W' || period_week,
  period_type = CASE 
    WHEN period_week IS NOT NULL THEN 'weekly'
    ELSE 'unknown'
  END,
  period_duration_days = 7
WHERE 
  period_identifier IS NULL 
  AND period_year IS NOT NULL 
  AND period_month IS NOT NULL;

-- Step 3: Drop the old unique constraint that causes overwrites
ALTER TABLE creator_performance 
DROP CONSTRAINT IF EXISTS creator_performance_creator_id_weekly_period_key;

-- Step 4: Add new unique constraint using period_identifier
ALTER TABLE creator_performance 
ADD CONSTRAINT creator_performance_creator_id_period_identifier_key 
UNIQUE (creator_id, period_identifier);

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_creator_performance_period_identifier 
ON creator_performance (creator_id, period_identifier, period_year DESC, period_month DESC);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN creator_performance.period_identifier IS 'Unique identifier for the performance period (e.g., "2025-06-01_2025-06-28")';
COMMENT ON COLUMN creator_performance.period_type IS 'Type of period: weekly, bi-weekly, monthly, custom';
COMMENT ON COLUMN creator_performance.period_duration_days IS 'Duration of the period in days';

-- Step 7: Update the view to use new columns
DROP VIEW IF EXISTS creator_performance_weekly;

CREATE OR REPLACE VIEW creator_performance_periods AS
SELECT 
  cp.*,
  c.username_tiktok,
  c.followers_count,
  c.konten_kategori,
  c.graduation_status,
  CASE 
    WHEN cp.period_start_date IS NOT NULL AND cp.period_end_date IS NOT NULL 
    THEN cp.period_start_date || ' ~ ' || cp.period_end_date
    ELSE cp.period_identifier
  END AS period_display,
  CASE 
    WHEN cp.period_duration_days <= 7 THEN 'Weekly'
    WHEN cp.period_duration_days <= 14 THEN 'Bi-weekly'
    WHEN cp.period_duration_days <= 31 THEN 'Monthly'
    ELSE 'Custom'
  END AS period_description
FROM creator_performance cp
JOIN creators c ON cp.creator_id = c.id
ORDER BY cp.period_year DESC, cp.period_month DESC, cp.period_start_date DESC, cp.diamonds DESC;

-- Step 8: Create function to generate period identifier
CREATE OR REPLACE FUNCTION generate_period_identifier(
  start_date date, 
  end_date date
) RETURNS varchar AS $$
BEGIN
  RETURN start_date || '_' || end_date;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create function to calculate period type
CREATE OR REPLACE FUNCTION calculate_period_type(
  duration_days integer
) RETURNS varchar AS $$
BEGIN
  CASE 
    WHEN duration_days <= 7 THEN RETURN 'weekly';
    WHEN duration_days <= 14 THEN RETURN 'bi-weekly';
    WHEN duration_days <= 31 THEN RETURN 'monthly';
    ELSE RETURN 'custom';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Verification queries:
-- SELECT * FROM creator_performance_periods LIMIT 10;
-- SELECT period_identifier, COUNT(*) FROM creator_performance GROUP BY period_identifier;
-- SELECT creator_id, period_identifier, period_start_date, period_end_date FROM creator_performance ORDER BY created_at DESC LIMIT 10;

COMMIT;