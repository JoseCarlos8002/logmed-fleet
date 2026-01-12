import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wwrcagnkzatuzwpmlrac.supabase.co';
const supabaseAnonKey = 'sb_publishable_z4e_yZIq4-Dw9f7Zz1A-Ew_ZLa6H5Do';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
