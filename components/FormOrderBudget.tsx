import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from './ui/dialog';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel, OrderBudget } from "../model/Models";
import { API } from '../config';

// interface OrderBudget {
//   id: string;
//   orderNumber: string;
//   orderDate: string;
//   department: string;
//   requestedBy: string;
//   description: string;
//   category: 'Tools' | 'Equipment' | 'Materials' | 'Services';
//   budgetAllocated: number;
//   budgetUsed: number;
//   status: 'Pending' | 'Approved' | 'Processing' | 'Completed' | 'Rejected';
//   priority: 'High' | 'Medium' | 'Low';
// }

interface OrderItem {
  ToolId: string;
  Qty: string;
  Brand: string;
  StatusCapex: string;
  Reason: string;
  Spesifikasi: string;
}

export default function FormOrderBudget() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [orders, setOrders] = useState<OrderBudget[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editingItem, setEditingItem] = useState<OrderBudget | null>(null);
  const [formData, setFormData] = useState({
    OrderNo: 'Auto Generated',
    Jobsite: '',
    Location: '',
    Allocated: '0',
    UsedAmount: '0'
  });

  const ReloadOrders = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
    });
    fetch(API.ORDERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OrderBudget[]) => { setOrders(json); console.log(json); })
      .catch((error) => console.error("Error:", error));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderno.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || order.StOrder === filterStatus;
    // const matchesCategory = filterCategory === 'All' || order.category === filterCategory;

    return matchesSearch && matchesStatus;// && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Approved':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Processing':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Approved':
      case 'Processing':
        return <CheckCircle className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tools':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Equipment':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Materials':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Services':
        return 'bg-orange-100 text-orange-700 border-orange-300';
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

  const calculateBudgetRemaining = (allocated: number, used: number) => {
    return allocated - used;
  };

  const calculatePercentageUsed = (allocated: number, used: number) => {
    return allocated > 0 ? ((used / allocated) * 100).toFixed(1) : '0.0';
  };

  const handleDelete = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
    toast.success('Order budget deleted successfully!');
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

  const stats = {
    totalOrders: orders.length,
    totalBudgetAllocated: orders.reduce((sum, o) => sum + Number(o.Allocated), 0),
    totalBudgetUsed: orders.reduce((sum, o) => sum + Number(o.UsedAmount), 0),
    pending: orders.filter((o) => o.StOrder === 'Pending').length,
    processing: orders.filter((o) => o.StOrder === 'Processing').length,
    completed: orders.filter((o) => o.StOrder === 'Completed').length,
  };

  const budgetRemaining = stats.totalBudgetAllocated - stats.totalBudgetUsed;
  const percentageUsed = stats.totalBudgetAllocated > 0
    ? ((stats.totalBudgetUsed / stats.totalBudgetAllocated) * 100).toFixed(1)
    : '0.0';

  const handleSave = async () => {
    // if (!formData.OrderNo || !formData.Jobsite || !formData.Allocated) {
    //   toast.error('Please fill in all required fields');
    //   return;
    // }
    setFormData({ ...formData, Allocated: "10000", UsedAmount: "5000" });
    try {
      const response = await fetch(API.ORDERTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingItem ? "UPDATE" : "INSERT"),
          jobsite: currentUser?.Jobsite,
          nrpUser: currentUser?.Nrp,
          orderNo: formData.OrderNo,
          location: currentUser?.Workgroup,
          Allocated: formData.Allocated,
          UsedAmount: formData.UsedAmount
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
          setEditingItem(null);
          setIsAddDialogOpen(false);
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

  useEffect(() => {
    ReloadOrders();
  }, []);

  const currentDate = new Date();
  const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-[#009999]" />
            Form Order Budget
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage budget orders and track allocation
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10"
            onClick={() => toast.success('Report exported successfully!')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button
            className="bg-[#009999] hover:bg-[#008080] text-white"
            onClick={() => {
              setIsAddDialogOpen(true);
            }
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.totalOrders}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <FileText className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Budget Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-lg text-gray-900">
                {formatCurrency(stats.totalBudgetAllocated).replace('Rp', '').trim()}
                <span className="text-xs text-gray-500 mt-1 ml-2">IDR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Budget Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-lg text-purple-600">
                {formatCurrency(stats.totalBudgetUsed).replace('Rp', '').trim()}
                <span className="text-xs text-gray-500 mt-1 ml-2">{percentageUsed}% utilized</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Budget Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-lg text-green-600">
                {formatCurrency(budgetRemaining).replace('Rp', '').trim()}
                <span className="text-xs text-gray-500 mt-1 ml-2">IDR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-yellow-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending Orders</CardTitle>
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

        <Card className="border-purple-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Processing Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-purple-600">{stats.processing}</div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.completed}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by requestor or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-400"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-white border-gray-400 hidden">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Tools">Tools</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Materials">Materials</SelectItem>
            <SelectItem value="Services">Services</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48 bg-white border-gray-400">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Budget Allocated</TableHead>
                  <TableHead>Budget Used</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      No order budgets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const remaining = calculateBudgetRemaining(
                      Number(order.Allocated),
                      Number(order.UsedAmount)
                    );
                    const percentUsed = calculatePercentageUsed(
                      Number(order.Allocated),
                      Number(order.UsedAmount)
                    );

                    return (
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
                          <div className="max-w-xs truncate" title="Description">
                            {order.remark}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm">
                            {formatCurrency(Number(order.Allocated))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {formatCurrency(Number(order.UsedAmount))}
                            </span>
                            <span className="text-xs text-gray-500">{percentUsed}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(remaining)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`flex items-center gap-1 w-fit ${getStatusColor(
                              order.StOrder
                            )}`}
                          >
                            {getStatusIcon(order.StOrder)}
                            {order.StOrder}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-yellow-50 hover:text-yellow-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                              onClick={() => handleDelete(order.orderNo)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredOrders.length} of {orders.length} order budgets
      </div>

      {/* Dialog add new order */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>New Request Order</DialogTitle>
            <DialogDescription>
              This order generate from CAPEX / OPEX budgeting
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Record No.</p>
              <p className="text-sm font-medium text-[#009999]">{formData.OrderNo}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Create Date</p>
              <p className="text-sm font-medium font-bold">{formattedDate}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Budget</p>
              <p className="text-sm font-medium font-bold">{0}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Jobsite</p>
              <p className="text-sm font-medium font-bold">{currentUser?.Jobsite}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
              <p className="text-sm font-medium font-bold">{currentUser?.Workgroup}</p>
            </div>

          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <Table className="text-xs">
                  <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                    <TableRow>
                      {/* <TableHead className="bg-gray-50">Tools ID</TableHead> */}
                      <TableHead className="bg-gray-50">Description</TableHead>
                      <TableHead className="bg-gray-50 text-center">Part No</TableHead>
                      <TableHead className="bg-gray-50 text-center">Brand</TableHead>
                      <TableHead className="bg-gray-50 text-center">Specification</TableHead>
                      <TableHead className="bg-gray-50 text-center">OPEX/CAPEX</TableHead>
                      <TableHead className="bg-gray-50 text-center">Qty</TableHead>
                      <TableHead className="bg-gray-50 text-center">Reason</TableHead>
                      <TableHead className="bg-gray-50">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* {toolDetail.length > 0 ? (
                                  toolDetail.map((item, idx) => (
                                    console.log(item), */}
                    <TableRow>
                      <TableCell>{ }</TableCell>
                      <TableCell>{ }</TableCell>
                      <TableCell className="text-center">{ }</TableCell>
                      <TableCell className="text-center">{ }</TableCell>
                      <TableCell>{ }</TableCell>
                      <TableCell>{ }</TableCell>
                      <TableCell>{ }</TableCell>
                      <TableCell>{ }</TableCell>
                    </TableRow>
                    {/* ))
                                ) : ( */}
                    {/* <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                      No details found
                                    </TableCell>
                                  </TableRow> */}
                    {/* )} */}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="bg-[#009999] hover:bg-[#007777] text-white" onClick={handleSave}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
