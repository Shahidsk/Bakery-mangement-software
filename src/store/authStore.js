import { create } from 'zustand';
import { supabase } from '../supabase';

export const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    error: null,

    // Initialize auth state listener
    initAuth: () => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ user: session?.user ?? null, loading: false });
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, loading: false });
        });
    },

    // Login action
    login: async (email, password) => {
        try {
            set({ loading: true, error: null });
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            set({ user: data.user, loading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    // Logout action
    logout: async () => {
        try {
            await supabase.auth.signOut();
            set({ user: null });
        } catch (error) {
            set({ error: error.message });
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
