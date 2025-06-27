-- Insert test articles
INSERT INTO public.articles (
    title,
    content,
    excerpt,
    type,
    access,
    view_count,
    published_at,
    created_at,
    seo_title,
    seo_description,
    seo_keywords
)
VALUES 
(
    'How to Become a Successful Content Creator',
    'Full article content will be displayed here...',
    'A comprehensive guide to starting your career as a digital content creator.',
    'article',
    'public',
    0,
    NOW(),
    NOW(),
    'Guide: Becoming a Successful Content Creator in 2024',
    'Learn the essential steps and strategies to become a successful content creator on digital platforms. Expert tips and actionable advice.',
    ARRAY['content creator', 'digital marketing', 'social media', 'influencer']
),
(
    'Tips to Increase TikTok Engagement',
    'Full article content will be displayed here...',
    'Learn strategies to boost your TikTok engagement and grow your account.',
    'article',
    'public',
    0,
    NOW(),
    NOW(),
    'Proven TikTok Engagement Strategies for 2024',
    'Discover effective techniques to increase your TikTok engagement, grow your following, and create viral content.',
    ARRAY['tiktok', 'social media', 'engagement', 'growth']
),
(
    'Digital Content Monetization Guide',
    'Full article content will be displayed here...',
    'Learn how to monetize your digital content effectively.',
    'article',
    'public',
    0,
    NOW(),
    NOW(),
    'Complete Guide to Digital Content Monetization',
    'Comprehensive guide on how to monetize your digital content across different platforms and maximize your earnings.',
    ARRAY['monetization', 'digital content', 'creator economy', 'revenue']
);

-- Insert categories
INSERT INTO public.article_categories (name, created_at)
VALUES 
('Education', NOW()),
('Social Media', NOW()),
('Monetization', NOW()),
('Growth Strategy', NOW()),
('Platform Tips', NOW());

-- Create article-category relationships
WITH article_refs AS (
  SELECT id, title FROM public.articles WHERE title IN (
    'How to Become a Successful Content Creator',
    'Tips to Increase TikTok Engagement',
    'Digital Content Monetization Guide'
  )
),
category_refs AS (
  SELECT id, name FROM public.article_categories WHERE name IN (
    'Education',
    'Social Media',
    'Monetization',
    'Growth Strategy',
    'Platform Tips'
  )
)
INSERT INTO public.article_category_relations (article_id, category_id, created_at)
SELECT 
  a.id,
  c.id,
  NOW()
FROM article_refs a
CROSS JOIN category_refs c
WHERE 
  (a.title = 'How to Become a Successful Content Creator' AND c.name IN ('Education', 'Growth Strategy'))
  OR (a.title = 'Tips to Increase TikTok Engagement' AND c.name IN ('Social Media', 'Platform Tips', 'Growth Strategy'))
  OR (a.title = 'Digital Content Monetization Guide' AND c.name IN ('Monetization', 'Education')); 