"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import Image from "next/image"

export default function DetectionPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedPlate, setDetectedPlate] = useState("")

  const handleStartDetection = () => {
    setIsProcessing(true)
    // Simulate detection process
    setTimeout(() => {
      setDetectedPlate("ঢাকা-মেট্রো-গ-১২-৩৪৫৬")
      setIsProcessing(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">License Plate Detection</h1>
        <p className="text-gray-600">AI-powered Bangla license plate recognition system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Live Camera Feed
            </CardTitle>
            <CardDescription>Real-time vehicle detection camera</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
              <Image
                src="/highway-toll-plaza-camera.png"
                alt="Camera feed"
                width={500}
                height={300}
                className="object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Processing...</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleStartDetection} 
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Detection
                  </>
                )}
              </Button>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detection Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>AI model analysis and extracted information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detectedPlate ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">License Plate Detected</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{detectedPlate}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Confidence Score</Label>
                    <div className="text-lg font-semibold text-green-600">98.7%</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Processing Time</Label>
                    <div className="text-lg font-semibold">2.3s</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vehicle Information</Label>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Owner:</span>
                      <span className="text-sm font-medium">Mohammad Rahman</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vehicle Type:</span>
                      <span className="text-sm font-medium">Private Car</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Toll Amount:</span>
                      <span className="text-sm font-medium">৳50</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Send Payment Link
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No vehicle detected yet</p>
                <p className="text-sm">Start detection to analyze license plates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manual Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Manual Image Upload
          </CardTitle>
          <CardDescription>Upload an image for license plate detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
            <Input type="file" accept="image/*" className="max-w-xs mx-auto" />
          </div>
          <Button className="w-full" variant="outline">
            Process Uploaded Image
          </Button>
        </CardContent>
      </Card>

      {/* Detection History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Detections</CardTitle>
          <CardDescription>History of recent license plate detections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { plate: "ঢাকা-মেট্রো-গ-১২-৩৪৫৬", time: "2 minutes ago", confidence: "98.7%", status: "success" },
              { plate: "চট্টগ্রাম-খ-৭৮-৯০১২", time: "5 minutes ago", confidence: "97.2%", status: "success" },
              { plate: "সিলেট-গ-৪৫-৬৭৮৯", time: "8 minutes ago", confidence: "89.1%", status: "warning" },
              { plate: "রাজশাহী-ক-২৩-৪৫৬৭", time: "12 minutes ago", confidence: "95.8%", status: "success" },
            ].map((detection, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {detection.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <div className="font-medium">{detection.plate}</div>
                    <div className="text-sm text-gray-500">{detection.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{detection.confidence}</div>
                  <Badge 
                    variant="secondary" 
                    className={detection.status === "success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                  >
                    {detection.status === "success" ? "Processed" : "Review"}
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
