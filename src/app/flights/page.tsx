import { FlightForm } from "@/components/flights/flight-form"

export default function FlightsPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Track Your Flights
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Keep track of your international flights for tax purposes.
        </p>
      </div>
      <FlightForm />
    </section>
  )
} 