import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { toast } from 'sonner';
import { QueryClient } from '@tanstack/react-query';

// Create a query client instance
const queryClient = new QueryClient();

// In Vite, environment variables are exposed through import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pmwnuwpbzyavvlgowctp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtd251d3BienlhdnZsZ293Y3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NjQ4NDMsImV4cCI6MjA1NTA0MDg0M30.WpRE6IM-2w4_xP4JONAcp02roRHjP4Hjd317N2BWrUc';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Helper function to check if admin
export async function isAdmin() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();

    if (error) {
      console.error('Admin check error:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Helper function to sign in as admin
export async function signInAsAdmin(email: string, password: string) {
  try {
    // First sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Authentication failed');

    // Then check if user is admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (adminError) {
      console.error('Admin check error:', adminError);
      await supabase.auth.signOut();
      throw new Error('Not authorized as admin');
    }

    if (!admin) {
      await supabase.auth.signOut();
      throw new Error('Not authorized as admin');
    }

    // Invalidate auth query to trigger UI update
    queryClient.invalidateQueries(['auth']);

    return { data: authData, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}

// Sign up function
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Sign in function
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    // Invalidate auth query to trigger UI update
    queryClient.invalidateQueries(['auth']);
    
    toast.success('Signed in successfully');
    return data;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign out function
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Invalidate all queries to reset the cache
    queryClient.invalidateQueries();
    
    toast.success('Signed out successfully');
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Password reset request
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
    toast.success('Password reset email sent');
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw error;
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    toast.success('Password updated successfully');
  } catch (error: any) {
    console.error('Password update error:', error);
    throw error;
  }
}