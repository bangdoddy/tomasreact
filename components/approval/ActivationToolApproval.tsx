import { useState, useRef, useEffect } from 'react';
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
  Wrench,
  MapPin,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';
import * as React from 'react';

interface ToolActivationRequest {
  id: string;
  toolId: string;
  toolName: string;
  requestedBy: string;
  requestDate: string;
  location: string;
  category: string;
  quantity: number;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
}

interface ActivationToolData {
  Idx: number;
  ToolsId: string;
  ToolsDesc: string;
  ToolsDateIn: string;
  NoBAST: string;
  Jobsite: string;
  GivenDate: string;
  IsConfirmed: string;
  NRPPenerima: string;
  NamaPenerima: string;
  NamaPenyerah: string;
  ApprovedBy: string;
  ApprovedByName: string;
  ApprovalDate: string;
  StApprovedBAST: string;
  StUser: string;
  StApproved: number;
  Tools: ActivationToolData[];
}

interface ToolDataDetail {
  Idx: number;
  IdTools: string;
  NamaTools: string;
  NamaPenerima: string;
  Size: string;
  Qty: number;
  Remarks: string
}

export default function ActivationToolApproval() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBastNo, setSelectedBastNo] = useState('');
  const [selectedNamaPenerima, setSelectedNamaPenerima] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [activationTools, setActivationTools] = useState<ActivationToolData[]>([])
  const [toolDetail, setToolDetail] = useState<ToolDataDetail[]>([])
  const [requests, setRequests] = useState<ToolActivationRequest[]>([]);

  const filteredData = activationTools.filter((req) => {
    const matchesSearch =
      req.NamaPenerima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.NamaPenyerah?.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === "";

    const matchesStatus = filterStatus === 'All' || req.StApprovedBAST.includes(filterStatus);

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV1':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV2':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Approved LV2':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const openDetail = (bastNo: string, namaPenerima: string, tanggal: string) => {
    setSelectedBastNo(bastNo);
    setSelectedNamaPenerima(namaPenerima);
    setSelectedTanggal(tanggal);
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      nrp: currentUser.Nrp,
      bastno: bastNo
    });
    fetch(API.ACTIVATIONTOOLSDETAIL() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolDataDetail[]) => {
        setToolDetail(json);
      })
      .catch((error) => console.error("Error:", error));

    setIsDetailDialogOpen(true);
  }

  const handleApprove = (id: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Approved' as const } : r))
    );
    toast.success('Tool activation request approved!');
  };

  const handleReject = (id: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Rejected' as const } : r))
    );
    toast.error('Tool activation request rejected');
  };

  const handleApproveActivation = async (tools: ActivationToolData) => {
    try {
      const response = await fetch(API.ACTIVATIONTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "APPROVE",
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          BastNo: tools.NoBAST,
          Nrp: tools.NRPPenerima,
          Nama: tools.StUser,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          GetActivationList();
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
  }

  function groupByNoBAST(rows: ActivationToolData[]): ActivationToolData[] {
    const map = new Map<string, ActivationToolData[]>();
    for (const r of rows) {
      if (!map.has(r.NoBAST)) map.set(r.NoBAST, []);
      map.get(r.NoBAST)!.push(r);
    }

    const grouped: ActivationToolData[] = [];
    for (const items of map.values()) {
      const header = items[0];
      header.Tools = items.map(it => it === header ? { ...it, Tools: [] } : { ...it, Tools: [] });
      grouped.push(header);
    }

    rows.length = 0;
    rows.push(...grouped);

    return rows;
  }


  const stats = {
    pending: activationTools.filter((r) => r.StApprovedBAST === 'Pending').length,
    approved: activationTools.filter((r) => r.StApprovedBAST.includes("Approved")).length,
    rejected: activationTools.filter((r) => r.StApprovedBAST === 'Rejected').length,
    total: activationTools.length,
  };
  const saveToExcel = (data: ActivationToolData[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Activation ID': tool.NoBAST,
        'Tools': tool.ToolsDesc,
        'Requested By': tool.NamaPenerima,
        'Sender By': tool.NamaPenyerah,
        'Date': tool.GivenDate,
        'Qty': tool.Tools.length,
        'Status': tool.StApprovedBAST
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Activation_Tools_Approval_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const GetActivationList = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      nrp: currentUser?.Nrp,
      role: currentUser?.Jabatan,
      showDetail: "SHOW"
    });
    fetch(API.ACTIVATIONTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ActivationToolData[]) => {
        console.log(json);
        const grouped: ActivationToolData[] = groupByNoBAST(json);
        setActivationTools(grouped)
      })
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    GetActivationList();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <Wrench className="h-7 w-7 text-[#009999]" />
            Activation Tool Approval
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve tool activation requests
          </p>
        </div>

        <Button
          variant="outline"
          className="border-gray-300 hover:bg-gray-50"
          onClick={() => saveToExcel(activationTools)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.total}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <Wrench className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 p-2">
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

        <Card className="border-green-200">
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

        <Card className="border-red-200">
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 p-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by tool name, ID, or requester..."
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

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Activation ID</TableHead>
                  <TableHead>Tools</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Sender By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
                {/*<TableRow className="bg-gray-50">*/}
                {/*  <TableHead>Request ID</TableHead>*/}
                {/*  <TableHead>Tool ID</TableHead>*/}
                {/*  <TableHead>Tool Name</TableHead>*/}
                {/*  <TableHead>Requested By</TableHead>*/}
                {/*  <TableHead>Date</TableHead>*/}
                {/*  <TableHead>Location</TableHead>*/}
                {/*  <TableHead>Category</TableHead>*/}
                {/*  <TableHead>Qty</TableHead>*/}
                {/*  <TableHead>Priority</TableHead>*/}
                {/*  <TableHead>Status</TableHead>*/}
                {/*  <TableHead className="text-center">Actions</TableHead>*/}
                {/*</TableRow>*/}
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No activation requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((request) => (
                    <TableRow key={request.NoBAST} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{request.NoBAST}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {request.Tools.map((item, idx) => (
                            <span key={idx} className="text-xs">
                              {item.ToolsDesc}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {request.NamaPenerima}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {request.NamaPenyerah}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {request.GivenDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">  {request.Tools.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getStatusColor(request.StApprovedBAST)}`}>
                          {request.StApprovedBAST}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            title="View Details"
                            onClick={() => openDetail(request.NoBAST, request.NamaPenerima, request.GivenDate.toString())}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.StApprovedBAST === 'Pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                title="Approve"
                                onClick={() => handleApproveActivation(request)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                title="Reject"
                                onClick={() => handleReject(request.NoBAST)}
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
                {/*{filteredRequests.length === 0 ? (*/}
                {/*  <TableRow>*/}
                {/*    <TableCell colSpan={11} className="text-center py-8 text-gray-500">*/}
                {/*      No activation requests found*/}
                {/*    </TableCell>*/}
                {/*  </TableRow>*/}
                {/*) : (*/}
                {/*  filteredRequests.map((request) => (*/}
                {/*    <TableRow key={request.id} className="hover:bg-gray-50">*/}
                {/*      <TableCell>*/}
                {/*        <span className="text-[#009999]">{request.id}</span>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>{request.toolId}</TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <div className="flex items-center gap-2">*/}
                {/*          <Wrench className="h-4 w-4 text-gray-400" />*/}
                {/*          {request.toolName}*/}
                {/*        </div>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <div className="flex items-center gap-2">*/}
                {/*          <User className="h-4 w-4 text-gray-400" />*/}
                {/*          {request.requestedBy}*/}
                {/*        </div>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <div className="flex items-center gap-2">*/}
                {/*          <Calendar className="h-4 w-4 text-gray-400" />*/}
                {/*          {new Date(request.requestDate).toLocaleDateString()}*/}
                {/*        </div>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <div className="flex items-center gap-2">*/}
                {/*          <MapPin className="h-4 w-4 text-gray-400" />*/}
                {/*          {request.location}*/}
                {/*        </div>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>{request.category}</TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">*/}
                {/*          {request.quantity}*/}
                {/*        </Badge>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <Badge className={`w-fit ${getPriorityColor(request.priority)}`}>*/}
                {/*          {request.priority}*/}
                {/*        </Badge>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <Badge className={`w-fit ${getStatusColor(request.status)}`}>*/}
                {/*          {request.status}*/}
                {/*        </Badge>*/}
                {/*      </TableCell>*/}
                {/*      <TableCell>*/}
                {/*        <div className="flex items-center justify-center gap-1">*/}
                {/*          <Button*/}
                {/*            variant="ghost"*/}
                {/*            size="icon"*/}
                {/*            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"*/}
                {/*            title="View Details"*/}
                {/*          >*/}
                {/*            <Eye className="h-4 w-4" />*/}
                {/*          </Button>*/}
                {/*          {request.status === 'Pending' && (*/}
                {/*            <>*/}
                {/*              <Button*/}
                {/*                variant="ghost"*/}
                {/*                size="icon"*/}
                {/*                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"*/}
                {/*                title="Approve"*/}
                {/*                onClick={() => handleApprove(request.id)}*/}
                {/*              >*/}
                {/*                <CheckCircle className="h-4 w-4" />*/}
                {/*              </Button>*/}
                {/*              <Button*/}
                {/*                variant="ghost"*/}
                {/*                size="icon"*/}
                {/*                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"*/}
                {/*                title="Reject"*/}
                {/*                onClick={() => handleReject(request.id)}*/}
                {/*              >*/}
                {/*                <XCircle className="h-4 w-4" />*/}
                {/*              </Button>*/}
                {/*            </>*/}
                {/*          )}*/}
                {/*        </div>*/}
                {/*      </TableCell>*/}
                {/*    </TableRow>*/}
                {/*  ))*/}
                {/*)}*/}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Tools Activation Items</DialogTitle>
            <DialogDescription>Show detail tools information</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">No. BAST</p>
              <p className="text-sm font-medium text-[#009999]">{selectedBastNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Receiver</p>
              <p className="text-sm font-medium font-bold">{selectedNamaPenerima}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
              <p className="text-sm font-medium font-bold">{selectedTanggal}</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="bg-gray-50">Tools ID</TableHead>
                      <TableHead className="bg-gray-50">Description</TableHead>
                      <TableHead className="bg-gray-50 text-center">Size</TableHead>
                      <TableHead className="bg-gray-50 text-center">Qty</TableHead>
                      <TableHead className="bg-gray-50">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toolDetail.length > 0 ? (
                      toolDetail.map((item, idx) => (
                        console.log(item),
                        <TableRow key={idx}>
                          <TableCell>{item.IdTools}</TableCell>
                          <TableCell>{item.NamaTools}</TableCell>
                          <TableCell className="text-center">{item.Size}</TableCell>
                          <TableCell className="text-center">{item.Qty}</TableCell>
                          <TableCell>{item.Remarks}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No details found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {activationTools.length} activation requests
      </div>
    </div>
  );
}
