'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, User, LogOut, ShieldAlert, LayoutDashboard, Menu, X, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOutAction } from '@/app/actions/auth';
import { Button } from './ui/Button';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/login');
    router.refresh();
  };

  const getDashboardLink = () => {
    if (!profile) return '/dashboard';
    if (profile.role === 'admin') return '/admin';
    if (profile.role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/reset-password') ||
                     pathname.startsWith('/onboarding');

  if (isAuthPage) return null; // Hide navbar on login/signup flows

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
            <Compass className="h-5 w-5" />
          </span>
          <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent font-extrabold">
            TripNova
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-white ${
              pathname === '/' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Explore
          </Link>
          
          {user && (
            <>
              {profile?.role === 'user' && !profile?.is_onboarding_completed && (
                <Link
                  href="/onboarding"
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    pathname === '/onboarding' ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  Onboarding
                </Link>
              )}
              <Link
                href={getDashboardLink()}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/vendor')
                    ? 'text-white'
                    : 'text-zinc-400'
                }`}
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={getDashboardLink()} className="flex items-center gap-2 group">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || 'User'}
                    className="h-8 w-8 rounded-full border border-violet-500/30 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold font-mono">
                    {profile?.name?.substring(0, 2).toUpperCase() || 'TR'}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-zinc-200 leading-none group-hover:text-white transition-colors">
                    {profile?.name || 'Traveler'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono capitalize leading-none mt-1">
                    {profile?.role || 'User'}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-900 py-4 px-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-base font-medium py-2 ${
              pathname === '/' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Explore
          </Link>
          
          {user && (
            <>
              {profile?.role === 'user' && !profile?.is_onboarding_completed && (
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 ${
                    pathname === '/onboarding' ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  Onboarding
                </Link>
              )}
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-2 ${
                  pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/vendor')
                    ? 'text-white'
                    : 'text-zinc-400'
                }`}
              >
                Dashboard
              </Link>
            </>
          )}

          <hr className="border-zinc-900 my-1" />

          {user ? (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || 'User'}
                    className="h-10 w-10 rounded-full border border-violet-500/30 object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold font-mono">
                    {profile?.name?.substring(0, 2).toUpperCase() || 'TR'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-zinc-200">
                    {profile?.name || 'Traveler'}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono capitalize">
                    {profile?.role || 'User'}
                  </div>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full mt-2"
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
