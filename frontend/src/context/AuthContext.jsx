import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchUserProfile, syncUserProfile } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('demo_role') || 'ADMIN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session fetch & backend profile sync
    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          let dbProfile = null;
          try {
            dbProfile = await fetchUserProfile();
          } catch (e) {
            console.warn('Backend profile fetch warning:', e);
          }

          const userRole = dbProfile?.role || session.user.user_metadata?.role || localStorage.getItem('demo_role') || 'ADMIN';
          const activeProfile = {
            id: session.user.id,
            email: dbProfile?.email || session.user.email,
            role: userRole,
          };
          setRole(userRole);
          setProfile(activeProfile);
          localStorage.setItem('demo_user', JSON.stringify(activeProfile));
        } else {
          // If no live Supabase session, check local stored auth state
          const demoUserStr = localStorage.getItem('demo_user');
          if (demoUserStr) {
            const demoUser = JSON.parse(demoUserStr);
            setUser(demoUser);
            setRole(demoUser.role || 'ADMIN');
            setProfile(demoUser);
          }
        }
      } catch (err) {
        console.warn('Auth initialization warning:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    // 2. Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        let dbProfile = null;
        try {
          dbProfile = await fetchUserProfile();
        } catch (e) {}

        const userRole = dbProfile?.role || session.user.user_metadata?.role || localStorage.getItem('demo_role') || 'ADMIN';
        const activeProfile = {
          id: session.user.id,
          email: dbProfile?.email || session.user.email,
          role: userRole,
        };
        setRole(userRole);
        setProfile(activeProfile);
        localStorage.setItem('demo_user', JSON.stringify(activeProfile));
      } else {
        const demoUserStr = localStorage.getItem('demo_user');
        if (!demoUserStr) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Login handler - Strictly validates credentials against Supabase Auth & syncs backend DB profile
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid login credentials. Please check your email/password or create an account.');
      }

      if (!data?.user) {
        throw new Error('Login failed. No user returned from authentication server.');
      }

      const desiredRole = data.user.user_metadata?.role || 'ADMIN';
      let dbProfile = null;
      try {
        dbProfile = await syncUserProfile(desiredRole);
      } catch (e) {
        console.warn('Profile sync on login warning:', e);
      }

      const userRole = dbProfile?.role || desiredRole;
      const loggedUser = {
        id: data.user.id,
        email: dbProfile?.email || data.user.email,
        role: userRole,
      };

      setUser(data.user);
      setRole(userRole);
      setProfile(loggedUser);
      localStorage.setItem('demo_user', JSON.stringify(loggedUser));
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login handler (for offline testing/evaluation only)
  const demoLogin = (roleToUse = 'ADMIN') => {
    const userId = roleToUse === 'ADMIN' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002';
    const demoUser = { id: userId, email: `${roleToUse.toLowerCase()}@demo.local`, role: roleToUse };
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    localStorage.setItem('demo_role', roleToUse);
    setUser(demoUser);
    setProfile(demoUser);
    setRole(roleToUse);
    return demoUser;
  };

  // Register handler - Creates account in Supabase Auth & initializes profile in backend DB
  const register = async (email, password, desiredRole = 'ADMIN') => {
    setLoading(true);
    try {
      localStorage.setItem('demo_role', desiredRole);

      // 1. Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: desiredRole },
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create account.');
      }

      let activeUser = data?.user;
      let session = data?.session;

      // If signUp succeeded but didn't establish a session immediately, attempt login
      if (!session && activeUser) {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        if (signInRes.data?.user) {
          activeUser = signInRes.data.user;
        }
      }

      if (!activeUser) {
        throw new Error('Account created, but authentication failed. Please sign in manually.');
      }

      // 2. Explicitly sync/create profile record in backend Prisma database
      let dbProfile = null;
      try {
        dbProfile = await syncUserProfile(desiredRole);
      } catch (e) {
        console.warn('Backend profile creation warning during registration:', e);
      }

      const userRole = dbProfile?.role || activeUser.user_metadata?.role || desiredRole;
      const newUser = {
        id: activeUser.id,
        email: dbProfile?.email || activeUser.email,
        role: userRole,
      };

      localStorage.setItem('demo_user', JSON.stringify(newUser));
      setUser(activeUser);
      setProfile(newUser);
      setRole(userRole);

      return { user: newUser, data };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut warning:', err);
    } finally {
      localStorage.removeItem('demo_user');
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  // Helper to switch role in demo mode
  const switchDemoRole = (newRole) => {
    localStorage.setItem('demo_role', newRole);
    setRole(newRole);
    if (profile || user) {
      const currentEmail = user?.email || profile?.email || 'user@example.com';
      const userId = newRole === 'ADMIN' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002';
      const updated = { id: userId, email: currentEmail, role: newRole };
      setUser(updated);
      setProfile(updated);
      localStorage.setItem('demo_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        login,
        demoLogin,
        register,
        logout,
        switchDemoRole,
        isAuthenticated: Boolean(user),
        isAdmin: role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
