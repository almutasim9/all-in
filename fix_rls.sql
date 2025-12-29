-- ==========================================
-- Fix Missing RLS Policies for Brands & Products
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Policies for BRANDS
-- Allow Admins to INSERT (Create)
create policy "Admins can insert brands" 
on brands for insert 
with check (is_admin());

-- Allow Admins to UPDATE
create policy "Admins can update brands" 
on brands for update 
using (is_admin());

-- Allow Admins to DELETE
create policy "Admins can delete brands" 
on brands for delete 
using (is_admin());


-- 2. Policies for PRODUCTS
-- Allow Admins to INSERT (Create)
create policy "Admins can insert products" 
on products for insert 
with check (is_admin());

-- Allow Admins to UPDATE
create policy "Admins can update products" 
on products for update 
using (is_admin());

-- Allow Admins to DELETE
create policy "Admins can delete products" 
on products for delete 
using (is_admin());
