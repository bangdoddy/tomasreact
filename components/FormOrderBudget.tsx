import { useState } from 'react';
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

interface OrderBudget {
  id: string;
  orderNumber: string;
  orderDate: string;
  department: string;
  requestedBy: string;
  description: string;
  category: 'Tools' | 'Equipment' | 'Materials' | 'Services';
  budgetAllocated: number;
  budgetUsed: number;
  status: 'Pending' | 'Approved' | 'Processing' | 'Completed' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
}

export default function FormOrderBudget() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const [orders, setOrders] = useState<OrderBudget[]>([
    {
      id: 'ORD-001',
      orderNumber: 'ORD/2024/12/001',
      orderDate: '2024-12-10',
      department: 'Operations',
      requestedBy: 'John Doe',
      description: 'Heavy equipment purchase',
      category: 'Equipment',
      budgetAllocated: 500000000,
      budgetUsed: 450000000,
      status: 'Processing',
      priority: 'High',
    },
    {
      id: 'ORD-002',
      orderNumber: 'ORD/2024/12/002',
      orderDate: '2024-12-09',
      department: 'Maintenance',
      requestedBy: 'Jane Smith',
      description: 'Replacement tools and spare parts',
      category: 'Tools',
      budgetAllocated: 150000000,
      budgetUsed: 150000000,
      status: 'Completed',
      priority: 'Medium',
    },
    {
      id: 'ORD-003',
      orderNumber: 'ORD/2024/12/003',
      orderDate: '2024-12-11',
      department: 'Engineering',
      requestedBy: 'Bob Johnson',
      description: 'Construction materials for site expansion',
      category: 'Materials',
      budgetAllocated: 800000000,
      budgetUsed: 0,
      status: 'Pending',
      priority: 'High',
    },
    {
      id: 'ORD-004',
      orderNumber: 'ORD/2024/12/004',
      orderDate: '2024-12-08',
      department: 'Safety',
      requestedBy: 'Sarah Wilson',
      description: 'Safety equipment maintenance services',
      category: 'Services',
      budgetAllocated: 75000000,
      budgetUsed: 0,
      status: 'Approved',
      priority: 'Medium',
    },
    {
      id: 'ORD-005',
      orderNumber: 'ORD/2024/12/005',
      orderDate: '2024-12-07',
      department: 'Operations',
      requestedBy: 'Mike Brown',
      description: 'Fuel storage equipment upgrade',
      category: 'Equipment',
      budgetAllocated: 300000000,
      budgetUsed: 0,
      status: 'Rejected',
      priority: 'Low',
    },
  ]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || order.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
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

  const stats = {
    totalOrders: orders.length,
    totalBudgetAllocated: orders.reduce((sum, o) => sum + o.budgetAllocated, 0),
    totalBudgetUsed: orders.reduce((sum, o) => sum + o.budgetUsed, 0),
    pending: orders.filter((o) => o.status === 'Pending').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    completed: orders.filter((o) => o.status === 'Completed').length,
  };

  const budgetRemaining = stats.totalBudgetAllocated - stats.totalBudgetUsed;
  const percentageUsed = stats.totalBudgetAllocated > 0 
    ? ((stats.totalBudgetUsed / stats.totalBudgetAllocated) * 100).toFixed(1) 
    : '0.0';

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
            className="border-gray-300 hover:bg-gray-50"
            onClick={() => toast.success('Report exported successfully!')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20">
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
              </div>
              <p className="text-xs text-gray-500 mt-1">IDR</p>
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
              </div>
              <p className="text-xs text-gray-500 mt-1">{percentageUsed}% utilized</p>
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
              </div>
              <p className="text-xs text-gray-500 mt-1">IDR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-yellow-200">
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

        <Card className="border-purple-200">
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

        <Card className="border-green-200">
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number, description, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
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
              <SelectTrigger className="w-full sm:w-48">
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
        </CardContent>
      </Card>

      {/* Order Budget Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Order Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Budget Allocated</TableHead>
                  <TableHead>Budget Used</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Priority</TableHead>
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
                      order.budgetAllocated,
                      order.budgetUsed
                    );
                    const percentUsed = calculatePercentageUsed(
                      order.budgetAllocated,
                      order.budgetUsed
                    );

                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="text-[#009999]">{order.orderNumber}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{order.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {order.requestedBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={order.description}>
                            {order.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`w-fit ${getCategoryColor(order.category)}`}>
                            {order.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatCurrency(order.budgetAllocated)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {formatCurrency(order.budgetUsed)}
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
                          <Badge className={`w-fit ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`flex items-center gap-1 w-fit ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
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
                              onClick={() => handleDelete(order.id)}
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
    </div>
  );
}
