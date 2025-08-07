import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, Car } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive toll plaza performance reports</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳1,24,567</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Processed</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,432</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Per Vehicle</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳47.8</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Success</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.5% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by vehicle type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Private Cars</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <span className="text-sm font-medium">৳80,969 (65%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Trucks</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                </div>
                <span className="text-sm font-medium">৳31,142 (25%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Buses</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '10%'}}></div>
                </div>
                <span className="text-sm font-medium">৳12,456 (10%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
            <CardDescription>Traffic distribution throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">6:00 AM - 9:00 AM</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">Peak</Badge>
                <span className="text-sm font-medium">2,145 vehicles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">9:00 AM - 12:00 PM</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                <span className="text-sm font-medium">1,567 vehicles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">12:00 PM - 3:00 PM</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>
                <span className="text-sm font-medium">892 vehicles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">3:00 PM - 6:00 PM</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">Peak</Badge>
                <span className="text-sm font-medium">2,234 vehicles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">6:00 PM - 12:00 AM</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                <span className="text-sm font-medium">1,594 vehicles</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Report</CardTitle>
          <CardDescription>Detailed breakdown of monthly performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-left p-2">Vehicles</th>
                  <th className="text-left p-2">Revenue</th>
                  <th className="text-left p-2">Detection Rate</th>
                  <th className="text-left p-2">Payment Success</th>
                  <th className="text-left p-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">January 2024</td>
                  <td className="p-2">24,567</td>
                  <td className="p-2">৳1,18,234</td>
                  <td className="p-2">97.8%</td>
                  <td className="p-2">95.2%</td>
                  <td className="p-2 text-green-600">+12.3%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">February 2024</td>
                  <td className="p-2">22,134</td>
                  <td className="p-2">৳1,06,789</td>
                  <td className="p-2">98.1%</td>
                  <td className="p-2">96.1%</td>
                  <td className="p-2 text-red-600">-9.9%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">March 2024</td>
                  <td className="p-2">26,789</td>
                  <td className="p-2">৳1,29,456</td>
                  <td className="p-2">98.5%</td>
                  <td className="p-2">96.8%</td>
                  <td className="p-2 text-green-600">+21.2%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
