import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Autocomplete from './ui/Autocomplete'
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Wrench,
  FileText, ChevronRight, ChevronLeft
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { API } from '../config';
import { GlobalModel } from "../model/Models";
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

interface DisposedTool {
  id: string;
  toolId: string;
  toolName: string;
  toolType: string;
  disposalDate: string;
  disposalReason: string;
  proposedBy: string;
  department: string;
  status: string; // 'Pending Disposal' | 'Disposed' | 'Reactivated' | 'Under Review';
  condition: string; // 'TA' | 'R2' | 'Damaged' | 'Obsolete';
  lastUsedDate: string;
  estimatedValue: number;
  remarks: string;
  baktno: string;
}

interface DisposalUnit {
  ID: string;
  ToolsId: string;
  ToolsName: string;
  ToolsType: string;
  ItemKey: string;
  ToolsFrom: string;
  ToolsCondition: string;
  ToolsStatus: string;
  DisposalReason: string;
  TindakLanjut: string;
  EstimatedValue: number;
  DisposalDate: string;
  ProposedBy: string;
}

export default function ReactivationDisposedTools() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [fuAction, setFuAction] = useState('rfu4');

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DisposedTool | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    toolId: '',
    toolName: '',
    toolType: '',
    disposalReason: '',
    status: '',
    remarks: '',
    BaktNo: '',
    ToolsCondition: '',
    Hasil: 'Con1'
  });

  const [regtools, setRegTools] = useState<GlobalModel[]>([]);
  const [disposedTools, setDisposedTools] = useState<DisposedTool[]>([]);
  //  {
  //    id: 'DT-001',
  //    toolId: 'TL-0245',
  //    toolName: 'Hydraulic Jack',
  //    toolType: 'Lifting Equipment',
  //    disposalDate: '2024-12-05',
  //    disposalReason: 'Hydraulic leak beyond repair',
  //    proposedBy: 'John Maintenance',
  //    department: 'Maintenance',
  //    status: 'Disposed',
  //    condition: 'TA',
  //    lastUsedDate: '2024-11-20',
  //    estimatedValue: 5000000,
  //    remarks: 'Disposed via certified disposal company',
  //  },
  //  {
  //    id: 'DT-002',
  //    toolId: 'TL-0189',
  //    toolName: 'Angle Grinder',
  //    toolType: 'Power Tools',
  //    disposalDate: '2024-12-08',
  //    disposalReason: 'Motor failure',
  //    proposedBy: 'Sarah Workshop',
  //    department: 'Workshop',
  //    status: 'Pending Disposal',
  //    condition: 'R2',
  //    lastUsedDate: '2024-12-01',
  //    estimatedValue: 2500000,
  //    remarks: 'Awaiting disposal approval',
  //  },
  //  {
  //    id: 'DT-003',
  //    toolId: 'TL-0312',
  //    toolName: 'Welding Machine',
  //    toolType: 'Welding Equipment',
  //    disposalDate: '2024-11-28',
  //    disposalReason: 'Technology upgrade',
  //    proposedBy: 'Mike Engineering',
  //    department: 'Engineering',
  //    status: 'Reactivated',
  //    condition: 'R2',
  //    lastUsedDate: '2024-11-25',
  //    estimatedValue: 15000000,
  //    remarks: 'Repaired and reactivated for backup use',
  //  },
  //  {
  //    id: 'DT-004',
  //    toolId: 'TL-0421',
  //    toolName: 'Pneumatic Drill',
  //    toolType: 'Drilling Equipment',
  //    disposalDate: '2024-12-10',
  //    disposalReason: 'Obsolete model',
  //    proposedBy: 'Bob Operations',
  //    department: 'Operations',
  //    status: 'Under Review',
  //    condition: 'Obsolete',
  //    lastUsedDate: '2024-10-15',
  //    estimatedValue: 8000000,
  //    remarks: 'Under evaluation for possible reactivation',
  //  },
  //  {
  //    id: 'DT-005',
  //    toolId: 'TL-0156',
  //    toolName: 'Safety Harness',
  //    toolType: 'Safety Equipment',
  //    disposalDate: '2024-12-03',
  //    disposalReason: 'Expired certification',
  //    proposedBy: 'Linda Safety',
  //    department: 'Safety',
  //    status: 'Disposed',
  //    condition: 'Damaged',
  //    lastUsedDate: '2024-11-30',
  //    estimatedValue: 1500000,
  //    remarks: 'Disposed per safety regulation',
  //  },
  //]);

  const filteredTools = disposedTools.filter((tool) => {
    const matchesSearch =
      tool.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.toolId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.toolType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.disposalReason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || tool.status === filterStatus;
    const matchesCondition = filterCondition === 'All' || tool.condition === filterCondition;

    return matchesSearch && matchesStatus && matchesCondition;
  });


  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTools.slice(startIndex, endIndex);
  const isPagingShow = filteredTools.length > itemsPerPage;


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Disposal':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Disposed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Reactivated':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'R2':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Repairing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Disposal':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Disposed':
        return <XCircle className="h-4 w-4" />;
      case 'Reactivated':
        return <CheckCircle className="h-4 w-4" />;
      case 'Under Review':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'TA':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'R2':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Damaged':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Obsolete':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-blue-700 border-blue-300';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  /*Action */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      id: '',
      toolId: '',
      toolName: '',
      toolType: '',
      disposalReason: '',
      status: '',
      remarks: '',
      BaktNo: '',
      ToolsCondition: '',
      Hasil: ''
    });
    setIsDialogOpen(true);
  }

  const handleEdit = (item: DisposedTool) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      toolId: item.toolId,
      toolName: item.toolName,
      toolType: item.toolType,
      disposalReason: item.disposalReason,
      status: item.status,
      remarks: item.remarks,
      BaktNo: item.baktno,
      ToolsCondition: item.condition,
      Hasil: item.condition === 'R2' ? 'Con1' : 'Con2'
    });
    setIsDialogOpen(true);
  }
  const openDeleteDialog = (item: DisposedTool) => {
    setEditingItem(item);
    setIsDeleteDialogOpen(true);
  }

  const handleSave = async () => {
    if (!formData.toolId || !formData.disposalReason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.BAKT(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingItem ? "UPDATEREQUEST" : "INSERTREQUEST"),
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          ItemKey: formData.id,
          Nrp: formData.toolId,
          Reason: formData.disposalReason,
          JobActivity: formData.remarks,
          OutFrom: fuAction,
          BaktNo: formData.BaktNo,
          IdTool: formData.toolId,
          // ToolsCondition: fuAction,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadFollowUp();
          setEditingItem(null);
          setIsDialogOpen(false);
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
  const handleDeleteUser = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(API.BAKT(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETEREQUEST",
          Jobsite: currentUser.Jobsite,
          ItemKey: editingItem.id,
          idTool: editingItem.toolId,
          ToolsCondition: editingItem.condition,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadFollowUp();
          setIsDeleteDialogOpen(false);
          setEditingItem(null);
          toast.success(resData?.Message ?? 'Deleted successfully ');
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

  const handleReactivate = async (id: string, toolid: string) => {
    try {
      const response = await fetch(API.BAKT(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "REAKTIFTOOL",
          Jobsite: currentUser.Jobsite,
          ItemKey: id,
          Nrp: toolid,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadFollowUp();
          setIsDeleteDialogOpen(false);
          setEditingItem(null);
          toast.success(resData?.Message ?? 'Deleted successfully ');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Respont");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }
    toast.success('Tool reactivation initiated successfully!');
  };


  const saveToExcel = (data: DisposedTool[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Tool ID': tool.toolId,
        'Tool Name': tool.toolName,
        'Type': tool.toolType,
        'Disposal Date': tool.disposalDate,
        'Disposal Reason': tool.disposalReason,
        'Proposed By': tool.proposedBy,
        'Department': tool.department,
        'Condition': tool.condition,
        'Estimated Value': tool.estimatedValue,
        'Status': tool.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Reactivation_Disposed_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }


  const stats = {
    total: disposedTools.length,
    pendingDisposal: disposedTools.filter((t) => t.status === 'Pending Disposal').length,
    disposed: disposedTools.filter((t) => t.status === 'Disposed').length,
    reactivated: disposedTools.filter((t) => t.status === 'Reactivated').length,
    damaged: disposedTools.filter((t) => t.status === 'R2').length,
    totalValue: disposedTools.reduce((sum, t) => sum + t.estimatedValue, 0),
  };

  const mapCondition = (raw?: string): DisposedTool['condition'] => {
    const c = (raw ?? '').trim().toLowerCase();
    switch (c) {
      case 'good':
      case 'ok':
        return 'Good';
      case 'ta':
      case 'test acceptable':
        return 'TA';
      case 'r2':
      case 'repairable':
      case 'need repair':
        return 'R2';
      case 'damaged':
      case 'rusak':
      case 'broken':
        return 'Damaged';
      case 'obsolete':
      case 'usang':
        return 'Obsolete';
      default:
        return raw || 'TA';
    }
  };


  const ReloadFollowUp = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "DISPOSALTOOL"
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: DisposalUnit[]) => {

        const items: DisposedTool[] = (json || []).map((u) => {
          return {
            id: u.ID ?? '',
            toolId: u.ToolsId ?? '',
            toolName: u.ToolsName ?? '',
            toolType: u.ToolsType ?? '',
            disposalDate: u.DisposalDate,
            disposalReason: u.DisposalReason ?? '',
            proposedBy: u.ProposedBy ?? '',
            department: '',
            status: u.ToolsStatus,
            condition: mapCondition(u.ToolsCondition),
            lastUsedDate: '',
            estimatedValue: u.EstimatedValue, // Number.isFinite(u.EstimatedValue as any) ? Number(u.EstimatedValue) : 0,
            remarks: u.TindakLanjut ?? '',
            baktno: u.ItemKey ?? ''
          };
        });
        console.log(items);
        setDisposedTools(items);

      })
      .catch((error) => console.error("Error:", error));
  };

  const GetToolsList = () => {
    const params = new URLSearchParams({
      showdata: "BAKTTOOLS", // "REGTOOLS",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setRegTools(json))
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    ReloadFollowUp();
    GetToolsList();
  }, []);

  const toolOptions = regtools?.map(p => ({
    id: p.Kode,
    label: p.Kode + '-' + p.Nama,
  }));

  const titlePage = "Request"
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <RefreshCw className="h-7 w-7 text-[#009999]" />
            Reactivation / Disposed Tools
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage tool disposal and reactivation processes
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
            onClick={() => saveToExcel(disposedTools)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white"
            onClick={() => handleAdd()}>
            <Plus className="h-4 w-4 mr-2" />
            New Disposal Request
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#009999]/20 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-500">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.total}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <FileText className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-500 font-bold">R2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-yellow-600">{stats.damaged}</div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-500">Disposed Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-red-600">{stats.disposed}</div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-green-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-500">Reactivated Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.reactivated}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-500">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-blue-600">{stats.underReview}</div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
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
                placeholder="Search by tool name, ID, type, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCondition} onValueChange={setFilterCondition}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Conditions</SelectItem>
                <SelectItem value="TA">TA</SelectItem>
                <SelectItem value="R2">R2</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
                <SelectItem value="Obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="R2">Damaged</SelectItem>
                <SelectItem value="Repairing">Repairing</SelectItem>
                <SelectItem value="Reactivated">Reactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Disposed Tools Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tool ID</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Follow-Up Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Proposed By</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Estimated Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((tool) => (
                    <TableRow key={tool.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{tool.toolId}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-gray-400" />
                          {tool.toolName}
                        </div>
                      </TableCell>
                      <TableCell>{tool.toolType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {/* {new Date(tool.disposalDate).toLocaleDateString()} */}
                          {tool.disposalDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={tool.disposalReason}>
                          {tool.disposalReason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {tool.proposedBy}
                        </div>
                      </TableCell>
                      <TableCell>{tool.department}</TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getConditionColor(tool.condition)}`}>
                          {tool.condition}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatCurrency(tool.estimatedValue)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 w-fit ${getStatusColor(
                            tool.status
                          )}`}
                        >
                          {getStatusIcon(tool.status)}
                          {tool.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button> */}
                          {tool.status != 'Reactivated' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-yellow-50 hover:text-yellow-600"
                              title="Edit"
                              onClick={() => handleEdit(tool)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                            onClick={() => openDeleteDialog(tool)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
      {/* Pagination */}
      <div className={`flex items-center justify-between mt-1  ${isPagingShow ? "" : "hidden"} `} >
        <div className="flex items-center">
          <Label htmlFor="itemsPerPage" className="mr-2">
            Items per page:
          </Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger id="itemsPerPage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/*<Label htmlFor="itemsPerPage" className="mr-2">*/}
          {/*  {disposedTools.length} records*/}
          {/*</Label>*/}
        </div>
      </div>

      {/* Footer */}
      {/*<div className="text-sm text-gray-600">*/}
      {/*  Showing {filteredTools.length} of {disposedTools.length} records*/}
      {/*</div>*/}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {(editingItem ? 'Follow Up ' : 'Add ') + titlePage}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2 p-2">
              <Label>BAKT No.</Label>
              <div className='border border-gray-200 rounded-md p-2 w-full'>
                {formData.BaktNo}
              </div>
            </div>

            <div className="space-y-2 p-2">
              <Label htmlFor="ToolsId">Tools *</Label>
              <div className='border border-gray-200 rounded-md p-2 w-full'>
                {formData.toolId + ' - ' + formData.toolName}
              </div>
              {/*<Autocomplete*/}
              {/*  value={formData.toolName}*/}
              {/*  disabled={editingItem != null}*/}
              {/*  options={toolOptions}*/}
              {/*  onSelect={(s) => {*/}
              {/*    setFormData({ ...formData, toolId : s.id, toolName: s.label })*/}
              {/*  }} />*/}
              {/* <Select
                value={formData.toolId}
                disabled={editingItem != null}
                onValueChange={(value) => {
                  const selected = regtools.find(j => j.Kode === value);
                  setFormData({ ...formData, toolId: value, toolName: selected.Keterangan, BaktNo: selected.Kategori })
                }}
              >
                <SelectTrigger id="ToolsId">
                  <SelectValue placeholder={(regtools.length > 0) ? "Select" : "Tools is empty"} />
                </SelectTrigger>
                <SelectContent>
                  {regtools.slice(0, 100).map((pos) => (
                    <SelectItem key={pos.Kode} value={pos.Kode}>
                      {pos.Keterangan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
            <div className="space-y-2 p-2">
              <Label htmlFor="CertNumber">Reason *</Label>
              <div className='border border-gray-200 rounded-md p-2 w-full'>
                {formData.disposalReason}
              </div>
            </div>
            <div className="space-y-2 p-2">
              <Label htmlFor="CertExpired">Remark *</Label>
              <div className='border border-gray-200 rounded-md p-2 w-full'>
                {formData.remarks}
              </div>
            </div>

            <div className="space-y-2 p-2">
              <Label htmlFor="hasil">Hasil *</Label>
              <Select
                value={fuAction}
                onValueChange={(value) => { setFuAction(value); setFormData({ ...formData, Hasil: value }) }}
              >
                <SelectTrigger id="hasil">
                  <SelectValue placeholder="Select Hasil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rfu5">R2</SelectItem>
                  <SelectItem value="rfu4">Good</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/*<div className="grid grid-cols-2 gap-4"> </div> */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#009999] hover:bg-[#007777] text-white"
            >
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{editingItem?.toolName}" (Id: {editingItem?.toolId}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
