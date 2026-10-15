-- Supabase PostgreSQL. Apply in a staging project first. No real catalog is seeded.
create extension if not exists pgcrypto;
create type public.staff_role as enum ('admin','operator');
create type public.order_state as enum ('received','preparing','shipped','delivered','cancelled');
create type public.payment_state as enum ('pending','confirmed','refunded','failed');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, display_name text, created_at timestamptz not null default now());
create table public.admin_roles(user_id uuid primary key references auth.users(id) on delete cascade, role public.staff_role not null);
create function public.is_staff(admin_only boolean default false) returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select exists(select 1 from public.admin_roles where user_id=auth.uid() and (not admin_only or role='admin')); $$;
revoke all on function public.is_staff(boolean) from public;
grant execute on function public.is_staff(boolean) to anon,authenticated,service_role;
create table public.categories(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,parent_id uuid references public.categories(id));
create table public.brands(id uuid primary key default gen_random_uuid(),name text not null unique,verified boolean not null default false);
create table public.products(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,description text not null default '',category_id uuid references public.categories(id),brand_id uuid references public.brands(id),price numeric(14,2) not null check(price>0),currency char(3) not null default 'CRC' check(currency='CRC'),specifications jsonb not null default '{}',active boolean not null default false,featured boolean not null default false,is_demo boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
-- Internal costs MUST NOT be placed in products or public views.
create table public.product_costs(product_id uuid primary key references public.products(id) on delete cascade,cost numeric(14,2) check(cost>=0),updated_at timestamptz not null default now());
create table public.product_images(id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,storage_path text not null,alt text not null,position integer not null default 0,unique(product_id,position));
create table public.product_variants(id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id),sku text unique not null,name text not null,attributes jsonb not null default '{}',stock integer not null default 0 check(stock>=0),minimum_stock integer not null default 2 check(minimum_stock>=0),active boolean not null default true);
create table public.customer_addresses(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,address jsonb not null,created_at timestamptz not null default now());
create table public.carts(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create table public.cart_items(cart_id uuid not null references public.carts(id) on delete cascade,variant_id uuid not null references public.product_variants(id),quantity integer not null check(quantity between 1 and 20),primary key(cart_id,variant_id));
create table public.promotions(id uuid primary key default gen_random_uuid(),code text unique not null,percent numeric(5,2) not null check(percent>0 and percent<=100),starts_at timestamptz not null,ends_at timestamptz not null,active boolean not null default false,check(ends_at>starts_at));
create table public.orders(id uuid primary key default gen_random_uuid(),number text unique not null default ('PG-'||upper(encode(gen_random_bytes(8),'hex'))),idempotency_key uuid unique not null,user_id uuid references auth.users(id),email text not null,contact jsonb not null,address_snapshot jsonb not null,tracking_token_hash text not null,subtotal numeric(14,2) not null default 0 check(subtotal>=0),discount numeric(14,2) not null default 0 check(discount>=0),shipping numeric(14,2) not null check(shipping>=0),total numeric(14,2) not null default 0 check(total>=0),currency char(3) not null default 'CRC' check(currency='CRC'),state public.order_state not null default 'received',payment_state public.payment_state not null default 'pending',carrier text,tracking_number text,internal_notes text,created_at timestamptz not null default now(),check(discount<=subtotal));
create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),variant_id uuid references public.product_variants(id),product_name text not null,variant_name text not null,sku text not null,unit_price numeric(14,2) not null check(unit_price>0),quantity integer not null check(quantity>0),unit_cost_snapshot numeric(14,2) check(unit_cost_snapshot>=0),specifications_snapshot jsonb not null default '{}');
create table public.payments(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),provider text not null,provider_payment_id text unique,amount numeric(14,2) not null check(amount>0),currency char(3) not null default 'CRC',state public.payment_state not null default 'pending',verified_at timestamptz,created_at timestamptz not null default now());
create table public.payment_events(id uuid primary key default gen_random_uuid(),provider text not null,provider_event_id text not null,received_at timestamptz not null default now(),processed_at timestamptz,unique(provider,provider_event_id));
create table public.order_costs(order_id uuid primary key references public.orders(id),payment_fee numeric(14,2) check(payment_fee>=0),packaging numeric(14,2) check(packaging>=0),shipping_absorbed numeric(14,2) check(shipping_absorbed>=0),attributed_advertising numeric(14,2) check(attributed_advertising>=0),other_variable numeric(14,2) check(other_variable>=0));
create table public.inventory_movements(id uuid primary key default gen_random_uuid(),variant_id uuid not null references public.product_variants(id),order_id uuid references public.orders(id),quantity_delta integer not null check(quantity_delta<>0),reason text not null,actor uuid references auth.users(id),created_at timestamptz not null default now());
create table public.newsletter_consents(id uuid primary key default gen_random_uuid(),email text not null unique,policy_version text not null,consented_at timestamptz not null default now(),revoked_at timestamptz);
create table public.audit_logs(id uuid primary key default gen_random_uuid(),actor uuid references auth.users(id),action text not null,entity_id uuid,metadata jsonb not null default '{}',created_at timestamptz not null default now());
create table public.outbox(id uuid primary key default gen_random_uuid(),deduplication_key text not null unique,event text not null,payload jsonb not null,state text not null default 'pending' check(state in ('pending','processing','sent','failed')),attempts integer not null default 0,available_at timestamptz not null default now(),locked_at timestamptz,last_error_code text,created_at timestamptz not null default now());
create index on public.products(category_id,active,created_at desc);
create index on public.products(brand_id) where active;
create index on public.product_variants(product_id);
create index on public.product_images(product_id,position);
create index on public.orders(created_at desc);
create index on public.orders(state,payment_state);
create index on public.order_items(order_id);
create index on public.inventory_movements(variant_id,created_at desc);
create index on public.outbox(state,available_at);
-- Default deny for every table. The service role is kept exclusively on a trusted server.
do $$ declare t text; begin for t in select tablename from pg_tables where schemaname='public' loop execute format('alter table public.%I enable row level security',t); end loop; end $$;
create policy profiles_self_read on public.profiles for select to authenticated using(id=auth.uid());
create policy roles_self_read on public.admin_roles for select to authenticated using(user_id=auth.uid());
-- No user can assign their own staff role.
create policy categories_read on public.categories for select using(true);
create policy categories_admin on public.categories for all to authenticated using(public.is_staff(true)) with check(public.is_staff(true));
create policy brands_read on public.brands for select using(true);
create policy brands_admin on public.brands for all to authenticated using(public.is_staff(true)) with check(public.is_staff(true));
create policy products_public on public.products for select using(active or public.is_staff());
create policy products_admin on public.products for all to authenticated using(public.is_staff(true)) with check(public.is_staff(true));
create policy images_public on public.product_images for select using(exists(select 1 from public.products p where p.id=product_id and p.active) or public.is_staff());
create policy images_admin on public.product_images for all to authenticated using(public.is_staff(true)) with check(public.is_staff(true));
create policy variants_public on public.product_variants for select using((active and exists(select 1 from public.products p where p.id=product_id and p.active)) or public.is_staff());
-- Variants and inventory are mutated only through trusted transactional server operations.
create policy costs_admin_read on public.product_costs for select to authenticated using(public.is_staff(true));
create policy addresses_own on public.customer_addresses for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy carts_own on public.carts for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy cart_items_own on public.cart_items for all to authenticated using(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid())) with check(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy orders_staff_read on public.orders for select to authenticated using(public.is_staff());
-- order_items includes private cost snapshots: operators receive a projected server DTO only.
create policy order_items_admin_read on public.order_items for select to authenticated using(public.is_staff(true));
create policy movements_staff_read on public.inventory_movements for select to authenticated using(public.is_staff());
create policy payments_admin_read on public.payments for select to authenticated using(public.is_staff(true));
create policy order_costs_admin_read on public.order_costs for select to authenticated using(public.is_staff(true));
create policy promotions_admin on public.promotions for all to authenticated using(public.is_staff(true)) with check(public.is_staff(true));
create policy consents_admin_read on public.newsletter_consents for select to authenticated using(public.is_staff(true));
create policy audit_admin_read on public.audit_logs for select to authenticated using(public.is_staff(true));
-- Transactional checkout primitive for a future verified server adapter. No client execution.
-- Shipping must be computed from an approved tariff by that adapter, never the browser.
create function public.reserve_order(p_key uuid,p_email text,p_contact jsonb,p_address jsonb,p_tracking_hash text,p_shipping numeric,p_items jsonb,p_promo text default null) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare oid uuid; item record; v record; subtotal_value numeric(14,2):=0; discount_value numeric(14,2):=0; pct numeric; begin
if p_shipping<0 or p_shipping is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 40 or length(p_tracking_hash)<>64 then raise exception 'Invalid checkout'; end if;
-- Serializes identical idempotency keys, including simultaneous requests.
perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
select id into oid from public.orders where idempotency_key=p_key;
if oid is not null then return oid; end if;
insert into public.orders(idempotency_key,email,contact,address_snapshot,tracking_token_hash,shipping) values(p_key,p_email,p_contact,p_address,p_tracking_hash,p_shipping) returning id into oid;
-- Stable lock ordering prevents competing mixed carts from deadlocking.
for item in select x.variant_id,sum(x.quantity)::integer quantity from jsonb_to_recordset(p_items) as x(variant_id uuid,quantity integer) group by x.variant_id order by x.variant_id loop
if item.quantity is null or item.quantity not between 1 and 20 then raise exception 'Invalid quantity'; end if;
select pv.*,p.name product_name,p.price,p.specifications,pc.cost into v from public.product_variants pv join public.products p on p.id=pv.product_id left join public.product_costs pc on pc.product_id=p.id where pv.id=item.variant_id and pv.active and p.active and not p.is_demo for update of pv,p;
if not found or v.stock<item.quantity then raise exception 'Unavailable inventory'; end if;
update public.product_variants set stock=stock-item.quantity where id=v.id;
insert into public.order_items(order_id,variant_id,product_name,variant_name,sku,unit_price,quantity,unit_cost_snapshot,specifications_snapshot) values(oid,v.id,v.product_name,v.name,v.sku,v.price,item.quantity,v.cost,v.specifications);
insert into public.inventory_movements(variant_id,order_id,quantity_delta,reason) values(v.id,oid,-item.quantity,'order_reserved');
subtotal_value:=subtotal_value+v.price*item.quantity;
if v.stock-item.quantity<=v.minimum_stock then insert into public.outbox(deduplication_key,event,payload) values(oid::text||':low:'||v.id::text,'inventory.low',jsonb_build_object('variantId',v.id)) on conflict do nothing; end if;
end loop;
if subtotal_value<=0 then raise exception 'Empty order'; end if;
if p_promo is not null and length(trim(p_promo))>0 then select percent into pct from public.promotions where code=upper(trim(p_promo)) and active and now() between starts_at and ends_at; if not found then raise exception 'Invalid promotion'; end if; discount_value:=round(subtotal_value*pct/100,2); end if;
update public.orders set subtotal=subtotal_value,discount=discount_value,total=subtotal_value-discount_value+p_shipping where id=oid;
insert into public.outbox(deduplication_key,event,payload) values(oid::text||':received','order.received',jsonb_build_object('orderId',oid));
return oid;
end $$;
revoke all on function public.reserve_order(uuid,text,jsonb,jsonb,text,numeric,jsonb,text) from public,anon,authenticated;
grant execute on function public.reserve_order(uuid,text,jsonb,jsonb,text,numeric,jsonb,text) to service_role;
-- Immutable historical order lines for all normal roles. Service-role workers must not rewrite them.
create function public.prevent_order_item_rewrite() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin raise exception 'Order snapshots are immutable'; end $$;
create trigger immutable_order_items before update or delete on public.order_items for each row execute function public.prevent_order_item_rewrite();
-- Storage is public only for approved catalog images, never customer/private documents.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy catalog_image_read on storage.objects for select using(bucket_id='product-images');
create policy catalog_image_insert on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_staff(true));
create policy catalog_image_update on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_staff(true)) with check(bucket_id='product-images' and public.is_staff(true));
create policy catalog_image_delete on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_staff(true));
