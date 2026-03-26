import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';

export default function ToolOrderMonitoringReport() {
  const [searchTerm, setSearchTerm] = useState('');
  const stats = { total: 68, pending: 12, processing: 18, completed: 32, rejected: 6 };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-[#009999]" />
            Tool Order Monitoring Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Monitor tool order budget and status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Report exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white" onClick={() => toast.success('Excel exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="border-[#009999]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-yellow-600">{stats.pending}</div></CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Processing</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-blue-600">{stats.processing}</div></CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-green-600">{stats.completed}</div></CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-red-600">{stats.rejected}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Order Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-[#009999]">ORD/2024/12/001</TableCell>
                  <TableCell>Heavy equipment purchase</TableCell>
                  <TableCell>2024-12-10</TableCell>
                  <TableCell>{formatCurrency(500000000)}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">Processing</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-[#009999]">ORD/2024/12/002</TableCell>
                  <TableCell>Replacement tools and spare parts</TableCell>
                  <TableCell>2024-12-09</TableCell>
                  <TableCell>{formatCurrency(150000000)}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
