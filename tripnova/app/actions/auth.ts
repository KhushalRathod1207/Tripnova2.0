'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth';

// 1. Sign Up Action
export async function signUpAction(formData: any) {
  try {
    const validatedFields = signupSchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name, email, password } = validatedFields.data;
    const supabase = await createClient();

    // Call Supabase SignUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: 'Check your email for a verification link to complete registration.' };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// 2. Sign In Action
export async function signInAction(formData: any) {
  try {
    const validatedFields = loginSchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password } = validatedFields.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Load profile to decide redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_onboarding_completed')
      .eq('id', data.user.id)
      .single();

    let redirectUrl = '/dashboard';
    const isCompleted = profile ? profile.is_onboarding_completed : false;
    const role = profile ? profile.role : 'user';

    if (role === 'admin') {
      redirectUrl = '/admin';
    } else if (role === 'vendor') {
      redirectUrl = '/vendor';
    } else if (!isCompleted) {
      redirectUrl = '/onboarding';
    }

    return { success: 'Logged in successfully', redirectUrl };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// 3. Sign Out Action
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  return { success: true };
}

// 4. Forgot Password Action
export async function forgotPasswordAction(formData: any) {
  try {
    const validatedFields = forgotPasswordSchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { email } = validatedFields.data;
    const supabase = await createClient();

    // Use headers or host details dynamically
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: 'Password reset link sent to your email.' };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// 5. Reset Password Action
export async function resetPasswordAction(formData: any) {
  try {
    const validatedFields = resetPasswordSchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { password } = validatedFields.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: 'Password has been reset successfully.' };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// 6. Save Onboarding Action
export async function saveOnboardingAction(onboardingData: {
  travel_interests: string[];
  travel_style: string;
  budget_preference: string;
  favorite_destinations: string[];
  activities: string[];
  travel_frequency: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized user' };
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.user_metadata?.name || 'Traveler',
        travel_interests: onboardingData.travel_interests,
        travel_style: onboardingData.travel_style,
        budget_preference: onboardingData.budget_preference,
        favorite_destinations: onboardingData.favorite_destinations,
        activities: onboardingData.activities,
        travel_frequency: onboardingData.travel_frequency,
        is_onboarding_completed: true,
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// 7. Submit Vendor Request Action
export async function submitVendorRequestAction(vendorData: {
  agency_name: string;
  gst_number: string;
  business_phone: string;
  business_address: string;
  document_url?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized user' };
    }

    // Check if there is an active request
    const { data: existing } = await supabase
      .from('vendor_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existing) {
      return { error: 'You already have a pending vendor application.' };
    }

    const { error } = await supabase.from('vendor_requests').insert({
      user_id: user.id,
      agency_name: vendorData.agency_name,
      gst_number: vendorData.gst_number,
      business_phone: vendorData.business_phone,
      business_address: vendorData.business_address,
      document_url: vendorData.document_url || '',
      status: 'pending',
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: 'Vendor application submitted successfully.' };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// 8. Admin: Approve Vendor Action
export async function approveVendorAction(requestId: string, userId: string) {
  try {
    const supabase = await createClient();
    
    // Check if the current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return { error: 'Access denied: Admin only' };
    }

    // Begin updates in Supabase (we do these in sequence since we are server side)
    // Update vendor_requests status
    const { error: requestErr } = await supabase
      .from('vendor_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (requestErr) return { error: requestErr.message };

    // Update profiles role
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ role: 'vendor' })
      .eq('id', userId);

    if (profileErr) return { error: profileErr.message };

    revalidatePath('/admin');
    return { success: 'Vendor application approved and role updated.' };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// 9. Admin: Reject Vendor Action
export async function rejectVendorAction(requestId: string) {
  try {
    const supabase = await createClient();
    
    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return { error: 'Access denied: Admin only' };
    }

    // Update status to rejected
    const { error } = await supabase
      .from('vendor_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    return { success: 'Vendor application rejected.' };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
