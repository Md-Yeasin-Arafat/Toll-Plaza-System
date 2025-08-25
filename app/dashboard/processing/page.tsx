// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { Clock, CheckCircle, AlertCircle, Car, Send, Eye, RefreshCw } from "lucide-react"
// import { useRouter } from "next/navigation"

// export default function ProcessingPage() {
//   const [currentVehicle, setCurrentVehicle] = useState({
//     plate: "ঢাকা-মেট্রো-গ-১২-৩৪৫৬",
//     owner: "Mohammad Rahman",
//     phone: "+880 1712-345678",
//     vehicleType: "Private Car",
//     tollAmount: 50,
//     status: "payment_pending",
//     detectedAt: "2 minutes ago",
//   })

//   const processingQueue = [
//     {
//       id: 1,
//       plate: "চট্টগ্রাম-খ-৭৮-৯০১২",
//       status: "detecting",
//       progress: 75,
//       estimatedTime: "30s",
//     },
//     {
//       id: 2,
//       plate: "সিলেট-গ-৪৫-৬৭৮৯",
//       status: "payment_sent",
//       progress: 90,
//       estimatedTime: "Waiting for payment",
//     },
//     {
//       id: 3,
//       plate: "রাজশাহী-ক-২৩-৪৫৬৭",
//       status: "completed",
//       progress: 100,
//       estimatedTime: "Completed",
//     },
//   ]

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "detecting":
//         return "bg-blue-100 text-blue-800"
//       case "payment_sent":
//         return "bg-yellow-100 text-yellow-800"
//       case "payment_pending":
//         return "bg-orange-100 text-orange-800"
//       case "completed":
//         return "bg-green-100 text-green-800"
//       case "failed":
//         return "bg-red-100 text-red-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "detecting":
//         return <RefreshCw className="h-4 w-4 animate-spin" />
//       case "payment_sent":
//         return <Send className="h-4 w-4" />
//       case "payment_pending":
//         return <Clock className="h-4 w-4" />
//       case "completed":
//         return <CheckCircle className="h-4 w-4" />
//       case "failed":
//         return <AlertCircle className="h-4 w-4" />
//       default:
//         return <Clock className="h-4 w-4" />
//     }
//   }

//   const router = useRouter()

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Current Vehicle Processing</h1>
//         <p className="text-gray-600">Real-time vehicle processing and payment management</p>
//       </div>

//       {/* Current Vehicle */}
//       <Card className="border-2 border-blue-200 bg-blue-50">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Car className="h-5 w-5 text-blue-600" />
//             Currently Processing
//           </CardTitle>
//           <CardDescription>Vehicle at the toll booth</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-2xl font-bold text-blue-900">{currentVehicle.plate}</h3>
//                 <p className="text-blue-700">Detected {currentVehicle.detectedAt}</p>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Owner:</span>
//                   <span className="text-sm font-medium">{currentVehicle.owner}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Phone:</span>
//                   <span className="text-sm font-medium">{currentVehicle.phone}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Vehicle Type:</span>
//                   <span className="text-sm font-medium">{currentVehicle.vehicleType}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Toll Amount:</span>
//                   <span className="text-sm font-medium">৳{currentVehicle.tollAmount}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center gap-2">
//                 <Badge variant="secondary" className={getStatusColor(currentVehicle.status)}>
//                   {getStatusIcon(currentVehicle.status)}
//                   Payment Pending
//                 </Badge>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span>Processing Progress</span>
//                   <span>75%</span>
//                 </div>
//                 <Progress value={75} className="h-2" />
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   size="sm"
//                   className="flex-1"
//                   onClick={() => {
//                     const paymentLink = `${window.location.origin}/payment/${currentVehicle.plate}?amount=${currentVehicle.tollAmount}`
//                     console.log("Simulated payment link sent:", paymentLink)
//                     alert("Payment link simulated and logged to console!") // Provide immediate feedback
//                     // Optionally, you can navigate directly:
//                     // router.push(paymentLink)
//                   }}
//                 >
//                   <Send className="h-4 w-4 mr-2" />
//                   Send Payment Link
//                 </Button>
//                 <Button size="sm" variant="outline">
//                   <Eye className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Processing Queue */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Processing Queue</CardTitle>
//           <CardDescription>Vehicles in the processing pipeline</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {processingQueue.map((vehicle) => (
//               <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-4">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                     <span className="text-sm font-medium text-blue-600">{vehicle.id}</span>
//                   </div>
//                   <div>
//                     <div className="font-medium">{vehicle.plate}</div>
//                     <div className="text-sm text-gray-500">{vehicle.estimatedTime}</div>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4">
//                   <div className="w-32">
//                     <Progress value={vehicle.progress} className="h-2" />
//                   </div>
//                   <Badge variant="secondary" className={getStatusColor(vehicle.status)}>
//                     {getStatusIcon(vehicle.status)}
//                     {vehicle.status.replace("_", " ")}
//                   </Badge>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Processing Statistics */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Processing Statistics</CardTitle>
//             <CardDescription>Real-time processing metrics</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="text-center p-4 bg-blue-50 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">12</div>
//                 <div className="text-sm text-blue-800">In Queue</div>
//               </div>
//               <div className="text-center p-4 bg-green-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">247</div>
//                 <div className="text-sm text-green-800">Completed Today</div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>Average Processing Time</span>
//                 <span>2.3 minutes</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>Success Rate</span>
//                 <span>98.7%</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>Payment Success Rate</span>
//                 <span>96.2%</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* System Status */}
//         <Card>
//           <CardHeader>
//             <CardTitle>System Status</CardTitle>
//             <CardDescription>Current system health</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-green-500" />
//                   <span className="text-sm">Camera System</span>
//                 </div>
//                 <Badge variant="secondary" className="bg-green-100 text-green-800">
//                   Online
//                 </Badge>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-green-500" />
//                   <span className="text-sm">ML Detection</span>
//                 </div>
//                 <Badge variant="secondary" className="bg-green-100 text-green-800">
//                   Active
//                 </Badge>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-green-500" />
//                   <span className="text-sm">Payment Gateway</span>
//                 </div>
//                 <Badge variant="secondary" className="bg-green-100 text-green-800">
//                   Connected
//                 </Badge>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <AlertCircle className="h-4 w-4 text-yellow-500" />
//                   <span className="text-sm">Database</span>
//                 </div>
//                 <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
//                   Slow
//                 </Badge>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }




"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, AlertCircle, Car, Send, Eye, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface VehicleInfo {
  _id: string
  license: string
  owner: string
  phone: string
  vehicleType: string
  tollAmount: number
  createdAt: Date | string
}

interface CurrentVehicle {
  plate: string
  owner: string
  phone: string
  vehicleType: string
  tollAmount: number
  status: string
  detectedAt: string
}

export default function ProcessingPage() {
  const [currentVehicle, setCurrentVehicle] = useState<CurrentVehicle>({
    plate: "Loading...",
    owner: "Loading...",
    phone: "Loading...",
    vehicleType: "Loading...",
    tollAmount: 0,
    status: "payment_pending",
    detectedAt: "Loading...",
  })

  const [isLoading, setIsLoading] = useState(true)

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

  // Function to format the time difference from createdAt
  const formatTimeAgo = (createdAt: Date | string): string => {
    try {
      const now = new Date()
      const created = new Date(createdAt)
      const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} day${days > 1 ? 's' : ''} ago`
      }
    } catch (error) {
      return "Recently"
    }
  }

  // Function to fetch the most recent vehicle information from database
  const fetchMostRecentVehicle = async (): Promise<VehicleInfo | null> => {
    try {
      const response = await fetch("/api/recent-vehicle", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log("No vehicles found in database")
          return null
        }
        throw new Error(`Failed to fetch recent vehicle: ${response.status}`)
      }

      const vehicleData: VehicleInfo = await response.json()
      return vehicleData
    } catch (error) {
      console.error("Error fetching recent vehicle:", error)
      return null
    }
  }

  // Load most recent vehicle information on component mount
  useEffect(() => {
    const loadRecentVehicleInfo = async () => {
      setIsLoading(true)
      const vehicleData = await fetchMostRecentVehicle()
      
      if (vehicleData) {
        setCurrentVehicle(prev => ({
          ...prev,
          plate: vehicleData.license,
          owner: vehicleData.owner,
          phone: vehicleData.phone,
          vehicleType: vehicleData.vehicleType,
          tollAmount: vehicleData.tollAmount,
          detectedAt: formatTimeAgo(vehicleData.createdAt),
        }))
      } else {
        // If no vehicle found, show default/unknown values
        setCurrentVehicle(prev => ({
          ...prev,
          plate: "No vehicles found",
          owner: "No Recent Vehicle",
          phone: "Not Available",
          vehicleType: "Unknown",
          tollAmount: 0,
          detectedAt: "No recent data",
        }))
      }
      setIsLoading(false)
    }

    loadRecentVehicleInfo()
  }, []) // Empty dependency array - only runs on mount

  // Function to update current vehicle with new license plate
  const updateCurrentVehicle = async (newPlate: string) => {
    setCurrentVehicle(prev => ({
      ...prev,
      plate: newPlate,
      owner: "Loading...",
      phone: "Loading...",
      vehicleType: "Loading...",
      tollAmount: 0,
      detectedAt: "Just now",
    }))
  }

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
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
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
                  <span className={`text-sm font-medium ${isLoading ? 'text-gray-400' : currentVehicle.owner === 'No Recent Vehicle' ? 'text-red-600' : ''}`}>
                    {currentVehicle.owner}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className={`text-sm font-medium ${isLoading ? 'text-gray-400' : currentVehicle.phone === 'Not Available' ? 'text-red-600' : ''}`}>
                    {currentVehicle.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle Type:</span>
                  <span className={`text-sm font-medium ${isLoading ? 'text-gray-400' : currentVehicle.vehicleType === 'Unknown' ? 'text-red-600' : ''}`}>
                    {currentVehicle.vehicleType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Toll Amount:</span>
                  <span className={`text-sm font-medium ${isLoading ? 'text-gray-400' : currentVehicle.tollAmount === 0 ? 'text-red-600' : ''}`}>
                    {currentVehicle.tollAmount === 0 ? 'Contact Operator' : `৳${currentVehicle.tollAmount}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getStatusColor(currentVehicle.status)}>
                  {getStatusIcon(currentVehicle.status)}
                  Payment Pending
                </Badge>
                {currentVehicle.owner === "No Recent Vehicle" && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    No Recent Data
                  </Badge>
                )}
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
                  disabled={currentVehicle.owner === "No Recent Vehicle" || isLoading}
                  onClick={() => {
                    const paymentLink = `${window.location.origin}/payment/${currentVehicle.plate}?amount=${currentVehicle.tollAmount}`
                    console.log("Simulated payment link sent:", paymentLink)
                    alert("Payment link simulated and logged to console!") // Provide immediate feedback
                    // Optionally, you can navigate directly:
                    // router.push(paymentLink)
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {currentVehicle.owner === "No Recent Vehicle" ? "No Recent Vehicle" : "Send Payment Link"}
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
