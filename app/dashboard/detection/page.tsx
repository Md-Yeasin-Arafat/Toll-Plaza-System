"use client"

import type React from "react"
import Link from "next/link"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle, FileImage, X, Camera, RotateCcw, Eye, Zap, Brain } from "lucide-react"
import Image from "next/image"

interface YoloDetection {
  bbox: number[]
  confidence: number
  class: string
}

interface YoloResults {
  success: boolean
  detections: YoloDetection[]
  processing_time: number
  model_version: string
}

interface OcrResults {
  success: boolean
  extracted_text: string
  license_plate: string
  confidence: number
  processing_time: number
}

interface VehicleInfo {
  _id: string
  license: string
  owner: string
  phone: string
  vehicleType: string
  tollAmount: number
}

export default function DetectionPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedPlate, setDetectedPlate] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [extractedText, setExtractedText] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [processingAttempt, setProcessingAttempt] = useState(0)
  const [detectedComponents, setDetectedComponents] = useState<{
    city: string
    metro: string
    letter: string
    numbers: string
  }>({ city: "", metro: "", letter: "", numbers: "" })
  const [processingSteps, setProcessingSteps] = useState<string[]>([])
  const [yoloResults, setYoloResults] = useState<YoloResults | null>(null)
  const [ocrResults, setOcrResults] = useState<OcrResults | null>(null)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [isLoadingVehicleInfo, setIsLoadingVehicleInfo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) {
        console.error("No file selected")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setStatus("Please select a valid image file")
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setStatus("File size too large. Please select an image under 10MB")
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          if (!e || !e.target || !e.target.result) {
            console.error("FileReader event or result is null")
            setStatus("Error reading file. Please try again.")
            return
          }

          const imageUrl = e.target.result as string
          setUploadedImage(imageUrl)
          processImageWithYoloAndOcr(imageUrl)
        } catch (error) {
          console.error("Error in FileReader onload:", error)
          setStatus("Error processing file. Please try again.")
        }
      }

      reader.onerror = () => {
        console.error("FileReader error")
        setStatus("Error reading file. Please try again.")
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error in handleFileUpload:", error)
      setStatus("Error uploading file. Please try again.")
    }
  }

  const fetchVehicleInfo = async (licensePlate: string): Promise<VehicleInfo | null> => {
    try {
      setIsLoadingVehicleInfo(true)
      
      const response = await fetch("/api/vehicle-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          license: licensePlate,
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log("Vehicle not found in database")
          return null
        }
        throw new Error(`Failed to fetch vehicle info: ${response.status}`)
      }

      const vehicleData: VehicleInfo = await response.json()
      return vehicleData
    } catch (error) {
      console.error("Error fetching vehicle info:", error)
      return null
    } finally {
      setIsLoadingVehicleInfo(false)
    }
  }

  const processImageWithYoloAndOcr = async (imageUrl: string) => {
    if (!imageUrl) {
      setStatus("No image provided for processing")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setStatus("Starting YOLO + OCR processing...")
    setExtractedText("")
    setDetectedPlate("")
    setDetectedComponents({ city: "", metro: "", letter: "", numbers: "" })
    setProcessingSteps([])
    setYoloResults(null)
    setOcrResults(null)
    setVehicleInfo(null)
    setProcessingAttempt((prev) => prev + 1)

    try {
      const steps: string[] = []
      steps.push("🚀 Starting YOLO license plate detection...")
      setProcessingSteps([...steps])
      setProgress(10)

      // Convert data URL to base64
      const base64Image = imageUrl.split(",")[1]

      if (!base64Image) {
        throw new Error("Invalid image format. Please upload a valid image file.")
      }

      steps.push("🧠 Running YOLO model for license plate detection...")
      setProcessingSteps([...steps])
      setProgress(30)

      // Step 1: YOLO Detection
      const yoloResponse = await fetch("/api/yolo-detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      })

      if (!yoloResponse.ok) {
        const errorData = await yoloResponse.json()
        throw new Error(errorData.error || `YOLO detection failed: ${yoloResponse.status}`)
      }

      const yoloData: YoloResults = await yoloResponse.json()
      setYoloResults(yoloData)

      steps.push(`✅ YOLO detection completed in ${yoloData.processing_time}s`)
      steps.push(
        `📍 Found ${yoloData.detections.length} license plate(s) with confidence ${(yoloData.detections[0]?.confidence * 100).toFixed(1)}%`,
      )
      setProcessingSteps([...steps])
      setProgress(60)

      if (yoloData.detections && yoloData.detections.length > 0) {
        const bestDetection = yoloData.detections[0] // Use the first/best detection

        steps.push("🔤 Starting OCR text extraction from detected region...")
        setProcessingSteps([...steps])
        setProgress(70)

        // Step 2: OCR Extraction
        const ocrResponse = await fetch("/api/ocr-extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            bbox: bestDetection.bbox,
          }),
        })

        if (!ocrResponse.ok) {
          const errorData = await ocrResponse.json()
          throw new Error(errorData.error || `OCR extraction failed: ${ocrResponse.status}`)
        }

        const ocrData: OcrResults = await ocrResponse.json()
        setOcrResults(ocrData)

        steps.push(`✅ OCR extraction completed in ${ocrData.processing_time}s`)
        steps.push(`📝 Extracted text: "${ocrData.extracted_text}"`)
        setProcessingSteps([...steps])
        setProgress(90)

        setExtractedText(ocrData.extracted_text)

        if (ocrData.license_plate) {
          setDetectedPlate(ocrData.license_plate)
          setConfidence(Math.round(ocrData.confidence * 100))
          
          steps.push(`🎯 Final license plate: ${ocrData.license_plate}`)
          steps.push("🔍 Searching database for vehicle information...")
          setProcessingSteps([...steps])

          // Step 3: Fetch vehicle information from database
          const vehicleData = await fetchVehicleInfo(ocrData.license_plate)
          
          if (vehicleData) {
            setVehicleInfo(vehicleData)
            setStatus("✅ License plate detected and vehicle found in database!")
            steps.push(`✅ Vehicle information found for owner: ${vehicleData.owner}`)
          } else {
            setStatus("✅ License plate detected but vehicle not found in database")
            steps.push("⚠️ Vehicle not found in database - showing default information")
          }

          // Parse components for display
          const parts = ocrData.license_plate.split("-")
          if (parts.length >= 3) {
            setDetectedComponents({
              city: parts[0] || "",
              metro: parts.length > 3 ? parts[1] : "",
              letter: parts.length > 3 ? parts[2] : parts[1],
              numbers: parts.length > 3 ? parts[3] : parts[2],
            })
          }
        } else {
          setStatus("⚠️ Text extracted but no complete license plate pattern found")
          steps.push("❌ Could not construct complete license plate from OCR text")
        }
      } else {
        setStatus("⚠️ No license plates detected in the image")
        steps.push("❌ YOLO model did not detect any license plates")
        steps.push("💡 Try uploading a clearer image with a visible license plate")
      }

      setProcessingSteps([...steps])
      setProgress(100)
    } catch (error) {
      console.error("YOLO + OCR Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setStatus(`❌ Error processing with YOLO + OCR: ${errorMessage}`)
      setProcessingSteps((prev) => [...prev, `❌ Error: ${errorMessage}`])
    } finally {
      setIsProcessing(false)
    }
  }

  const clearUploadedImage = () => {
    try {
      setUploadedImage(null)
      setExtractedText("")
      setDetectedPlate("")
      setProgress(0)
      setStatus("")
      setConfidence(0)
      setDetectedComponents({ city: "", metro: "", letter: "", numbers: "" })
      setProcessingSteps([])
      setYoloResults(null)
      setOcrResults(null)
      setVehicleInfo(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error clearing uploaded image:", error)
    }
  }

  const triggerFileInput = () => {
    try {
      fileInputRef.current?.click()
    } catch (error) {
      console.error("Error triggering file input:", error)
    }
  }

  const retryProcessing = () => {
    try {
      if (uploadedImage) {
        processImageWithYoloAndOcr(uploadedImage)
      } else {
        setStatus("No image available to retry processing")
      }
    } catch (error) {
      console.error("Error retrying processing:", error)
      setStatus("Error retrying processing. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">YOLO + OCR License Plate Detection</h1>
        <p className="text-gray-600">Advanced Bangla license plate recognition using YOLO detection + OCR extraction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload and Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              YOLO + OCR License Plate Upload
            </CardTitle>
            <CardDescription>Upload a clear image for YOLO detection and OCR analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Upload a Bangla license plate image</p>
                <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, GIF up to 10MB</p>
                <Button onClick={triggerFileInput} variant="outline">
                  <FileImage className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Uploaded Image Preview */}
                <div className="relative">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded license plate"
                      width={500}
                      height={300}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearUploadedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Processing Progress */}
                {(isProcessing || isLoadingVehicleInfo) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{isLoadingVehicleInfo ? "Loading vehicle information..." : status}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Detected Components */}
                {(detectedComponents.city ||
                  detectedComponents.metro ||
                  detectedComponents.letter ||
                  detectedComponents.numbers) && (
                  <div className="grid grid-cols-2 gap-2">
                    {detectedComponents.city && (
                      <div className="p-2 bg-blue-50 rounded text-center">
                        <div className="text-xs text-blue-600">City</div>
                        <div className="font-bold text-blue-800">{detectedComponents.city}</div>
                      </div>
                    )}
                    {detectedComponents.metro && (
                      <div className="p-2 bg-purple-50 rounded text-center">
                        <div className="text-xs text-purple-600">Metro</div>
                        <div className="font-bold text-purple-800">{detectedComponents.metro}</div>
                      </div>
                    )}
                    {detectedComponents.letter && (
                      <div className="p-2 bg-green-50 rounded text-center">
                        <div className="text-xs text-green-600">Letter</div>
                        <div className="font-bold text-green-800">{detectedComponents.letter}</div>
                      </div>
                    )}
                    {detectedComponents.numbers && (
                      <div className="p-2 bg-orange-50 rounded text-center">
                        <div className="text-xs text-orange-600">Numbers</div>
                        <div className="font-bold text-orange-800">{detectedComponents.numbers}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={triggerFileInput} variant="outline" className="flex-1 bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Another
                  </Button>
                  <Button onClick={retryProcessing} variant="outline" disabled={isProcessing}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Processing
                  </Button>
                </div>
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detection Results */}
        <Card>
          <CardHeader>
            <CardTitle>YOLO + OCR Results</CardTitle>
            <CardDescription>License plate detected using YOLO model and OCR extraction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detectedPlate ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">License Plate Detected by YOLO + OCR</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 font-mono text-center p-2 bg-white rounded border">
                    {detectedPlate}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">OCR Confidence</Label>
                    <div className="text-lg font-semibold text-green-600">{confidence}%</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Processing Method</Label>
                    <div className="text-sm font-semibold">YOLO + OCR</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vehicle Information</Label>
                  {isLoadingVehicleInfo ? (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Loading vehicle information...</div>
                    </div>
                  ) : vehicleInfo ? (
                    <div className="p-3 bg-green-50 rounded-lg space-y-1 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Found in Database</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Owner:</span>
                        <span className="text-sm font-medium">{vehicleInfo.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium">{vehicleInfo.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vehicle Type:</span>
                        <span className="text-sm font-medium">{vehicleInfo.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Toll Amount:</span>
                        <span className="text-sm font-medium">৳{vehicleInfo.tollAmount}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg space-y-1 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">Not Found in Database</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Owner:</span>
                        <span className="text-sm font-medium">Unknown</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vehicle Type:</span>
                        <span className="text-sm font-medium">Unknown</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Toll Amount:</span>
                        <span className="text-sm font-medium">Contact Operator</span>
                      </div>
                    </div>
                  )}
                </div>

                

              {vehicleInfo ? (
                <Link href="/dashboard/processing">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Complete processing
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled
                >
                  Vehicle Not Registered
                </Button>
              )}

              </div>
            ) : extractedText ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Text Extracted by OCR</span>
                  </div>
                  <div className="text-sm text-yellow-700">
                    OCR extracted text but couldn't identify complete license plate pattern
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-sm font-medium text-blue-800">OCR Result:</Label>
                  <div className="mt-2 p-2 bg-white rounded border text-sm font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {extractedText}
                  </div>
                </div>

                <Button
                  onClick={retryProcessing}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry with YOLO + OCR
                </Button>
              </div>
            ) : status ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                <p className="text-gray-600">{status}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No image uploaded yet</p>
                <p className="text-sm">Upload a license plate image for YOLO + OCR analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      

      {/* Model Results */}
      {(yoloResults || ocrResults) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YOLO Results */}
          {yoloResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  YOLO Detection Results
                </CardTitle>
                <CardDescription>License plate detection using YOLO model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Model Version:</span>
                    <span className="text-sm font-medium">{yoloResults.model_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Time:</span>
                    <span className="text-sm font-medium">{yoloResults.processing_time}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Detections:</span>
                    <span className="text-sm font-medium">{yoloResults.detections.length}</span>
                  </div>
                  {yoloResults.detections.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">Best Detection:</div>
                      <div className="text-xs space-y-1">
                        <div>Confidence: {(yoloResults.detections[0].confidence * 100).toFixed(1)}%</div>
                        <div>Bbox: [{yoloResults.detections[0].bbox.join(", ")}]</div>
                        <div>Class: {yoloResults.detections[0].class}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* OCR Results */}
          {ocrResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  OCR Extraction Results
                </CardTitle>
                <CardDescription>Text extraction from detected license plate region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Time:</span>
                    <span className="text-sm font-medium">{ocrResults.processing_time}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium">{(ocrResults.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Extracted Text:</div>
                    <div className="text-sm font-mono bg-white p-2 rounded border">{ocrResults.extracted_text}</div>
                  </div>
                  {ocrResults.license_plate && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">Parsed License Plate:</div>
                      <div className="text-lg font-mono font-bold text-green-800">{ocrResults.license_plate}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detection History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent YOLO + OCR Detections</CardTitle>
          <CardDescription>History of recent license plate detections using YOLO model and OCR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                plate: "ঢাকা-মেট্রো-গ-১২-৩৪৫৬",
                time: "2 minutes ago",
                confidence: "95.7%",
                status: "success",
                method: "YOLO + OCR",
              },
              {
                plate: "চট্টগ্রাম-খ-৭৮-৯০১২",
                time: "5 minutes ago",
                confidence: "92.2%",
                status: "success",
                method: "YOLO + OCR",
              },
              {
                plate: "সিলেট-গ-৪৫-৬৭৮৯",
                time: "8 minutes ago",
                confidence: "88.8%",
                status: "success",
                method: "YOLO + OCR",
              },
              {
                plate: "রাজশাহী-ক-২৩-৪৫৬৭",
                time: "12 minutes ago",
                confidence: "94.1%",
                status: "success",
                method: "YOLO + OCR",
              },
            ].map((detection, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium font-mono">{detection.plate}</div>
                    <div className="text-sm text-gray-500">
                      {detection.time} • {detection.method}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{detection.confidence}</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Complete
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}