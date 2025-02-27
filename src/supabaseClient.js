import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseKey = import.meta.env.SSUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
