# FireMaint V1 deployment checklist

1. Create a Supabase project.
2. Run the migrations in order.
3. Run `027_seed_reference_data.sql`.
4. Create Auth users through Supabase Auth.
5. Insert/update their `profiles` rows with the correct organisation/client/role.
6. Run the demo seed if required.
7. Configure private storage buckets.
8. Set Next.js environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (server only)
9. Run RLS tests before production.
10. Run the FireMaint golden-path E2E test.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
