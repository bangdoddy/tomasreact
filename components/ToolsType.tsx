import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Plus, Pencil, Trash2, Package, Download, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { ToolsTypeModel, GlobalModel } from "../model/Models";
import { API } from '../config';

export default function GeneralSetting({ PartCode }: { PartCode?: string }) {
  const isSpesific = Boolean(PartCode);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("ALL");
  useEffect(() => {
    setSelectedCategory(PartCode || "ALL");
  }, [PartCode]);

  const { currentUser } = useAuth();
  const [itemList, setItemList] = useState<ToolsTypeModel[]>([]);
  const [categories, setCategories] = useState<GlobalModel[]>([]);

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  /*Model Edit */
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ToolsTypeModel | null>(null);
  const [formData, setFormData] = useState({
    Kode: '',
    Keterangan: '',
    MaxId: '',
    PartCode: '',
  });

  /*Action */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      Kode: '',
      Keterangan: '',
      MaxId: '',
      PartCode: '',
    });
    setIsDialogOpen(true);
  }

  const handleEdit = (item: ToolsTypeModel) => {
    setEditingItem(item);
    setFormData({
      Kode: item.Kode,
      Keterangan: item.Keterangan,
      MaxId: item.MaxId,
      PartCode: item.PartCode
    });
    setIsDialogOpen(true);
  }
  const openDeleteDialog = (item: ToolsTypeModel) => {
    setEditingItem(item);
    setIsDeleteDialogOpen(true);
  }
  const handleSave = async () => {
    if (!formData.Kode || !formData.Keterangan || !formData.PartCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.TYPETOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingItem ? "UPDATE" : "INSERT"),
          Kode: formData.Kode,
          Keterangan: formData.Keterangan,
          MaxId: String(formData.MaxId),
          PartCode: formData.PartCode
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
  const handleDeleteItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(API.TYPETOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
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
  /*Load Server */
  const ReloadMaster = () => {
    const params = new URLSearchParams({
      PartCode: selectedCategory,
      jobsite: currentUser.Jobsite
    });
    fetch(API.TYPETOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolsTypeModel[]) => setItemList(json))
      .catch((error) => console.error("Error:", error));
  };

  const ReloadCategory = () => {
    const params = new URLSearchParams({
      showdata: "MASTERSETTING"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setCategories(json))
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    if (itemList.length == 0) {
      ReloadMaster();
    } else if (categories.length === 0) {
      ReloadCategory()
      console.log("Reload categories")
    }
  });
  //Filter Data
  const filteredList = itemList.filter(
    (user) => user.PartCode.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory === "ALL"
  );
  // Pagination calculations
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredList.slice(startIndex, endIndex);

  const titlePage = PartCode ?? "Tools Type" 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[#003366]">{titlePage}</h1>
          <p className="text-gray-600 mt-1">Manage Master {titlePage} </p>
        </div>
        <div className="flex gap-2"> 
          <Button
            onClick={handleAdd}
            className="bg-[#009999] hover:bg-[#007777] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {titlePage ?? "Setting"}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">{titlePage} List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>MaxId</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item) => {
                  return (
                    <TableRow key={item.Kode}>
                      <TableCell>{item.Kode}</TableCell>
                      <TableCell>{item.Keterangan}</TableCell>
                      <TableCell>{item.MaxId}</TableCell>
                      <TableCell>{item.PartCode}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="text-[#009999] hover:text-[#007777]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {(editingItem ? 'Edit ' : 'Add ') + titlePage}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kode *</Label>
              <Input
                id="category"
                disabled={editingItem != null}
                value={formData.Kode}
                onChange={(e) => setFormData({ ...formData, Kode: e.target.value })}
                placeholder="e.g., JB001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Nama/Keterangan *</Label>
              <Input
                id="type"
                value={formData.Keterangan}
                onChange={(e) => setFormData({ ...formData, Keterangan: e.target.value })}
                placeholder="e.g., Welding Machine"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">MaxId</Label>
              <Input
                id="type"
                type="number"
                value={formData.MaxId}
                onChange={(e) => setFormData({ ...formData, MaxId: e.target.value })}
                placeholder="e.g., Welding Machine All"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="PartCode">part Code *</Label>
              <Input
                id="type"
                type="number"
                value={formData.PartCode}
                onChange={(e) => setFormData({ ...formData, PartCode: e.target.value })}
                placeholder="e.g., Welding Machine All"
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
              This will permanently delete the "{editingItem?.Keterangan}" (ID: {editingItem?.Kode}
              ). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
} 