"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = router.query?.vehicleId || "N/A" // Access vehicleId from router.query
  const amount = searchParams.get("amount") || "0.00"

  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvc, setCvc] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle")
  const [message, setMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setPaymentStatus("idle")
    setMessage("")

    // Simulate API call
    setTimeout(() => {
      if (cardNumber.endsWith("0000")) {
        setPaymentStatus("success")
        setMessage("Payment successful! Thank you for your payment.")
      } else {
        setPaymentStatus("failed")
        setMessage("Payment failed. Please check your card details and try again.")
      }
      setIsProcessing(false)
    }, 2000) // Simulate 2-second processing time
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/processing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Processing
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
            <CardDescription>
              Pay for vehicle <span className="font-semibold">{vehicleId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 text-center">
              <p className="text-lg text-gray-700">Amount Due:</p>
              <p className="text-4xl font-bold text-blue-600">৳{amount}</p>
            </div>

            {paymentStatus === "success" && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="block sm:inline">{message}</span>
              </div>
            )}
            {paymentStatus === "failed" && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  disabled={isProcessing || paymentStatus === "success"}
                />
                <p className="text-xs text-gray-500">
                  Use card ending in <span className="font-bold">0000</span> for success.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    disabled={isProcessing || paymentStatus === "success"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    type="text"
                    placeholder="XXX"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                    disabled={isProcessing || paymentStatus === "success"}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isProcessing || paymentStatus === "success"}>
                {isProcessing ? "Processing..." : "Pay Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
