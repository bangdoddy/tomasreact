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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel, OrderBudget } from "../../model/Models";
import { API } from '../../config';

interface OrderItem {
  orderno: string;
  OrderDate: string;
  jobsite: string;
  ToolsId: string;
  PicTool: string;
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

}

interface TRFRequest {
  id: string;
  trfNumber: string;
  requestedBy: string;
  requestDate: string;
  transferType: 'Inter-Location' | 'Inter-Department' | 'Return';
  fromLocation: string;
  toLocation: string;
  toolId: string;
  toolName: string;
  quantity: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  urgency: 'Urgent' | 'Normal' | 'Low';
}

export default function TRFApproval() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [filterType, setFilterType] = useState('All');

  const [requests, setRequests] = useState<OrderItem[]>([]);

  const ReloadOrders = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,

    });
    fetch(API.ORDERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OrderItem[]) => { setRequests(json); console.log('Order items: ', json); })
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

  const handleApprove = (orderno: string) => {
    setRequests(
      requests.map((r) => (r.orderno === orderno ? { ...r, StOrder: 'Approved' } : r))
    );
    toast.success('TRF request approved!');
  };

  const handleReject = (orderno: string) => {
    setRequests(
      requests.map((r) => (r.orderno === orderno ? { ...r, StOrder: 'Rejected' } : r))
    );
    toast.error('TRF request rejected');
  };

  const stats = {
    pending: requests.filter((r) => r.StOrder === 'Pending').length,
    approved: requests.filter((r) => r.StOrder === 'Approved').length,
    rejected: requests.filter((r) => r.StOrder === 'Rejected').length,
    total: requests.length,
  };

  useEffect(() => {
    ReloadOrders();
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
    <div className="space-y-6">
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

        <Button
          variant="outline"
          className="border-gray-300 hover:bg-gray-50"
          onClick={() => toast.success('Report exported successfully!')}
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

        <Card className="shadow-md p-1">
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

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:border-primary">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Inter-Location">Inter-Location</SelectItem>
            <SelectItem value="Inter-Department">Inter-Department</SelectItem>
            <SelectItem value="Return">Return</SelectItem>
          </SelectContent>
        </Select>

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
                  <TableHead>Tools ID</TableHead>
                  <TableHead>Tools Desc</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableRow key={order.ToolsId} className="text-xs hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{order.orderno}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {formatDate(order.OrderDate)}
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
                        <div className="max-w-xs truncate" title="Tools ID">
                          {order.ToolsId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title="Tools Desc">
                          {order.ToolsDescription}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title="Specification">
                          {order.Spesifikasi}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-xs truncate" title="Cost">
                          {formatCurrency(Number(order.ToolsCost))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title="Quantity">
                          {order.Qty}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title="Reason">
                          {order.Reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 w-fit ${getStatusColor(
                            order.StApprove
                          )}`}
                        >
                          {getStatusIcon(order.StApprove)}
                          {order.StApprove}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {order.StOrder === 'Pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                title="Approve"
                                onClick={() => handleApprove(order.orderno)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                title="Reject"
                                onClick={() => handleReject(order.orderno)}
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
        Showing {filteredRequests.length} of {requests.length} TRF requests
      </div>
    </div>
  );
}
