import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import { useReactToPrint } from "react-to-print";
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import * as XLSX from 'xlsx';

interface BaktResult {
  BA_No: string;
  CreateDateBA: string;
  WO_No: string;
  IsConfirmed: number;
  StUser: string;
  StApproved: number;
  NRPMechanic: string;
  Nama: string;
  Jabatan: string;
  NRPSuperior: string;
  NamaSuperior: string;
  ToolsId: string;
  ToolsName: string;
  TotalPrice: number;
  Perusahaan: number;
  Karyawan: number;
  CauseBrokenBA: string;
  StApprovedBAKT: string;
  StReportBAKT: string;
  CreatedDate: string;
}

export default function BAKTReport() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [baktTools, setBaktTools] = useState<BaktResult[]>([])
  const [summary, setSummary] = useState({ total: 89, completed: 75, inProgress: 10, pending: 4 })

  // Pagination Items
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredRequests = baktTools.filter((req) => {
    const matchesSearch =
      req.BA_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.ToolsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.Nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.NamaSuperior.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.ToolsName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || req.StReportBAKT === filterStatus;

    return matchesSearch && matchesStatus;
  });

  /*Pagination Items (fallback to client-side if total is not set) */
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRequests.slice(startIndex, endIndex);


  const saveToExcel = (data: BaktResult[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'BAKT Number': tool.BA_No,
        'Tools Name': tool.ToolsName,
        'Issue Date': tool.CreatedDate,
        'Requested By': tool.Nama,
        'Superior': tool.NamaSuperior,
        'Status': tool.StReportBAKT
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Bakt_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const GetBaktList = () => {
    const params = new URLSearchParams({
      act: "REPORT",
      jobsite: currentUser.Jobsite,
      nrp: currentUser.Nrp
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: BaktResult[]) => {
        console.log(json)
        setBaktTools(json)
        setSummary({
          total: json.length,
          completed: json.filter((r) => r.StReportBAKT === 'Completed').length,
          inProgress: json.filter((r) => r.StReportBAKT === 'In Progress').length,
          pending: json.filter((r) => r.StReportBAKT === 'Pending').length,
        })
      })
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    GetBaktList();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-[#009999]" />
            BAKT Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">BAKT status and tracking report</p>
        </div>
        <div className="flex gap-2">
          {/*<Button variant="outline" onClick={() => toast.success('Report exported!')}>*/}
          {/*  <Download className="h-4 w-4 mr-2" />*/}
          {/*  Export PDF*/}
          {/*</Button>*/}
          <Button className="bg-[#009999] hover:bg-[#008080] text-white" onClick={() => saveToExcel(baktTools)}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total BAKT</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{summary.total}</div></CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-green-600">{summary.completed}</div></CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-blue-600">{summary.inProgress}</div></CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-yellow-600">{summary.pending}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search By BAKT Number, Tools Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>BAKT Number</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No BAKT requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((request) => (
                    <TableRow key={request.BA_No} className="hover:bg-gray-50">
                      <TableCell
                        className="text-[#009999] cursor-pointer hover:underline font-medium"
                        onClick={() => window.open(`/?print=BAKTReview&ba_no=${request.BA_No}`, '_blank')}
                      >
                        {request.BA_No}
                      </TableCell>
                      <TableCell className="text-gray-600">{request.ToolsName}</TableCell>
                      <TableCell className="text-gray-600">{request.CreatedDate}</TableCell>
                      <TableCell className="text-gray-600">{request.Nama}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getStatusColor(request.StReportBAKT)}`}>{request.StReportBAKT}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {/*<TableRow className="hover:bg-gray-50">*/}
                {/*  <TableCell className="text-[#009999]">BAKT-2024-001</TableCell>*/}
                {/*  <TableCell>Hydraulic Pump</TableCell>*/}
                {/*  <TableCell>2024-12-01</TableCell>*/}
                {/*  <TableCell>Operations</TableCell>*/}
                {/*  <TableCell className="text-center">*/}
                {/*    <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>*/}
                {/*  </TableCell>*/}
                {/*</TableRow>*/}
                {/*<TableRow className="hover:bg-gray-50">*/}
                {/*  <TableCell className="text-[#009999]">BAKT-2024-002</TableCell>*/}
                {/*  <TableCell>Welding Machine</TableCell>*/}
                {/*  <TableCell>2024-12-05</TableCell>*/}
                {/*  <TableCell>Maintenance</TableCell>*/}
                {/*  <TableCell className="text-center">*/}
                {/*    <Badge className="bg-blue-100 text-blue-700 border-blue-300">In Progress</Badge>*/}
                {/*  </TableCell>*/}
                {/*</TableRow>*/}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Items per page:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="itemsPerPage" className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600 ml-4">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Page {currentPage}</span>
                <span className="text-sm text-gray-600">of {totalPages || 1}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
