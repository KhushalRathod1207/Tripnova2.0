'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Store, ShieldAlert, Award, FileSpreadsheet, Plus, 
  MapPin, IndianRupee, Compass, ChevronRight, LogOut 
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { signOutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function VendorPortal() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [vendorData, setVendorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileData || profileData.role !== 'vendor') {
          toast.error('Access Denied: Vendors only');
          router.push('/dashboard');
          return;
        }
        setProfile(profileData);

        // Fetch approved vendor request details
        const { data: requestData } = await supabase
          .from('vendor_requests')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'approved')
          .single();

        setVendorData(requestData);
      } catch (err: any) {
        toast.error('Failed to load vendor portal details');
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070614]">
        <div className="flex flex-col items-center gap-3">
          <Compass className="h-10 w-10 text-violet-500 animate-spin" />
          <span className="text-zinc-500 text-sm font-mono tracking-widest">LOADING VENDOR PORTAL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#070614]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Store className="h-5 w-5" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase">VENDOR PARTNER PORTAL</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            {vendorData?.agency_name || 'Partner console'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage listings, packages, and bookings for your clients.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-zinc-800 text-zinc-300 hover:text-white"
          >
            Personal Dashboard
          </Button>

          <Button
            variant="danger"
            onClick={handleSignOut}
            leftIcon={<LogOut className="h-4 w-4" />}
            className="h-10 px-4 text-sm"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Total Bookings</span>
            <span className="text-3xl font-extrabold text-white mt-1">42</span>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-400 font-semibold">+12% from last month</span>
          </CardContent>
        </Card>

        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Active Packages</span>
            <span className="text-3xl font-extrabold text-white mt-1">8</span>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-zinc-500 font-semibold">2 pending approval</span>
          </CardContent>
        </Card>

        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Monthly Revenue</span>
            <span className="text-3xl font-extrabold text-white mt-1 flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6 text-emerald-400 shrink-0" />
              <span>2,45,000</span>
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-400 font-semibold">+18% growth month-over-month</span>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Agency Details & Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Agency credentials details */}
        <Card variant="glass" className="md:col-span-1 border-white/5 bg-zinc-950/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <span>Partner Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-zinc-900/60 text-sm">
            <div>
              <span className="text-zinc-500 block">GST Number:</span>
              <span className="text-zinc-200 font-mono font-semibold">{vendorData?.gst_number || 'Pending'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Contact Phone:</span>
              <span className="text-zinc-200 font-semibold">{vendorData?.business_phone || 'Pending'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Business Address:</span>
              <span className="text-zinc-200 font-semibold text-xs leading-relaxed block mt-1">
                {vendorData?.business_address || 'Pending'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Package Listings */}
        <Card variant="glass" className="md:col-span-2 border-white/5 bg-zinc-950/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-white">Your Listed Tour Packages</CardTitle>
              <CardDescription className="text-zinc-500">Add or edit travel packages you are currently offering.</CardDescription>
            </div>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Create Package
            </Button>
          </CardHeader>
          <CardContent className="pt-2 border-t border-zinc-900/60">
            <div className="divide-y divide-zinc-900">
              <div className="py-4 flex justify-between items-center text-sm group cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-200 block group-hover:text-violet-400 transition-colors">
                    Golden Triangle of India tour (Delhi-Agra-Jaipur)
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> 5 Days, 4 Nights
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-200">₹14,999/Pax</span>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </div>
              </div>

              <div className="py-4 flex justify-between items-center text-sm group cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-200 block group-hover:text-violet-400 transition-colors">
                    Himachal Adventure Expedition
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> 7 Days, 6 Nights
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-200">₹24,500/Pax</span>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
