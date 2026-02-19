-- =============================================================================
-- Meta Agency — Dummy Data (Demo / Portfolio)
-- Run this AFTER supabase_schema.sql has been executed.
-- Paste into Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- =============================================================================
-- STEP 1: ADMIN USER
-- password_hash is stored and compared as plaintext — login with:
--   Email   : admin@metaagency.id
--   Password: admin123
-- =============================================================================

-- Ensure the admin row has the exact UUID that articles.created_by references.
-- Step 1a: If a different UUID was created by the schema seed, NULL out the FK references first,
--          then delete the old row, then insert with the correct fixed UUID.
UPDATE public.articles    SET created_by = NULL WHERE created_by NOT IN ('11111111-0000-0000-0000-000000000001'::uuid);
UPDATE public.bonus_calculation_history SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN ('11111111-0000-0000-0000-000000000001'::uuid);
DELETE FROM public.admins WHERE email = 'admin@metaagency.id' AND id <> '11111111-0000-0000-0000-000000000001';

INSERT INTO public.admins (id, email, password_hash, name, created_at)
VALUES (
  '11111111-0000-0000-0000-000000000001',
  'admin@metaagency.id',
  'admin123',
  'Admin Meta Agency',
  now()
)
ON CONFLICT (id) DO UPDATE
  SET email         = EXCLUDED.email,
      password_hash = EXCLUDED.password_hash,
      name          = EXCLUDED.name;


-- =============================================================================
-- STEP 2: ARTICLE CATEGORIES (safe re-insert)
-- =============================================================================

INSERT INTO public.article_categories (id, name, slug, created_at) VALUES
  ('d29bdef7-c5ac-4d89-93c9-fd301ffa6f45', 'Kebijakan TikTok', 'kebijakan-tiktok', now()),
  ('6d8b1aa4-1fef-4c7c-957a-98e480d518a9', 'Tips Streaming',   'tips-streaming',   now()),
  ('6bc5616f-055d-4b4c-9314-b807c9a30d15', 'Bonus Info',       'bonus-info',       now()),
  ('2068bb3a-5cf6-44a4-98be-8e6b9a1c0401', 'Pengumuman',       'pengumuman',       now()),
  ('a03af7c5-ce1f-4677-891a-0669f8f3e655', 'Education',        'education',        now()),
  ('0825986f-5e40-4ba1-95ec-2863909af20e', 'Social Media',     'social-media',     now()),
  ('abe2d6df-bf47-46cf-84c6-18a00e3e3117', 'Monetization',     'monetization',     now()),
  ('764c806e-09b0-4d55-a476-37f85d450157', 'Growth Strategy',  'growth-strategy',  now()),
  ('265d437c-48a4-423c-8b1a-5dba261d2b28', 'Platform Tips',    'platform-tips',    now())
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- STEP 3: BONUS RULES (single config row)
-- Tier A: 23+ days, 100+ hours → 30% bonus percentage
-- Tier B: 20+ days,  60+ hours → 25% bonus percentage
-- Tier C: 15+ days,  40+ hours → 20% bonus percentage
-- =============================================================================

INSERT INTO public.bonus_rules (id, requirements, bonus_table, updated_at)
VALUES (
  1,
  '{"A": {"days": 23, "hours": 100, "bonusPercentage": 30},
    "B": {"days": 20, "hours": 60,  "bonusPercentage": 25},
    "C": {"days": 15, "hours": 40,  "bonusPercentage": 20}}',
  '{"A": [], "B": [], "C": []}',
  now()
)
ON CONFLICT (id) DO UPDATE SET updated_at = now();


-- =============================================================================
-- STEP 4: CREATORS (15 real creators from agency data)
-- =============================================================================

INSERT INTO public.creators (id, creator_id, username_tiktok, followers_count, konten_kategori, status, graduation_status, created_at, updated_at)
VALUES
  ('aaaaaaaa-0001-0000-0000-000000000001', '7359134912118620166', 'skyauramlbb',    0, 'gaming',     'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0002-0000-0000-000000000002', '7359135303539556357', 'syviraau_',      0, 'lifestyle',  'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0003-0000-0000-000000000003', '7359135408770875397', 'aimstarsayless', 0, 'gaming',     'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0004-0000-0000-000000000004', '7403358679791222785', 'caramelnihdeck', 0, 'gaming',     'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0005-0000-0000-000000000005', '7376851040186122256', 'rrq_cast',       0, 'gaming',     'active', 'Rookie joined over 90D',       now(), now()),
  ('aaaaaaaa-0006-0000-0000-000000000006', '7398152577713635344', 'hann.n14',       0, 'lifestyle',  'active', 'Rookie joined over 90D',       now(), now()),
  ('aaaaaaaa-0007-0000-0000-000000000007', '7478194521784795153', 'instrumerald',   0, 'music',      'active', 'Rookie joined over 90D',       now(), now()),
  ('aaaaaaaa-0008-0000-0000-000000000008', '7359134456152064005', 'bangijumm_',     0, 'gaming',     'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0009-0000-0000-000000000009', '7359134717800611845', 'ajijunmei',      0, 'lifestyle',  'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0010-0000-0000-000000000010', '7476624636478865424', 'takumo_pubgm',   0, 'gaming',     'active', 'Rookie joined over 90D',       now(), now()),
  ('aaaaaaaa-0011-0000-0000-000000000011', '7359135604191625221', 'bocahrudal',     0, 'gaming',     'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0012-0000-0000-000000000012', '7449237414100336656', 'drewdoang',      0, 'other',      'active', 'Rookie joined over 90D',       now(), now()),
  ('aaaaaaaa-0013-0000-0000-000000000013', '7359134992074637317', 'maaaarrriio_',   0, 'gaming',     'active', 'Joined as non-Rookie',         now(), now()),
  ('aaaaaaaa-0014-0000-0000-000000000014', '7359138848942718981', 'vertii_',        0, 'lifestyle',  'active', 'Rookie joined over 90D',       now(), now()),
  ('aaaaaaaa-0015-0000-0000-000000000015', '7491701120797130769', 'aku.divaaa_',    0, 'lifestyle',  'active', 'Rookie not graduated in 90D',  now(), now())
ON CONFLICT (creator_id) DO NOTHING;


-- =============================================================================
-- STEP 5: CREATOR PERFORMANCE — June 2025 (period 2025-06-01 ~ 2025-06-28)
-- =============================================================================

INSERT INTO public.creator_performance (
  id, creator_id, period_month, period_year,
  diamonds, valid_days, live_hours,
  period_start_date, period_end_date,
  period_identifier, period_type, period_duration_days,
  created_at
) VALUES
  ('bbbbbbbb-0001-0000-0000-000000000001', 'aaaaaaaa-0001-0000-0000-000000000001', 6, 2025, 39623, 25, 103.15, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0002-0000-0000-000000000002', 'aaaaaaaa-0002-0000-0000-000000000002', 6, 2025, 59500, 23,  87.92, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0003-0000-0000-000000000003', 'aaaaaaaa-0003-0000-0000-000000000003', 6, 2025, 13839, 28, 185.38, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0004-0000-0000-000000000004', 'aaaaaaaa-0004-0000-0000-000000000004', 6, 2025, 10370, 21,  67.65, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0005-0000-0000-000000000005', 'aaaaaaaa-0005-0000-0000-000000000005', 6, 2025, 15715, 19,  76.10, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0006-0000-0000-000000000006', 'aaaaaaaa-0006-0000-0000-000000000006', 6, 2025, 10694, 15,  83.55, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0007-0000-0000-000000000007', 'aaaaaaaa-0007-0000-0000-000000000007', 6, 2025,  5038, 21,  93.97, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0008-0000-0000-000000000008', 'aaaaaaaa-0008-0000-0000-000000000008', 6, 2025,  7860, 26, 129.77, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0009-0000-0000-000000000009', 'aaaaaaaa-0009-0000-0000-000000000009', 6, 2025,  3392, 28, 176.87, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0010-0000-0000-000000000010', 'aaaaaaaa-0010-0000-0000-000000000010', 6, 2025,  8076, 17,  46.38, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0011-0000-0000-000000000011', 'aaaaaaaa-0011-0000-0000-000000000011', 6, 2025,  3893, 21,  60.02, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0012-0000-0000-000000000012', 'aaaaaaaa-0012-0000-0000-000000000012', 6, 2025,  2689, 19, 110.35, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0013-0000-0000-000000000013', 'aaaaaaaa-0013-0000-0000-000000000013', 6, 2025,  3275, 23, 118.00, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0014-0000-0000-000000000014', 'aaaaaaaa-0014-0000-0000-000000000014', 6, 2025,  3216, 16,  84.95, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now()),
  ('bbbbbbbb-0015-0000-0000-000000000015', 'aaaaaaaa-0015-0000-0000-000000000015', 6, 2025,  7847, 12,  30.10, '2025-06-01', '2025-06-28', '2025-06-01_2025-06-28', 'monthly', 28, now())
ON CONFLICT (creator_id, period_identifier) DO NOTHING;


-- =============================================================================
-- STEP 6: BONUS CALCULATIONS — June 2025
-- bonus_amount_idr = diamonds * 0.05 (USD) * 16000 (exchange) * bonus%
-- Tier A = 30%, Tier B = 25%, Tier C = 20%
-- =============================================================================

INSERT INTO public.bonus_calculations (
  id, creator_id, month, year,
  diamonds, valid_days, live_hours,
  tier, bonus_amount_idr, payment_status,
  created_at, updated_at
) VALUES
  -- Grade A creators
  ('cccccccc-0001-0000-0000-000000000001', 'aaaaaaaa-0002-0000-0000-000000000002', 6, 2025, 59500, 23,  87.92, 'A', 14280000.00, 'paid',    now(), now()),
  ('cccccccc-0002-0000-0000-000000000002', 'aaaaaaaa-0001-0000-0000-000000000001', 6, 2025, 39623, 25, 103.15, 'A',  9509520.00, 'paid',    now(), now()),
  ('cccccccc-0003-0000-0000-000000000003', 'aaaaaaaa-0003-0000-0000-000000000003', 6, 2025, 13839, 28, 185.38, 'A',  3321360.00, 'pending', now(), now()),
  ('cccccccc-0004-0000-0000-000000000004', 'aaaaaaaa-0008-0000-0000-000000000008', 6, 2025,  7860, 26, 129.77, 'A',  1886400.00, 'pending', now(), now()),
  ('cccccccc-0005-0000-0000-000000000005', 'aaaaaaaa-0009-0000-0000-000000000009', 6, 2025,  3392, 28, 176.87, 'A',   814080.00, 'pending', now(), now()),
  ('cccccccc-0006-0000-0000-000000000006', 'aaaaaaaa-0013-0000-0000-000000000013', 6, 2025,  3275, 23, 118.00, 'A',   786000.00, 'pending', now(), now()),
  -- Grade B creators
  ('cccccccc-0007-0000-0000-000000000007', 'aaaaaaaa-0005-0000-0000-000000000005', 6, 2025, 15715, 19,  76.10, 'B',  3143000.00, 'pending', now(), now()),
  ('cccccccc-0008-0000-0000-000000000008', 'aaaaaaaa-0004-0000-0000-000000000004', 6, 2025, 10370, 21,  67.65, 'B',  2074000.00, 'pending', now(), now()),
  ('cccccccc-0009-0000-0000-000000000009', 'aaaaaaaa-0007-0000-0000-000000000007', 6, 2025,  5038, 21,  93.97, 'B',  1007600.00, 'pending', now(), now()),
  ('cccccccc-0010-0000-0000-000000000010', 'aaaaaaaa-0011-0000-0000-000000000011', 6, 2025,  3893, 21,  60.02, 'B',   778600.00, 'pending', now(), now()),
  ('cccccccc-0011-0000-0000-000000000011', 'aaaaaaaa-0012-0000-0000-000000000012', 6, 2025,  2689, 19, 110.35, 'B',   537800.00, 'pending', now(), now()),
  -- Grade C creators
  ('cccccccc-0012-0000-0000-000000000012', 'aaaaaaaa-0006-0000-0000-000000000006', 6, 2025, 10694, 15,  83.55, 'C',  1711040.00, 'pending', now(), now()),
  ('cccccccc-0013-0000-0000-000000000013', 'aaaaaaaa-0010-0000-0000-000000000010', 6, 2025,  8076, 17,  46.38, 'C',  1292160.00, 'pending', now(), now()),
  ('cccccccc-0014-0000-0000-000000000014', 'aaaaaaaa-0014-0000-0000-000000000014', 6, 2025,  3216, 16,  84.95, 'C',   514560.00, 'pending', now(), now()),
  -- Not eligible (below Grade C minimum)
  ('cccccccc-0015-0000-0000-000000000015', 'aaaaaaaa-0015-0000-0000-000000000015', 6, 2025,  7847, 12,  30.10, NULL,         0.00, 'pending', now(), now())
ON CONFLICT (creator_id, month, year) DO NOTHING;


-- =============================================================================
-- STEP 7: ARTICLES (6 articles matching the frontend dummy data)
-- created_by references the admin user UUID from Step 1
-- =============================================================================

INSERT INTO public.articles (
  id, title, content, category_id,
  type, access, view_count,
  created_by, published_at, created_at, updated_at,
  excerpt, slug, featured_image
) VALUES
  (
    'dddddddd-0001-0000-0000-000000000001',
    'Cara Meningkatkan Diamonds TikTok LIVE Secara Konsisten',
    '<p>Konsistensi adalah kunci utama dalam menghasilkan diamonds yang stabil setiap bulan di TikTok LIVE.</p>
<h2>1. Tentukan Jadwal LIVE yang Konsisten</h2>
<p>Algoritma TikTok memberi keuntungan kepada creator yang LIVE secara rutin pada waktu yang sama. Penonton akan terbiasa dengan jadwal Anda dan lebih mudah hadir kembali.</p>
<h2>2. Optimalkan Durasi LIVE</h2>
<p>Sesi LIVE minimal 1–2 jam menghasilkan diamonds lebih banyak karena penonton memiliki lebih banyak kesempatan untuk berinteraksi. Creator dengan rata-rata 3+ jam per sesi cenderung masuk Grade A.</p>
<h2>3. Interaksi Aktif dengan Penonton</h2>
<p>Ucapkan terima kasih untuk setiap gift, ajak bicara penonton baru, dan buat sesi LIVE Anda terasa personal. Engagement tinggi mendorong algoritma TikTok untuk merekomendasikan LIVE Anda ke lebih banyak orang.</p>
<h2>4. Konsistensi Valid Days</h2>
<p>Valid days adalah hari di mana Anda melakukan LIVE minimal sekali. Target minimal 15 hari per bulan untuk masuk Grade C, 20 hari untuk Grade B, dan 23 hari untuk Grade A.</p>
<p>Creator yang berhasil menjaga konsistensi selama 3 bulan berturut-turut rata-rata mengalami kenaikan diamonds sebesar 40–60%.</p>',
    '6d8b1aa4-1fef-4c7c-957a-98e480d518a9',
    'article', 'public', 1240,
    '11111111-0000-0000-0000-000000000001',
    '2025-07-10 08:00:00+00', now(), now(),
    'Konsistensi adalah kunci utama dalam menghasilkan diamonds yang stabil setiap bulan. Pelajari strategi yang terbukti digunakan oleh creator top Meta Agency.',
    'cara-meningkatkan-diamonds-tiktok-live',
    NULL
  ),
  (
    'dddddddd-0002-0000-0000-000000000002',
    'Memahami Sistem Grade A, B, C di Meta Agency',
    '<p>Sistem grading kami dirancang untuk memberikan reward yang adil dan transparan berdasarkan performa LIVE setiap bulan.</p>
<h2>Cara Kerja Grading</h2>
<p>Setiap bulan, performa LIVE setiap creator dievaluasi berdasarkan dua metrik utama: jumlah hari LIVE aktif (valid days) dan total jam LIVE.</p>
<h2>Grade A — Top Performer</h2>
<ul><li>Minimum 23 valid days</li><li>Minimum 100 jam LIVE</li><li>Bonus: 30% dari nilai diamonds</li></ul>
<h2>Grade B — Good Performer</h2>
<ul><li>Minimum 20 valid days</li><li>Minimum 60 jam LIVE</li><li>Bonus: 25% dari nilai diamonds</li></ul>
<h2>Grade C — Standard</h2>
<ul><li>Minimum 15 valid days</li><li>Minimum 40 jam LIVE</li><li>Bonus: 20% dari nilai diamonds</li></ul>
<h2>Tidak Memenuhi Syarat</h2>
<p>Creator yang tidak masuk salah satu grade tetap bisa mendapatkan diamonds, namun tidak mendapat persentase bonus tambahan. Ini bukan penalti — melainkan dorongan untuk meningkatkan konsistensi bulan berikutnya.</p>
<h2>Tips Naik Grade</h2>
<p>Fokus pada valid days terlebih dahulu. Banyak creator yang memiliki jam LIVE tinggi tapi kurang valid days karena mereka LIVE sangat panjang di beberapa hari saja. Lebih baik LIVE 2–3 jam setiap hari daripada 8 jam sekali seminggu.</p>',
    '6bc5616f-055d-4b4c-9314-b807c9a30d15',
    'article', 'public', 980,
    '11111111-0000-0000-0000-000000000001',
    '2025-07-05 08:00:00+00', now(), now(),
    'Sistem grading kami dirancang untuk memberikan reward yang adil berdasarkan performa LIVE. Artikel ini menjelaskan cara mencapai Grade A dan memaksimalkan bonus.',
    'memahami-sistem-grade-meta-agency',
    NULL
  ),
  (
    'dddddddd-0003-0000-0000-000000000003',
    'Kebijakan Terbaru TikTok LIVE untuk Creator 2025',
    '<p>TikTok merilis beberapa pembaruan kebijakan penting yang berdampak langsung pada creator LIVE di tahun 2025.</p>
<h2>Perubahan Utama</h2>
<p>TikTok memperketat aturan konten LIVE, khususnya terkait dengan:</p>
<ul>
<li><strong>Konten sensitivitas tinggi:</strong> Konten yang dianggap tidak sesuai usia akan langsung diturunkan tanpa peringatan.</li>
<li><strong>Durasi sesi:</strong> TikTok kini mendorong sesi LIVE yang lebih berkualitas daripada sekadar durasi panjang.</li>
<li><strong>Interaksi gift:</strong> Beberapa jenis gift virtual mengalami perubahan nilai konversi.</li>
</ul>
<h2>Yang Tidak Berubah</h2>
<p>Sistem diamonds dan konversi ke USD tidak mengalami perubahan signifikan. Creator yang konsisten dan menjaga kualitas konten tidak perlu khawatir dengan pembaruan ini.</p>
<h2>Rekomendasi</h2>
<p>Pastikan konten LIVE Anda selalu sesuai dengan Community Guidelines TikTok. Jika ada ketidakjelasan, hubungi tim Meta Agency untuk klarifikasi sebelum mengubah format konten Anda.</p>',
    'd29bdef7-c5ac-4d89-93c9-fd301ffa6f45',
    'article', 'public', 754,
    '11111111-0000-0000-0000-000000000001',
    '2025-06-28 08:00:00+00', now(), now(),
    'TikTok merilis beberapa pembaruan kebijakan yang berdampak langsung pada creator LIVE. Simak ringkasan lengkap dan cara menyesuaikan strategi konten Anda.',
    'kebijakan-terbaru-tiktok-live-2025',
    NULL
  ),
  (
    'dddddddd-0004-0000-0000-000000000004',
    'Strategi Jadwal LIVE yang Efektif untuk Mendapatkan Penonton',
    '<p>Menentukan waktu LIVE yang tepat bisa meningkatkan jumlah penonton aktif hingga signifikan. Data dari creator kami menunjukkan pola yang konsisten.</p>
<h2>Waktu Terbaik untuk LIVE</h2>
<p>Berdasarkan analisis performa creator Meta Agency, tiga slot waktu paling efektif adalah:</p>
<ul>
<li><strong>Pagi: 08.00 – 10.00 WIB</strong> — cocok untuk konten santai, penonton aktif sebelum kerja/kuliah.</li>
<li><strong>Sore: 16.00 – 19.00 WIB</strong> — slot paling kompetitif, traffic tertinggi, cocok untuk gaming dan hiburan.</li>
<li><strong>Malam: 21.00 – 23.00 WIB</strong> — penonton santai, engagement rate lebih tinggi, cocok untuk sesi interaktif.</li>
</ul>
<h2>Strategi Rotasi Jadwal</h2>
<p>Tidak semua creator cocok dengan satu slot waktu. Coba LIVE di dua atau tiga slot berbeda selama dua minggu pertama, lalu analisis slot mana yang menghasilkan penonton dan diamonds terbanyak.</p>
<h2>Konsistensi Lebih Penting dari Timing</h2>
<p>Creator yang LIVE di waktu yang kurang populer tapi sangat konsisten biasanya mengalahkan creator yang LIVE di prime time tapi tidak teratur. Penonton akan menyesuaikan diri dengan jadwal Anda.</p>',
    '6d8b1aa4-1fef-4c7c-957a-98e480d518a9',
    'article', 'public', 612,
    '11111111-0000-0000-0000-000000000001',
    '2025-06-20 08:00:00+00', now(), now(),
    'Menentukan waktu LIVE yang tepat bisa meningkatkan jumlah penonton hingga 3x lipat. Analisis data dari creator kami menunjukkan pola yang konsisten.',
    'strategi-jadwal-live-efektif',
    NULL
  ),
  (
    'dddddddd-0005-0000-0000-000000000005',
    'Panduan Lengkap Endorsement untuk Creator TikTok',
    '<p>Endorsement bisa menjadi sumber pendapatan tambahan yang signifikan di luar diamonds. Pelajari cara mengelolanya dengan tepat.</p>
<h2>Jenis Endorsement yang Umum</h2>
<ul>
<li><strong>Product review:</strong> Brand mengirimkan produk untuk direview selama LIVE atau di konten video.</li>
<li><strong>Mention berbayar:</strong> Menyebut brand atau produk dengan cara natural di konten Anda.</li>
<li><strong>Affiliate:</strong> Mendapat komisi dari setiap penjualan yang berasal dari link Anda.</li>
</ul>
<h2>Cara Menetapkan Rate</h2>
<p>Rate standar bergantung pada jumlah followers, rata-rata viewers LIVE, dan engagement rate. Creator dengan 10K–50K followers umumnya mematok Rp 300.000–1.500.000 per konten, tergantung jenis dan durasi.</p>
<h2>Yang Harus Dihindari</h2>
<p>Jangan menerima semua tawaran endorsement hanya demi uang. Penonton yang merasa Anda terlalu sering berpromosi akan berkurang kepercayaannya. Pilih brand yang relevan dengan niche konten Anda.</p>
<h2>Peran Meta Agency</h2>
<p>Tim kami membantu memfasilitasi koneksi dengan brand yang sesuai dan mendampingi proses negosiasi jika diperlukan. Hubungi tim kami jika ada tawaran yang ingin dikonsultasikan.</p>',
    'abe2d6df-bf47-46cf-84c6-18a00e3e3117',
    'article', 'public', 530,
    '11111111-0000-0000-0000-000000000001',
    '2025-06-15 08:00:00+00', now(), now(),
    'Endorsement bisa menjadi sumber pendapatan tambahan yang signifikan. Pelajari cara negosiasi rate yang tepat dan menjaga kepercayaan audiens Anda.',
    'panduan-endorsement-creator-tiktok',
    NULL
  ),
  (
    'dddddddd-0006-0000-0000-000000000006',
    'Cara Membangun Personal Branding yang Kuat di TikTok',
    '<p>Personal branding yang jelas membuat penonton lebih mudah mengenali dan mengingat Anda — dan lebih setia untuk kembali ke LIVE Anda.</p>
<h2>Tentukan Niche Anda</h2>
<p>Creator yang mencoba semua jenis konten biasanya sulit berkembang. Pilih satu atau dua niche yang Anda kuasai dan sukai: gaming, lifestyle, musik, memasak, edukasi, atau lainnya.</p>
<h2>Konsistensi Visual</h2>
<p>Gunakan warna, font, dan gaya thumbnail yang konsisten. Penonton harus bisa mengenali konten Anda hanya dari tampilannya, sebelum membaca nama akun Anda.</p>
<h2>Tone dan Kepribadian</h2>
<p>Jadilah diri sendiri, tapi dengan versi yang lebih terfokus. Apakah Anda energik dan lucu? Tenang dan informatif? Pilih satu persona yang natural dan pertahankan.</p>
<h2>Bangun Komunitas, Bukan Sekadar Penonton</h2>
<p>Creator yang paling sukses di TikTok LIVE bukan yang memiliki penonton terbanyak, melainkan yang memiliki penonton paling setia. Kenali penonton reguler Anda, ingat nama mereka, dan buat mereka merasa dihargai.</p>
<h2>Konsistensi Adalah Segalanya</h2>
<p>Personal branding yang kuat dibangun dari konsistensi selama berbulan-bulan, bukan dari satu video viral. Tetap konsisten bahkan ketika viewernya sedikit — itu yang membedakan creator jangka panjang.</p>',
    '764c806e-09b0-4d55-a476-37f85d450157',
    'article', 'public', 489,
    '11111111-0000-0000-0000-000000000001',
    '2025-06-08 08:00:00+00', now(), now(),
    'Personal branding yang jelas membuat penonton lebih mudah mengenali dan mengingat Anda. Ikuti langkah-langkah yang telah terbukti dari creator sukses kami.',
    'cara-membangun-personal-branding-tiktok',
    NULL
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- STEP 8: ARTICLE CATEGORY RELATIONS
-- =============================================================================

INSERT INTO public.article_category_relations (article_id, category_id, created_at)
VALUES
  ('dddddddd-0001-0000-0000-000000000001', '6d8b1aa4-1fef-4c7c-957a-98e480d518a9', now()),
  ('dddddddd-0002-0000-0000-000000000002', '6bc5616f-055d-4b4c-9314-b807c9a30d15', now()),
  ('dddddddd-0003-0000-0000-000000000003', 'd29bdef7-c5ac-4d89-93c9-fd301ffa6f45', now()),
  ('dddddddd-0004-0000-0000-000000000004', '6d8b1aa4-1fef-4c7c-957a-98e480d518a9', now()),
  ('dddddddd-0005-0000-0000-000000000005', 'abe2d6df-bf47-46cf-84c6-18a00e3e3117', now()),
  ('dddddddd-0006-0000-0000-000000000006', '764c806e-09b0-4d55-a476-37f85d450157', now())
ON CONFLICT (article_id, category_id) DO NOTHING;


-- =============================================================================
-- VERIFY: Quick check after running (optional — paste separately)
-- =============================================================================

-- SELECT 'admins' AS tbl, COUNT(*) FROM public.admins
-- UNION ALL SELECT 'creators',            COUNT(*) FROM public.creators
-- UNION ALL SELECT 'creator_performance', COUNT(*) FROM public.creator_performance
-- UNION ALL SELECT 'bonus_calculations',  COUNT(*) FROM public.bonus_calculations
-- UNION ALL SELECT 'articles',            COUNT(*) FROM public.articles
-- UNION ALL SELECT 'article_categories',  COUNT(*) FROM public.article_categories
-- UNION ALL SELECT 'bonus_rules',         COUNT(*) FROM public.bonus_rules;

-- Expected result:
--   admins               | 1
--   creators             | 15
--   creator_performance  | 15
--   bonus_calculations   | 15
--   articles             | 6
--   article_categories   | 9
--   bonus_rules          | 1
