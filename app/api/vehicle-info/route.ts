// app/api/vehicle-info/route.ts (App Router format for Next.js 13+)

import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb' // Adjust path based on where your mongodb.ts file is located

const DATABASE_NAME = 'tollplaza'
const COLLECTION_NAME = 'license-plate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { license } = body

    if (!license) {
      return NextResponse.json(
        { error: 'License plate number is required' },
        { status: 400 }
      )
    }

    // Connect to database using your existing connection
    const client = await clientPromise
    const db = client.db(DATABASE_NAME)
    const collection = db.collection(COLLECTION_NAME)

    // Search for vehicle by license plate
    const vehicle = await collection.findOne({ license: license })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Return vehicle information
    return NextResponse.json({
      _id: vehicle._id.toString(),
      license: vehicle.license,
      owner: vehicle.owner,
      phone: vehicle.phone,
      vehicleType: vehicle.vehicleType,
      tollAmount: vehicle.tollAmount
    })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}