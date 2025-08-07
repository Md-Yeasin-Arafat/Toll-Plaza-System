import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CreditCard, Database, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Toll Plaza System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Seamless toll collection with AI-powered license plate recognition and automated payment processing
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Camera className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>AI Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced machine learning models detect and extract Bangla license plates automatically
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Seamless Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automated payment links sent to vehicle owners for quick and secure transactions
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Smart Database</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive vehicle registration database with real-time transaction tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Secure System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                End-to-end security with encrypted data transmission and secure payment processing
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vehicle Detection</h3>
              <p className="text-gray-600">Camera captures license plate image when vehicle approaches</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-600">ML model extracts Bangla license number and retrieves vehicle info</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Payment</h3>
              <p className="text-gray-600">Payment link sent to owner, transaction completed seamlessly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
