// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPABASE_URL = 'https://dsyvgbqcbmiqvorrwumi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeXZnYnFjYm1pcXZvcnJ3dW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODAxOTMsImV4cCI6MjA4MjE1NjE5M30.NRZjvcjgkTGxb0OfqTnTt7GmN8yTqh6fnIpGtaTqn9M';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabaseClient;
