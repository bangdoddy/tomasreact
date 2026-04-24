import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User, ChevronRight, ChevronLeft
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
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel, AuditRequest } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface ToolBoxInspection {
  id: string;
  toolBoxId: string;
  inspectionDate: string;
  inspector: string;
  location: string;
  toolsCount: number;
  status: string; // 'Pass' | 'Fail' | 'Partial';
  issues: string;
  nextInspection: string;
}

export default function ToolBoxInspection() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [inspections, setInspections] = useState<ToolBoxInspection[]>([
    {
      id: 'TBI-001',
      toolBoxId: 'TB-A001',
      inspectionDate: '2024-12-10',
      inspector: 'John Doe',
      location: 'Site Alpha',
      toolsCount: 25,
      status: 'Pass',
      issues: 'None',
      nextInspection: '2025-01-10',
    },
    //{
    //  id: 'TBI-002',
    //  toolBoxId: 'TB-B002',
    //  inspectionDate: '2024-12-09',
    //  inspector: 'Jane Smith',
    //  location: 'Site Beta',
    //  toolsCount: 30,
    //  status: 'Fail',
    //  issues: '3 missing tools, 2 damaged',
    //  nextInspection: '2024-12-16',
    //},
    //{
    //  id: 'TBI-003',
    //  toolBoxId: 'TB-C003',
    //  inspectionDate: '2024-12-11',
    //  inspector: 'Bob Johnson',
    //  location: 'Workshop Central',
    //  toolsCount: 20,
    //  status: 'Partial',
    //  issues: '1 tool requires calibration',
    //  nextInspection: '2024-12-18',
    //},
    //{
    //  id: 'TBI-004',
    //  toolBoxId: 'TB-D004',
    //  inspectionDate: '2024-12-08',
    //  inspector: 'Sarah Wilson',
    //  location: 'Site Gamma',
    //  toolsCount: 28,
    //  status: 'Pass',
    //  issues: 'None',
    //  nextInspection: '2025-01-08',
    //},
  ]);

  const filteredInspections = inspections.filter((inspection) => {
    return (
      inspection.toolBoxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInspections.slice(startIndex, endIndex);
  const isPagingShow = filteredInspections.length > itemsPerPage;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Fail':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Pending':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Fail':
        return <XCircle className="h-4 w-4" />;
      case 'Partial':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleDelete = (id: string) => {
    setInspections(inspections.filter((i) => i.id !== id));
    toast.success('Tool box inspection deleted successfully!');
  };

  const stats = {
    total: inspections.length,
    passed: inspections.filter((i) => i.status === 'Pass').length,
    failed: inspections.filter((i) => i.status === 'Fail').length,
    partial: inspections.filter((i) => i.status === 'Partial').length,
    pending: inspections.filter((i) => i.status === 'Pending').length,
  };


  const ReloadAuditData = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "AUDITTOOLSBOX"
    });
    fetch(API.AUDITTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: AuditRequest[]) => {
        const items: ToolBoxInspection[] = (json || []).map((u) => {
          return {
            id: u.NoUrut ? 'TBI-' + u.NoUrut : 'TBI',
            toolBoxId: u.IdToolBox ?? '',
            inspectionDate: u.AuditDate ?? '',
            inspector: u.NamaPicToolBox ?? '',
            location: u.ToolsLocation ?? '',
            toolsCount: Number(u.Total) ?? 0,
            status: u.StAudit ?? '',
            issues: u.RemarkAudit ?? '',
            nextInspection: u.AuditDate ?? '',
          };
        });
        setInspections(items);
        console.log(items);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    ReloadAuditData();
  }, []);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-[#009999]" />
            Tool Box Inspection
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage tool box inspections and track tool inventory
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.total}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <Package className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.passed}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Partial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-yellow-600">{stats.partial}</div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-red-600">{stats.pending}</div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by tool box ID, inspector, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inspection Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Inspection ID</TableHead>
                  <TableHead>Tool Box ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tools Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Next Inspection</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No tool box inspections found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((inspection) => (
                    <TableRow key={inspection.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="text-[#009999]">{inspection.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          {inspection.toolBoxId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {inspection.inspectionDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {inspection.inspector}
                        </div>
                      </TableCell>
                      <TableCell>{inspection.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {inspection.toolsCount} tools
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 w-fit ${getStatusColor(
                            inspection.status
                          )}`}
                        >
                          {getStatusIcon(inspection.status)}
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{inspection.issues}</span>
                      </TableCell>
                      <TableCell>
                        {inspection.nextInspection}
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
                            onClick={() => handleDelete(inspection.id)}
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
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredInspections.length} of {inspections.length} tool box inspections
      </div>
    </div>
  );
}
