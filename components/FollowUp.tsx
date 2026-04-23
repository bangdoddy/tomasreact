import { useState, useEffect } from 'react';
import { Search, FileDown, Calendar, ChevronRight, ChevronLeft, Plus, Eye, Pencil } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { API } from '../config';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import * as XLSX from 'xlsx';

interface FollowUpItem {
  baktNumber: string;
  toolsId: string;
  description: string;
  mekanik: string;
  createdDate: string;
  targetDate: string;
  status: string; // '' | 'In Progress' | 'Pending' | 'Completed' | 'Overdue';
  remarks: string;
  ToolsCondition: string;
  itemkey: string;
}

interface FollowUpUnit {
  BA_No: string;
  IdTools: string;
  ToolsName: string;
  NRP_Mechanic: string;
  NamaMekanik: string;
  CreatedDate: string;
  TargetDate: string;
  FUStatus: string;
  remarks: string;
  ToolsCondition: string;
  itemkey: string;
}

export default function FollowUp() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>([]);

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    toolsId: '',
    remarks: '',
    toolCondition: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [fuAction, setFuAction] = useState('rfu3');
  const [fuRemark, setFuRemark] = useState('');

  const filteredItems = followUpItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.baktNumber.toLowerCase().includes(query) ||
      item.toolsId.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.mekanik.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);
  const isPagingShow = filteredItems.length > itemsPerPage;


  const getStatusBadge = (status: FollowUpItem['status']) => {
    const statusConfig = {
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Overdue': 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusConfig[status]}>
        {status}
      </Badge>
    );
  };

  const handleExport = () => {
    console.log('Export Follow Up data');
    saveToExcel(followUpItems);
  };

  const saveToExcel = (data: FollowUpItem[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'BAKT Number': tool.baktNumber,
        'Tools ID': tool.toolsId,
        'Description': tool.description,
        'Mekanik': tool.mekanik,
        'Created Date': tool.createdDate,
        'Target Date': tool.targetDate,
        'Status': tool.status,
        'Remarks': tool.remarks,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Bakt_FollowUp_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }


  const handleAddRequest = (item: FollowUpItem) => {
    setEditingItem(item);
    setEditFormData({
      toolsId: item.toolsId,
      remarks: item.remarks,
      toolCondition: item.ToolsCondition,
    });

    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const response = await fetch(API.BAKT(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "INSERTREQUEST",
          jobsite: currentUser.Jobsite,
          nrpUser: currentUser.Nrp,
          BaktNo: editingItem.baktNumber,
          itemkey: editingItem.baktNumber,
          IdTool: editingItem.toolsId,
          ToolsCondition: editFormData.toolCondition,
          OutFrom: fuAction,
          Reason: editFormData.remarks,
          JobActivity: fuRemark
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const resData = data[0];

      if (resData?.Status == 1) {
        toast.success(resData?.Message || 'Follow-up added successfully');
        setIsEditDialogOpen(false);
        setFuAction('');
        setFuRemark('');
        ReloadFollowUp();
      } else {
        toast.error(resData?.Message || "Failed to add follow-up");
      }
    } catch (error: any) {
      console.error('Error updating follow-up:', error);
      toast.error(error.message || 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetails = (item: FollowUpItem) => {
    console.log('View details for:', item);
    // Implement view details logic
  };

  const ReloadFollowUp = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "FOLLOWUPBAKT"
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: FollowUpUnit[]) => {
        const items: FollowUpItem[] = json.map((u) => {
          return {
            baktNumber: u.BA_No ?? '',
            toolsId: u.IdTools ?? '',
            description: u.ToolsName ?? '',
            mekanik: u.NamaMekanik ?? '',
            createdDate: u.CreatedDate ?? '',
            targetDate: u.TargetDate ?? '',
            status: u.FUStatus ?? '',
            remarks: u.remarks ?? '',
            ToolsCondition: u.ToolsCondition ?? ''
          };
        });

        console.log(items);
        setFollowUpItems(items);

      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    ReloadFollowUp();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#003366] mb-2">Follow Up BAKT</h1>
          <p className="text-gray-500 text-sm">Track and monitor BAKT progress and completion</p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">In Progress</p>
              <p className="text-2xl text-blue-800">
                {followUpItems.filter(i => i.status === 'In Progress').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl text-yellow-800">
                {followUpItems.filter(i => i.status === 'Pending').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl text-green-800">
                {followUpItems.filter(i => i.status === 'Completed').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Overdue</p>
              <p className="text-2xl text-red-800">
                {followUpItems.filter(i => i.status === 'Overdue').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by BAKT Number, Tools ID, Description, Status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#003366] hover:bg-[#003366]">
              <TableHead className="text-white text-center">BAKT Number</TableHead>
              <TableHead className="text-white text-center">Tools ID</TableHead>
              <TableHead className="text-white text-center">Description</TableHead>
              <TableHead className="text-white text-center">Mekanik</TableHead>
              <TableHead className="text-white text-center">Created Date</TableHead>
              <TableHead className="text-white text-center">Target Date</TableHead>
              <TableHead className="text-white text-center">BAKT Status</TableHead>
              {/* <TableHead className="text-white text-center">Remarks</TableHead> */}
              <TableHead className="text-white bg-gray-600 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="text-gray-600">{item.baktNumber}</TableCell>
                  <TableCell className="text-gray-600">{item.toolsId}</TableCell>
                  <TableCell className="text-gray-600">{item.description}</TableCell>
                  <TableCell className="text-gray-600">{item.mekanik}</TableCell>
                  <TableCell className="text-gray-600">{item.createdDate}</TableCell>
                  <TableCell className="text-gray-600">{item.targetDate}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  {/* <TableCell className="text-gray-600">{item.remarks}</TableCell> */}
                  <TableCell className="flex gap-2 justify-center">
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(item)}
                      className="border-amber-500 text-amber-600"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                    </Button> */}
                    <Button
                      size="sm"
                      title="Add Follow Up"
                      variant="outline"
                      onClick={() => handleAddRequest(item)}
                      className="border-amber-500 text-amber-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  No follow-up items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className={`flex items-center justify-between mt-1  ${isPagingShow ? "" : "hidden"} `}>
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

      {/* Summary */}
      {/*<div className="flex items-center justify-between text-sm text-gray-600">*/}
      {/*  <p>*/}
      {/*    Showing {filteredItems.length} of {followUpItems.length} items*/}
      {/*  </p>*/}
      {/*  <p>Total Follow-Up: {followUpItems.length} BAKTs</p>*/}
      {/*</div>*/}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-[#003366] text-white p-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="h-6 w-6 text-[#00cccc]" />
              Add Follow-Up Request
            </DialogTitle>
            <DialogDescription className="text-blue-100/70">
              BAKT No. <span className="text-white font-mono">{editingItem?.baktNumber}</span>
              <div className="mt-2">{editingItem?.mekanik}</div>
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6 bg-white">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools ID</Label>
              <div className="p-2 bg-gray-50 rounded border text-sm font-medium text-gray-700">
                {editingItem?.toolsId}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <div className="p-2 bg-gray-50 rounded border text-sm font-medium text-gray-700">
                {editingItem?.description}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">BAKT Reason</Label>
              <div className="p-2 bg-gray-50 rounded border text-sm font-medium text-gray-700">
                {editingItem?.remarks}
              </div>
            </div>

            <div className="space-y-2 flex grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="tools-condition" className="text-sm font-medium text-gray-700">Tool Condition</Label>
                <Select
                  value={editFormData.toolCondition}
                  disabled
                >
                  <SelectTrigger id="tools-condition" className="w-full bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Con2">R1</SelectItem>
                    <SelectItem value="Con3">R2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fu-action" className="text-sm font-medium text-gray-700">Follow Up Action</Label>
                <Select
                  value={fuAction}
                  onValueChange={(value) => setFuAction(value)}
                >
                  <SelectTrigger id="fu-action" className="w-full bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rfu3">Repairing</SelectItem>
                    <SelectItem value="rfu5">R2</SelectItem>
                    <SelectItem value="rfu4">Good</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <Label htmlFor="fu-action" className="text-sm font-medium text-gray-700">Remark</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter follow-up remarks..."
                  onChange={(e) => setFuRemark(e.target.value)}
                  className="min-h-[100px] resize-none bg-white border border-gray-300"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 bg-white">
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-[#009999] hover:bg-[#007777] text-white min-w-[120px]"
              >
                {isSaving ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
