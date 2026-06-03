import { useState, useEffect, forwardRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  Truck,
  Trash
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
import * as XLSX from 'xlsx';
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
  StatusPR?: string;
  StatusPO?: string;
  Supplier?: string;
  Est_date?: string;
  Note?: string;
  Act_date?: string;
  IsClose?: string;

}

interface CapexItem {
  IdKey: string;
  ToolsJobsite: string;
  ToolsId: string;
  ToolsDescription: string;
  ToolsBrand: string;
  ToolsSize: string;
  ToolsQty: string;
  ToolsExisting: string;
  ToolsDeviasi: string;
  ToolsCost: string;
  StatusCapex: string;
  Category: string;
  ToolsPN: string;
  ToolsKlasifikasi: string;
  ToolsYear: string;
  Remarks: string;
  IsFinal: string;
  StOrder: string;
  Allocated: string;
  Reason?: string;
  NrpUser?: string;
}

const CustomDateInput = forwardRef(({ value, onClick, className }: any, ref: any) => (
  <div className="relative w-full">
    <Input
      value={value}
      onClick={onClick}
      ref={ref}
      className={className}
      readOnly
      placeholder="dd-MM-yyyy"
    />
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
  </div>
));

const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateToYMD = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function FormOrderBudget() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [orders, setOrders] = useState<OrderBudget[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [capexList, setCapexList] = useState<CapexItem[]>([]);
  const [Budget, setBudget] = useState<OrderBudget[]>([]);
  const [editingItem, setEditingItem] = useState<OrderBudget | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [orderDetailList, setOrderDetailList] = useState<any[]>([]);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  // const [editingOrderItem, setEditingOrderItem] = useState<any | null>(null);
  const [statusOrder, setStatusOrder] = useState<GlobalModel[]>([]);
  const [newItem, setNewItem] = useState<CapexItem[]>([]);
  const [formData, setFormData] = useState({
    OrderNo: '',
    ToolsId: '',
    Jobsite: '',
    Description: '',
    Brand: '0',
    Size: '0',
    Qty: '',
    Cost: '',
    Reason: '',
    Source: '',
    Year: ''
  });

  const [editingOrderItem, setEditingOrderItem] = useState({
    OrderNo: '',
    ToolsId: '',
    PR_date: '',
    PR_no: '',
    PO_date: '',
    PO_no: '',
    Supplier: '',
    Est_date: '',
    Note: '',
    Act_date: '',
    IsClose: '0',
    Status: '',
    StatusPR: '',
    StatusPO: '',
  })

  const ReloadBudget = (year: string) => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      Year: year
    });
    fetch(API.CAPEX() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OrderBudget[]) => { setBudget(json); console.log(json); })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadOrderHeader = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "HEADER",
    });
    fetch(API.ORDERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OrderBudget[]) => { setOrders(json); console.log(json); })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadOrders = () => {
    const params = new URLSearchParams({
      jobsite: currentUser?.Jobsite || '',
      nrpUser: currentUser?.Nrp || '',
    });
    fetch(API.ORDERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OrderItem[]) => { setOrderItems(json); console.log('Order items: ', json); })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadCapex = (yearVal?: string) => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "GETCAPEX",
      year: yearVal || formData.Year,
    });
    fetch(API.CAPEX() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: CapexItem[]) => {
        setCapexList(json);
        // console.log(json);
        const items: CapexItem[] = json.map((item: any) => ({
          IdKey: item.IdKey || '',
          ToolsJobsite: item.ToolsJobsite || '',
          ToolsId: item.ToolsId || '',
          ToolsDescription: item.ToolsDescription || '',
          ToolsBrand: item.ToolsBrand || '',
          ToolsSize: item.ToolsSize || '',
          ToolsQty: String(item.ToolsQty ?? '0'),
          Category: item.Category || '',
          ToolsCost: String(item.toolsCost ?? item.ToolsCost ?? '0'),
          StatusCapex: item.StatusCapex || '',
          NrpUser: currentUser?.Nrp || '',
        }));
        // setOrderItems(items);
        setNewItem(items);
      })
      .catch((error) => console.error("Error:", error));

    // setFormData({ ...formData, Allocated: allocated });
  };

  const handleUpdateItem = (toolsId: string, field: 'Qty' | 'Reason', val: string) => {
    setCapexList(prev => prev.map(item => {
      if (item.ToolsId === toolsId) {
        return { ...item, [field === 'Qty' ? 'ToolsQty' : 'Reason']: val };
      }
      return item;
    }));
    setNewItem(prev => prev.map(item => {
      if (item.ToolsId === toolsId) {
        return { ...item, [field === 'Qty' ? 'ToolsQty' : 'Reason']: val };
      }
      return item;
    }));
  };

  // const openDetail = (order: OrderItem) => {
  //   setSelectedOrder(order);
  //   const params = new URLSearchParams({
  //     jobsite: currentUser.Jobsite,
  //     nrp: currentUser.Nrp,
  //     act: "DETAIL",
  //     orderno: order.orderno
  //   });
  //   fetch(API.ORDERTOOLS() + `?${params.toString()}`, {
  //     method: "GET"
  //   })
  //     .then((response) => response.json())
  //     .then((json: any[]) => {
  //       setOrderDetailList(json);
  //     })
  //     .catch((error) => console.error("Error:", error));

  //   setIsDetailDialogOpen(true);
  // };

  const ReloadStatusPO = () => {
    const params = new URLSearchParams({
      ShowData: "STATUSPO"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => { setStatusOrder(json); })
      .catch((error) => console.error("Error:", error));
  }

  const openEditItem = (item: OrderItem) => {
    setSelectedOrder(item);

    setEditingOrderItem({
      OrderNo: item.orderno || '-',
      ToolsId: item.ToolsId || (item as any).toolsId || '',
      PR_date: item.PR_date || '',
      PR_no: item.PR_no || '',
      PO_date: item.PO_date || '',
      PO_no: item.PO_no || '',
      Supplier: item.Supplier || '',
      Est_date: item.Est_date || '',
      Note: item.Note || '',
      Act_date: item.Act_date || '',
      IsClose: item.IsClose || '0',
      Status: item.StOrder || '',
      StatusPO: item.StatusPO || '',
      StatusPR: item.StatusPR || '',
    });

    console.log(item);

    setIsEditItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!editingOrderItem) return;

    const updatedDetails = orderDetailList.map(item => {
      const itemOrderNo = item.orderno || item.OrderNo || '';
      const itemToolsId = item.ToolsId || item.toolsId || '';
      const targetOrderNo = editingOrderItem.OrderNo || '';
      const targetToolsId = editingOrderItem.ToolsId || '';

      if (itemOrderNo === targetOrderNo && itemToolsId === targetToolsId) {
        return { ...item, ...editingOrderItem };
      }
      return item;
    });

    setOrderDetailList(updatedDetails);

    try {
      const response = await fetch(API.ORDERTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "UPDATEDETAIL",
          jobsite: currentUser?.Jobsite,
          nrpUser: currentUser?.Nrp,
          OrderNo: selectedOrder?.orderno || editingOrderItem.OrderNo || '',
          ToolId: editingOrderItem.ToolsId || '',
          Status: editingOrderItem.Status,
          PR_date: editingOrderItem.PR_date,
          PR_no: editingOrderItem.PR_no,
          PO_date: editingOrderItem.PO_date,
          PO_no: editingOrderItem.PO_no,
          Est_date: editingOrderItem.Est_date,
          Act_date: editingOrderItem.Act_date,
          Isclose: editingOrderItem.IsClose,
          StatusPR: editingOrderItem.StatusPR,
          StatusPO: editingOrderItem.StatusPO,
          Supplier: editingOrderItem.Supplier,
          // Tools: editingOrderItem
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
        return;
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadOrders();
          setIsEditItemDialogOpen(false);
          toast.success(resData?.Message ?? 'Item updated successfully');
        } else {
          toast.error(resData?.Message ?? "Failed to save");
        }
      } else {
        toast.error("Failed, No Response");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + (ex as any).message);
    }
  };

  const rawAllocated = capexList.map(p => p.Allocated || (p as any).allocated || '0')[0];
  const totalAllocated = String(rawAllocated).replace(/,/g, '');
  // Calculate totals
  const totalRequirement = capexList.reduce((sum, item) => sum + Number(item.ToolsQty || (item as any).toolsQty || 0), 0);
  const totalExisting = capexList.reduce((sum, item) => sum + Number(item.ToolsExisting || (item as any).toolsExisting || 0), 0);
  const totalDeviasi = capexList.reduce((sum, item) => sum + Number(item.ToolsDeviasi || (item as any).toolsDeviasi || 0), 0);
  const totalCost = capexList.reduce((sum, item) => sum + (Number(item.ToolsCost || (item as any).toolsCost || 0) * Number(item.ToolsQty || 0)), 0);


  const filteredOrders = orderItems.filter((order) => {
    const matchesSearch =
      order.orderno.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || order.StOrder === filterStatus;
    // const matchesCategory = filterCategory === 'All' || order.category === filterCategory;

    return matchesSearch && matchesStatus;// && matchesCategory;
  });

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        jobsite: currentUser?.Jobsite || '',
        nrp: currentUser?.Nrp || '',
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
      const itemDownload = (data as OrderItem[])
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

  const saveToExcel = (data: OrderItem[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Tools Jobsite': tool.jobsite,
        'Tools Id': tool.ToolsId,
        'Tools Desc': tool.ToolsDescription,
        'Order Date': formatDate(tool.OrderDate),
        'Request By': tool.PicTool,
        'Tools Category': tool.Category,
        'Specification': tool.Spesifikasi,
        'Cost': tool.ToolsCost,
        'Requirement': tool.Qty,
        'Reason': tool.Reason,
        'Status Order': tool.StOrder,
        'Status Approval': tool.StApprove,
        'PR Date': tool.PR_date,
        'PR No': tool.PR_no,
        'Status PR': tool.StatusPR,
        'PO Date': tool.PO_date,
        'PO No': tool.PO_no,
        'Status PO': tool.StatusPO,
        'Est Date': tool.Est_date,
        'Act Date': tool.Act_date,
        'Supplier': tool.Supplier,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `SmartTomas_TRF_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'PR':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'PO':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Delivered':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

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

  const handleDelete = async (order: OrderItem) => {
    try {
      const response = await fetch(API.ORDERTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          orderno: order?.orderno,
          ToolId: order?.ToolsId
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
          ReloadOrderHeader();
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
      toast.error("Failed. Message: " + (ex as any).message);
    }
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
    totalOrders: orderItems.length,
    totalBudgetAllocated: Budget.filter(b => b.IsFinal == 'Yes').reduce((sum, o) => sum + (Number(o.ToolsCost || 0) * Number(o.ToolsQty)), 0),
    totalBudgetUsed: orderItems.filter(b => b.StOrder === 'Delivered').reduce((sum, o) => sum + (Number(o.ToolsCost || 0)) * Number(o.Qty), 0),
    pending: orderItems.filter((o) => o.StOrder === 'Pending').length,
    processing: orderItems.filter((o) => o.StOrder === 'PR' || o.StOrder === 'PO').length,
    delivered: orderItems.filter((o) => o.StOrder === 'Delivered').length,
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
          location: currentUser?.Workgroup,
          Allocated: totalAllocated,
          UsedAmount: String(totalCost),
          ForYear: formData.Year,
          Remark: currentUser?.Jobsite + ' ' + newItem.map(item => item.StatusCapex)[0] + ' Budget plan ' + formData.Year,
          Tools: newItem.map(item => ({
            ToolsId: item.ToolsId,
            Brand: item.ToolsBrand || '',
            Qty: Number(item.ToolsQty || 0),
            statusCapex: item.StatusCapex || '',
            Reason: item.Reason || formData.Reason || '',
            Spesifikasi: item.ToolsSize || '',
            NrpUser: item.NrpUser || '',
          }))
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
          ReloadOrderHeader();
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
      toast.error("Failed. Message: " + (ex as any).message);
    }
  };

  useEffect(() => {
    ReloadStatusPO();
    ReloadBudget(formData.Year);
    // ReloadOrderHeader();
    ReloadOrders();
  }, []);


  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
            onClick={() => exportToExcel()}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button
            className="bg-[#009999] hover:bg-[#008080] text-white"
            onClick={() => {
              setIsAddDialogOpen(true);
              setCapexList([]);
              // setOrderItems([]);

              setFormData({
                OrderNo: 'Auto Generated',
                Jobsite: '',
                ToolsId: '',
                Description: '',
                Brand: '',
                Size: '',
                Qty: '',
                Cost: '',
                Reason: '',
                Source: '',
                Year: ''
              })
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
                {orderItems.length > 0 ? formatCurrency(stats.totalBudgetAllocated).replace('Rp', '').trim() : 0}
                <span className="text-xs text-gray-500 mt-1 ml-2">IDR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Est. Budget Used</CardTitle>
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
                {orderItems.length > 0 ? formatCurrency(budgetRemaining).replace('Rp', '').trim() : 0}
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
            <CardTitle className="text-sm text-gray-600">Orders Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.delivered}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-5 w-5 text-green-600" />
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
            <SelectItem value="PR">PR</SelectItem>
            <SelectItem value="PO">PO</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
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
                  <TableHead>Tools Category</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status Order</TableHead>
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
                      Number(order.ToolsCost),
                      Number(order.ToolsCost)
                    );
                    const percentUsed = calculatePercentageUsed(
                      Number(order.ToolsCost),
                      Number(order.ToolsCost)
                    );

                    return (
                      <TableRow key={order.ToolsId} className="text-xs hover:bg-gray-50">
                        <TableCell>
                          <span className="text-[#009999]">{order.orderno}</span>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-2">
                            {formatDate(order.OrderDate)}
                          </div>
                        </TableCell>

                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {order.PicTool}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Jobsite">
                            {order.jobsite}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Tools ID">
                            {order.ToolsId}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Tools Desc">
                            {order.ToolsDescription}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Specification">
                            {order.Spesifikasi}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Tools Category">
                            {order.Category}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Cost">
                            {formatCurrency(Number(order.ToolsCost))}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Quantity">
                            {order.Qty}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="max-w-xs truncate" title="Reason">
                            {order.Reason}
                          </div>
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
                            {order.StApprove !== 'Pending' &&
                              (<Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-yellow-50 hover:text-yellow-600"
                                title="Edit"
                                onClick={() => openEditItem(order)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>)}

                            {order.StApprove !== 'Approved' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                title="Remove from list"
                                onClick={() => handleDelete(order)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>)}
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
      <Dialog open={isAddDialogOpen} onOpenChange={(open: any) => {
        setIsAddDialogOpen(open);
        if (!open) {
          setCapexList([]);
          setOrderItems([]);
        }
      }}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>New Request Order</DialogTitle>
            <DialogDescription>
              This order generate from CAPEX / OPEX budgeting
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Record No.</p>
                <p className="text-sm font-medium text-[#009999]">{formData.OrderNo}</p>
              </div>

              <div className="space-y-2">
                <Label>Select Source</Label>
                <Select
                  value={formData.Source}
                  onValueChange={(value) => {
                    setFormData(formData => ({ ...formData, Source: value }));
                    if (value === "CAPEX") {
                      if (formData.Year == "") {
                        return;
                      }
                      ReloadCapex(formData.Year);
                    } else {
                      setCapexList([]);
                      setOrderItems([]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48 bg-white border-gray-400">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAPEX">CAPEX</SelectItem>
                    <SelectItem value="OPEX">OPEX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Year</Label>
                <Select
                  value={formData.Year}
                  onValueChange={(value) => {
                    setFormData(formData => ({ ...formData, Year: value }));

                    if (formData.Source === "CAPEX") {
                      ReloadCapex(value);
                      // setFormData(formData => ({ ...formData, Allocated: allocated }));
                    } else {
                      setCapexList([]);
                      setOrderItems([]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48 bg-white border-gray-400">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Budget Remaining</p>
                <p className="text-lg font-large font-bold text-[#009999]">{
                  capexList.length === 0 ?
                    0 : newItem.length === 0 ? formatIDR(Number(totalAllocated)) : formatIDR(budgetRemaining)

                }
                </p>
              </div>

              {/* <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Jobsite</p>
                <p className="text-sm font-medium font-bold">{currentUser?.Jobsite}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                <p className="text-sm font-medium font-bold">{currentUser?.Workgroup}</p>
              </div> */}
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
                      <TableHead className="bg-gray-50 text-center">Cost</TableHead>
                      <TableHead className="bg-gray-50 text-center">Qty</TableHead>
                      <TableHead className="bg-gray-50 text-center">Reason</TableHead>
                      <TableHead className="bg-gray-50">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capexList.length > 0 ? (
                      capexList.map((item, idx) => {
                        const targetId = item.ToolsId || (item as any).toolsId;
                        const capex = capexList.find(c => (c.ToolsId || (c as any).toolsId) === targetId) || capexList[idx];
                        const orderItem = capexList.find(o => o.ToolsId === targetId);
                        return (
                          <TableRow key={targetId || idx}>
                            <TableCell>{item?.ToolsDescription || (capex as any)?.toolsDescription}</TableCell>
                            <TableCell className="text-center">{item?.ToolsPN || (capex as any)?.toolsPN}</TableCell>
                            <TableCell className="text-center">{item?.ToolsBrand || (capex as any)?.toolsBrand}</TableCell>
                            <TableCell className="text-center">{item?.ToolsSize || (capex as any)?.toolsSize}</TableCell>
                            <TableCell className="text-right">{formatIDR(Number(item?.ToolsCost || (capex as any)?.toolsCost || 0))}</TableCell>
                            <TableCell className="text-center">
                              {/* <Input
                                type="number"
                                value={item.ToolsQty || '0'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateItem(targetId, 'Qty', val);
                                }}
                                className="w-16 text-center h-8 inline-block bg-white border border-slate-300"
                              /> */}
                              <span className="text-center">{item.ToolsQty}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Input
                                value={item.Reason || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateItem(targetId, 'Reason', val);
                                }}
                                className="h-8 min-w-[100px] bg-white border border-slate-300"
                              />
                            </TableCell>
                            <TableCell>{item.Remarks || (capex as any)?.remarks}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          No details found
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-[#009999]/10 hover:bg-[#009999]/10">
                      <TableCell colSpan={4} className="text-right">
                        <strong>TOTAL:</strong>
                      </TableCell>
                      <TableCell className="text-right">
                        <strong>{formatIDR(totalCost)}</strong>
                      </TableCell>
                      <TableCell className="text-center">
                        <strong>{totalRequirement}</strong>
                      </TableCell>

                      <TableCell colSpan={5}></TableCell>
                    </TableRow>
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

      {/* Detail Dialog Popup */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Order Budget Details</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-[#009999]">
                {selectedOrder?.orderno} </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-xs">
            <div>
              <p className="text-gray-500 uppercase font-semibold">Order Date</p>
              <p className="font-medium text-gray-900">{formatDate(selectedOrder?.orderdate || '')}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase font-semibold">Requested By</p>
              <p className="font-medium text-gray-900">{selectedOrder?.PicTool}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase font-semibold">Allocated</p>
              <p className="font-medium text-gray-900">{formatIDR(Number(selectedOrder?.Allocated) || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase font-semibold">Used Amount</p>
              <p className="font-medium text-gray-900">{formatIDR(Number(selectedOrder?.UsedAmount) || 0)}</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <Table className="text-xs">
                  <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="bg-gray-50">Tools ID</TableHead>
                      <TableHead className="bg-gray-50">Description</TableHead>
                      <TableHead className="bg-gray-50 text-center">Part No</TableHead>
                      <TableHead className="bg-gray-50 text-center">Brand</TableHead>
                      <TableHead className="bg-gray-50 text-center">Specification</TableHead>
                      <TableHead className="bg-gray-50 text-center">Cost</TableHead>
                      <TableHead className="bg-gray-50 text-center">Qty</TableHead>
                      <TableHead className="bg-gray-50 text-center">Reason</TableHead>
                      <TableHead className="bg-gray-50 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetailList.length > 0 ? (
                      orderDetailList.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs">{item.ToolsId || item.toolsId || '-'}</TableCell>
                          <TableCell>{item.ToolsDesc || '-'}</TableCell>
                          <TableCell className="text-center">{item.ToolsPN || item.toolsPN || item.PartNo || item.partNo || '-'}</TableCell>
                          <TableCell className="text-center">{item.Brand || item.brand || '-'}</TableCell>
                          <TableCell className="text-center">{item.Spesifikasi || item.spesifikasi || item.ToolsSize || item.toolsSize || '-'}</TableCell>
                          <TableCell className="text-right">
                            {formatIDR(Number(item.ToolsCost || 0))}
                          </TableCell>
                          <TableCell className="text-center font-semibold">{item.Qty || item.qty || item.ToolsQty || item.toolsQty || 0}</TableCell>
                          <TableCell className="text-center">{item.Reason || item.reason || '-'}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-yellow-50 hover:text-yellow-600"
                              title="Edit PR/PO"
                              onClick={() => openEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                          No items found for this order
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

      {/* Edit PR/PO Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[850px] bg-white text-xs">
          <DialogHeader>
            <DialogTitle className="text-[#003366] font-semibold text-lg">FORM PR & PO BUDGET</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update tracking details
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Container */}
            <div className="space-y-4 md:pr-6">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Tool ID</Label>
                  <Input
                    value={editingOrderItem.ToolsId || ''}
                    disabled
                    className="bg-gray-50 border border-gray-300 h-9 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Specification</Label>
                  <Input
                    value={selectedOrder?.Spesifikasi || ''}
                    disabled
                    className="bg-gray-50 border border-gray-300 h-9 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Item Description</Label>
                <Input
                  value={selectedOrder?.ToolsDescription || selectedOrder?.ToolsDesc || '-'}
                  disabled
                  className="bg-gray-50 border border-gray-300 h-9 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">ORDER STATUS</Label>
                <Select
                  value={editingOrderItem.Status}
                  onValueChange={(val) => setEditingOrderItem((prev: any) => ({ ...prev, Status: val }))}
                >
                  <SelectTrigger className="bg-white border border-gray-300 h-9">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    {statusOrder.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}

                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Date Create PR</Label>
                <DatePicker
                  selected={parseDate(editingOrderItem.PR_date)}
                  onChange={(date: Date | null) => {
                    setEditingOrderItem((prev: any) => ({
                      ...prev,
                      PR_date: formatDateToYMD(date)
                    }));
                  }}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  customInput={
                    <CustomDateInput
                      className="w-full pl-10 h-9 bg-white border border-gray-300 focus:border-[#009999] focus:ring-[#009999]"
                    />
                  }
                  wrapperClassName="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">No PR</Label>
                  <Input
                    value={editingOrderItem.PR_no}
                    onChange={(e) => setEditingOrderItem((prev: any) => ({ ...prev, PR_no: e.target.value }))}
                    className="bg-white border border-gray-300 h-9"
                    placeholder="Enter PR Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">PR STATUS</Label>
                  <Select
                    value={editingOrderItem.StatusPR}
                    onValueChange={(val) => setEditingOrderItem((prev: any) => ({ ...prev, StatusPR: val }))}
                  >
                    <SelectTrigger className="bg-white border border-gray-300 h-9">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">PR Pending</SelectItem>
                      <SelectItem value="Approve">PR Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Container */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Date Create PO</Label>
                <DatePicker
                  selected={parseDate(editingOrderItem.PO_date)}
                  onChange={(date: Date | null) => {
                    setEditingOrderItem((prev: any) => ({
                      ...prev,
                      PO_date: formatDateToYMD(date)
                    }));
                  }}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  customInput={
                    <CustomDateInput
                      className="w-full pl-10 h-9 bg-white border border-gray-300 focus:border-[#009999] focus:ring-[#009999]"
                    />
                  }
                  wrapperClassName="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">No PO</Label>
                  <Input
                    value={editingOrderItem.PO_no}
                    onChange={(e) => setEditingOrderItem((prev: any) => ({ ...prev, PO_no: e.target.value }))}
                    className="bg-white border border-gray-300 h-9"
                    placeholder="Enter PO Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">PO STATUS</Label>
                  <Select
                    value={editingOrderItem.StatusPO}
                    onValueChange={(val) => setEditingOrderItem((prev: any) => ({ ...prev, StatusPO: val }))}
                  >
                    <SelectTrigger className="bg-white border border-gray-300 h-9">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">PO Pending</SelectItem>
                      <SelectItem value="Approve">PO Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">SUPPLIER</Label>
                <Input
                  value={editingOrderItem.Supplier}
                  onChange={(e) => setEditingOrderItem((prev: any) => ({ ...prev, Supplier: e.target.value }))}
                  className="bg-white border border-gray-300 h-9"
                  placeholder="Enter Supplier Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 space-y-2">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">ESTIMATED DELIVERY DATE</Label>
                  <DatePicker
                    selected={parseDate(editingOrderItem.Est_date)}
                    onChange={(date: Date | null) => {
                      setEditingOrderItem((prev: any) => ({
                        ...prev,
                        Est_date: formatDateToYMD(date)
                      }));
                    }}
                    dateFormat="dd-MM-yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={
                      <CustomDateInput
                        className="w-full pl-10 h-9 bg-white border border-gray-300 focus:border-[#009999] focus:ring-[#009999]"
                      />
                    }
                    wrapperClassName="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-700 font-medium">ACTUAL SUPPLY DATE</Label>
                  <DatePicker
                    selected={parseDate(editingOrderItem.Act_date)}
                    onChange={(date: Date | null) => {
                      setEditingOrderItem((prev: any) => ({
                        ...prev,
                        Act_date: formatDateToYMD(date)
                      }));
                    }}
                    dateFormat="dd-MM-yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={
                      <CustomDateInput
                        className="w-full pl-10 h-9 bg-white border border-gray-300 focus:border-[#009999] focus:ring-[#009999]"
                      />
                    }
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">NOTE (PLANT/PROCUREMENT/PURCHASING)</Label>
                <Input
                  value={editingOrderItem.Note}
                  onChange={(e) => setEditingOrderItem((prev: any) => ({ ...prev, Note: e.target.value }))}
                  className="bg-white border border-gray-300 h-9"
                  placeholder="Enter Note"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 hidden">
                <div className="space-y-1">
                  <Label className="text-gray-700 font-medium">STATUS</Label>
                  <Select
                    value={editingOrderItem.IsClose}
                    onValueChange={(val) => setEditingOrderItem((prev: any) => ({ ...prev, IsClose: val }))}
                  >
                    <SelectTrigger className="bg-white border border-gray-300 h-9">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">OPEN</SelectItem>
                      <SelectItem value="1">CLOSED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveItem}
              className="bg-[#009999] hover:bg-[#008080] text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
