'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Users, Store, ClipboardList, Check, X, Shield, 
  Search, ExternalLink, Calendar, Compass, LogOut 
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { approveVendorAction, rejectVendorAction, signOutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    users: 0,
    vendors: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData || profileData.role !== 'admin') {
        toast.error('Access Denied: Admins only');
        router.push('/dashboard');
        return;
      }
      setProfile(profileData);

      // Fetch platform metrics
      // 1. Fetch total users (role = 'user')
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      // 2. Fetch total vendors (role = 'vendor')
      const { count: vendorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor');

      // 3. Fetch pending requests
      const { data: requestList } = await supabase
        .from('vendor_requests')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setRequests(requestList || []);
      setStats({
        users: usersCount || 0,
        vendors: vendorsCount || 0,
        pending: requestList?.length || 0,
      });

    } catch (err: any) {
      toast.error('Failed to load admin telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (requestId: string, userId: string) => {
    setActionLoadingId(requestId);
    const result = await approveVendorAction(requestId, userId);
    setActionLoadingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || 'Vendor approved successfully.');
      loadData(); // refresh details
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoadingId(requestId);
    const result = await rejectVendorAction(requestId);
    setActionLoadingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || 'Vendor rejected.');
      loadData(); // refresh details
    }
  };

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
          <span className="text-zinc-500 text-sm font-mono tracking-widest">LOADING ADMIN CONSOLE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#070614]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-violet-400">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase">ADMIN PORTAL</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Platform Console</h1>
          <p className="text-sm text-zinc-400 mt-1">Monitor users, approve agency applications, and view metrics.</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Registered Users</span>
              <span className="text-2xl font-extrabold text-white mt-0.5 block">{stats.users}</span>
            </div>
          </CardHeader>
        </Card>

        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Active Vendors</span>
              <span className="text-2xl font-extrabold text-white mt-0.5 block">{stats.vendors}</span>
            </div>
          </CardHeader>
        </Card>

        <Card variant="glass" className="border-white/5 bg-zinc-950/40">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600/10 text-amber-400">
              <ClipboardList className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Pending Requests</span>
              <span className="text-2xl font-extrabold text-white mt-0.5 block">{stats.pending}</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Vendor Approvals Table */}
      <Card variant="glass" className="border-white/5 bg-zinc-950/40">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Pending Vendor Applications</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 border-t border-zinc-900/60 overflow-x-auto">
          {requests.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-8 text-center">No pending vendor applications found.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-xs font-mono uppercase">
                  <th className="py-3 px-2">Agency details</th>
                  <th className="py-3 px-2">GST Number</th>
                  <th className="py-3 px-2">Phone</th>
                  <th className="py-3 px-2">Applicant</th>
                  <th className="py-3 px-2">Document</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {requests.map((req) => (
                  <tr key={req.id} className="text-zinc-300 hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-2">
                      <span className="font-semibold text-zinc-200 block">{req.agency_name}</span>
                      <span className="text-[10px] text-zinc-500 block leading-normal mt-0.5">{req.business_address}</span>
                    </td>
                    <td className="py-4 px-2 font-mono text-xs text-zinc-400">{req.gst_number}</td>
                    <td className="py-4 px-2 font-mono text-xs">{req.business_phone}</td>
                    <td className="py-4 px-2">
                      <span className="text-zinc-200 block font-medium">{(req.profiles as any)?.name}</span>
                      <span className="text-[10px] text-zinc-500 block font-mono">{(req.profiles as any)?.email}</span>
                    </td>
                    <td className="py-4 px-2">
                      {req.document_url ? (
                        <a 
                          href={req.document_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
                        >
                          <span>View PDF</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">None Provided</span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(req.id)}
                          disabled={actionLoadingId !== null}
                          className="text-rose-400 hover:bg-rose-500/10 p-2 cursor-pointer"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApprove(req.id, req.user_id)}
                          isLoading={actionLoadingId === req.id}
                          disabled={actionLoadingId !== null}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 px-3"
                        >
                          Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
