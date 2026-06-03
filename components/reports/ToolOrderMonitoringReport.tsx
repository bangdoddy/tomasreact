import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
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


export default function ToolOrderMonitoringReport() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<OrderHeader[]>([]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.StApprove === 'Pending').length,
    processing: requests.filter((r) => r.StApprove === 'Waiting').length,
    completed: requests.filter((r) => r.StApprove === 'Approved').length,
    rejected: requests.filter((r) => r.StApprove === 'Rejected').length,
  };

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

    XLSX.writeFile(workbook, `TRF_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  useEffect(() => {
    ReloadOrders();
  }, []);

  const filteredRequests = requests.filter((order) => {
    const matchesSearch =
      order.orderno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.remark && order.remark.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-[#009999]" />
            Tool Order Monitoring Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Monitor tool order budget and status</p>
        </div>
        <div className="flex gap-2 p-2">
          <Button variant="outline"
            className="hidden border-[#009999] text-[#009999] hover:bg-[#009999]/10"
            onClick={() => toast.success('Report exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="border-[#009999] text-[#009999] hover:bg-[#009999]/10"
            variant={"outline"}
            onClick={() => exportToExcel()}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-yellow-600">{stats.pending}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1 hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Processing</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-blue-600">{stats.processing}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-green-600">{stats.completed}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1 hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-red-600">{stats.rejected}</div></CardContent>
        </Card>
      </div>

      <div className="relative p-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white border-gray-400" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Order Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Budget Approved</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((order) => (
                    <TableRow key={order.orderno} className="hover:bg-gray-50 text-xs">
                      <TableCell className="text-[#009999]">{order.orderno}</TableCell>
                      <TableCell>{order.remark}</TableCell>
                      <TableCell>{formatDate(order.orderdate)}</TableCell>
                      <TableCell>{(order as any).TotalCost ? formatCurrency(Number((order as any).TotalCost)) : '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`w-fit ${getStatusColor(order.StApprove || '')}`}>
                          {order.StApprove}
                        </Badge>
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
        Showing {filteredRequests.length} of {requests.length} orders
      </div>
    </div>
  );
}
