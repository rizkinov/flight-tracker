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
  expiresAt?: Timestamp
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

export async function createFlight(userId: string, data: CreateFlightData, isAnonymous: boolean = false) {
  console.log('Creating flight in Firebase:', { userId, data, isAnonymous })
  try {
    const flightData = {
      userId,
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Add expiration for anonymous users (24 hours from now)
      ...(isAnonymous && {
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
      })
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

export async function updateFlight(flightId: string, data: UpdateFlightData, isAnonymous: boolean = false) {
  console.log('updateFlight service called:', { flightId, data, isAnonymous })
  try {
    const flightRef = doc(db, 'flights', flightId)
    console.log('Preparing update data with timestamp')
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
      ...(isAnonymous && {
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
      })
    }
    console.log('Calling Firestore updateDoc:', updateData)
    await updateDoc(flightRef, updateData)
    console.log('Firestore update completed successfully')
  } catch (error) {
    console.error('Error in updateFlight service:', error)
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