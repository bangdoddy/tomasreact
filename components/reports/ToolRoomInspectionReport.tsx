import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, ClipboardCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';

export default function ToolRoomInspectionReport() {
  const [searchTerm, setSearchTerm] = useState('');
  const stats = { total: 124, passed: 112, failed: 8, pending: 4 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-[#009999]" />
            Tool Room Inspection Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Tool room inspection results and compliance</p>
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
            <CardTitle className="text-sm text-gray-600">Total Inspections</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Passed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-green-600">{stats.passed}</div></CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-red-600">{stats.failed}</div></CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-yellow-600">{stats.pending}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search inspections..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Inspection ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Inspection Date</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-[#009999]">TR-INS-001</TableCell>
                  <TableCell>Tool Room A</TableCell>
                  <TableCell>2024-12-10</TableCell>
                  <TableCell>John Inspector</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-700 border-green-300">Passed</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-[#009999]">TR-INS-002</TableCell>
                  <TableCell>Tool Room B</TableCell>
                  <TableCell>2024-12-08</TableCell>
                  <TableCell>Jane Inspector</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-red-100 text-red-700 border-red-300">Failed</Badge>
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
