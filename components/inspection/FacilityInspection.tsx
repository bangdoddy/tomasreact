import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Upload, Download, Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';

export default function FacilityInspection() {
  const [searchTerm, setSearchTerm] = useState('');

  const inspectionData = [
    {
      id: 1,
      facilityId: 'FAC-001',
      facilityName: 'WORKSHOP A',
      location: '40AD',
      inspectionDate: '2024-01-10',
      inspector: 'John Smith',
      status: 'GOOD',
      nextInspection: '2024-02-10',
      remarks: 'All equipment functional',
    },
    {
      id: 2,
      facilityId: 'FAC-002',
      facilityName: 'WASHING BAY 1',
      location: '40AC',
      inspectionDate: '2024-01-08',
      inspector: 'Jane Doe',
      status: 'NEEDS REPAIR',
      nextInspection: '2024-02-08',
      remarks: 'Pump replacement required',
    },
    {
      id: 3,
      facilityId: 'FAC-003',
      facilityName: 'PIT STOP A',
      location: '40AI',
      inspectionDate: '2024-01-12',
      inspector: 'Mike Johnson',
      status: 'GOOD',
      nextInspection: '2024-02-12',
      remarks: 'Regular maintenance completed',
    },
  ];

  const filteredData = inspectionData.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-2 pb-2">
      <Card className="border-0 shadow">
        <CardHeader className="p-3 pb-2 border-b border-gray-200 bg-gradient-to-r from-[#003366] to-[#009999]">
          <CardTitle className="text-base text-white">Facility Inspection</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search facility inspection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-9 gap-2 text-xs">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
              <Button size="sm" variant="outline" className="h-9 gap-2 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                size="sm"
                className="h-9 gap-2 bg-[#009999] hover:bg-[#007777] text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add New</span>
              </Button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">NO</TableHead>
                    <TableHead className="text-xs">FACILITY ID</TableHead>
                    <TableHead className="text-xs">FACILITY NAME</TableHead>
                    <TableHead className="text-xs">LOCATION</TableHead>
                    <TableHead className="text-xs">INSPECTION DATE</TableHead>
                    <TableHead className="text-xs">INSPECTOR</TableHead>
                    <TableHead className="text-xs">STATUS</TableHead>
                    <TableHead className="text-xs">NEXT INSPECTION</TableHead>
                    <TableHead className="text-xs">REMARKS</TableHead>
                    <TableHead className="text-xs text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="text-xs uppercase">{index + 1}</TableCell>
                      <TableCell className="text-xs uppercase">{item.facilityId}</TableCell>
                      <TableCell className="text-xs uppercase">{item.facilityName}</TableCell>
                      <TableCell className="text-xs uppercase">{item.location}</TableCell>
                      <TableCell className="text-xs uppercase">{item.inspectionDate}</TableCell>
                      <TableCell className="text-xs uppercase">{item.inspector}</TableCell>
                      <TableCell className="text-xs uppercase">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            item.status === 'GOOD'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs uppercase">{item.nextInspection}</TableCell>
                      <TableCell className="text-xs uppercase">{item.remarks}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Edit className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
