import { useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [filterType, setFilterType] = useState('All');

  const [requests, setRequests] = useState<TRFRequest[]>([
    {
      id: 'TRF-001',
      trfNumber: 'TRF/2024/12/001',
      requestedBy: 'John Doe',
      requestDate: '2024-12-10',
      transferType: 'Inter-Location',
      fromLocation: 'Warehouse A',
      toLocation: 'Site B',
      toolId: 'TL-0156',
      toolName: 'Hydraulic Jack',
      quantity: 3,
      reason: 'Required for maintenance at Site B',
      status: 'Pending',
      urgency: 'Urgent',
    },
    {
      id: 'TRF-002',
      trfNumber: 'TRF/2024/12/002',
      requestedBy: 'Jane Smith',
      requestDate: '2024-12-09',
      transferType: 'Inter-Department',
      fromLocation: 'Operations',
      toLocation: 'Maintenance',
      toolId: 'TL-0178',
      toolName: 'Digital Multimeter',
      quantity: 5,
      reason: 'Equipment testing requirements',
      status: 'Pending',
      urgency: 'Normal',
    },
    {
      id: 'TRF-003',
      trfNumber: 'TRF/2024/12/003',
      requestedBy: 'Bob Johnson',
      requestDate: '2024-12-08',
      transferType: 'Return',
      fromLocation: 'Site C',
      toLocation: 'Warehouse A',
      toolId: 'TL-0189',
      toolName: 'Welding Machine',
      quantity: 2,
      reason: 'Project completed',
      status: 'Pending',
      urgency: 'Low',
    },
    {
      id: 'TRF-004',
      trfNumber: 'TRF/2024/12/004',
      requestedBy: 'Sarah Wilson',
      requestDate: '2024-12-07',
      transferType: 'Inter-Location',
      fromLocation: 'Workshop B',
      toLocation: 'Site A',
      toolId: 'TL-0145',
      toolName: 'Impact Driver Set',
      quantity: 4,
      reason: 'New project requirements',
      status: 'Approved',
      urgency: 'Normal',
    },
    {
      id: 'TRF-005',
      trfNumber: 'TRF/2024/12/005',
      requestedBy: 'Mike Brown',
      requestDate: '2024-12-06',
      transferType: 'Inter-Department',
      fromLocation: 'Engineering',
      toLocation: 'Quality Control',
      toolId: 'TL-0167',
      toolName: 'Laser Level',
      quantity: 2,
      reason: 'Quality inspection tasks',
      status: 'Rejected',
      urgency: 'Low',
    },
  ]);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.trfNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.toLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    const matchesType = filterType === 'All' || req.transferType === filterType;

    return matchesSearch && matchesStatus && matchesType;
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

  const handleApprove = (id: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Approved' as const } : r))
    );
    toast.success('TRF request approved!');
  };

  const handleReject = (id: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Rejected' as const } : r))
    );
    toast.error('TRF request rejected');
  };

  const stats = {
    pending: requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    rejected: requests.filter((r) => r.status === 'Rejected').length,
    total: requests.length,
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

        <Card className="border-yellow-200">
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
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by TRF number, tool, requester, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
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

      {/* TRF Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>TRF Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No TRF requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{request.trfNumber}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getTypeColor(request.transferType)}`}>
                          {request.transferType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm">{request.toolName}</div>
                            <div className="text-xs text-gray-500">{request.toolId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{request.fromLocation}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{request.toLocation}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {request.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {request.requestedBy}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getStatusColor(request.status)}`}>
                          {request.status}
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
                          {request.status === 'Pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                title="Approve"
                                onClick={() => handleApprove(request.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                title="Reject"
                                onClick={() => handleReject(request.id)}
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
