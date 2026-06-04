import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Plus, Edit, Trash2, Download, Send, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { BudgetCapexItem, initialBudgetCapexData } from '../../data/budgetCapexData';
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import { useAuth } from '../../service/AuthContext';
import * as XLSX from 'xlsx';

interface OpexData {
  IdKey: string;
  OrderNo: string;
  ToolsJobsite: string;
  ToolsId: string;
  ToolsDescription: string;
  ToolsBrand: string;
  ToolsSize: string;
  ToolsQty: string;
  ToolsExisting: string;
  ToolsDeviasi: string;
  ToolsCost: string;
  TotalCost: string;
  StatusCapex: string;
  Category: string;
  ToolsPN: string;
  ToolsKlasifikasi: string;
  ToolsYear: string;
  Remarks: string;
  IsFinal: string;
  StOrder: string;
}

export default function BudgetingCapex() {
  const { currentUser } = useAuth();
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [opexData, setOpexData] = useState<OpexData[]>([]);
  const [categories, setCategories] = useState<GlobalModel[]>([]);
  const [stdQuantities, setStdQuantities] = useState<GlobalModel[]>([]);

  // Simulating user role - in real app, this would come from auth context
  const [userRole] = useState<string>('Super User'); // Can be 'Super User' or 'PIC Tools'

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<BudgetCapexItem | null>(null);
  const [editingItem, setEditingItem] = useState<OpexData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    id: '',
    orderNo: '',
    toolsId: '',
    jobsite: '',
    toolsCategory: '',
    toolsDescription: '',
    year: '',
    statusCapex: 'CAPEX',
    cost: 0,
    brand: '',
    size: '',
    pn: '',
    klasifikasiTool: '',
    requirement: 0,
    existing: 0,
    deviasi: 0,
    totalCost: 0,
    remarks: '',
    finalBudget: '',
  });

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

  const ReloadOpexData = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      nrp: currentUser.Nrp,
      statusCapex: "OPEX"
    });
    fetch(API.CAPEX() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: OpexData[]) => {
        setOpexData(json);
        console.log(json);
      })
      .catch((error) => console.error("Error:", error));
  };

  // Filter items by year and search term
  const filteredItems = useMemo(() => {
    let result = opexData;

    if (yearFilter !== 'All') {
      result = result.filter(item => item.ToolsYear?.trim() === yearFilter.trim());
    }

    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      result = result.filter(item =>
      (item.ToolsDescription?.toLowerCase().includes(search) ||
        item.ToolsId?.toLowerCase().includes(search) ||
        item.Category?.toLowerCase().includes(search) ||
        item.ToolsBrand?.toLowerCase().includes(search) ||
        item.ToolsKlasifikasi?.toLowerCase().includes(search))
      );
    }

    return result;
  }, [opexData, yearFilter, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [yearFilter, searchTerm, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredItems, totalPages, currentPage]);

  // Get unique years from items
  const availableYears = useMemo(() => {
    const years = new Set(opexData.map(item => item.ToolsYear?.trim()).filter(Boolean));
    return ['All', ...Array.from(years).sort()];
  }, [opexData]);

  const ScanFinalBudget = () => {
    return opexData.filter(item => item.IsFinal === 'Yes' && item.StOrder === 'New');
  };

  const handleInputChange = (field: keyof BudgetCapexItem, value: string | number) => {
    const updatedData = { ...formData, [field]: value };

    // Auto-calculate deviasi and totalCost
    if (field === 'requirement' || field === 'existing' || field === 'cost') {
      const req = Number(field === 'requirement' ? value : updatedData.requirement || 0);
      const exist = Number(field === 'existing' ? value : updatedData.existing || 0);
      const costValue = Number(field === 'cost' ? value : updatedData.cost || 0);

      updatedData.deviasi = req - exist;
      updatedData.totalCost = updatedData.deviasi * costValue;
    }

    setFormData(updatedData);
  };

  const handleAdd = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setCurrentItem(null);
    setFormData({
      id: '',
      orderNo: '',
      toolsId: '',
      jobsite: currentUser?.Jobsite || '',
      toolsCategory: '',
      toolsDescription: '',
      year: '',
      statusCapex: 'OPEX',
      cost: 0,
      brand: '',
      size: '',
      pn: '',
      klasifikasiTool: '',
      requirement: 0,
      existing: 0,
      deviasi: 0,
      totalCost: 0,
      remarks: '',
      finalBudget: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: OpexData) => {
    // Enter edit mode and populate form with selected item data
    setIsEditMode(true);
    setEditingItem(item);
    // Store a minimal currentItem with id for update logic
    // setCurrentItem({ id: item.Id } as any);

    setFormData({
      id: '',
      orderNo: item.OrderNo,
      toolsId: item.ToolsId,
      jobsite: currentUser?.Jobsite || '',
      toolsCategory: item.Category.charAt(0).toUpperCase(),
      toolsDescription: item.ToolsDescription,
      year: item.ToolsYear,
      statusCapex: item.StatusCapex,
      cost: Number(item.ToolsCost),
      brand: item.ToolsBrand,
      size: item.ToolsSize,
      pn: item.ToolsPN,
      klasifikasiTool: item.ToolsKlasifikasi,
      requirement: Number(item.ToolsQty),
      existing: Number(item.ToolsExisting),
      deviasi: Number(item.ToolsQty) - Number(item.ToolsExisting),
      totalCost: Number(item.ToolsCost) * (Number(item.ToolsQty) - Number(item.ToolsExisting)),
      remarks: item.Remarks,
      finalBudget: item.IsFinal
    });
    console.table(item);
    setIsDialogOpen(true);
  };



  const handleDelete = async (Id: string) => {
    setOpexData(opexData.filter((item) => item.IdKey !== Id));

    try {
      const response = await fetch(API.CAPEX(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          nrpUser: currentUser?.Nrp,
          IdKey: Id.toString(),
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadOpexData();
          setEditingItem(null);
          setIsDialogOpen(false);
          toast.success(resData?.Message ?? 'successfully');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Response");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const handleSave = async () => {
    if (!formData.finalBudget) {
      toast.error('Please enter Status Final Budget');
      return;
    }

    if (!formData.year || formData.year === '-') {
      toast.error('Please enter Year');
      return;
    }

    if (!formData.cost) {
      toast.error('Please enter Cost');
      return;
    }


    try {
      const response = await fetch(API.CAPEX(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (isEditMode ? "UPDATE" : "INSERT"),
          nrpUser: currentUser?.Nrp,
          IdKey: formData.id,
          ToolsId: formData.toolsId,
          Category: formData.toolsCategory,
          ToolsDesc: formData.toolsDescription,
          StatusCapex: formData.statusCapex,
          Year: formData.year,
          Brand: formData.brand,
          Size: formData.size,
          PN: formData.pn,
          Klasifikasi: formData.klasifikasiTool,
          Qty: String(formData.requirement),
          Existing: String(formData.existing),
          Cost: String(formData.cost),
          jobsite: currentUser?.Jobsite,
          Remark: formData.remarks,
          IsFinal: formData.finalBudget,
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadOpexData();
          setEditingItem(null);
          setIsDialogOpen(false);
          toast.success(resData?.Message ?? 'successfully');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Response");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }


    // if (isEditMode && currentItem) {
    //   setCapexData(
    //     capexData.map((item) =>
    //       item.Id === currentItem.id ? { ...item, ...mappedItem } : item
    //     )
    //   );
    //   toast.success('Budget item updated successfully');
    // } else {
    //   const newItem: CapexData = {
    //     Id: Date.now().toString(),
    //     ToolsJobsite: currentUser?.Jobsite || '',
    //     StOrder: '',
    //     ...mappedItem,
    //   } as CapexData;
    //   setCapexData([...capexData, newItem]);
    //   toast.success('Budget item added successfully');
    // }

    // setIsDialogOpen(false);
  };

  const handleSubmit = async () => {
    const itemsToSubmit = opexData.filter(item => item.IsFinal === 'Yes' && item.StOrder === 'New');

    if (itemsToSubmit.length === 0) {
      toast.error('No items with Final Budget = "Yes" to submit');
      return;
    }

    try {
      const response = await fetch(API.CAPEX(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "SUBMITREQUEST",
          nrpUser: currentUser?.Nrp,
          jobsite: currentUser?.Jobsite,
          statusCapex: "OPEX"
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadOpexData();
          setEditingItem(null);
          setIsDialogOpen(false);
          // toast.success(resData?.Message ?? 'successfully');
          toast.success(`Successfully submitted ${itemsToSubmit.length} item(s) to superior for approval`);
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Response");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const totalRequirement = filteredItems.reduce((sum, item) => sum + Number(item.ToolsQty), 0);
  const totalExisting = filteredItems.reduce((sum, item) => sum + Number(item.ToolsExisting), 0);
  const totalDeviasi = filteredItems.reduce((sum, item) => sum + (Number(item.ToolsDeviasi)), 0);
  const totalCost = filteredItems.reduce((sum, item) => sum + Number(item.TotalCost), 0);

  const handleToolSearch = async (toolId: string) => {
    if (!toolId) return;

    try {
      const params = new URLSearchParams({
        ShowData: "STDQUANTITY",
        Jobsite: currentUser.Jobsite,
        Keyword: toolId,
      });

      const response = await fetch(API.FILTERS() + `?${params.toString()}`, {
        method: "GET"
      });

      if (!response.ok) {
        toast.error(`Error searching tool: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const tools = data.data ?? data;

      if (Array.isArray(tools) && tools.length > 0) {
        const tool = tools.find((t: any) => t.Kode.toLowerCase() === toolId.toLowerCase()) || tools[0];

        if (tool.Kode.toLowerCase() === toolId.toLowerCase()) {
          setFormData(prev => ({
            ...prev,
            toolsDescription: tool.Nama || '',
            toolsCategory: tool.KategoriId || tool.Kategori || '',
            statusCapex: tool.Status || '',
            requirement: tool.Qty || '0',
            existing: tool.existing || '0',
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

  const handleDownloadExcel = () => {
    // Create CSV content for Excel
    const headers = [
      'ToolsId',
      'ToolsCategory',
      'Tools Description',
      'Year',
      'StatusCapex',
      'Cost',
      'Brand',
      'Size',
      'PN',
      'Klasifikasi Tool',
      'Requirement',
      'Existing',
      'Deviasi',
      'Total Cost',
      'Remarks',
      'Final Budget',
      'Diajukan Oleh (Nama Lengkap) PIC Tool',
      'Disetujui Oleh (Nama Lengkap) Unit Head',
      'Diketahui Oleh (Nama Lengkap) Section Head / Dept. Head',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredItems.map((item) => {
        const deviasi = Number(item.ToolsQty) - Number(item.ToolsExisting);
        const totalItemCost = Number(item.ToolsCost) * deviasi;
        return [
          `"${item.ToolsId}"`,
          `"${item.Category}"`,
          `"${item.ToolsDescription}"`,
          `"${item.ToolsYear}"`,
          `"${item.StatusCapex}"`,
          item.ToolsCost,
          `"${item.ToolsBrand}"`,
          `"${item.ToolsSize}"`,
          `"${item.ToolsPN}"`,
          `"${item.ToolsKlasifikasi}"`,
          item.ToolsQty,
          item.ToolsExisting,
          deviasi,
          totalItemCost,
          `"${item.Remarks}"`,
          `"${item.IsFinal}"`,
          '""', // Placeholder for PIC Tool signature
          '""', // Placeholder for Unit Head signature
          '""', // Placeholder for Section/Dept Head signature
        ].join(',');
      }),
      // Total row
      [
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
        '"TOTAL:"',
        totalRequirement,
        totalExisting,
        totalDeviasi,
        totalCost,
        '""',
        '""',
        '""',
        '""',
        '""',
      ].join(','),
    ].join('\n');

    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Budgeting_OPEX_${yearFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Excel file downloaded successfully!');
  };

  useEffect(() => {
    ReloadOpexData();
    ReloadCategory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#003366] mb-1">Budgeting OPEX</h2>
          <p className="text-gray-600">Manage operational expenditure budget for tools and equipment</p>
        </div>
        <div className="flex gap-3">
          <Button
            disabled={ScanFinalBudget().length === 0}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#003366] to-[#009999] hover:opacity-90 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
          <Button
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-[#003366] to-[#009999] hover:opacity-90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget Item
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-[#003366] to-[#009999]">
        <CardContent className="p-6">
          <div className="text-white">
            <p className="text-sm text-white/80 mb-1">Total OPEX Budget</p>
            <p className="text-3xl">{formatIDR(totalCost)}</p>
            <p className="text-sm text-white/80 mt-2">{filteredItems.length} items in budget</p>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Tools description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-0"
              />
            </div>
            <Label htmlFor="yearFilter" className="whitespace-nowrap">Filter Year:</Label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg p-2">
        <CardHeader>
          <CardTitle>Budget Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="border border-gray-200">
              <TableHeader>
                <TableRow className="border-b-0 divide-x divide-gray-300">
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">ToolsId</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">ToolsCategory</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Tools Description</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Year</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">StatusCapex</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Size</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">PN</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Klasifikasi</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Cost</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Requirement</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Existing</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Deviasi</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Total Cost</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Final Budget</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Status</TableHead>
                  <TableHead className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item, index) => (
                  <TableRow key={item.IdKey || `${item.ToolsId}-${index}`} className="hover:bg-gray-50 text-xs">
                    <TableCell className="font-medium">{item.ToolsId}</TableCell>
                    <TableCell>{item.Category}</TableCell>
                    <TableCell>{item.ToolsDescription}</TableCell>
                    <TableCell>{item.ToolsYear}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                        {item.StatusCapex}
                      </span>
                    </TableCell>
                    <TableCell>{item.ToolsSize}</TableCell>
                    <TableCell>{item.ToolsPN}</TableCell>
                    <TableCell>{item.ToolsKlasifikasi}</TableCell>
                    <TableCell className="text-right">{formatIDR(Number(item.ToolsCost))}</TableCell>
                    <TableCell className="text-center">{item.ToolsQty}</TableCell>
                    <TableCell className="text-center">{item.ToolsExisting}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${Number(item.ToolsDeviasi) > 0
                          ? 'bg-red-100 text-red-700'
                          : Number(item.ToolsDeviasi) === 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {Number(item.ToolsDeviasi)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatIDR(Number(item.TotalCost))}</TableCell>

                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${item.IsFinal === 'Yes'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {item.IsFinal}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${item.StOrder === 'Submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        {item.StOrder}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {/* {item.StOrder != "Submitted" && ( */}
                        <><Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button><Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete(item.IdKey);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                          </Button></>
                        {/* )} */}

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-[#009999]/10 hover:bg-[#009999]/10">
                  <TableCell colSpan={9} className="text-right">
                    <strong>TOTAL:</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <strong>{totalRequirement}</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <strong>{totalExisting}</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <strong>
                      {totalDeviasi}
                    </strong>
                  </TableCell>
                  <TableCell>
                    <strong>{formatIDR(totalCost)}</strong>
                  </TableCell>
                  <TableCell colSpan={4}></TableCell>
                </TableRow>
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
                <SelectTrigger id="itemsPerPage" className="w-[80px]">
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
              <span className="mx-2 text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Budget Item' : 'Add New Budget Item'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the budget item details below.'
                : 'Fill in the details to add a new budget item.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="toolsId">Tools ID</Label>
              <Input
                className="bg-white border-gray-300"
                id="toolsId"
                disabled={isEditMode}
                value={formData.toolsId}
                onChange={(e) => setFormData({ ...formData, toolsId: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleToolSearch(formData.toolsId);
                  }
                }}
                placeholder="PRESS ENTER to verify"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolsCategory">Tools Category</Label>
              <Select
                value={formData.toolsCategory}
                onValueChange={(value) => {
                  setFormData({ ...formData, toolsCategory: value })
                }
                }
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="toolsDescription">Tools Description *</Label>
              <Input
                className="bg-white border-gray-300"
                id="toolsDescription"
                value={formData.toolsDescription}
                onChange={(e) => setFormData({ ...formData, toolsDescription: e.target.value })}
                placeholder="e.g., AIR PLASMA CUTTER 45 AMPERE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={formData.year}
                // disabled={isEditMode}
                onValueChange={(value) => setFormData({ ...formData, year: value, finalBudget: 'No' })}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusCapex">Status Capex</Label>
              <Select
                value={formData.statusCapex}
                onValueChange={(value) => setFormData({ ...formData, statusCapex: value })}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAPEX">CAPEX</SelectItem>
                  <SelectItem value="OPEX">OPEX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (IDR) {userRole !== 'Super User' && '(Read Only)'}</Label>
              <Input
                id="cost"
                type="text"
                value={formData.cost ? new Intl.NumberFormat('id-ID').format(formData.cost) : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  const numValue = rawValue ? parseInt(rawValue, 10) : 0;
                  handleInputChange('cost', numValue);
                }}
                placeholder="0"
                disabled={userRole !== 'Super User'}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                className="bg-white border-gray-300"
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., ENERPAC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                className="bg-white border-gray-300"
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., 80 TON"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pn">PN</Label>
              <Input
                className="bg-white border-gray-300"
                id="pn"
                value={formData.pn}
                onChange={(e) => setFormData({ ...formData, pn: e.target.value })}
                placeholder="e.g., STD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="klasifikasiTool">Klasifikasi Tool</Label>
              <Input
                className="bg-white border-gray-300"
                id="klasifikasiTool"
                value={formData.klasifikasiTool}
                onChange={(e) => setFormData({ ...formData, klasifikasiTool: e.target.value })}
                placeholder="e.g., STD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirement">Requirement</Label>
              <Input
                className="bg-white border-gray-300"
                id="requirement"
                type="number"
                disabled={true}
                min={0}
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: Number(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="existing">Existing</Label>
              <Input
                className="bg-white border-gray-300"
                id="existing"
                type="number"
                disabled={true}
                min={0}
                value={formData.existing}
                onChange={(e) => setFormData({ ...formData, existing: Number(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 hidden">
              <Label htmlFor="deviasi">Deviasi (Auto-calculated)</Label>
              <Input
                id="deviasi"
                type="number"
                value={formData.deviasi}
                disabled
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks {userRole !== 'PIC Tools' && userRole !== 'Super User' && '(Read Only)'}</Label>
              <Input
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional notes..."
                disabled={userRole !== 'PIC Tools' && userRole !== 'Super User'}
                className={userRole !== 'PIC Tools' && userRole !== 'Super User' ? 'bg-white border-gray-300' : 'bg-white border-gray-300'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalBudget">Final Budget {userRole !== 'Super User' && '(Read Only)'}</Label>
              <Select
                value={formData.finalBudget}
                onValueChange={(value) => setFormData({ ...formData, finalBudget: value })}
                disabled={userRole !== 'Super User'}
              >
                <SelectTrigger className={userRole !== 'Super User' ? 'bg-white border-gray-300' : 'bg-white border-gray-300'}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
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
              className="bg-gradient-to-r from-[#003366] to-[#009999] hover:opacity-90 text-white"
            >
              {isEditMode ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The budget item will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  handleDelete(itemToDelete);
                }
                //setIsDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}