-- =============================================================================
-- Meta Agency — Supabase Schema Import
-- Generated from backup: db_cluster-27-08-2025@06-29-23.backup
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Execute section by section, or paste the whole file and run.
-- =============================================================================


-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- admins
-- Custom admin user table (not linked to auth.users — uses password_hash directly)
CREATE TABLE public.admins (
    id         uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    email      varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    name       varchar(100),
    created_at timestamptz DEFAULT now()
);

-- article_categories
CREATE TABLE public.article_categories (
    id         uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name       varchar(100) NOT NULL,
    slug       varchar(100) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- articles
CREATE TABLE public.articles (
    id              uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title           varchar(255) NOT NULL,
    content         text NOT NULL,
    category_id     uuid,
    type            varchar(20)  DEFAULT 'article',
    access          varchar(20)  DEFAULT 'public',
    view_count      integer      DEFAULT 0,
    created_by      uuid,
    published_at    timestamptz,
    created_at      timestamptz  DEFAULT now(),
    updated_at      timestamptz  DEFAULT now(),
    seo_title       varchar,
    seo_description text,
    seo_keywords    text[],
    excerpt         text,
    slug            varchar,
    featured_image  varchar
);

COMMENT ON COLUMN public.articles.slug IS 'SEO-friendly URL slug';
COMMENT ON COLUMN public.articles.featured_image IS 'URL to the featured image';

-- article_category_relations  (many-to-many between articles and categories)
CREATE TABLE public.article_category_relations (
    article_id  uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at  timestamptz DEFAULT now()
);

-- creators
-- One row per TikTok creator managed by the agency
CREATE TABLE public.creators (
    id                  uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    creator_id          varchar(50)  NOT NULL,   -- TikTok Creator ID (numeric string)
    username_tiktok     varchar(100) NOT NULL,
    link_tiktok         varchar(255),
    nomor_wa            varchar(20),             -- WhatsApp number
    followers_count     integer      DEFAULT 0,
    konten_kategori     varchar(50),             -- Content category (gaming, lifestyle, etc.)
    game_preference     text,
    status              varchar(20)  DEFAULT 'active',  -- active | inactive | graduated
    joined_date         date,
    days_since_joining  integer,
    graduation_status   varchar(100),
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now(),
    CONSTRAINT check_creator_id_not_empty CHECK (creator_id <> '')
);

-- creator_performance
-- Monthly (or custom-period) performance data per creator
CREATE TABLE public.creator_performance (
    id                    uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    creator_id            uuid,
    period_month          integer NOT NULL,
    period_year           integer NOT NULL,
    diamonds              integer      DEFAULT 0,
    valid_days            integer      DEFAULT 0,
    live_hours            numeric(10,2) DEFAULT 0,
    viewers_count         integer      DEFAULT 0,
    new_followers         integer      DEFAULT 0,
    diamonds_vs_last_month  numeric(5,2),
    hours_vs_last_month     numeric(5,2),
    raw_data              jsonb,
    created_at            timestamptz DEFAULT now(),
    -- Extended period columns
    period_week           integer,
    period_start_date     date,
    period_end_date       date,
    period_identifier     varchar(100),  -- e.g. "2025-06-01_2025-06-28"
    period_type           varchar(20),   -- weekly | bi-weekly | monthly | custom
    period_duration_days  integer
);

COMMENT ON COLUMN public.creator_performance.period_week          IS 'Week number within the month (1-5)';
COMMENT ON COLUMN public.creator_performance.period_start_date    IS 'Start date of the performance period';
COMMENT ON COLUMN public.creator_performance.period_end_date      IS 'End date of the performance period';
COMMENT ON COLUMN public.creator_performance.period_identifier    IS 'Unique identifier for the performance period (e.g., "2025-06-01_2025-06-28")';
COMMENT ON COLUMN public.creator_performance.period_type          IS 'Type of period: weekly, bi-weekly, monthly, custom';
COMMENT ON COLUMN public.creator_performance.period_duration_days IS 'Duration of the period in days';

-- bonus_rules
-- Stores the current bonus tier configuration (one active row, id=1)
CREATE TABLE public.bonus_rules (
    id           integer NOT NULL,
    requirements jsonb NOT NULL,  -- { "A": { days, hours, bonusPercentage }, "B": {...}, "C": {...} }
    bonus_table  jsonb NOT NULL,  -- diamond range → IDR payout lookup per tier
    updated_at   timestamptz DEFAULT now()
);

-- bonus_calculations
-- One row per creator per period once bonus is calculated
CREATE TABLE public.bonus_calculations (
    id              uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    creator_id      uuid,
    month           integer NOT NULL,
    year            integer NOT NULL,
    diamonds        integer,
    valid_days      integer,
    live_hours      numeric(10,2),
    tier            varchar(1),   -- A | B | C | null
    bonus_amount_idr numeric(12,2),
    payment_status  varchar(20) DEFAULT 'pending',  -- pending | paid | cancelled
    payment_date    date,
    notes           text,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

-- bonus_calculation_history
-- Snapshot log of every bonus run (what rules were active, summary, who ran it)
CREATE TABLE public.bonus_calculation_history (
    id                bigint NOT NULL,
    month             integer NOT NULL,
    year              integer NOT NULL,
    rules_snapshot    jsonb NOT NULL,
    summary           jsonb,
    eligible_creators jsonb,
    notes             text,
    created_at        timestamptz DEFAULT now(),
    created_by        uuid
);

CREATE SEQUENCE public.bonus_calculation_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.bonus_calculation_history_id_seq
    OWNED BY public.bonus_calculation_history.id;

ALTER TABLE public.bonus_calculation_history
    ALTER COLUMN id SET DEFAULT nextval('public.bonus_calculation_history_id_seq');

-- username_history
-- Auto-populated via trigger whenever a creator's TikTok username changes
CREATE TABLE public.username_history (
    id           uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    creator_id   uuid,
    old_username varchar(100),
    new_username varchar(100),
    changed_at   timestamptz DEFAULT now()
);


-- =============================================================================
-- 3. PRIMARY KEYS
-- =============================================================================

ALTER TABLE public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);

ALTER TABLE public.article_categories
    ADD CONSTRAINT article_categories_pkey PRIMARY KEY (id);

ALTER TABLE public.article_category_relations
    ADD CONSTRAINT article_category_relations_pkey PRIMARY KEY (article_id, category_id);

ALTER TABLE public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);

ALTER TABLE public.bonus_calculation_history
    ADD CONSTRAINT bonus_calculation_history_pkey PRIMARY KEY (id);

ALTER TABLE public.bonus_calculations
    ADD CONSTRAINT bonus_calculations_pkey PRIMARY KEY (id);

ALTER TABLE public.bonus_rules
    ADD CONSTRAINT bonus_rules_pkey PRIMARY KEY (id);

ALTER TABLE public.creator_performance
    ADD CONSTRAINT creator_performance_pkey PRIMARY KEY (id);

ALTER TABLE public.creators
    ADD CONSTRAINT creators_pkey PRIMARY KEY (id);

ALTER TABLE public.username_history
    ADD CONSTRAINT username_history_pkey PRIMARY KEY (id);


-- =============================================================================
-- 4. UNIQUE CONSTRAINTS
-- =============================================================================

ALTER TABLE public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);

ALTER TABLE public.article_categories
    ADD CONSTRAINT article_categories_slug_key UNIQUE (slug);

ALTER TABLE public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);

ALTER TABLE public.bonus_calculations
    ADD CONSTRAINT bonus_calculations_creator_id_month_year_key UNIQUE (creator_id, month, year);

ALTER TABLE public.creator_performance
    ADD CONSTRAINT creator_performance_creator_id_period_identifier_key UNIQUE (creator_id, period_identifier);

ALTER TABLE public.creators
    ADD CONSTRAINT creators_creator_id_key UNIQUE (creator_id);

-- Redundant alias kept for compatibility
ALTER TABLE public.creators
    ADD CONSTRAINT unique_tiktok_creator_id UNIQUE (creator_id);


-- =============================================================================
-- 5. FOREIGN KEYS
-- =============================================================================

ALTER TABLE public.article_category_relations
    ADD CONSTRAINT article_category_relations_article_id_fkey
        FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;

ALTER TABLE public.article_category_relations
    ADD CONSTRAINT article_category_relations_category_id_fkey
        FOREIGN KEY (category_id) REFERENCES public.article_categories(id) ON DELETE CASCADE;

ALTER TABLE public.articles
    ADD CONSTRAINT articles_category_id_fkey
        FOREIGN KEY (category_id) REFERENCES public.article_categories(id);

ALTER TABLE public.articles
    ADD CONSTRAINT articles_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES public.admins(id);

ALTER TABLE public.bonus_calculation_history
    ADD CONSTRAINT bonus_calculation_history_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES public.admins(id);

ALTER TABLE public.bonus_calculations
    ADD CONSTRAINT bonus_calculations_creator_id_fkey
        FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE;

ALTER TABLE public.creator_performance
    ADD CONSTRAINT creator_performance_creator_id_fkey
        FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE;

ALTER TABLE public.username_history
    ADD CONSTRAINT username_history_creator_id_fkey
        FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE;


-- =============================================================================
-- 6. INDEXES
-- =============================================================================

CREATE INDEX idx_article_category_relations_article_id
    ON public.article_category_relations USING btree (article_id);

CREATE INDEX idx_article_category_relations_category_id
    ON public.article_category_relations USING btree (category_id);

CREATE INDEX idx_bonus_date
    ON public.bonus_calculations USING btree (year DESC, month DESC);

CREATE INDEX idx_bonus_status
    ON public.bonus_calculations USING btree (payment_status);

CREATE INDEX idx_creator_performance_period_identifier
    ON public.creator_performance USING btree (creator_id, period_identifier, period_year DESC, period_month DESC);

CREATE INDEX idx_creator_performance_weekly
    ON public.creator_performance USING btree (creator_id, period_year DESC, period_month DESC, period_week DESC);

CREATE INDEX idx_creators_category
    ON public.creators USING btree (konten_kategori);

CREATE INDEX idx_creators_followers
    ON public.creators USING btree (followers_count);

CREATE INDEX idx_creators_username
    ON public.creators USING btree (username_tiktok);

CREATE INDEX idx_performance_date
    ON public.creator_performance USING btree (period_year DESC, period_month DESC);


-- =============================================================================
-- 7. VIEWS
-- =============================================================================

-- creator_performance_periods
-- Joins creator_performance with creators to produce a display-ready view
CREATE VIEW public.creator_performance_periods AS
SELECT
    cp.id,
    cp.creator_id,
    cp.period_month,
    cp.period_year,
    cp.diamonds,
    cp.valid_days,
    cp.live_hours,
    cp.viewers_count,
    cp.new_followers,
    cp.diamonds_vs_last_month,
    cp.hours_vs_last_month,
    cp.raw_data,
    cp.created_at,
    cp.period_week,
    cp.period_start_date,
    cp.period_end_date,
    cp.period_identifier,
    cp.period_type,
    cp.period_duration_days,
    c.username_tiktok,
    c.followers_count,
    c.konten_kategori,
    c.graduation_status,
    CASE
        WHEN cp.period_start_date IS NOT NULL AND cp.period_end_date IS NOT NULL
        THEN (cp.period_start_date || ' ~ ' || cp.period_end_date)::varchar
        ELSE cp.period_identifier
    END AS period_display,
    CASE
        WHEN cp.period_duration_days <= 7  THEN 'Weekly'
        WHEN cp.period_duration_days <= 14 THEN 'Bi-weekly'
        WHEN cp.period_duration_days <= 31 THEN 'Monthly'
        ELSE 'Custom'
    END AS period_description
FROM public.creator_performance cp
JOIN public.creators c ON cp.creator_id = c.id
ORDER BY cp.period_year DESC, cp.period_month DESC, cp.period_start_date DESC, cp.diamonds DESC;


-- =============================================================================
-- 8. FUNCTIONS
-- =============================================================================

-- calculate_period_type: maps duration_days to a period label
CREATE OR REPLACE FUNCTION public.calculate_period_type(duration_days integer)
RETURNS varchar
LANGUAGE plpgsql AS $$
BEGIN
    CASE
        WHEN duration_days <= 7  THEN RETURN 'weekly';
        WHEN duration_days <= 14 THEN RETURN 'bi-weekly';
        WHEN duration_days <= 31 THEN RETURN 'monthly';
        ELSE RETURN 'custom';
    END CASE;
END;
$$;

-- generate_period_identifier: produces a string key like "2025-06-01_2025-06-28"
CREATE OR REPLACE FUNCTION public.generate_period_identifier(start_date date, end_date date)
RETURNS varchar
LANGUAGE plpgsql AS $$
BEGIN
    RETURN start_date || '_' || end_date;
END;
$$;

-- increment_article_view_count: trigger function for article view tracking
CREATE OR REPLACE FUNCTION public.increment_article_view_count()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.articles
    SET view_count = view_count + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
END;
$$;

-- track_username_change: trigger function, auto-logs username changes to username_history
CREATE OR REPLACE FUNCTION public.track_username_change()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.username_tiktok IS DISTINCT FROM NEW.username_tiktok THEN
        INSERT INTO public.username_history (creator_id, old_username, new_username)
        VALUES (NEW.id, OLD.username_tiktok, NEW.username_tiktok);
    END IF;
    RETURN NEW;
END;
$$;

-- update_updated_at: sets updated_at = NOW() on any UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- update_updated_at_column: alias of above (kept for compatibility)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- =============================================================================
-- 9. TRIGGERS
-- =============================================================================

-- Auto-log TikTok username changes on creators table
CREATE TRIGGER trigger_username_change
    AFTER UPDATE ON public.creators
    FOR EACH ROW EXECUTE FUNCTION public.track_username_change();

-- Auto-update updated_at on bonus_calculations
CREATE TRIGGER update_bonus_timestamp
    BEFORE UPDATE ON public.bonus_calculations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-update updated_at on creators
CREATE TRIGGER update_creators_timestamp
    BEFORE UPDATE ON public.creators
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- =============================================================================
-- 10. SEED DATA
-- =============================================================================

-- article_categories (9 categories from original database)
INSERT INTO public.article_categories (id, name, slug, created_at) VALUES
    ('d29bdef7-c5ac-4d89-93c9-fd301ffa6f45', 'Kebijakan TikTok',  'kebijakan-tiktok',  '2025-06-19 12:29:44.396615+00'),
    ('6d8b1aa4-1fef-4c7c-957a-98e480d518a9', 'Tips Streaming',    'tips-streaming',    '2025-06-19 12:29:44.396615+00'),
    ('6bc5616f-055d-4b4c-9314-b807c9a30d15', 'Bonus Info',        'bonus-info',        '2025-06-19 12:29:44.396615+00'),
    ('2068bb3a-5cf6-44a4-98be-8e6b9a1c0401', 'Pengumuman',        'pengumuman',        '2025-06-19 12:29:44.396615+00'),
    ('a03af7c5-ce1f-4677-891a-0669f8f3e655', 'Education',         'education',         '2025-06-24 09:53:03.270675+00'),
    ('0825986f-5e40-4ba1-95ec-2863909af20e', 'Social Media',      'social-media',      '2025-06-24 09:53:03.270675+00'),
    ('abe2d6df-bf47-46cf-84c6-18a00e3e3117', 'Monetization',      'monetization',      '2025-06-24 09:53:03.270675+00'),
    ('764c806e-09b0-4d55-a476-37f85d450157', 'Growth Strategy',   'growth-strategy',   '2025-06-24 09:53:03.270675+00'),
    ('265d437c-48a4-423c-8b1a-5dba261d2b28', 'Platform Tips',     'platform-tips',     '2025-06-24 09:53:03.270675+00')
ON CONFLICT (id) DO NOTHING;

-- bonus_rules (single configuration row — adjust bonus_table values to match your payout sheet)
-- requirements: minimum valid_days, live_hours, and bonus percentage per tier (A/B/C)
-- bonus_table:  diamond range → IDR payout table — populate this with your actual bonus amounts
INSERT INTO public.bonus_rules (id, requirements, bonus_table, updated_at) VALUES
    (1,
     '{"A": {"days": 23, "hours": 100, "bonusPercentage": 30},
       "B": {"days": 20, "hours": 60,  "bonusPercentage": 25},
       "C": {"days": 15, "hours": 40,  "bonusPercentage": 20}}',
     '{"A": [], "B": [], "C": []}',
     now())
ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- Admin user is seeded in supabase_dummy_data.sql with a fixed UUID.
-- Do NOT insert an admin here — the dummy data file uses a specific UUID
-- that is referenced by the articles.created_by foreign key.


-- =============================================================================
-- END
-- =============================================================================
-- Creator data and performance data should be re-imported via the Admin Panel
-- (Talent Management → CSV upload, Performance Upload → CSV upload)
-- after the schema is in place.
-- =============================================================================
