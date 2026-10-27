import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hlbabxaenpuzipsdttbn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ixE3YSoQnQGTSH1vScNEAg_1ArtRfLf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
