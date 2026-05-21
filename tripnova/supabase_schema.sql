-- TripNova Production Ready Schema --

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),
    is_verified BOOLEAN DEFAULT false,
    is_onboarding_completed BOOLEAN DEFAULT false,
    travel_interests TEXT[] DEFAULT '{}',
    travel_style TEXT,
    budget_preference TEXT,
    favorite_destinations TEXT[] DEFAULT '{}',
    activities TEXT[] DEFAULT '{}',
    travel_frequency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Vendor Requests Table
CREATE TABLE IF NOT EXISTS public.vendor_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    agency_name TEXT NOT NULL,
    gst_number TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    business_address TEXT NOT NULL,
    document_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.vendor_requests ENABLE ROW LEVEL SECURITY;

-- 3. Trigger to Create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, role, is_verified, is_onboarding_completed)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Traveler'),
        new.email,
        new.raw_user_meta_data->>'avatar_url',
        'user',
        false,
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Helper to Prevent RLS Infinite Recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Row Level Security Policies

-- Profiles Policies
CREATE POLICY "Users can read own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" 
    ON public.profiles FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" 
    ON public.profiles FOR UPDATE 
    USING (public.is_admin());

-- Vendor Requests Policies
CREATE POLICY "Users can create own request" 
    ON public.vendor_requests FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own request" 
    ON public.vendor_requests FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" 
    ON public.vendor_requests FOR ALL 
    USING (public.is_admin());
