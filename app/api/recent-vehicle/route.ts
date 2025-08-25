// app/api/recent-vehicle/route.ts

import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb' // Adjust path based on where your mongodb.ts file is located

const DATABASE_NAME = 'tollplaza'
const COLLECTION_NAME = 'license-plate'

export async function GET() {
  try {
    // Connect to database using your existing connection
    const client = await clientPromise
    const db = client.db(DATABASE_NAME)
    const collection = db.collection(COLLECTION_NAME)

    // Find the most recent vehicle based on createdAt field
    const recentVehicle = await collection
      .find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (most recent first)
      .limit(1) // Get only the most recent one
      .toArray()

    if (!recentVehicle || recentVehicle.length === 0) {
      return NextResponse.json(
        { error: 'No vehicles found' },
        { status: 404 }
      )
    }

    const vehicle = recentVehicle[0]

    // Return vehicle information
    return NextResponse.json({
      _id: vehicle._id.toString(),
      license: vehicle.license,
      owner: vehicle.owner,
      phone: vehicle.phone,
      vehicleType: vehicle.vehicleType,
      tollAmount: vehicle.tollAmount,
      createdAt: vehicle.createdAt // MongoDB will serialize the Date object properly
    })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}