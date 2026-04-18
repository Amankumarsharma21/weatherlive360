CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_published_created ON public.posts(published, created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Published posts are viewable by everyone"
ON public.posts FOR SELECT
USING (published = true);

-- Writes are restricted; the admin edge function uses the service role key and bypasses RLS.
-- No insert/update/delete policies are created intentionally.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a couple of starter posts
INSERT INTO public.posts (slug, title, excerpt, content) VALUES
('best-time-to-visit-delhi', 'Best Time to Visit Delhi: A Weather Guide', 'Plan your trip to Delhi with this season-by-season weather guide.', E'# Best Time to Visit Delhi\n\nDelhi has four distinct seasons. The most pleasant period is **October to March**, when daytime temperatures hover between 15–25°C.\n\n## Spring (Feb–Mar)\nMild and dry. Great for sightseeing.\n\n## Summer (Apr–Jun)\nHot and dry, often above 40°C. Stay hydrated and avoid midday sun.\n\n## Monsoon (Jul–Sep)\nHeavy rain, high humidity. Carry an umbrella and check forecasts daily.\n\n## Winter (Nov–Jan)\nCool and foggy mornings; sunny afternoons. Air quality can dip — check AQI before outdoor activity.'),
('understanding-the-air-quality-index', 'Understanding the Air Quality Index (AQI)', 'What AQI numbers really mean — and when to stay indoors.', E'# Understanding the AQI\n\nThe Air Quality Index summarises pollutant levels into a single 1–5 scale (OpenWeatherMap) or 0–500 (US EPA).\n\n- **1 (Good)** — Air is clean. Enjoy outdoor activities.\n- **2 (Fair)** — Acceptable for most people.\n- **3 (Moderate)** — Sensitive groups should limit prolonged exertion.\n- **4 (Poor)** — Reduce outdoor activity. Wear a mask if needed.\n- **5 (Very Poor)** — Avoid outdoor exercise. Use air purifiers indoors.\n\nAlways combine AQI with weather: rain often clears pollutants, while still cold mornings trap them.');