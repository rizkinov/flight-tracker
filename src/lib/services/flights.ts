import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Flight {
  id: string
  userId: string
  flightNumber: string
  date: string
  from: string
  to: string
  notes?: string
  days: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateFlightData {
  flightNumber: string
  date: string
  from: string
  to: string
  notes?: string
  days: number
}

export interface UpdateFlightData {
  flightNumber?: string
  date?: string
  from?: string
  to?: string
  notes?: string
  days?: number
}

export async function createFlight(userId: string, data: CreateFlightData) {
  console.log('Creating flight in Firebase:', { userId, data })
  try {
    const flightData = {
      userId,
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    console.log('Prepared flight data:', flightData)
    
    const docRef = await addDoc(collection(db, 'flights'), flightData)
    console.log('Flight document created with ID:', docRef.id)
    
    return docRef.id
  } catch (error) {
    console.error('Error in createFlight:', error)
    throw error
  }
}

export async function updateFlight(flightId: string, data: UpdateFlightData) {
  try {
    const flightRef = doc(db, 'flights', flightId)
    await updateDoc(flightRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating flight:', error)
    throw error
  }
}

export async function deleteFlight(flightId: string) {
  try {
    const flightRef = doc(db, 'flights', flightId)
    await deleteDoc(flightRef)
  } catch (error) {
    console.error('Error deleting flight:', error)
    throw error
  }
}

export async function deleteAllFlights(userId: string) {
  try {
    const q = query(
      collection(db, 'flights'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    
    const batch = writeBatch(db)
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error deleting all flights:', error)
    throw error
  }
}

export async function getUserFlights(userId: string) {
  console.log('Fetching flights for user:', userId)
  try {
    const q = query(
      collection(db, 'flights'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const flights = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Flight[]
    console.log('Retrieved flights:', flights.length)
    return flights
  } catch (error) {
    console.error('Error getting user flights:', error)
    throw error
  }
} 