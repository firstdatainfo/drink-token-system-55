// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rolwazbrwelxykbkfrgs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbHdhemJyd2VseHlrYmtmcmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODAzNzgsImV4cCI6MjA2MzE1NjM3OH0.2MSsp4v_1BAUrB8YfIa_TO-Y3JcEPVcEVtkPqfrEHXQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);