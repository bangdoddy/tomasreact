import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';

export default function DisposedToolReport() {
  const [searchTerm, setSearchTerm] = useState('');
  const stats = { total: 45, thisMonth: 8, thisQuarter: 22, thisYear: 45 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <XCircle className="h-7 w-7 text-[#009999]" />
            Disposed Tool Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track disposed and decommissioned tools</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Disposed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-blue-600">{stats.thisMonth}</div></CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">This Quarter</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-purple-600">{stats.thisQuarter}</div></CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">This Year</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-orange-600">{stats.thisYear}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search disposed tools..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tool ID</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Disposal Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-center">Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-[#009999]">TL-0245</TableCell>
                  <TableCell>Hydraulic Jack</TableCell>
                  <TableCell>2024-12-05</TableCell>
                  <TableCell>Hydraulic leak beyond repair</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-red-100 text-red-700 border-red-300">TA</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-[#009999]">TL-0189</TableCell>
                  <TableCell>Angle Grinder</TableCell>
                  <TableCell>2024-12-08</TableCell>
                  <TableCell>Motor failure</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-300">R2</Badge>
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
