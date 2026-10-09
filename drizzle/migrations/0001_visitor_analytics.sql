CREATE TABLE public.visitors (
  device_id text PRIMARY KEY CHECK (char_length(device_id) BETWEEN 16 AND 128),
  ip_hash text,
  user_id uuid,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.visitors TO service_role;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE INDEX visitors_last_seen_idx ON public.visitors (last_seen);

CREATE TABLE public.analytics_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tracking_started_at timestamptz NOT NULL DEFAULT now(),
  legacy_visitors integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.analytics_settings TO service_role;
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.analytics_settings (id) VALUES (1);

CREATE OR REPLACE FUNCTION public.track_visitor(p_device_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ip text;
  v_hash text;
BEGIN
  IF p_device_id IS NULL OR char_length(p_device_id) NOT BETWEEN 16 AND 128 THEN RETURN; END IF;
  v_ip := split_part(COALESCE((current_setting('request.headers', true)::json)->>'x-forwarded-for', ''), ',', 1);
  IF v_ip <> '' THEN v_hash := encode(sha256(convert_to(trim(v_ip), 'UTF8')), 'hex'); END IF;
  INSERT INTO public.visitors (device_id, ip_hash, user_id)
  VALUES (p_device_id, v_hash, auth.uid())
  ON CONFLICT (device_id) DO UPDATE
    SET last_seen = now(),
        ip_hash = COALESCE(EXCLUDED.ip_hash, visitors.ip_hash),
        user_id = COALESCE(auth.uid(), visitors.user_id);
END $$;
GRANT EXECUTE ON FUNCTION public.track_visitor(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_visitor_analytics()
RETURNS TABLE(registered_users bigint, unique_visitors bigint, live_sessions bigint, legacy_users bigint, legacy_visitors integer, tracking_started_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.analytics_settings;
BEGIN
  IF lower(COALESCE(auth.jwt()->>'email', '')) <> 'poifoundationunlimited@gmail.com' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT * INTO s FROM public.analytics_settings WHERE id = 1;
  RETURN QUERY SELECT
    (SELECT COUNT(DISTINCT id) FROM public.profiles),
    (SELECT COUNT(DISTINCT device_id) FROM public.visitors WHERE user_id IS NULL),
    (SELECT COUNT(DISTINCT device_id) FROM public.visitors WHERE last_seen > now() - interval '2 minutes'),
    (SELECT COUNT(*) FROM public.profiles WHERE created_at < s.tracking_started_at),
    s.legacy_visitors,
    s.tracking_started_at;
END $$;
REVOKE EXECUTE ON FUNCTION public.get_visitor_analytics() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_visitor_analytics() TO authenticated;