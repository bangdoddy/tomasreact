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
  Home,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  MapPin, ChevronRight, ChevronLeft
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

interface ToolRoomInspection {
  id: string;
  roomId: string;
  roomName: string;
  inspectionDate: string;
  inspector: string;
  toolsCount: number;
  status: string; // 'Excellent' | 'Good' | 'Fair' | 'Poor';
  cleanliness: string; // 'Clean' | 'Acceptable' | 'Needs Cleaning';
  issues: string;
  nextInspection: string;
}

export default function ToolRoomInspection() {
  const { currentUser } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [inspections, setInspections] = useState<ToolRoomInspection[]>([
    {
      id: 'TRI-001',
      roomId: 'ROOM-A1',
      roomName: 'Main Tool Room',
      inspectionDate: '2024-12-10',
      inspector: 'John Doe',
      toolsCount: 450,
      status: 'Excellent',
      cleanliness: 'Clean',
      issues: 'None',
      nextInspection: '2025-01-10',
    },
    {
      id: 'TRI-002',
      roomId: 'ROOM-B2',
      roomName: 'Workshop Storage',
      inspectionDate: '2024-12-09',
      inspector: 'Jane Smith',
      toolsCount: 320,
      status: 'Good',
      cleanliness: 'Acceptable',
      issues: 'Minor dust accumulation',
      nextInspection: '2025-01-09',
    },
    {
      id: 'TRI-003',
      roomId: 'ROOM-C3',
      roomName: 'Heavy Equipment Room',
      inspectionDate: '2024-12-08',
      inspector: 'Bob Johnson',
      toolsCount: 180,
      status: 'Fair',
      cleanliness: 'Needs Cleaning',
      issues: 'Oil spills, poor organization',
      nextInspection: '2024-12-15',
    },
    {
      id: 'TRI-004',
      roomId: 'ROOM-D4',
      roomName: 'Site Tool Storage',
      inspectionDate: '2024-12-11',
      inspector: 'Sarah Wilson',
      toolsCount: 280,
      status: 'Good',
      cleanliness: 'Clean',
      issues: 'None',
      nextInspection: '2025-01-11',
    },
  ]);

  const filteredInspections = inspections.filter((inspection) => {
    return (
      inspection.roomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInspections.slice(startIndex, endIndex);
  const isPagingShow = filteredInspections.length > itemsPerPage;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Good':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Poor':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCleanlinessColor = (cleanliness: string) => {
    switch (cleanliness) {
      case 'Clean':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Acceptable':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Needs Cleaning':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleDelete = (id: string) => {
    setInspections(inspections.filter((i) => i.id !== id));
    toast.success('Tool room inspection deleted successfully!');
  };

  const stats = {
    total: inspections.length,
    excellent: inspections.filter((i) => i.status === 'Excellent').length,
    good: inspections.filter((i) => i.status === 'Good').length,
    needsAttention: inspections.filter((i) => i.status === 'Fair' || i.status === 'Poor').length,
  };

  const ReloadAuditData = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "AUDITTOOLSROOM"
    });
    fetch(API.AUDITTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: AuditRequest[]) => { 
        const items: ToolRoomInspection[] = (json || []).map((u) => {
          return {
            id: u.NoUrut ? 'TRI-' + u.NoUrut :'TRI',
            roomId: u.NoUrut ?'ROOM-'+u.NoUrut: 'ROOM',
            roomName: u.ToolsLocation,
            inspectionDate: u.AuditDate??'',
            inspector: '',
            toolsCount: Number(u.Total)??0,
            status: u.StAudit??'',
            cleanliness: '',
            issues: u.RemarkAudit ?? '',
            nextInspection: u.AuditDate??''
          };
        });
        setInspections(items);

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
            <Home className="h-7 w-7 text-[#009999]" />
            Tool Room Inspection
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and inspect tool room conditions and inventory
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.total}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <Home className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Excellent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.excellent}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Good</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-blue-600">{stats.good}</div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-yellow-600">{stats.needsAttention}</div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
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
              placeholder="Search by room ID, name, or inspector..."
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
                  <TableHead>Room ID</TableHead>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Tools Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cleanliness</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Next Inspection</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No tool room inspections found
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
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {inspection.roomId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-400" />
                          {inspection.roomName}
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
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {inspection.toolsCount} tools
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getStatusColor(inspection.status)}`}>
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`w-fit ${getCleanlinessColor(inspection.cleanliness)}`}>
                          {inspection.cleanliness}
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
        Showing {filteredInspections.length} of {inspections.length} tool room inspections
      </div>
    </div>
  );
}
