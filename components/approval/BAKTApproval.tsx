import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Calendar,
  User,
  ClipboardList,
  FileText,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface BAKTRequest {
  id: string;
  baktNumber: string;
  requestedBy: string;
  department: string;
  requestDate: string;
  projectName: string;
  estimatedValue: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  urgency: 'Urgent' | 'Normal' | 'Low';
}

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
}

export default function BAKTApproval() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [baktTools, setBaktTools] = useState<BaktResult[]>([])

  const [requests, setRequests] = useState<BAKTRequest[]>([]);

  const filteredRequests = baktTools.filter((req) => {
    const matchesSearch =
      req.BA_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.ToolsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.Nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.NamaSuperior.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || req.StApprovedBAKT === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV5':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV4':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV3':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV2':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV1':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Normal':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Low':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleApprove = async (bakt: BaktResult) => {
    try {
      const response = await fetch(API.BAKT(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "APPROVE",
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          ItemKey: bakt.BA_No,
          Nrp: bakt.NRPMechanic,
          JobActivity: bakt.StUser,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          GetBaktList();
          toast.success(resData?.Message ?? 'successfully');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Respont");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const handleReject = (id: string) => {
    toast.error('BAKT request rejected');
  };

  const stats = {
    pending: baktTools.filter((r) => r.StApprovedBAKT === 'Pending').length,
    approved: baktTools.filter((r) => r.StApprovedBAKT === 'Approved').length,
    rejected: baktTools.filter((r) => r.StApprovedBAKT === 'Rejected').length,
    totalValue: baktTools
      .filter((r) => r.StApprovedBAKT === 'Pending')
      .reduce((sum, r) => sum + r.TotalPrice, 0),
  };

  const saveToExcel = (data: BaktResult[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'BAKT Number': tool.BA_No,
        'Project Name': tool.ToolsName,
        'Requested By': tool.Nama,
        'Department': tool.NamaSuperior,
        'Date': tool.CreateDateBA,
        'Est. Value (IDR)': tool.TotalPrice,
        'Status': tool.StApprovedBAKT
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Bakt_Approval_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const GetBaktList = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      nrp: currentUser.Nrp
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: BaktResult[]) => {
        setBaktTools(json)
      })
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    GetBaktList();
  }, []);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-[#009999]" />
            BAKT Approval
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve BAKT (Berita Acara Kebutuhan Tenaga) requests
          </p>
        </div>

        <Button
          variant="outline"
          className="border-gray-300 hover:bg-gray-50"
          onClick={() => saveToExcel(baktTools)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-md p-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-yellow-600">{stats.pending}</div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.approved}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-red-600">{stats.rejected}</div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg text-gray-900">
                {formatCurrency(stats.totalValue).replace('Rp', '').trim()}
                <span className="text-xs text-gray-500 mt-1"> IDR Million</span>
              </div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <FileText className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
            {/* <p className="text-xs text-gray-500 mt-1">IDR Million</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by BAKT number, project, requester, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* BAKT Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>BAKT Number</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Est. Value (IDR)</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No BAKT requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.BA_No} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{request.BA_No}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {request.ToolsName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {request.Nama}
                        </div>
                      </TableCell>
                      <TableCell>{request.NamaSuperior}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(request.CreateDateBA).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatCurrency(request.TotalPrice)}
                        </span>
                      </TableCell>
                      <TableCell>{0}</TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getStatusColor(request.StApprovedBAKT)}`}>
                          {request.StApprovedBAKT}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.StApprovedBAKT === 'Pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                title="Approve"
                                onClick={() => handleApprove(request)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                title="Reject"
                                onClick={() => handleReject(request.BA_No)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredRequests.length} of {requests.length} BAKT requests
      </div>
    </div>
  );
}
