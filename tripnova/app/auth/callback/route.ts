import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const provider = data.user.app_metadata?.provider;

      if (provider === 'email') {
        // Sign out to clear the session so they must log in manually
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?verified=true`);
      }

      // Fetch profile to decide landing page (onboarding, dashboard, etc.)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_onboarding_completed')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (profile.role === 'vendor') {
          return NextResponse.redirect(`${origin}/vendor`);
        } else if (!profile.is_onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return user to login if there is an error
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}
