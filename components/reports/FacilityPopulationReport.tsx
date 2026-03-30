import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Download, FileText } from 'lucide-react';
import { Input } from '../ui/input';

export default function FacilityPopulationReport() {
  const [searchTerm, setSearchTerm] = useState('');

  const reportData = [
    {
      id: 1,
      facilityId: 'FAC-001',
      facilityName: 'WORKSHOP A',
      type: 'WORKSHOP',
      location: '40AD',
      status: 'OPERATIONAL',
      capacity: 'HIGH',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-04-05',
    },
    {
      id: 2,
      facilityId: 'FAC-002',
      facilityName: 'WASHING BAY 1',
      type: 'WASHING BAY',
      location: '40AC',
      status: 'OPERATIONAL',
      capacity: 'MEDIUM',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
    },
    {
      id: 3,
      facilityId: 'FAC-003',
      facilityName: 'PIT STOP A',
      type: 'PIT STOP',
      location: '40AI',
      status: 'OPERATIONAL',
      capacity: 'HIGH',
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-04-08',
    },
    {
      id: 4,
      facilityId: 'FAC-004',
      facilityName: 'CALIBRATION LAB',
      type: 'CALIBRATION',
      location: '40AB',
      status: 'MAINTENANCE',
      capacity: 'LOW',
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-02-15',
    },
  ];

  const filteredData = reportData.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-2 pb-2">
      <Card className="border-0 shadow">
        <CardHeader className="p-3 pb-2 border-b border-gray-200 bg-gradient-to-r from-[#003366] to-[#009999]">
          <CardTitle className="text-base text-white">Facility Population Report</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search facility population report..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-9 gap-2 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                size="sm"
                className="h-9 gap-2 bg-[#009999] hover:bg-[#007777] text-white text-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Generate Report</span>
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
                    <TableHead className="text-xs">TYPE</TableHead>
                    <TableHead className="text-xs">LOCATION</TableHead>
                    <TableHead className="text-xs">STATUS</TableHead>
                    <TableHead className="text-xs">CAPACITY</TableHead>
                    <TableHead className="text-xs">LAST MAINTENANCE</TableHead>
                    <TableHead className="text-xs">NEXT MAINTENANCE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="text-xs uppercase">{index + 1}</TableCell>
                      <TableCell className="text-xs uppercase">{item.facilityId}</TableCell>
                      <TableCell className="text-xs uppercase">{item.facilityName}</TableCell>
                      <TableCell className="text-xs uppercase">{item.type}</TableCell>
                      <TableCell className="text-xs uppercase">{item.location}</TableCell>
                      <TableCell className="text-xs uppercase">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            item.status === 'OPERATIONAL'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs uppercase">{item.capacity}</TableCell>
                      <TableCell className="text-xs uppercase">{item.lastMaintenance}</TableCell>
                      <TableCell className="text-xs uppercase">{item.nextMaintenance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Total Facilities: <span className="text-[#003366]">{filteredData.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
