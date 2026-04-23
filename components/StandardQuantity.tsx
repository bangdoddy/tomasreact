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
import { Plus, Pencil, Trash2, Package, Download, Upload, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { StdQuantity, GlobalModel } from "../model/Models";
import { API } from '../config';


export default function StandardQuantity() {
  const { currentUser } = useAuth();
  const [itemList, setItemList] = useState<StdQuantity[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StdQuantity | null>(null);
  const [formData, setFormData] = useState({
    ToolsId: '',
    Jobsite: '',
    ToolsCategory: '',
    ToolsDesc: '',
    StatusCapex: '',
    StdQuantity: "0",
    RiskCategory: '',
    Sertification: ''
  });
  /*Model*/
  const [jobsites, setJobsites] = useState<GlobalModel[]>([]);
  const [categories, setCategories] = useState<GlobalModel[]>([]);
  const [riskCategorys, setRiskCategories] = useState<GlobalModel[]>([]);
  const [sertifications, setSertifications] = useState<GlobalModel[]>([]);
  const [statusCapex, setStatusCapex] = useState<GlobalModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      ToolsId: '',
      Jobsite: '',
      ToolsCategory: '',
      ToolsDesc: '',
      StatusCapex: '',
      StdQuantity: "0",
      RiskCategory: '',
      Sertification: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: StdQuantity) => {
    setEditingItem(item);
    setFormData({
      ToolsId: item.ToolsId,
      Jobsite: item.Jobsite,
      ToolsCategory: item.ToolsCategory,
      ToolsDesc: item.ToolsDesc,
      StatusCapex: item.StatusCapex,
      StdQuantity: item.StdQuantity,
      RiskCategory: item.RiskCategory,
      Sertification: item.Sertification
    });
    setIsDialogOpen(true);
  };

  const handleToolSearch = async (toolId: string) => {
    if (!toolId) return;

    try {
      const params = new URLSearchParams({
        action: "WITHTOTAL",
        jobsite: currentUser.Jobsite,
        current: "1",
        perpage: "1",
        filter: toolId,
      });

      const response = await fetch(API.REGISTERTOOLS() + `?${params.toString()}`, {
        method: "GET"
      });

      if (!response.ok) {
        toast.error(`Error searching tool: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const tools = data.data ?? data;

      if (Array.isArray(tools) && tools.length > 0) {
        const tool = tools.find((t: any) => t.ToolsId.toLowerCase() === toolId.toLowerCase()) || tools[0];

        if (tool.ToolsId.toLowerCase() === toolId.toLowerCase()) {
          setFormData(prev => ({
            ...prev,
            ToolsDesc: tool.ToolsDesc || '',
            ToolsCategory: tool.ToolsType || tool.ToolsCategory || '',
            StatusCapex: tool.StatusCapex || '',
            Sertification: tool.StatusStd || '',
            Jobsite: tool.ToolsJobsite || '',
          }));
          // toast.success("Tool data found and populated");
        } else {
          toast.error("Tool ID not found");
        }
      } else {
        toast.error("Tool ID not found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search tool data");
    }
  };

  const handleSave = async () => {
    if (!formData.ToolsCategory || !formData.ToolsDesc || !formData.ToolsId
      || !formData.Jobsite || !formData.StdQuantity || !formData.StatusCapex) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(API.STDQUANTITY(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingItem ? "UPDATE" : "INSERT"),
          nrp: currentUser.Nrp,
          ToolId: formData.ToolsId,
          Kategori: formData.ToolsCategory,
          Desc: formData.ToolsDesc,
          StatusCapex: formData.StatusCapex,
          StdQuantity: formData.StdQuantity,
          RiskCategory: formData.RiskCategory,
          Sertification: formData.Sertification,
          Jobsite: formData.Jobsite
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
      const response = await fetch(API.STDQUANTITY(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          ToolId: editingItem.ToolsId,
          Jobsite: editingItem.Jobsite,
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

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const openDeleteDialog = (tools: StdQuantity) => {
    setEditingItem(tools);
    setIsDeleteDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = itemList.map(item => ({
      'Tools Id': item.ToolsId,
      'Tools Category': item.ToolsCategory,
      'Tools Desc': item.ToolsDesc,
      'Standard Qty': item.StdQuantity,
      'Current Qty': item.ActualQuantity,
      'Status Capex': item.StatusCapex,
      'Risk Category': item.RiskCategory,
      'Sertification': item.Sertification,
      'Jobsite': item.Jobsite,
      'Status': item.Status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Standard Quantity');
    XLSX.writeFile(wb, 'standard_quantity.xlsx');
    toast.success('Data exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.success(`Feature Import is under maintenance`);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        const wb = XLSX.read(binaryStr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws) as any[];

        //const importedData: StandardQty[] = jsonData.map((row, index) => ({
        //  id: data.length + index + 1,
        //  toolsCategory: row['Tools Category'] || '',
        //  toolsType: row['Tools Type'] || '',
        //  standardQty: Number(row['Standard Qty']) || 0,
        //  currentQty: Number(row['Current Qty']) || 0,
        //  jobsite: row['Jobsite'] || '',
        //  workgroup: row['Workgroup'] || '',
        //}));

        //setData([...data, ...importedData]);
        //toast.success(`Imported ${importedData.length} records successfully`);
      } catch (error) {
        toast.error('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const ReloadMaster = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
    });
    fetch(API.STDQUANTITY() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: StdQuantity[]) => setItemList(json))
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
      .then((json: GlobalModel[]) => { setJobsites(json); console.log(json); })
      .catch((error) => console.error("Error:", error));
  }

  const ReloadCertification = () => {
    const params = new URLSearchParams({
      kategori: "StatusCertification"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setSertifications(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadRiskCategori = () => {
    const params = new URLSearchParams({
      kategori: "RiskCategory"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setRiskCategories(json))
      .catch((error) => console.error("Error:", error));
  }
  const ReloadStatusCapex = () => {
    const params = new URLSearchParams({
      kategori: "StatusCapex"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setStatusCapex(json))
      .catch((error) => console.error("Error:", error));
  }
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

  useEffect(() => {
    if (itemList.length == 0) {
      ReloadMaster();
    } else if (jobsites.length === 0) {
      ReloadJobsites();
      console.log("Reload Jobsite")
    } else if (statusCapex.length === 0) {
      ReloadStatusCapex();
      console.log("Reload statusCapex")
    } else if (riskCategorys.length === 0) {
      ReloadRiskCategori();
      console.log("Reload riskCategorys")
    } else if (sertifications.length === 0) {
      ReloadCertification();
      console.log("Reload sertifications")
    } else if (categories.length === 0) {
      ReloadCategory()
      console.log("Reload categories")
    }
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(itemList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = itemList.slice(startIndex, endIndex);

  const filteredTransactions = currentItems.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      transaction.ToolsDesc?.toLowerCase().includes(query) ||
      transaction.ToolsCategory?.toLowerCase().includes(query)
    );
  });

  //dashboard
  const totalItems = itemList.length;
  const meetingStandard = itemList.filter(item => item.Status == "OK").length;
  const belowStandard = totalItems - meetingStandard;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[#003366]">Standard Quantity Management</h1>
          <p className="text-gray-600 mt-1">Manage standard quantity requirements for tools</p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="import-file">
            <Button
              variant="outline"
              className="border-[#009999] text-[#009999] hover:bg-[#009999]/10"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-[#009999] text-[#009999] hover:bg-[#009999]/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-[#009999] hover:bg-[#007777] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Standard
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-[#009999] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-2">
              <span className="text-[#003366]">{totalItems}</span>
              <Package className="h-8 w-8 text-[#009999]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-600">Meeting Standard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#003366]">{meetingStandard}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({totalItems > 0 ? ((meetingStandard / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-600">Below Standard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#003366]">{belowStandard}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({totalItems > 0 ? ((belowStandard / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-[#003366] w-full max-w-[50px]">
            Standard Quantity List
          </CardTitle>
          <div className="relative w-full max-w-[100px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#009999]/50" />
            <Input
              placeholder="Search by tools desc or category..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 border-[#009999]/30 focus:border-[#009999] focus:ring-[#009999]/20"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-100">ToolsId</TableHead>
                  <TableHead className="bg-gray-100">Category</TableHead>
                  <TableHead className="bg-gray-100">Desc</TableHead>
                  <TableHead className="text-center bg-gray-100">Standard Qty</TableHead>
                  <TableHead className="text-center bg-gray-100">Current Qty</TableHead>
                  <TableHead className="text-center bg-gray-100">Status</TableHead>
                  <TableHead className="bg-gray-100">Status Capex</TableHead>
                  <TableHead className="bg-gray-100">Risk<br />Category</TableHead>
                  <TableHead className="bg-gray-100">Cert</TableHead>
                  <TableHead className="bg-gray-100">Jobsite</TableHead>
                  <TableHead className="text-right bg-gray-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((item) => {
                  var isBelow = item.Status != "OK"
                  return (
                    <TableRow key={item.ToolsId}>
                      <TableCell className="text-gray-600">{item.ToolsId}</TableCell>
                      <TableCell className="text-gray-600">{item.ToolsCategory}</TableCell>
                      <TableCell className="text-gray-600">{item.ToolsDesc}</TableCell>
                      <TableCell className="text-center text-gray-600">{item.StdQuantity}</TableCell>
                      <TableCell className="text-center text-gray-600">{item.ActualQuantity}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs ${isBelow
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {isBelow ? 'Below' : 'OK'}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.StatusCapex}</TableCell>
                      <TableCell className="text-gray-600">{item.RiskCategory}</TableCell>
                      <TableCell className="text-gray-600">{item.Sertification}</TableCell>
                      <TableCell className="text-gray-600">{item.Jobsite}</TableCell>
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
              {editingItem ? 'Edit Standard Quantity' : 'Add Standard Quantity'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Tools Id *</Label>
              <Input
                id="category"
                disabled={editingItem != null}
                value={formData.ToolsId}
                onChange={(e) => setFormData({ ...formData, ToolsId: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleToolSearch(formData.ToolsId);
                  }
                }}
                placeholder="Enter Tools ID then press ENTER..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tools Desc *</Label>
              <Input
                id="type"
                value={formData.ToolsDesc}
                onChange={(e) => setFormData({ ...formData, ToolsDesc: e.target.value })}
                placeholder="e.g., Welding Machine"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Tools Category *</Label>
                <Input
                  id="category"
                  value={formData.ToolsCategory}
                  onChange={(e) => setFormData({ ...formData, ToolsCategory: e.target.value })}
                  placeholder="Enter Tools Category..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="standardQty">Standard Qty *</Label>
                <Input
                  id="standardQty"
                  type="number"
                  value={formData.StdQuantity}
                  onChange={(e) => setFormData({ ...formData, StdQuantity: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobsite">Jobsite *</Label>
                <Select
                  value={formData.Jobsite}
                  onValueChange={(value) => {
                    // const selected = jobsites.find(j => j.Keterangan === value);
                    setFormData({ ...formData, Jobsite: value })
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statuscapex">Status Capex *</Label>
                <Select
                  value={formData.StatusCapex}
                  onValueChange={(value) => {
                    setFormData({ ...formData, StatusCapex: value })
                  }}
                >
                  <SelectTrigger id="statuscapex">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {statusCapex.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))} */}
                    <SelectItem value="CAPEX">CAPEX</SelectItem>
                    <SelectItem value="OPEX">OPEX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskCategori">Risk Category</Label>
                <Select
                  value={formData.RiskCategory}
                  onValueChange={(value) => {
                    setFormData({ ...formData, RiskCategory: value })
                  }}
                >
                  <SelectTrigger id="add-jobsite">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskCategorys.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="Certification">Certification</Label>
                <Select
                  value={formData.Sertification}
                  onValueChange={(value) => {
                    setFormData({ ...formData, Sertification: value })
                  }}
                >
                  <SelectTrigger id="add-jobsite">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X">X</SelectItem>
                    <SelectItem value="V">V</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              This will permanently delete the "{editingItem?.ToolsDesc}" (ID: {editingItem?.ToolsId}
              ). This action cannot be undone.
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
