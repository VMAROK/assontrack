// Supabase connection for syncing your logs between devices.
// The anon key is meant to be public: the database's row-level security
// (see supabase.sql) only ever lets a signed-in user read and write their own row.
window.AOT_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
