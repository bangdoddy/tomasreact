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
import { Plus, Pencil, Trash2, UserCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GenSetting, GlobalModel } from "../model/Models";
import { API } from '../config';

interface Role {
  id: number;
  position: string;
  description: string;
  userCount: number;
}

const initialRoles: Role[] = [
  { id: 1, position: 'PIC Tools', description: 'Person In Charge of Tools Management', userCount: 1 },
  { id: 2, position: 'Group Leader', description: 'Leads a group of workers', userCount: 3 },
  { id: 3, position: 'Supervisor', description: 'Supervises team operations', userCount: 5 },
  { id: 4, position: 'Super User', description: 'Administrative user with full access', userCount: 2 },
  { id: 5, position: 'Welder', description: 'Welding specialist', userCount: 8 },
  { id: 6, position: 'Tool Officer', description: 'Manages tool operations and logistics', userCount: 2 },
  { id: 7, position: 'Plant Engineer', description: 'Oversees plant engineering operations', userCount: 4 },
  { id: 8, position: 'Driver Support', description: 'Provides transportation and driving support', userCount: 6 },
  { id: 9, position: 'Electric Engineer', description: 'Electrical engineering specialist', userCount: 5 },
  { id: 10, position: 'Tyreman', description: 'Tire maintenance specialist', userCount: 3 },
  { id: 11, position: 'Mechanic', description: 'Performs mechanical repairs and maintenance', userCount: 12 },
  { id: 12, position: 'Officer', description: 'General officer position', userCount: 7 },
  { id: 13, position: 'Tool Keeper', description: 'Maintains and manages tool inventory', userCount: 4 },
  { id: 14, position: 'Unit Head Planner', description: 'Plans and coordinates unit operations', userCount: 2 },
  { id: 15, position: 'Section Head', description: 'Heads a specific section', userCount: 3 },
  { id: 16, position: 'Department Head', description: 'Heads a department', userCount: 2 },
  { id: 17, position: 'Rigger', description: 'Rigging specialist', userCount: 5 },
];

export default function RolesManagement() {
  const { currentUser } = useAuth();
  const [itemList, setItemList] = useState<GenSetting[]>([]);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<GenSetting | null>(null);
  const [formData, setFormData] = useState({
    Kode: '',
    Keterangan: '',
    Detail: '',
    Kategori: '',
  });

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({ Kode: '', Keterangan: '', Detail: '', Kategori: 'Jabatan', });
    setIsDialogOpen(true);
  };

  const handleEdit = (role: GenSetting) => {
    setEditingRole(role);
    setFormData({ Kode: role.Kode, Keterangan: role.Keterangan, Detail: role.Detail, Kategori: role.Kategori });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (item: GenSetting) => {
    setEditingRole(item);
    setIsDeleteDialogOpen(true);
  }

  const handleSave = async () => {
    if (!formData.Kode || !formData.Keterangan) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.GENERALSETTING(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingRole ? "UPDATE" : "INSERT"),
          Kode: formData.Kode,
          Keterangan: formData.Keterangan,
          Detail: formData.Detail,
          Kategori: formData.Kategori
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
          setEditingRole(null);
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


  const handleDeleteRole = async () => {
    if (!editingRole) return;

    try {
      const response = await fetch(API.GENERALSETTING(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          Kode: editingRole.Kode,
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
          setEditingRole(null);
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
      Kategori: 'Jabatan',
      jobsite: currentUser.Jobsite
    });
    fetch(API.GENERALSETTING() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GenSetting[]) => {
        for (var x = 0; x < json.length; x++) {
          if (json[x].Detail == null || json[x].Detail == "") {
            for (var y = 0; y < roles.length; y++) {
              if (json[x].Keterangan?.toLowerCase() == roles[y].position?.toLowerCase()) {
                json[x].Detail = roles[y].description;
                break;
              }
            }
          }
        }
        setItemList(json)
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    if (itemList.length == 0) {
      ReloadMaster();
    }
  });


  // Pagination calculations
  const totalPages = Math.ceil(itemList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = itemList.slice(startIndex, endIndex);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#003366]">Roles Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and positions</p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-[#009999] hover:bg-[#007777] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-[#009999] shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-lg">{itemList.length}</span>
              <UserCircle className="h-8 w-8 text-[#009999] p-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#009999] shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Active Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-lg">{itemList.filter(r => r.Jumlah > 0).length}</span>
              <UserCircle className="h-8 w-8 text-blue-500 p-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#009999] shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Inactive Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-lg">{itemList.filter(r => r.Jumlah === 0).length}</span>
              <UserCircle className="h-8 w-8 text-gray-400 p-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Roles List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((role) => (
                <TableRow key={role.Kode}>
                  <TableCell className="text-gray-600">{role.Kode}</TableCell>
                  <TableCell className="text-gray-600">{role.Keterangan}</TableCell>
                  <TableCell className="text-gray-600">{role.Detail}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#009999] text-white text-sm">
                      {role.Jumlah}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(role)}
                        className="text-[#009999] hover:text-[#007777]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(role)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kode *</Label>
              <Input
                id="category"
                disabled={editingRole != null}
                value={formData.Kode}
                onChange={(e) => setFormData({ ...formData, Kode: e.target.value })}
                placeholder="e.g., Jab11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position Name *</Label>
              <Input
                id="position"
                value={formData.Keterangan}
                onChange={(e) => setFormData({ ...formData, Keterangan: e.target.value })}
                placeholder="e.g., Supervisor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.Detail}
                onChange={(e) => setFormData({ ...formData, Detail: e.target.value })}
                placeholder="Role description"
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
              {editingRole ? 'Update' : 'Add'} Role
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
              This will permanently delete the "{editingRole?.Keterangan}" (ID: {editingRole?.Kode}
              ). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingRole(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}