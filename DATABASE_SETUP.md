# Database setup

The application uses Supabase for authentication and data storage.

## Current status

The local environment now points to the replacement Supabase project. The Supabase Auth health endpoint responds, but the application tables were not present when checked. The SQL schema has not been applied automatically.

No custom table is needed for password recovery. Supabase stores authentication users and password hashes in its built-in `auth.users` system, and the reset flow uses Supabase Auth's recovery session.

## Create the application tables

1. Open the SQL Editor for the Supabase project configured in `.env.local`.
2. Open `supabase/schema.sql` from this repository.
3. Paste the complete file into a new SQL query and run it once.
4. In **Table Editor**, confirm these tables exist:
   - `profiles`
   - `teams`
   - `players`
   - `player_season_stats`
   - `subscriptions`
   - `feature_flags`
   - `season_config`
   - `ai_predictions`
   - `comparison_history`

The script also creates the new-user profile trigger, enables row-level security, adds policies, and seeds the IPL teams and feature flags.

## Verify from SQL Editor

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

To check users, use **Authentication → Users**. Passwords are never readable; Supabase stores only password hashes. Users can change them through `/forgot-password` or the Supabase dashboard reset email.

## Supabase URL configuration

For local password recovery, add this URL under **Authentication → URL Configuration → Redirect URLs**:

```text
http://localhost:3000/auth/callback?next=/reset-password
```

Set the Site URL to `http://localhost:3000` during local development. Add the production callback URL as well when deploying.

## Environment variables

`.env.local` is intentionally ignored by Git. Configure the same values separately in the hosting provider. Never commit the service-role key, database password, payment secret, or AI key.
