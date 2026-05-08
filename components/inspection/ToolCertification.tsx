import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Autocomplete from '../ui/Autocomplete'
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Wrench, ChevronRight, ChevronLeft
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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface Certification {
  Kode: string;
  Jobsite: string;
  ToolsId: string;
  ToolsName: string;
  CertType: string;
  CertNumber: string;
  CertBy: string;
  CertStartDate: string;
  CertExpiredDate: string;
  CertDate: string;
  CertStatus: string;
  nextDueDate: string;
}

export default function ToolCertification() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  const [formData, setFormData] = useState({
    Kode: '',
    ToolsId: '',
    ToolsName: '',
    CertType: '',
    CertNumber: '',
    CertExpired: '',
    CertStart: '',
    CertBy: '',
    CertFile: '',
  });
  const [regtools, setRegTools] = useState<GlobalModel[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  /*  {
      id: 'CERT-001',
      toolId: 'TL-0001',
      toolName: 'Hydraulic Jack',
      certificationType: 'Certification',
      certificationDate: '2024-06-10',
      expiryDate: '2025-06-10',
      certifiedBy: 'SGS Indonesia',
      certificationNumber: 'CERT-2024-HJ-001',
      status: 'Valid',
      nextDueDate: '2025-06-10',
    },
    {
      id: 'CAL-001',
      toolId: 'TL-0025',
      toolName: 'Pressure Gauge',
      certificationType: 'Calibration',
      certificationDate: '2024-11-15',
      expiryDate: '2024-12-15',
      certifiedBy: 'Kalibrasi Jaya',
      certificationNumber: 'CAL-2024-PG-025',
      status: 'Expiring Soon',
      nextDueDate: '2024-12-15',
    },
    {
      id: 'CERT-002',
      toolId: 'TL-0043',
      toolName: 'Welding Machine',
      certificationType: 'Certification',
      certificationDate: '2023-08-20',
      expiryDate: '2024-08-20',
      certifiedBy: 'TUV Rheinland',
      certificationNumber: 'CERT-2023-WM-043',
      status: 'Expired',
      nextDueDate: '2024-12-20',
    },
    {
      id: 'CAL-002',
      toolId: 'TL-0067',
      toolName: 'Digital Multimeter',
      certificationType: 'Calibration',
      certificationDate: '2024-10-05',
      expiryDate: '2025-10-05',
      certifiedBy: 'Sucofindo',
      certificationNumber: 'CAL-2024-DM-067',
      status: 'Valid',
      nextDueDate: '2025-10-05',
    },
    {
      id: 'CERT-003',
      toolId: 'TL-0089',
      toolName: 'Lifting Equipment',
      certificationType: 'Certification',
      certificationDate: '2024-09-12',
      expiryDate: '2025-09-12',
      certifiedBy: 'SGS Indonesia',
      certificationNumber: 'CERT-2024-LE-089',
      status: 'Valid',
      nextDueDate: '2025-09-12',
    },
  ]);
  */
  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.ToolsName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.ToolsId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.CertNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'all' || cert.CertType === filterType;

    const matchesStatus =
      filterStatus === 'all' || cert.CertStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCertifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCertifications.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Expired':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Valid':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Expiring Soon':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleDelete = (id: string) => {
    setCertifications(certifications.filter((c) => c.ToolsId !== id));
    toast.success('Certification record deleted successfully!');
  };

  const stats = {
    total: certifications.length,
    valid: certifications.filter((c) => c.CertStatus === 'Valid').length,
    expiringSoon: certifications.filter((c) => c.CertStatus === 'Expiring Soon').length,
    expired: certifications.filter((c) => c.CertStatus === 'Expired').length,
  };


  /*Action */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      Kode: '',
      ToolsId: '',
      ToolsName: '',
      CertType: '',
      CertNumber: '',
      CertExpired: '',
      CertStart: '',
      CertBy: '',
      CertFile: '',
    });
    setIsDialogOpen(true);
  }

  const handleEdit = (item: Certification) => {
    setEditingItem(item);
    setFormData({
      Kode: item.Kode,
      ToolsId: item.ToolsId,
      ToolsName: item.ToolsId + '-' + item.ToolsName,
      CertType: item.CertType,
      CertNumber: item.CertNumber,
      CertExpired: item.CertExpiredDate,
      CertStart: item.CertStartDate,
      CertBy: item.CertBy,
      CertFile: '',
    });
    setIsDialogOpen(true);
  }
  const openDeleteDialog = (item: Certification) => {
    setEditingItem(item);
    setIsDeleteDialogOpen(true);
  }

  const handleSave = async () => {
    if (!formData.ToolsId || !formData.CertNumber || !formData.CertBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.CERTIFICATION(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingItem ? "UPDATE" : "INSERT"),
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          Kode: formData.Kode,
          ToolsId: formData.ToolsId,
          CertType: formData.CertType,
          CertNumber: formData.CertNumber,
          CertExpired: formData.CertExpired,
          CertStart: formData.CertStart,
          CertBy: formData.CertBy,
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
      const response = await fetch(API.CERTIFICATION(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          Jobsite: currentUser.Jobsite,
          Kode: editingItem.Kode,
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

  const saveToExcel = (data: Certification[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Record ID': tool.Kode,
        'Tool ID': tool.ToolsId,
        'Tool Name': tool.ToolsName,
        'Type': tool.CertType,
        'Cert. Number': tool.CertNumber,
        'Cert. Date': tool.CertDate,
        'Expiry Date': tool.CertExpiredDate,
        'Certified By': tool.CertBy,
        'Status': tool.CertStatus,
        'Next Due': tool.nextDueDate,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Tools_Certification_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }


  /*Load Server */
  const ReloadMaster = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite
    });
    fetch(API.CERTIFICATION() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: Certification[]) => {
        setCertifications(json);
      })
      .catch((error) => console.error("Error:", error));
  };
  const GetToolsList = () => {
    const params = new URLSearchParams({
      showdata: "REGTOOLS",
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
    ReloadMaster();
    GetToolsList();
  }, []);


  const toolOptions = regtools?.map(p => ({
    id: p.Kode,
    label: p.Kode + '-' + p.Nama,
  }));

  const titlePage = "Certification"
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <Award className="h-7 w-7 text-[#009999]" />
            Certification and Calibration
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage tool certifications and calibration records
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline"
            className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10"
            onClick={() => saveToExcel(certifications)}>
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white"
            onClick={() => handleAdd()}>
            <Plus className="h-4 w-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-bold text-gray-600">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.total}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <Award className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-bold text-gray-600">Valid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.valid}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-bold text-gray-600">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-yellow-600">{stats.expiringSoon}</div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-bold text-gray-600">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-red-600">{stats.expired}</div>
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
            placeholder="Search by tool name, ID, or certification number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-[#003366] pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-white border-[#003366] w-full sm:w-48">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Certification">Certification</SelectItem>
            <SelectItem value="Calibration">Calibration</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-white border-[#003366] w-full sm:w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Valid">Valid</SelectItem>
            <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Certification Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Record ID</TableHead>
                  <TableHead>Tool ID</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cert. Number</TableHead>
                  <TableHead>Cert. Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Certified By</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Next Due</TableHead> */}
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No certification records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((cert) => (
                    <TableRow key={cert.Kode} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{cert.Kode}</span>
                      </TableCell>
                      <TableCell>{cert.ToolsId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-gray-400" />
                          {cert.ToolsName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            cert.CertType === 'Certification'
                              ? 'bg-purple-50 text-purple-700 border-purple-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }
                        >
                          {cert.CertType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{cert.CertNumber}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(cert.CertDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(cert.CertExpiredDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {cert.CertBy}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 w-fit ${getStatusColor(
                            cert.CertStatus
                          )}`}
                        >
                          {getStatusIcon(cert.CertStatus)}
                          {cert.CertStatus}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        {new Date(cert.nextDueDate).toLocaleDateString()}
                      </TableCell> */}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-yellow-50 hover:text-yellow-600"
                            title="Edit"
                            onClick={() => handleEdit(cert)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                            onClick={() => openDeleteDialog(cert)}
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
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 p-2">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredCertifications.length} of {certifications.length} certification records
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {(editingItem ? 'Edit ' : 'Add ') + titlePage}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="CertType">Cert Type *</Label>
              <Select
                value={formData.CertType}
                disabled={editingItem != null}
                onValueChange={(value) => {
                  setFormData({ ...formData, CertType: value })
                }}
              >
                <SelectTrigger id="CertType">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="Certification" value="Certification">Certification</SelectItem>
                  <SelectItem key="Calibration" value="Calibration">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ToolsId">Tools *</Label>
              <Autocomplete
                value={formData.ToolsName}
                disabled={editingItem != null}
                options={toolOptions}
                onSelect={(s) => {
                  setFormData({ ...formData, ToolsId: s.id, ToolsName: s.label })
                }} />
              {/*<Select*/}
              {/*  value={formData.ToolsId}*/}
              {/*  disabled={editingItem != null}*/}
              {/*  onValueChange={(value) => {*/}
              {/*    setFormData({ ...formData, ToolsId: value })*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <SelectTrigger id="ToolsId">*/}
              {/*    <SelectValue placeholder="Select" />*/}
              {/*  </SelectTrigger>*/}
              {/*  <SelectContent>*/}
              {/*    {regtools.slice(0, 100).map((pos) => (*/}
              {/*      <SelectItem key={pos.Kode} value={pos.Kode}>*/}
              {/*        {pos.Nama}*/}
              {/*      </SelectItem>*/}
              {/*    ))}*/}
              {/*  </SelectContent>*/}
              {/*</Select>*/}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="CertNumber">Cert Number *</Label>
                <Input
                  id="CertNumber"
                  value={formData.CertNumber}
                  onChange={(e) => setFormData({ ...formData, CertNumber: e.target.value })}
                  placeholder="e.g., JB001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="CertExpired">Cert Expired *</Label>
                <Input
                  id="CertExpired"
                  type="date"
                  value={formData.CertExpired}
                  onChange={(e) => setFormData({ ...formData, CertExpired: e.target.value })}
                  placeholder="e.g., JB001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="CertBy">Cert By *</Label>
              <Input
                id="CertBy"
                value={formData.CertBy}
                onChange={(e) => setFormData({ ...formData, CertBy: e.target.value })}
                placeholder="e.g., JB001"
              />
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
              This will permanently delete the "{editingItem?.ToolsName}" (Id: {editingItem?.ToolsId}). This action cannot be undone.
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