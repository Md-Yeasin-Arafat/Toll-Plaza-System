"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, AlertCircle, Car, Send, Eye, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProcessingPage() {
  const [currentVehicle, setCurrentVehicle] = useState({
    plate: "ঢাকা-মেট্রো-গ-১২-৩৪৫৬",
    owner: "Mohammad Rahman",
    phone: "+880 1712-345678",
    vehicleType: "Private Car",
    tollAmount: 50,
    status: "payment_pending",
    detectedAt: "2 minutes ago",
  })

  const processingQueue = [
    {
      id: 1,
      plate: "চট্টগ্রাম-খ-৭৮-৯০১২",
      status: "detecting",
      progress: 75,
      estimatedTime: "30s",
    },
    {
      id: 2,
      plate: "সিলেট-গ-৪৫-৬৭৮৯",
      status: "payment_sent",
      progress: 90,
      estimatedTime: "Waiting for payment",
    },
    {
      id: 3,
      plate: "রাজশাহী-ক-২৩-৪৫৬৭",
      status: "completed",
      progress: 100,
      estimatedTime: "Completed",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "detecting":
        return "bg-blue-100 text-blue-800"
      case "payment_sent":
        return "bg-yellow-100 text-yellow-800"
      case "payment_pending":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "detecting":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "payment_sent":
        return <Send className="h-4 w-4" />
      case "payment_pending":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Current Vehicle Processing</h1>
        <p className="text-gray-600">Real-time vehicle processing and payment management</p>
      </div>

      {/* Current Vehicle */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600" />
            Currently Processing
          </CardTitle>
          <CardDescription>Vehicle at the toll booth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">{currentVehicle.plate}</h3>
                <p className="text-blue-700">Detected {currentVehicle.detectedAt}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Owner:</span>
                  <span className="text-sm font-medium">{currentVehicle.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium">{currentVehicle.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle Type:</span>
                  <span className="text-sm font-medium">{currentVehicle.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Toll Amount:</span>
                  <span className="text-sm font-medium">৳{currentVehicle.tollAmount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getStatusColor(currentVehicle.status)}>
                  {getStatusIcon(currentVehicle.status)}
                  Payment Pending
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing Progress</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const paymentLink = `${window.location.origin}/payment/${currentVehicle.plate}?amount=${currentVehicle.tollAmount}`
                    console.log("Simulated payment link sent:", paymentLink)
                    alert("Payment link simulated and logged to console!") // Provide immediate feedback
                    // Optionally, you can navigate directly:
                    // router.push(paymentLink)
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Payment Link
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
          <CardDescription>Vehicles in the processing pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processingQueue.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{vehicle.id}</span>
                  </div>
                  <div>
                    <div className="font-medium">{vehicle.plate}</div>
                    <div className="text-sm text-gray-500">{vehicle.estimatedTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={vehicle.progress} className="h-2" />
                  </div>
                  <Badge variant="secondary" className={getStatusColor(vehicle.status)}>
                    {getStatusIcon(vehicle.status)}
                    {vehicle.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Statistics</CardTitle>
            <CardDescription>Real-time processing metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-800">In Queue</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">247</div>
                <div className="text-sm text-green-800">Completed Today</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Processing Time</span>
                <span>2.3 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span>98.7%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Success Rate</span>
                <span>96.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Camera System</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">ML Detection</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Payment Gateway</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Slow
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
