import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Pencil, Trash2, Download, Search, ChevronLeft, ChevronRight, Users, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { User } from '../App';
import { useAuth, GlobalModel } from "../service/AuthContext";
import { API } from '../config';

export default function UserManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [jobsites, setJobsites] = useState<GlobalModel[]>([]);
  const [jabatans, setJabatans] = useState<GlobalModel[]>([]);
  const [superiors, setSuperiors] = useState<GlobalModel[]>([]);
  const [workgroups, setWorkgroups] = useState<GlobalModel[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    nrp: '',
    name: '',
    supervisorNrp: '',
    supervisorName: '',
    position: '',
    positionId: '',
    jobsite: '',
    jobsiteId: '',
    workgroup: '',
    workgroupId: '',
    jabatanStructural: '',
    jabatanStructuralId: '',
  });

  const [resetFormData, setResetFormData] = useState({
    nrp: '',
    password: '',
    repassword: ''
  });

  const filteredUsers = users.filter(
    (user) =>
      user.nrp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.supervisorNrp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.supervisorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Workgroup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleAddUser = async () => {
    if (
      !formData.nrp ||
      !formData.name ||
      !formData.supervisorNrp ||
      !formData.supervisorName ||
      !formData.position ||
      !formData.jobsite ||
      !formData.workgroup
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.DETAILUSER(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "INSERT",
          nrp: formData.nrp,
          nama: formData.name,
          NrpSuperior: formData.supervisorNrp,
          Jabatan: formData.positionId,
          JabatanStructural: formData.jabatanStructuralId,
          Jobsite: formData.jobsiteId,
          Workgroup: formData.workgroupId
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
          setIsAddDialogOpen(false);
          resetForm();
          toast.success(resData?.Message ?? 'User Insert successfully ');
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

  const handleEditUser = async () => {
    if (!selectedUser) return;

    if (
      !formData.nrp ||
      !formData.name ||
      !formData.supervisorNrp ||
      !formData.supervisorName ||
      !formData.position ||
      !formData.jobsite ||
      !formData.workgroup
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.DETAILUSER(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "UPDATE",
          nrp: formData.nrp,
          nama: formData.name,
          NrpSuperior: formData.supervisorNrp,
          Jabatan: formData.positionId,
          JabatanStructural: formData.jabatanStructuralId,
          Jobsite: formData.jobsiteId,
          Workgroup: formData.workgroupId
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
          setIsEditDialogOpen(false);
          setSelectedUser(null);
          resetForm();
          toast.success(resData?.Message ?? 'User updated successfully ');
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
    if (!selectedUser) return;

    try {
      const response = await fetch(API.DETAILUSER(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          nrp: selectedUser.nrp,
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
          setSelectedUser(null);
          toast.success(resData?.Message ?? 'User deleted successfully ');
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

  const handleResetUser = async () => {
    if (!selectedUser) return;
    if (
      !resetFormData.nrp ||
      !resetFormData.password ||
      !resetFormData.repassword
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (resetFormData.password != resetFormData.repassword) {
      toast.error('Confirm password not valid');
      return;
    }

    try {
      const response = await fetch(API.DETAILUSER(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "RESET",
          nrp: resetFormData.nrp,
          password: resetFormData.password
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          setIsResetDialogOpen(false);
          setSelectedUser(null);
          toast.success(resData?.Message ?? 'User Reset successfully ');
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

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    const selected = superiors.find(j => j.Kode === user.supervisorNrp);
    setFormData({
      nrp: user.nrp,
      name: user.name,
      supervisorNrp: user.supervisorNrp,
      supervisorName: selected?.Keterangan ?? user.supervisorName,
      position: user.Jabatan,
      jobsite: user.Jobsite,
      workgroup: user.Workgroup,
      positionId: user.JabatanId,
      jobsiteId: user.JobsiteId,
      workgroupId: user.WorkgroupId,
      jabatanStructural: user.JabatanStructural,
      jabatanStructuralId: user.JabatanStructuralId
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openResetDialog = (user: User) => {
    setSelectedUser(user);
    const selected = superiors.find(j => j.Kode === user.supervisorNrp);
    setResetFormData({
      nrp: user.nrp,
      password: "",
      repassword: ""
    });
    setIsResetDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nrp: '',
      name: '',
      supervisorNrp: '',
      supervisorName: '',
      position: '',
      positionId: '',
      jobsite: '',
      jobsiteId: '',
      workgroup: '',
      workgroupId: '',
      jabatanStructural: '',
      jabatanStructuralId: ''
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      users.map((user) => ({
        'User NRP': user.nrp,
        'User Name': user.name,
        'Superior NRP': user.supervisorNrp,
        'Superior Name': user.supervisorName,
        Jabatan: user.Jabatan,
        Jobsite: user.Jobsite,
        Workgroup: user.Workgroup,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    XLSX.writeFile(workbook, `SmartTomas_Users_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  };

  const ReloadMaster = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
    });
    fetch(API.DETAILUSER() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: User[]) => setUsers(json))
      .catch((error) => console.error("Error:", error));
  };

  const ReloadJobsites = () => {
    const params = new URLSearchParams({
      kategori: "Jobsite"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setJobsites(json))
      .catch((error) => console.error("Error:", error));
  }
  const ReloadJabatans = () => {
    const params = new URLSearchParams({
      kategori: "Jabatan"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setJabatans(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadSuperior = () => {
    const params = new URLSearchParams({
      showdata: "SUPERIOR",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setSuperiors(json))
      .catch((error) => console.error("Error:", error));
  };


  const ReloadWorkgroup = () => {
    const params = new URLSearchParams({
      showdata: "WORKGROUP",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setWorkgroups(json))
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    ReloadMaster();
    ReloadJobsites();
    ReloadJabatans();
    ReloadWorkgroup();
    ReloadSuperior();
    //if(users.length === 0) { 
    //  ReloadMaster(); 
    //  console.log("Reload Users")
    //}
    //else if(jobsites.length === 0) { 
    //  ReloadJobsites(); 
    //  console.log("Reload Jobsite")
    //}
    //else if(jabatans.length === 0) { 
    //  ReloadJabatans(); 
    //  console.log("Reload Jabatan")
    //}
    //else if (workgroups.length === 0) {
    //    ReloadWorkgroup();
    //    console.log("Reload workgroups")
    //} 
    //else if (superiors.length === 0) {
    //    ReloadSuperior();
    //    console.log("Reload superiors")
    //}
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>User Data Management</CardTitle>
              <CardDescription>Manage employee information and assignments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10">
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by NRP, name, supervisor, or workgroup..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-gray-300 hover:bg-gray-300">
                    <TableHead colSpan={2} className="text-center border-r border-gray-400 text-gray-900 h-12">
                      User
                    </TableHead>
                    <TableHead colSpan={2} className="text-center border-r border-gray-400 text-gray-900 h-12">
                      Superior
                    </TableHead>
                    <TableHead rowSpan={2} className="text-center border-r border-gray-400 text-gray-900">
                      Jabatan
                    </TableHead>
                    <TableHead rowSpan={2} className="text-center border-r border-gray-400 text-gray-900">
                      Jabatan<br />Structural
                    </TableHead>
                    <TableHead rowSpan={2} className="text-center border-r border-gray-400 text-gray-900">
                      Jobsite
                    </TableHead>
                    <TableHead rowSpan={2} className="text-center border-r border-gray-400 text-gray-900">
                      Workgroup
                    </TableHead>
                    <TableHead rowSpan={2} className="text-right text-gray-900">
                      Actions
                    </TableHead>
                  </TableRow>
                  <TableRow className="bg-gray-300 hover:bg-gray-300">
                    <TableHead className="text-center border-r border-gray-400 text-gray-900">NRP</TableHead>
                    <TableHead className="text-center border-r border-gray-400 text-gray-900">Name</TableHead>
                    <TableHead className="text-center border-r border-gray-400 text-gray-900">NRP</TableHead>
                    <TableHead className="text-center border-r border-gray-400 text-gray-900">Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.nrp}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.name}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.supervisorNrp}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.supervisorName}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.Jabatan}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.JabatanStructural}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.Jobsite}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{user.Workgroup}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(user)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openResetDialog(user)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new employee record in the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-nrp">User NRP *</Label>
                <Input
                  id="add-nrp"
                  value={formData.nrp}
                  onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                  placeholder="e.g., 00018083"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-name">User Name *</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-supervisor-name">Supervisor Name *</Label>
                {/*<Input*/}
                {/*    id="add-supervisor-name"*/}
                {/*    value={formData.supervisorName}*/}
                {/*    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}*/}
                {/*    placeholder="Supervisor name"*/}
                {/*/>*/}
                <Select
                  value={formData.supervisorName}
                  onValueChange={(value) => {
                    const selected = superiors.find(j => j.Keterangan === value);
                    setFormData({ ...formData, supervisorName: value, supervisorNrp: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="add-supervisor-name">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {superiors.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-supervisor-nrp">Supervisor NRP *</Label>
                <Input
                  id="add-supervisor-nrp"
                  disabled={true}
                  value={formData.supervisorNrp}
                  onChange={(e) => setFormData({ ...formData, supervisorNrp: e.target.value })}
                  placeholder="e.g., 107193"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-position">Jabatan *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => {
                    const selected = jabatans.find(j => j.Keterangan === value);
                    setFormData({ ...formData, position: value, positionId: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="add-position">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {jabatans.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-position2">Jabatan Struktural *</Label>
                <Select
                  value={formData.jabatanStructural}
                  onValueChange={(value) => {
                    const selected = jabatans.find(j => j.Keterangan === value);
                    setFormData({ ...formData, jabatanStructural: value, jabatanStructuralId: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="add-position2">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {jabatans.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-jobsite">Jobsite *</Label>
                <Select
                  value={formData.jobsite}
                  onValueChange={(value) => {
                    const selected = jobsites.find(j => j.Keterangan === value);
                    setFormData({ ...formData, jobsite: value, jobsiteId: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="add-jobsite">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobsites.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                    {/*<SelectItem value="HAJU">HAJU</SelectItem>
                    <SelectItem value="BUMA">BUMA</SelectItem>
                    <SelectItem value="KPC">KPC</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-workgroup">Workgroup *</Label>
                <Select
                  value={formData.workgroup}
                  onValueChange={(value) => {
                    const selected = workgroups.find(j => j.Keterangan === value);
                    setFormData({ ...formData, workgroup: value, workgroupId: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="add-workgroup">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {workgroups.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/*<Input*/}
                {/*  id="add-workgroup"*/}
                {/*  value={formData.workgroup}*/}
                {/*  onChange={(e) => setFormData({ ...formData, workgroup: e.target.value })}*/}
                {/*  placeholder="e.g., AD02001"*/}
                {/*/>*/}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]">Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nrp">User NRP *</Label>
                <Input
                  id="edit-nrp"
                  disabled={true}
                  value={formData.nrp}
                  onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">User Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-supervisor-name">Supervisor Name *</Label>
                {/*<Input*/}
                {/*  id="edit-supervisor-name"*/}
                {/*  value={formData.supervisorName}*/}
                {/*  onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}*/}
                {/*/>*/}
                <Select
                  value={formData.supervisorName}
                  onValueChange={(value) => {
                    const selected = superiors.find(j => j.Keterangan === value);
                    setFormData({ ...formData, supervisorName: value, supervisorNrp: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="edit-supervisor-name">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {superiors.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-supervisor-nrp">Supervisor NRP *</Label>
                <Input
                  id="edit-supervisor-nrp"
                  disabled={true}
                  value={formData.supervisorNrp}
                  onChange={(e) => setFormData({ ...formData, supervisorNrp: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-position">Jabatan *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => {
                    const selected = jabatans.find(j => j.Keterangan === value);
                    setFormData({ ...formData, position: value, positionId: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="edit-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jabatans.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-position2">Jabatan Struktural *</Label>
                <Select
                  value={formData.jabatanStructural}
                  onValueChange={(value) => {
                    const selected = jabatans.find(j => j.Keterangan === value);
                    setFormData({ ...formData, jabatanStructural: value, jabatanStructuralId: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="edit-position2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jabatans.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-jobsite">Jobsite *</Label>
                <Select
                  value={formData.jobsite}
                  onValueChange={(value) => {
                    const selected = jobsites.find(j => j.Keterangan === value);
                    setFormData({ ...formData, jobsite: value, jobsiteId: selected?.Kode ?? "" })
                  }}
                >
                  <SelectTrigger id="edit-jobsite">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobsites.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                    {/*<SelectItem value="HAJU">HAJU</SelectItem>
                    <SelectItem value="BUMA">BUMA</SelectItem>
                    <SelectItem value="KPC">KPC</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-workgroup">Workgroup *</Label>
                {/*<Input*/}
                {/*  id="edit-workgroup"*/}
                {/*  value={formData.workgroup}*/}
                {/*  onChange={(e) => setFormData({ ...formData, workgroup: e.target.value })}*/}
                {/*/>*/}
                <Select
                  value={formData.workgroup}
                  onValueChange={(value) => {
                    const selected = workgroups.find(j => j.Keterangan === value);
                    setFormData({ ...formData, workgroup: value, workgroupId: selected?.Kode ?? "" })
                  }} >
                  <SelectTrigger id="edit-workgroup">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workgroups.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{selectedUser?.name}" (NRP: {selectedUser?.nrp}
              ). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reset Password User</DialogTitle>
            <DialogDescription>Reset Password information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-4">
                <Label htmlFor="add-nrp">Password *</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={resetFormData.password}
                  onChange={(e) => setResetFormData({ ...resetFormData, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-4">
                <Label htmlFor="add-name">Confirm Password *</Label>
                <Input
                  id="reset-repassword"
                  type="password"
                  value={resetFormData.repassword}
                  onChange={(e) => setResetFormData({ ...resetFormData, repassword: e.target.value })}
                  placeholder="Confirm Password"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResetDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleResetUser} className="bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]">Reset</Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}