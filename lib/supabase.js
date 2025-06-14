import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const initSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
};

export const getSupabase = () => {
    if (!supabaseInstance) {
        return initSupabase();
    }
    return supabaseInstance;
}; 