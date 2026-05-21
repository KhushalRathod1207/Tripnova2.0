'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, MapPin, Calendar, Heart, ShieldAlert, 
  Store, Phone, FileText, Landmark, X, LogOut, CheckCircle2 
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { submitVendorRequestAction, signOutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

// Vendor Zod Validation
const vendorRequestSchema = z.object({
  agency_name: z.string().min(3, 'Agency name must be at least 3 characters'),
  gst_number: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST Number format'),
  business_phone: z.string().min(10, 'Phone must be at least 10 digits'),
  business_address: z.string().min(10, 'Address must be at least 10 characters'),
  document_url: z.string().url('Must be a valid document URL').optional().or(z.literal('')),
});

type VendorRequestInput = z.infer<typeof vendorRequestSchema>;

export default function UserDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [vendorRequest, setVendorRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorRequestInput>({
    resolver: zodResolver(vendorRequestSchema),
    defaultValues: {
      agency_name: '',
      gst_number: '',
      business_phone: '',
      business_address: '',
      document_url: '',
    },
  });

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setProfile(profileData);

      // Fetch Vendor Application status
      const { data: requestData } = await supabase
        .from('vendor_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (requestData && requestData.length > 0) {
        setVendorRequest(requestData[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/login');
    router.refresh();
  };

  const handleVendorSubmit = async (data: VendorRequestInput) => {
    setIsSubmitting(true);
    const result = await submitVendorRequestAction(data);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || 'Application submitted successfully.');
      setIsModalOpen(false);
      reset();
      loadData(); // Reload details
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070614]">
        <div className="flex flex-col items-center gap-3">
          <Compass className="h-10 w-10 text-violet-500 animate-spin" />
          <span className="text-zinc-500 text-sm font-mono tracking-widest">LOADING DASHBOARD...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#070614]">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Hello, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{profile?.name || 'Traveler'}</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Welcome to your TripNova dashboard. Let&apos;s plan your next getaway.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Vendor Request Button/Status */}
          {profile?.role === 'user' && (
            <>
              {!vendorRequest && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(true)}
                  leftIcon={<Store className="h-4 w-4 text-violet-400" />}
                  className="border-zinc-800 text-zinc-300 hover:text-white"
                >
                  Become a Vendor
                </Button>
              )}

              {vendorRequest && vendorRequest.status === 'pending' && (
                <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Vendor Application Pending Review</span>
                </div>
              )}

              {vendorRequest && vendorRequest.status === 'rejected' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-medium">Application Rejected</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="border-rose-500/20 text-zinc-300"
                  >
                    Reapply
                  </Button>
                </div>
              )}
            </>
          )}

          {profile?.role === 'vendor' && (
            <Button
              variant="outline"
              onClick={() => router.push('/vendor')}
              leftIcon={<Store className="h-4 w-4 text-emerald-400" />}
              className="border-emerald-500/20 text-zinc-300 hover:text-white"
            >
              Vendor Panel
            </Button>
          )}

          {profile?.role === 'admin' && (
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              leftIcon={<CheckCircle2 className="h-4 w-4 text-cyan-400" />}
              className="border-cyan-500/20 text-zinc-300 hover:text-white"
            >
              Admin Dashboard
            </Button>
          )}

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

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card variant="glass" className="md:col-span-1 border-white/5 bg-zinc-950/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name} 
                  className="h-12 w-12 rounded-full border border-violet-500/30 object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-lg font-mono">
                  {profile?.name?.substring(0, 2).toUpperCase() || 'TR'}
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-bold text-white">{profile?.name || 'Traveler'}</CardTitle>
                <span className="text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30 font-semibold px-2 py-0.5 rounded-full capitalize">
                  {profile?.role || 'User'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-zinc-900/60 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-medium">Budget Class:</span>
              <span className="text-zinc-200 font-semibold">{profile?.budget_preference || 'Unspecified'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-medium">Companion:</span>
              <span className="text-zinc-200 font-semibold">{profile?.travel_style || 'Unspecified'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-medium">Travel Frequency:</span>
              <span className="text-zinc-200 font-semibold">{profile?.travel_frequency || 'Unspecified'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Interests & Activities */}
        <Card variant="glass" className="md:col-span-2 border-white/5 bg-zinc-950/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Your Travel Profile</CardTitle>
            <CardDescription className="text-zinc-500">Topics and activities you chose during onboarding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-zinc-900/60">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Interests</span>
              <div className="flex flex-wrap gap-2">
                {profile?.travel_interests && profile.travel_interests.length > 0 ? (
                  profile.travel_interests.map((interest: string) => (
                    <span 
                      key={interest}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-medium text-zinc-300"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">No interests configured.</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Favorite Activities</span>
              <div className="flex flex-wrap gap-2">
                {profile?.activities && profile.activities.length > 0 ? (
                  profile.activities.map((act: string) => (
                    <span 
                      key={act}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-medium text-zinc-300"
                    >
                      {act}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">No activities configured.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destinations & Saved Bookings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Destinations */}
        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-400" />
              <span>Saved Destinations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 border-t border-zinc-900/60">
            {profile?.favorite_destinations && profile.favorite_destinations.length > 0 ? (
              <div className="divide-y divide-zinc-900">
                {profile.favorite_destinations.map((dest: string, index: number) => (
                  <div key={dest} className="py-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-200 font-semibold">{dest}</span>
                    <span className="text-xs text-violet-400 font-medium">View Deals</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-4 text-center">No destinations bookmarked yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Mock Bookings list */}
        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-400" />
              <span>Your Booked Trips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 border-t border-zinc-900/60">
            {/* Displaying simple mock active list to look complete */}
            <div className="divide-y divide-zinc-900">
              <div className="py-3.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-zinc-200 block">Flight to Paris (CDG)</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">DEPARTS: OCT 12, 2026</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  Confirmed
                </span>
              </div>
              <div className="py-3.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-zinc-200 block">Boutique Stay at Eiffel Tower</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">CHECKIN: OCT 12, 2026</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  Confirmed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Become a Vendor Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg z-10"
            >
              <Card variant="glass" className="border-white/5 bg-zinc-950 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <Store className="h-5.5 w-5.5 text-violet-400" />
                      <span>Become a Vendor</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-500 text-xs mt-1">
                      Register your travel agency. Applications are processed manually by admins.
                    </CardDescription>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-2">
                  <form onSubmit={handleSubmit(handleVendorSubmit)} className="space-y-4">
                    <Input
                      {...register('agency_name')}
                      label="Agency / Business Name"
                      placeholder="Nova Travels Agency"
                      error={errors.agency_name?.message}
                      disabled={isSubmitting}
                    />

                    <Input
                      {...register('gst_number')}
                      label="GST Registration Number"
                      placeholder="27AAAAA1111A1Z1"
                      error={errors.gst_number?.message}
                      disabled={isSubmitting}
                      className="font-mono text-sm uppercase"
                    />

                    <Input
                      {...register('business_phone')}
                      label="Business Phone Number"
                      placeholder="9876543210"
                      type="tel"
                      leftIcon={<Phone className="h-4 w-4" />}
                      error={errors.business_phone?.message}
                      disabled={isSubmitting}
                    />

                    <Input
                      {...register('business_address')}
                      label="Business Registered Address"
                      placeholder="123 Ocean Drive, Suite 10, Mumbai"
                      error={errors.business_address?.message}
                      disabled={isSubmitting}
                    />

                    <Input
                      {...register('document_url')}
                      label="Verification Document URL (License/ID PDF)"
                      placeholder="https://example.com/license.pdf"
                      leftIcon={<FileText className="h-4 w-4" />}
                      error={errors.document_url?.message}
                      disabled={isSubmitting}
                    />

                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-900">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsModalOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        isLoading={isSubmitting}
                      >
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
