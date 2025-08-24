import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  let tempImagePath: string | null = null

  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log("Starting YOLO license plate detection...")

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "temp")
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Save base64 image to temporary file
    const tempFileName = `temp_image_${randomUUID()}.jpg`
    tempImagePath = path.join(tempDir, tempFileName)

    // Convert base64 to buffer and save to file
    const imageBuffer = Buffer.from(image, "base64")
    fs.writeFileSync(tempImagePath, imageBuffer)

    // Path to Python script
    const pythonScriptPath = path.join(process.cwd(), "python", "yolo_detector.py")

    // Check if Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
      throw new Error(`Python script not found at: ${pythonScriptPath}`)
    }

    // Run Python YOLO detection script with file path instead of base64
    const python = spawn("python", [pythonScriptPath, tempImagePath])

    let stdout = ""
    let stderr = ""

    // Collect stdout
    python.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    // Collect stderr
    python.stderr.on("data", (data) => {
      stderr += data.toString()
      console.error("YOLO Python stderr:", data.toString())
    })

    // Wait for process to complete
    const exitCode = await new Promise((resolve) => {
      python.on("close", (code) => {
        resolve(code)
      })
    })

    if (exitCode !== 0) {
      throw new Error(`Python script exited with code ${exitCode}. Error: ${stderr}`)
    }

    // Parse results
    let yoloResults
    try {
      yoloResults = JSON.parse(stdout.trim())
    } catch (parseError) {
      console.error("Failed to parse Python output:", stdout)
      throw new Error(`Failed to parse YOLO results: ${parseError}`)
    }

    // Check for errors in results
    if (yoloResults.error) {
      throw new Error(`YOLO detection error: ${yoloResults.error}`)
    }

    console.log("YOLO detection completed:", yoloResults)

    return NextResponse.json({
      success: true,
      detections: yoloResults.detections || [],
      processing_time: yoloResults.processing_time || 0,
      model_version: yoloResults.model_version || "yolo_license_plate_detector",
    })
  } catch (error) {
    console.error("YOLO detection error:", error)
    return NextResponse.json(
      { error: `YOLO detection failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  } finally {
    // Clean up temporary file
    if (tempImagePath && fs.existsSync(tempImagePath)) {
      try {
        fs.unlinkSync(tempImagePath)
      } catch (cleanupError) {
        console.error("Failed to cleanup temp file:", cleanupError)
      }
    }
  }
}
