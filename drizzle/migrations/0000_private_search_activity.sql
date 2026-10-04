DROP POLICY IF EXISTS "Anyone can read search activity" ON public.search_activity;
CREATE POLICY "Users read own search activity" ON public.search_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own search activity" ON public.search_activity FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE SELECT ON public.search_activity FROM anon;
GRANT SELECT, DELETE ON public.search_activity TO authenticated;

CREATE OR REPLACE FUNCTION public.log_search_activity(search_query text, search_mode text DEFAULT 'default'::text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO public.search_activity (user_id, query, search_mode) VALUES (auth.uid(), search_query, search_mode);
  DELETE FROM public.search_activity WHERE user_id = auth.uid() AND id NOT IN (
    SELECT id FROM public.search_activity WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 100);
END;
$function$;