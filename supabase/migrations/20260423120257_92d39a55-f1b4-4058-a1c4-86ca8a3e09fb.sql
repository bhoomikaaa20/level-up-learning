
-- Admin: ban/unban a user
CREATE OR REPLACE FUNCTION public.set_user_banned(_target UUID, _banned BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.profiles SET banned = _banned WHERE id = _target;
END;
$$;

-- Self: increment XP/coins/streak after quiz
CREATE OR REPLACE FUNCTION public.award_xp_and_coins(_xp INTEGER, _coins INTEGER)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  prof public.profiles;
  today DATE := CURRENT_DATE;
  new_streak INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO prof FROM public.profiles WHERE id = uid;

  IF prof.last_active_date = today THEN
    new_streak := prof.streak;
  ELSIF prof.last_active_date = today - INTERVAL '1 day' THEN
    new_streak := prof.streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE public.profiles
    SET xp = xp + GREATEST(_xp, 0),
        coins = coins + GREATEST(_coins, 0),
        streak = new_streak,
        last_active_date = today
    WHERE id = uid
    RETURNING * INTO prof;
  RETURN prof;
END;
$$;
