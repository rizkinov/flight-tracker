export type Flight = {
  id: string
  user_id: string
  flight_number: string
  departure_date: string
  arrival_date: string
  from_country: string
  to_country: string
  airline: string
  notes?: string
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  email: string
  created_at: string
} 