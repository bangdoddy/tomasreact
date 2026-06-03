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
  FileText,
  Wrench,
  ArrowRightLeft,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel, OrderBudget } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface OrderHeader {
  orderno: string;
  orderdate: string;
  jobsite: string;
  PicTool: string;
  location: string;
  ApproveByPic: string;
  ApproveBySH: string;
  ApprovedDateByPic: string;
  ApprovedDateBySH: string;
  remark: string;
  StUser: string;
  StApprove: string;
  TotalCost: string;
}

interface OrderItem {
  orderno: string;
  OrderDate: string;
  jobsite: string;
  ToolsId: string;
  PicTool: string;
  NrpUser: string;
  ToolsDescription: string;
  Brand: string;
  Spesifikasi: string;
  Qty: string;
  Category: string;
  ToolsCost: string;
  statusCapex: string;
  Reason: string;
  StOrder: string;
  PR_date?: string;
  PR_no?: string;
  StApprove?: string;
  PO_date?: string;
  PO_no?: string;
  Supplier?: string;
  Est_date?: string;
  Note?: string;
  Act_date?: string;
  IsClose?: string;
  StUser?: string;
}

export default function TRFApproval() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const [requests, setRequests] = useState<OrderHeader[]>([]);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [orderToApprove, setOrderToApprove] = useState<OrderHeader | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState<OrderHeader | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHeader | null>(null);
  const [orderDetailList, setOrderDetailList] = useState<OrderItem[]>([]);

  const ReloadOrders = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      nrp: currentUser?.Nrp,
      act: 'LISTAPPROVAL'
    });
    fetch(API.ORDERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OrderHeader[]) => { setRequests(json); console.log('Order items: ', json); })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadOrderItems = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
    });
    fetch(API.ORDERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OrderItem[]) => { setOrderDetailList(json); })
      .catch((error) => console.error("Error:", error));
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredRequests = requests.filter((order) => {
    const matchesSearch =
      order.orderno.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || order.StApprove === filterStatus;
    // const matchesCategory = filterCategory === 'All' || order.category === filterCategory;

    return matchesSearch && matchesStatus;// && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Waiting':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Approved':
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Inter-Location':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Inter-Department':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Return':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleApprove = async (order: any) => {
    try {
      const response = await fetch(API.ORDERTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "APPROVE",
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          OrderNo: order.orderno,
          Role: order.StUser,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadOrders();
          toast.success(resData?.Message ?? 'successfully');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Respont");
      }
    } catch (ex: any) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const confirmApprove = () => {
    if (orderToApprove) {
      handleApprove(orderToApprove);
      setIsApproveDialogOpen(false);
      setOrderToApprove(null);
    }
  };

  const confirmReject = () => {
    if (orderToReject) {
      handleReject(orderToReject);
      setIsRejectDialogOpen(false);
      setOrderToReject(null);
    }
  };

  const openDetail = (order: OrderHeader) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handlePrint = (order: OrderHeader) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleReject = async (order: any) => {
    try {
      const response = await fetch(API.ORDERTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "REJECT",
          OrderNo: order.orderno
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadOrders();
          toast.success(resData?.Message ?? 'successfully');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Response");
      }
    } catch (ex: any) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const stats = {
    pending: requests.filter((r) => r.StApprove === 'Pending').length,
    approved: requests.filter((r) => r.StApprove === 'Approved').length,
    rejected: requests.filter((r) => r.StApprove === 'Rejected').length,
    total: requests.length,
  };

  const selectedOrderDetails = orderDetailList.filter(
    (item) => item.orderno === selectedOrder?.orderno
  );

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        jobsite: currentUser?.Jobsite || '',
        nrp: currentUser?.Nrp || '',
        act: 'LISTAPPROVAL'
      });
      const url = `${API.ORDERTOOLS()}?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
        return;
      }

      let data;
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
      const itemDownload = (data as OrderHeader[])
      if (Array.isArray(data) && data.length > 0) {
        saveToExcel(data);
      } else if (data && typeof data === "object" && Array.isArray(data.data)) {
        if (data.items.length > 0) {
          saveToExcel(data.data);
        } else {
          toast.error("Failed, No Response");
          return;
        }
      } else {
        toast.error("Failed, No Response");
        return;
      }
    } catch (ex) {
      const message = ex?.message ?? String(ex);
      toast.error("Failed. Message: " + message);
      return;
    }
  };

  const saveToExcel = (data: OrderHeader[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Order No.': tool.orderno,
        'Tools Jobsite': tool.jobsite,
        'Order Date': formatDate(tool.orderdate),
        'Request By': tool.PicTool,
        'Cost': tool.TotalCost,
        'Remark': tool.remark,
        'Status Approval': tool.StApprove,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `TRF_Approval_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  useEffect(() => {
    ReloadOrders();
    ReloadOrderItems();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'PR':
      case 'PO':
        return <CheckCircle className="h-4 w-4" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .print-only {
          display: none;
        }
        @media print {
          /* Hide EVERYTHING in the DOM */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the print container and its contents */
          .print-only, .print-only * {
            visibility: visible !important;
          }
          /* Position the print container at the top left of the page */
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          @page {
            size: landscape;
            margin: 15mm;
          }
        }
      `}</style>
      <div className="space-y-6 screen-only">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-gray-900 flex items-center gap-2">
              <ArrowRightLeft className="h-7 w-7 text-[#009999]" />
              TRF Approval
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve Tool Request Form (TRF) transfer requests
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#009999] text-[#009999] hover:bg-[#009999]/10"
              onClick={() => exportToExcel()}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-[#009999]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl text-gray-900">{stats.total}</div>
                <div className="p-2 bg-[#009999]/10 rounded-lg">
                  <ArrowRightLeft className="h-5 w-5 text-[#009999]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md p-1">
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

          <Card className="shadow-md p-1">
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

          <Card className="shadow-md p-1 hidden">
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by TRF number, tool, requester, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-0"
            />
          </div>

          {/* <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:border-primary">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Inter-Location">Inter-Location</SelectItem>
            <SelectItem value="Inter-Department">Inter-Department</SelectItem>
            <SelectItem value="Return">Return</SelectItem>
          </SelectContent>
        </Select> */}

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:border-primary">
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


        {/* Order Budget Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Order Number</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Jobsite</TableHead>
                    {/* <TableHead>Tools ID</TableHead>
                    <TableHead>Tools Desc</TableHead>
                    <TableHead>Specification</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason</TableHead> */}
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                        No order budgets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((order) => (
                      <TableRow key={order.orderno} className="text-xs hover:bg-gray-50">
                        <TableCell>
                          <span className="text-[#009999]">{order.orderno}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatDate(order.orderdate)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {order.PicTool}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title="Jobsite">
                            {order.jobsite}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title="TotalCost">
                            {formatCurrency(Number(order.TotalCost))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title="Reason">
                            {order.remark}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`flex items-center gap-1 w-fit ${getStatusColor(
                              order.StApprove || ''
                            )}`}
                          >
                            {getStatusIcon(order.StApprove || '')}
                            {order.StApprove}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              title="View Details"
                              onClick={() => openDetail(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-[#009999]/10 hover:text-[#009999]"
                              title="Print to PDF"
                              onClick={() => handlePrint(order)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {order.StApprove === 'Pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                  title="Approve"
                                  onClick={() => {
                                    setOrderToApprove(order);
                                    setIsApproveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                {order.PicTool != currentUser?.Nama && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                    title="Reject"
                                    onClick={() => {
                                      setOrderToReject(order);
                                      setIsRejectDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
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
          Showing {filteredRequests.length} of {requests.length} TRF requests
        </div>

        {/* Confirm Approval Dialog */}
        <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this order request ? This action will approve the request and update the status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsApproveDialogOpen(false);
                setOrderToApprove(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmApprove}
                className="bg-[#009999] hover:bg-[#008080] text-white"
              >
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirm Rejection Dialog */}
        <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this order request? This action will reject the request and update the status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsRejectDialogOpen(false);
                setOrderToReject(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmReject}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Details Dialog Modal */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[750px]">
            <DialogHeader>
              <DialogTitle>Order Request Details</DialogTitle>
              <DialogDescription>Show detailed order items information</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Order Number</p>
                <p className="text-sm font-medium text-[#009999]">{selectedOrder?.orderno}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Requester</p>
                <p className="text-sm font-medium font-bold text-gray-900">{selectedOrder?.PicTool}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Request  Date</p>
                <p className="text-sm font-medium font-bold text-gray-900">
                  {selectedOrder?.orderdate ? formatDate(selectedOrder.orderdate) : '-'}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="bg-gray-50">Tools ID</TableHead>
                        <TableHead className="bg-gray-50">Description</TableHead>
                        <TableHead className="bg-gray-50">Specification</TableHead>
                        <TableHead className="bg-gray-50 text-center">Cost</TableHead>
                        <TableHead className="bg-gray-50 text-center">Qty</TableHead>
                        <TableHead className="bg-gray-50">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrderDetails.length > 0 ? (
                        selectedOrderDetails.map((item, idx) => (
                          <TableRow key={item.ToolsId}>
                            <TableCell>{item.ToolsId}</TableCell>
                            <TableCell>{item.ToolsDescription}</TableCell>
                            <TableCell>{item.Spesifikasi}</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(item.ToolsCost))}</TableCell>
                            <TableCell className="text-center">{item.Qty}</TableCell>
                            <TableCell>{item.Reason}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
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
      </div>

      {/* Print-only Layout */}
      <div className="print-only p-8 space-y-8 bg-white text-black">
        {/* Print Header Table */}
        <table className="w-full border border-black border-collapse text-[10px] uppercase mb-6">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-1 px-2 font-semibold w-[10%] border-r border-black">NUMBER</td>
              <td className="p-1 px-2 w-[20%] border-r border-black">{selectedOrder?.orderno || ''}</td>
              <td rowSpan={3} className="p-4 text-center align-middle font-bold text-sm border-r border-black w-[40%]">
                TOOLS & FACILITY REQUISITION FORM
              </td>
              <td className="p-1 px-2 font-semibold w-[15%] border-r border-black">CREATION DATE</td>
              <td className="p-1 px-2 w-[15%]">{selectedOrder?.orderdate ? formatDate(selectedOrder.orderdate) : ''}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1 px-2 font-semibold border-r border-black">JOB SITE</td>
              <td className="p-1 px-2 border-r border-black">{selectedOrder?.jobsite || ''}</td>

            </tr>
            <tr>
              <td className="p-1 px-2 font-semibold border-r border-black">SECTION</td>
              <td className="p-1 px-2 border-r border-black">{selectedOrder?.location || 'PLANT TIRE'}</td>

            </tr>
          </tbody>
        </table>

        {/* Print Table */}
        <table className="w-full border-collapse border border-gray-400 text-xs text-left">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-400">
              <th className="p-2 border border-gray-400 font-bold text-center">Tools ID</th>
              <th className="p-2 border border-gray-400 font-bold text-center">Tools Desc</th>
              <th className="p-2 border border-gray-400 font-bold text-center">Specification</th>
              <th className="p-2 border border-gray-400 font-bold text-center">Cost</th>
              <th className="p-2 border border-gray-400 font-bold text-center">Qty</th>
              <th className="p-2 border border-gray-400 font-bold text-center">Reason</th>
            </tr>
          </thead>
          <tbody>
            {selectedOrderDetails.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500 border border-gray-400">
                  No order budgets found
                </td>
              </tr>
            ) : (
              selectedOrderDetails.map((order) => (
                <tr key={order.ToolsId} className="border-b border-gray-400">
                  <td className="p-2 border border-gray-400">{order.ToolsId}</td>
                  <td className="p-2 border border-gray-400">{order.ToolsDescription}</td>
                  <td className="p-2 border border-gray-400">{order.Spesifikasi}</td>
                  <td className="p-2 border border-gray-400 text-right">{formatCurrency(Number(order.ToolsCost))}</td>
                  <td className="p-2 border border-gray-400 text-center">{order.Qty}</td>
                  <td className="p-2 border border-gray-400">{order.Reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Signature Boxes in Footer */}
        <div className="pt-12 grid grid-cols-3 gap-4 text-sm font-semibold">
          <div className="flex flex-col">
            <p className="mb-16">Approved by PIC</p>
            <div className="w-48 border-b border-black">
              <div className="p-1 h-20 w-20">
                {selectedOrder?.ApproveByPic && (
                  <img src="../src/assets/approved_mark.png" alt="Pic sign" />
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">(PIC Tools)</p>
          </div>
          <div className="flex flex-col">
            <p className="mb-16">Approved by Section Head</p>
            <div className="w-48 border-b border-black">
              <div className="p-1 h-20 w-20">
                {selectedOrder?.ApproveBySH && (
                  <img src="../src/assets/approved_mark.png" alt="Pic sign" />
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">(Section Head)</p>
          </div>
          <div className="flex flex-col">
            <p className="mb-16">Approved by Chief Operation</p>
            <div className="w-48 border-b border-black">
              <div className="p-1 h-15 w-15"></div>
            </div>
            <p className="mt-2 text-xs text-gray-600">(Agus Harsanto)</p>
          </div>
        </div>
      </div>
    </>
  );
}
