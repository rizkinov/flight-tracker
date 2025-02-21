-- Create flights table
create table flights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  flight_number text not null,
  departure_date timestamp with time zone not null,
  arrival_date timestamp with time zone not null,
  from_country text not null,
  to_country text not null,
  airline text not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table flights enable row level security;

-- Create policy to only allow users to see their own flights
create policy "Users can only see their own flights"
  on flights for select
  using (auth.uid() = user_id);

-- Create policy to only allow users to insert their own flights
create policy "Users can only insert their own flights"
  on flights for insert
  with check (auth.uid() = user_id);

-- Create policy to only allow users to update their own flights
create policy "Users can only update their own flights"
  on flights for update
  using (auth.uid() = user_id);

-- Create policy to only allow users to delete their own flights
create policy "Users can only delete their own flights"
  on flights for delete
  using (auth.uid() = user_id); 