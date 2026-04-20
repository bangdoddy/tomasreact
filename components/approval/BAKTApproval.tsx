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
  Currency,
  DollarSign,
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
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
  status: 'Pending' | 'Waiting' | 'Approved' | 'Rejected';
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
  ToolsCondition: string;
  StApprovedBAKT: string;
  StReportBAKT: string;
}

export default function BAKTApproval() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [baktTools, setBaktTools] = useState<BaktResult[]>([])

  const [requests, setRequests] = useState<BAKTRequest[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedBakt, setSelectedBakt] = useState<BaktResult | null>(null);
  const [baktToApprove, setBaktToApprove] = useState<BaktResult | null>(null);
  const [baktToReject, setBaktToReject] = useState<BaktResult | null>(null);

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
      case 'Waiting':
        return 'bg-blue-100 text-blue-700 border-blue-300';
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
          BaktNo: bakt.BA_No,
          Nrp: bakt.NRPMechanic,
          Reason: bakt.StUser,
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

  const handleReject = async (bakt: BaktResult) => {
    try {
      const response = await fetch(API.BAKT(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "REJECT",
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          BaktNo: bakt.BA_No,
          Nrp: bakt.NRPMechanic,
          Reason: bakt.StUser,
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
        toast.error("Failed, No Response");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const handleViewDetails = (bakt: BaktResult) => {
    setSelectedBakt(bakt);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBakt(null);
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
        'Date': formatDate(tool.CreateDateBA),
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
      Role: currentUser.Jabatan,
      nrp: currentUser.Nrp
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: BaktResult[]) => {
        setBaktTools(json); console.log(json);
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
                <DollarSign className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
            {/* <p className="text-xs text-gray-500 mt-1">IDR Million</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-2 p-2">
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
                <SelectItem value="Waiting">Waiting</SelectItem>
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
                  <TableHead>Tools Desc</TableHead>
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
                        <span className="text-gray-600 text-[#009999]">{request.BA_No}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-600 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          {request.ToolsName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-600 flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          {request.Nama}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{request.NamaSuperior}</TableCell>
                      <TableCell>
                        <div className="text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          {formatDate(request.CreateDateBA)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 text-sm">
                          {formatCurrency(request.TotalPrice)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{0}</TableCell>
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
                            onClick={() => handleViewDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(request.StApprovedBAKT == 'Pending') && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                title="Approve"
                                onClick={() => {
                                  setBaktToApprove(request);
                                  setIsApproveDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                title="Reject"
                                onClick={() => {
                                  setBaktToReject(request);
                                  setIsRejectDialogOpen(true);
                                }}
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-[#003366] text-white p-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-[#00cccc]" />
              BAKT Detail Information
            </DialogTitle>
            <DialogDescription className="text-blue-100/70">
              BAKT No. <span className="text-white font-mono">{selectedBakt?.BA_No}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tool Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tool Information</h3>
                <div className="space-y-3">
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-500">Tools ID</span>
                    <span className="font-medium text-gray-900">{selectedBakt?.ToolsId}</span>
                  </div>
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-500">Tools Name</span>
                    <span className="font-medium text-gray-900">{selectedBakt?.ToolsName}</span>
                  </div>
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-500">MO No.</span>
                    <span className="font-medium text-gray-900">{selectedBakt?.WO_No}</span>
                  </div>
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-500">Condition / Reason</span>
                    <span className="font-medium text-gray-900 italic text-red-600">
                      "{selectedBakt?.ToolsCondition + ": " + selectedBakt?.CauseBrokenBA || 'No description provided'}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Employee & Transaction Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Employee & Transaction</h3>
                <div className="space-y-3">
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-500">NRP</span>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-[#009999]" />
                      <span className="font-medium text-gray-900">{selectedBakt?.NRPMechanic}</span>
                    </div>
                  </div>
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-500">Employee Name</span>
                    <span className="font-medium text-gray-900">{selectedBakt?.Nama}</span>
                  </div>
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-500">BAKT Date</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-[#009999]" />
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedBakt?.CreateDateBA || '')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex items-center justify-between bg-gray-50 -mx-6 -mb-6 p-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold uppercase">Total Estimated Price</span>
                <span className="text-2xl font-bold text-[#009999]">
                  {selectedBakt?.TotalPrice ? formatCurrency(selectedBakt.TotalPrice) : 'Rp 0'}
                </span>
              </div>
              <Button
                onClick={closeDetails}
                className="bg-[#009999] hover:bg-[#007777] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve BAKT No. <span className="font-mono font-bold text-[#009999]">{baktToApprove?.BA_No}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBaktToApprove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (baktToApprove) {
                  handleApprove(baktToApprove);
                  setBaktToApprove(null);
                }
              }}
              className="bg-[#009999] hover:bg-[#007777] text-white"
            >
              Confirm Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject BAKT No. <span className="font-mono font-bold text-red-600">{baktToReject?.BA_No}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBaktToReject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (baktToReject) {
                  handleReject(baktToReject);
                  setBaktToReject(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
