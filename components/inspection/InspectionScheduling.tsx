import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Wrench,
  User,
  Download,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface Schedule {
  ItemKey: string;
  ToolsJobsite: string;
  ToolsMonthAudit: string;
  ToolsYearAudit: string;
  ToolsType: string;
  ToolsTypeDesc: string;
  Auditor: string;
  NRP_Auditor: string;
  ToolsAuditStatus: string;
  ValidateBy: string;
  AuditDate: string;
  AuditTime: string;
  AuditType: string; 
}

export default function InspectionScheduling() {
  const { currentUser } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);  
  const [editingItem, setEditingItem] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    ItemKey: '',
    AuditDate: '',
    AuditTime: '',
    ToolsKategori: '',
    NrpUser: '',
    NamaUser: '',
  });

  const [categories, setCategories] = useState<GlobalModel[]>([]); 
  const [userAudit, setUserAudit] = useState<GlobalModel[]>([]); 

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  /*
    {
      id: 'SCH-001',
      toolId: 'TL-0001',
      toolName: 'Hydraulic Jack',
      scheduledDate: '2024-12-15',
      scheduledTime: '09:00',
      inspector: 'John Doe',
      inspectionType: 'Regular',
      status: 'Scheduled',
      location: 'Warehouse A',
      ItemKey:'',
    },
    {
      id: 'SCH-002',
      toolId: 'TL-0025',
      toolName: 'Air Compressor',
      scheduledDate: '2024-12-14',
      scheduledTime: '10:30',
      inspector: 'Jane Smith',
      inspectionType: 'Maintenance',
      status: 'In Progress',
      location: 'Workshop B',
      ItemKey: '',
    },
    {
      id: 'SCH-003',
      toolId: 'TL-0043',
      toolName: 'Welding Machine',
      scheduledDate: '2024-12-12',
      scheduledTime: '14:00',
      inspector: 'Bob Johnson',
      inspectionType: 'Calibration',
      status: 'Completed',
      location: 'Site C',
      ItemKey: '',
    },
    {
      id: 'SCH-004',
      toolId: 'TL-0067',
      toolName: 'Grinder',
      scheduledDate: '2024-12-16',
      scheduledTime: '11:00',
      inspector: 'Sarah Wilson',
      inspectionType: 'Regular',
      status: 'Scheduled',
      location: 'Workshop A',
      ItemKey: '',
    },
  ]*/  

  const filteredSchedules = schedules.filter((schedule) => {
    return (
      schedule.ToolsTypeDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.Auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.ItemKey.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDateRangeFromDateStr = (dateStr) => {
    if (!dateStr) return { min: undefined, max: undefined };
    //const [y, m, d] = dateStr.split("-").map(Number);
    //const min = new Date(y, m, 1);
    //const max = new Date(y, m + 1, 0);
    //return { min , max };

    const [y, m] = dateStr.split("-").map(Number); // m = 1..12
    const year = y;
    const month0 = m - 1; // 0..11

    const pad = (n) => (n < 10 ? `0${n}` : String(n));

    // First day of month
    const first = new Date(year, month0, 1);
    const min = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`;

    // Last day of month (day 0 of next month)
    const last = new Date(year, month0 + 1, 0);
    const max = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;

    return { min, max };

  }
  /*Action */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      ItemKey: '',
      AuditDate: '',
      AuditTime: '',
      ToolsKategori: '',
      NrpUser: '',
      NamaUser: '',
    });
    setIsDialogOpen(true);
  }

  const handleEdit = (item: Schedule) => {
    setEditingItem(item);
    setFormData({
      ItemKey: item.ItemKey,
      AuditDate: item.AuditDate,
      AuditTime: item.AuditTime,
      ToolsKategori: item.ToolsType,
      NrpUser: item.NRP_Auditor,
      NamaUser: item.Auditor,
    });
    setIsDialogOpen(true);
  }
  const openDeleteDialog = (item: Schedule) => {
    setEditingItem(item);
    setIsDeleteDialogOpen(true);
  }

  const handleSave = async () => {
    if (!formData.AuditDate || !formData.ToolsKategori || !formData.NrpUser) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.AUDITTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingItem ? "UPDATE" : "INSERT"),
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          Nrp: formData.NrpUser,
          ItemKey: formData.ItemKey,
          ToolType: formData.ToolsKategori,
          Auditdate: formData.AuditDate+' '+formData.AuditTime
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadMaster();
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
      const response = await fetch(API.AUDITTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          Jobsite: currentUser.Jobsite,
          ItemKey: editingItem.ItemKey,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadMaster();
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


  const saveToExcel = (data: Schedule[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Schedule ID': tool.ItemKey+"_"+tool.ToolsType ,
        'Tool Category': tool.ToolsTypeDesc,
        'Date': tool.AuditDate,
        'Time': tool.AuditTime,
        'Inspector': tool.Auditor,
        'Type': tool.AuditType,
        'Location': '',
        'Status': tool.ToolsAuditStatus, 
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Schedule_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }


  const stats = {
    scheduled: schedules.filter((s) => s.ToolsAuditStatus === 'Scheduled').length,
    inProgress: schedules.filter((s) => s.ToolsAuditStatus === 'In Progress').length,
    completed: schedules.filter((s) => s.ToolsAuditStatus === 'Completed').length,
  };

  /*Load Server */
  const ReloadMaster = () => {
    const params = new URLSearchParams({ 
      jobsite: currentUser.Jobsite
    });
    fetch(API.AUDITTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: Schedule[]) => {
        setSchedules(json);
      })
      .catch((error) => console.error("Error:", error));
  };
  const ReloadCategory = () => {
    const params = new URLSearchParams({
      showdata: "TOOLTYPE"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setCategories(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadUserAudit = () => {
    const params = new URLSearchParams({
      showdata: "AUDITOR",
      jobsite : currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setUserAudit(json))
      .catch((error) => console.error("Error:", error));
  }

  

  useEffect(() => { 
    ReloadMaster(); 
    ReloadCategory();
    ReloadUserAudit();
  },[]);

  const titlePage = "Schedule"
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-[#009999]" />
            Inspection Scheduling
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and schedule tool inspections
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50"
            onClick={() => saveToExcel(schedules)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white"
            onClick={() => handleAdd()}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-blue-600">{stats.scheduled}</div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-yellow-600">{stats.inProgress}</div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.completed}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by tool name, ID, or inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Schedule ID</TableHead> 
                  <TableHead>Tool Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.ItemKey} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{schedule.ItemKey+'_'+schedule.ToolsType}</span>
                      </TableCell> 
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-gray-400" />
                          {schedule.ToolsTypeDesc}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {new Date(schedule.AuditDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {schedule.AuditTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {schedule.Auditor}
                        </div>
                      </TableCell>
                      <TableCell>{schedule.AuditType}</TableCell>
                      <TableCell>{}</TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getStatusColor(schedule.ToolsAuditStatus)}`}>
                          {schedule.ToolsAuditStatus}
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
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                            onClick={() => openDeleteDialog(schedule)}
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

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredSchedules.length} of {schedules.length} schedules
      </div>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {(editingItem ? 'Edit ' : 'Add ') + titlePage}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auditDate">Date *</Label>
                <Input
                  id="auditDate"
                  type="date"  
                  value={formData.AuditDate}
                  onChange={(e) => setFormData({ ...formData, AuditDate: e.target.value })} 
                  {...(() => {
                    const { min, max } = getDateRangeFromDateStr(formData.AuditDate);
                    console.log("MinMax:" + min + "<>" + max);
                    return {
                      min,  
                      max,
                    };
                  })()} 
                  placeholder="e.g., JB001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auditTime">Time *</Label>
                <Input
                  id="auditTime"
                  type="time" 
                  value={formData.AuditTime}
                  onChange={(e) => setFormData({ ...formData, AuditTime: e.target.value })}
                  placeholder="e.g., JB001"
                />
              </div>
            </div> 
            <div className="space-y-2">
              <Label htmlFor="category">Tools Category *</Label>
              <Select
                value={formData.ToolsKategori}
                disabled={editingItem != null}
                onValueChange={(value) => {
                  setFormData({ ...formData, ToolsKategori: value })
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((pos) => (
                    <SelectItem key={pos.Kode} value={pos.Kode}>
                      {pos.Keterangan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="Auditor">Auditor *</Label>
              <Select
                value={formData.NrpUser}
                onValueChange={(value) => {
                  setFormData({ ...formData, NrpUser: value })
                }}
              >
                <SelectTrigger id="Auditor">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {userAudit.map((pos) => (
                    <SelectItem key={pos.Kode} value={pos.Kode}>
                      {pos.Keterangan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              This will permanently delete the "{editingItem?.ItemKey}_{editingItem?.ToolsType}" (Auditor: {editingItem?.Auditor}). This action cannot be undone.
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
