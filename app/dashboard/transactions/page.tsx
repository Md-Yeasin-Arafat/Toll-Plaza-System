import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Eye, RefreshCw } from 'lucide-react'

export default function TransactionsPage() {
  const transactions = [
    {
      id: "TXN-001",
      plate: "ঢাকা-মেট্রো-গ-১২-৩৪৫৬",
      owner: "Mohammad Rahman",
      amount: 50,
      status: "completed",
      paymentMethod: "bKash",
      timestamp: "2024-01-15 14:30:25",
      vehicleType: "Private Car"
    },
    {
      id: "TXN-002",
      plate: "চট্টগ্রাম-খ-৭৮-৯০১২",
      owner: "Fatima Begum",
      amount: 120,
      status: "completed",
      paymentMethod: "Nagad",
      timestamp: "2024-01-15 14:28:15",
      vehicleType: "Truck"
    },
    {
      id: "TXN-003",
      plate: "সিলেট-গ-৪৫-৬৭৮৯",
      owner: "Abdul Karim",
      amount: 80,
      status: "pending",
      paymentMethod: "Rocket",
      timestamp: "2024-01-15 14:25:10",
      vehicleType: "Bus"
    },
    {
      id: "TXN-004",
      plate: "রাজশাহী-ক-২ৃ-৪৫৬৭",
      owner: "Rashida Khatun",
      amount: 50,
      status: "failed",
      paymentMethod: "bKash",
      timestamp: "2024-01-15 14:22:45",
      vehicleType: "Private Car"
    },
    {
      id: "TXN-005",
      plate: "বরিশাল-গ-৮৯-০১২৩",
      owner: "Aminul Islam",
      amount: 50,
      status: "completed",
      paymentMethod: "Card",
      timestamp: "2024-01-15 14:20:30",
      vehicleType: "Private Car"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "bKash": return "bg-pink-100 text-pink-800"
      case "Nagad": return "bg-orange-100 text-orange-800"
      case "Rocket": return "bg-purple-100 text-purple-800"
      case "Card": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recent Transactions</h1>
          <p className="text-gray-600">Monitor and manage toll payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,199</div>
            <p className="text-xs text-muted-foreground">96.2% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">32</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">16</div>
            <p className="text-xs text-muted-foreground">1.3% failure rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by license plate or owner..." className="pl-10" />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="rocket">Rocket</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Detailed list of all toll transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Transaction ID</th>
                  <th className="text-left p-3">License Plate</th>
                  <th className="text-left p-3">Owner</th>
                  <th className="text-left p-3">Vehicle Type</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Payment Method</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Timestamp</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{transaction.id}</td>
                    <td className="p-3 font-mono">{transaction.plate}</td>
                    <td className="p-3">{transaction.owner}</td>
                    <td className="p-3">{transaction.vehicleType}</td>
                    <td className="p-3 font-medium">৳{transaction.amount}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={getPaymentMethodColor(transaction.paymentMethod)}>
                        {transaction.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-500">{transaction.timestamp}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal would go here in a real app */}
    </div>
  )
}
