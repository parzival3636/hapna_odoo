-- ============================================================
-- SUPABASE AUTH SETUP — Run AFTER the main schema migration
-- This creates the trigger and JWT hook for role-based auth
-- ============================================================

-- ============================================================
-- 1. TRIGGER: Auto-create user_profiles on signup
-- ============================================================
-- When a new user signs up via Supabase Auth, this trigger
-- automatically creates a row in user_profiles.
-- It reads the 'role' from the user's raw_user_meta_data.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    signup_role TEXT;
BEGIN
    -- Extract the role from raw_user_meta_data (set during signup)
    signup_role := NEW.raw_user_meta_data->>'role';

    -- Default to 'customer' if not provided or invalid
    IF signup_role IS NULL OR signup_role NOT IN ('customer', 'organiser', 'admin') THEN
        signup_role := 'customer';
    END IF;

    INSERT INTO public.user_profiles (user_id, role, is_active, timezone)
    VALUES (
        NEW.id::text,
        signup_role::public.user_role,
        true,
        'Asia/Kolkata'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. JWT HOOK: Inject role into access token (Custom Access Token)
-- ============================================================
-- This function is called by Supabase's Custom Access Token Hook
-- to inject the user's role from user_profiles into the JWT.
--
-- SETUP STEPS:
-- 1. Go to Supabase Dashboard → Authentication → Hooks
-- 2. Enable "Custom Access Token (JWT)" hook
-- 3. Select this function: custom_access_token_hook
-- 4. Save

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
    claims JSONB;
    user_role TEXT;
BEGIN
    -- Get the user's role from user_profiles
    SELECT role::text INTO user_role
    FROM public.user_profiles
    WHERE user_id = (event->>'user_id')
    LIMIT 1;

    -- Default to 'customer' if no profile found
    IF user_role IS NULL THEN
        user_role := 'customer';
    END IF;

    -- Extract existing claims
    claims := event->'claims';

    -- Inject role into app_metadata in the JWT
    IF claims->'app_metadata' IS NULL THEN
        claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
    END IF;

    claims := jsonb_set(
        claims,
        '{app_metadata, role}',
        to_jsonb(user_role)
    );

    -- Update the claims in the event
    event := jsonb_set(event, '{claims}', claims);

    RETURN event;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant necessary permissions for the hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;

-- Revoke public access to the hook function
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;


-- ============================================================
-- 3. HELPER: Update user role (for admin use)
-- ============================================================
-- Example: SELECT set_user_role('user-uuid-here', 'organiser');

CREATE OR REPLACE FUNCTION public.set_user_role(
    target_user_id TEXT,
    new_role user_role
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_profiles
    SET role = new_role, updated_at = now()
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- NOTES
-- ============================================================
-- After running this SQL:
--
-- 1. Go to Supabase Dashboard → Authentication → Hooks
--    → Enable "Custom Access Token (JWT)" hook
--    → Select function: custom_access_token_hook
--
-- 2. Go to Authentication → Email Templates
--    → In "Confirm Signup" template, use {{ .Token }} to show
--      the 6-digit OTP code instead of a confirmation link
--    → Do the same for "Reset Password" template
--
-- 3. To make a user an admin:
--    SELECT set_user_role('the-user-uuid', 'admin');
