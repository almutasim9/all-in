-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  role text check (role in ('admin', 'sales_rep', 'data_entry')) default 'sales_rep',
  status text check (status in ('active', 'inactive')) default 'active',
  avatar_url text,
  allowed_provinces text[], -- Array of strings
  allowed_brands text[],    -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. BRANDS
create table public.brands (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references public.brands(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null,
  currency text default 'USD',
  period text, -- month, year, once
  features text[],
  is_popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CLIENTS
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  status text check (status in ('new', 'qualifying', 'proposal', 'won', 'lost')) default 'new',
  phone text,
  email text,
  address text,
  province text,
  category text,
  instagram text,
  google_maps_url text,
  notes text,
  product_interest text,
  
  -- Follow up logic
  follow_up_date date,
  follow_up_note text,
  
  -- Key Metrics
  last_interaction date,
  deal_value numeric,
  loss_reason text,
  loss_note text,

  -- Assignment
  assigned_to uuid references public.profiles(id),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ACTIVITIES
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  type text check (type in ('call', 'visit', 'note', 'email', 'assignment', 'reminder')) not null,
  description text,
  user_id uuid references public.profiles(id), -- Who performed action
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SUBSCRIPTIONS
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  product_id uuid references public.products(id),
  product_name text, -- Cache name in case product deleted
  start_date date not null,
  end_date date not null,
  status text check (status in ('active', 'expired', 'pending')) default 'pending',
  amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. MONTHLY TARGETS
create table public.monthly_targets (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.profiles(id) on delete cascade not null,
  month int not null,
  year int not null,
  deals_target int default 0,
  visits_target int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(member_id, month, year)
);

-- ENABLE ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table clients enable row level security;
alter table activities enable row level security;
alter table subscriptions enable row level security;
alter table monthly_targets enable row level security;
alter table brands enable row level security;
alter table products enable row level security;

-- POLICIES (Simplified for initial rollout)

-- REUSABLE FUNCTIONS
-- Check if user is admin
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- PROFILES
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- BRANDS & PRODUCTS (Public read, Admin write)
create policy "Brands are viewable by everyone" on brands for select using (true);
create policy "Admins can insert brands" on brands for insert with check ( is_admin() );
create policy "Admins can update brands" on brands for update using ( is_admin() );
create policy "Admins can delete brands" on brands for delete using ( is_admin() );

create policy "Products are viewable by everyone" on products for select using (true);
create policy "Admins can insert products" on products for insert with check ( is_admin() );
create policy "Admins can update products" on products for update using ( is_admin() );
create policy "Admins can delete products" on products for delete using ( is_admin() );

-- CLIENTS
-- Admins see all. Sales Reps see assigned + Not assigned (leads pool)? 
-- For simplicity: Everyone authenticated can view all clients (Collaborative CRM)
-- But only Admin or Owner can edit.
create policy "Authenticated users can view clients" on clients for select using (auth.role() = 'authenticated');
create policy "Admins and Assigned Reps can update clients" on clients for update using ( 
  is_admin() or auth.uid() = assigned_to 
);
create policy "Authenticated users can create clients" on clients for insert with check (auth.role() = 'authenticated');

-- ACTIVITIES
create policy "Authenticated users can view activities" on activities for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert activities" on activities for insert with check (auth.role() = 'authenticated');

-- SUBSCRIPTIONS
create policy "Authenticated users can view subscriptions" on subscriptions for select using (auth.role() = 'authenticated');
create policy "Admins and Assigned Reps can manage subscriptions" on subscriptions for all using ( 
  is_admin() or exists (select 1 from clients where clients.id = subscriptions.client_id and clients.assigned_to = auth.uid())
);

-- TARGETS
create policy "Users view own targets, Admins view all" on monthly_targets for select using (
  auth.uid() = member_id or is_admin()
);
