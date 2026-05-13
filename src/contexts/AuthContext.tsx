import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  gym: any | null;
  staff: any | null;
  permissions: string[];
  role: string | null;
  isOwner: boolean;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [gym, setGym] = useState<any | null>(null);
  const [staff, setStaff] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Refresh auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setProfile(null);
    setGym(null);
    setStaff(null);
    setPermissions([]);
    setRole(null);
    setIsOwner(false);
  };

  useEffect(() => {
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // If we have a user but no profile, or it's a sign in event, fetch data
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || !profile) {
          setLoading(true);
          try {
            await fetchUserData(session.user.id, session.user.email);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
        }
      } else {
        clearAuth();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string, email: string | undefined) => {
    try {
      // Fetch from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, gyms(*), staff(*, roles(*)), members(*), trainers(*)')
        .or(`id.eq.${userId},email.eq.${email}`)
        .maybeSingle();

      if (userData) {
        setProfile(userData);
        setRole(userData.role);
        
        // Handle gym population
        if (userData.gyms) {
          setGym(userData.gyms);
        } else if (userData.gym_id) {
          const { data: gymData } = await supabase
            .from('gyms')
            .select('*')
            .eq('id', userData.gym_id)
            .maybeSingle();
          if (gymData) setGym(gymData);
        }

        setStaff(userData.staff);
        setPermissions(userData.staff?.roles?.permissions || []);
        setIsOwner(userData.role === 'admin' || userData.role === 'admin2');
        
        // Update last login
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', userData.id);
      } else {
        // Fallback for legacy gym owners if they aren't in users table yet
        if (email) {
          const { data: gymData } = await supabase
            .from('gyms')
            .select('*')
            .eq('email', email)
            .single();

          if (gymData) {
            setGym(gymData);
            setRole('admin');
            setIsOwner(true);
          }
        }
      }
    } catch (error) {
      console.error('Auth fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (identifier: string, password: string) => {
    let email = identifier;
    
    // Check if identifier is a phone number (10 digits)
    if (/^\d{10}$/.test(identifier)) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('phone', identifier)
        .maybeSingle();
      
      if (userError) {
        return { error: userError };
      }

      if (userData?.email) {
        email = userData.email;
      } else {
        return { error: new Error('User with this phone number not found.') };
      }
    }

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      clearAuth();
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, user, profile, gym, staff, permissions, role, isOwner, loading, 
      signIn, signOut, refreshAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
