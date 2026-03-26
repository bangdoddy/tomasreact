import { useState, useMemo } from 'react';
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
import { Plus, Edit, Trash2, Download, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { BudgetOpexItem, initialBudgetOpexData } from '../../data/budgetOpexData';

export default function BudgetingOpex() {
  const [items, setItems] = useState<BudgetOpexItem[]>(initialBudgetOpexData);
  const [yearFilter, setYearFilter] = useState<string>('All');

  // Simulating user role - in real app, this would come from auth context
  const [userRole] = useState<string>('Super User'); // Can be 'Super User' or 'PIC Tools'

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<BudgetOpexItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<BudgetOpexItem>>({
    toolsId: '',
    toolsCategory: '',
    toolsDescription: '',
    year: '2025',
    statusOpex: 'OPEX',
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
    finalBudget: 'No',
  });

  // Filter items by year
  const filteredItems = useMemo(() => {
    if (yearFilter === 'All') return items;
    return items.filter(item => item.year === yearFilter);
  }, [items, yearFilter]);

  // Get unique years from items
  const availableYears = useMemo(() => {
    const years = new Set(items.map(item => item.year));
    return ['All', ...Array.from(years).sort()];
  }, [items]);

  const handleInputChange = (field: keyof BudgetOpexItem, value: string | number) => {
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
    setCurrentItem(null);
    setFormData({
      toolsId: '',
      toolsCategory: '',
      toolsDescription: '',
      year: '2025',
      statusOpex: 'OPEX',
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
      finalBudget: 'No',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: BudgetOpexItem) => {
    setIsEditMode(true);
    setCurrentItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success('Budget item deleted successfully');
  };

  const handleSave = () => {
    if (!formData.toolsDescription) {
      toast.error('Please enter Tools Description');
      return;
    }

    if (isEditMode && currentItem) {
      setItems(
        items.map((item) =>
          item.id === currentItem.id ? { ...item, ...formData } : item
        )
      );
      toast.success('Budget item updated successfully');
    } else {
      const newItem: BudgetOpexItem = {
        id: Date.now().toString(),
        ...formData,
      } as BudgetOpexItem;
      setItems([...items, newItem]);
      toast.success('Budget item added successfully');
    }

    setIsDialogOpen(false);
  };

  const handleSubmit = () => {
    const itemsToSubmit = items.filter(item => item.finalBudget === 'Yes');
    
    if (itemsToSubmit.length === 0) {
      toast.error('No items with Final Budget = "Yes" to submit');
      return;
    }

    // Simulate submission to superior
    toast.success(`Successfully submitted ${itemsToSubmit.length} item(s) to superior for approval`);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const totalRequirement = filteredItems.reduce((sum, item) => sum + item.requirement, 0);
  const totalExisting = filteredItems.reduce((sum, item) => sum + item.existing, 0);
  const totalDeviasi = filteredItems.reduce((sum, item) => sum + item.deviasi, 0);
  const totalCost = filteredItems.reduce((sum, item) => sum + item.totalCost, 0);

  const handleDownloadExcel = () => {
    // Create CSV content for Excel
    const headers = [
      'ToolsId',
      'ToolsCategory',
      'Tools Description',
      'Year',
      'StatusOpex',
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
      ...filteredItems.map((item) =>
        [
          `"${item.toolsId}"`,
          `"${item.toolsCategory}"`,
          `"${item.toolsDescription}"`,
          `"${item.year}"`,
          `"${item.statusOpex}"`,
          item.cost,
          `"${item.brand}"`,
          `"${item.size}"`,
          `"${item.pn}"`,
          `"${item.klasifikasiTool}"`,
          item.requirement,
          item.existing,
          item.deviasi,
          item.totalCost,
          `"${item.remarks}"`,
          `"${item.finalBudget}"`,
          '""', // Placeholder for PIC Tool signature
          '""', // Placeholder for Unit Head signature
          '""', // Placeholder for Section/Dept Head signature
        ].join(',')
      ),
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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Budget Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#003366]">
                  <TableHead className="text-white">ToolsId</TableHead>
                  <TableHead className="text-white">ToolsCategory</TableHead>
                  <TableHead className="text-white">Tools Description</TableHead>
                  <TableHead className="text-white">Year</TableHead>
                  <TableHead className="text-white">StatusOpex</TableHead>
                  <TableHead className="text-white">Cost</TableHead>
                  <TableHead className="text-white">Brand</TableHead>
                  <TableHead className="text-white">Size</TableHead>
                  <TableHead className="text-white">PN</TableHead>
                  <TableHead className="text-white">Klasifikasi Tool</TableHead>
                  <TableHead className="text-white">Requirement</TableHead>
                  <TableHead className="text-white">Existing</TableHead>
                  <TableHead className="text-white">Deviasi</TableHead>
                  <TableHead className="text-white">Total Cost</TableHead>
                  <TableHead className="text-white">Remarks</TableHead>
                  <TableHead className="text-white">Final Budget</TableHead>
                  <TableHead className="text-white text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.toolsId}</TableCell>
                    <TableCell>{item.toolsCategory}</TableCell>
                    <TableCell>{item.toolsDescription}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                        {item.statusOpex}
                      </span>
                    </TableCell>
                    <TableCell>{formatIDR(item.cost)}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.pn}</TableCell>
                    <TableCell>{item.klasifikasiTool}</TableCell>
                    <TableCell className="text-center">{item.requirement}</TableCell>
                    <TableCell className="text-center">{item.existing}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.deviasi > 0
                            ? 'bg-red-100 text-red-700'
                            : item.deviasi === 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.deviasi}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatIDR(item.totalCost)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.remarks}>
                      {item.remarks}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.finalBudget === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.finalBudget}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete(item.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-[#009999]/10 hover:bg-[#009999]/10">
                  <TableCell colSpan={10} className="text-right">
                    <strong>TOTAL:</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <strong>{totalRequirement}</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <strong>{totalExisting}</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <strong className={`px-2 py-1 rounded text-xs ${
                      totalDeviasi > 0
                        ? 'bg-red-100 text-red-700'
                        : totalDeviasi === 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {totalDeviasi}
                    </strong>
                  </TableCell>
                  <TableCell>
                    <strong>{formatIDR(totalCost)}</strong>
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
                id="toolsId"
                value={formData.toolsId}
                onChange={(e) => handleInputChange('toolsId', e.target.value)}
                placeholder="e.g., CDMSA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolsCategory">Tools Category</Label>
              <Select
                value={formData.toolsCategory}
                onValueChange={(value) => handleInputChange('toolsCategory', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMMON TOOL">COMMON TOOL</SelectItem>
                  <SelectItem value="DRILLING TOOL">DRILLING TOOL</SelectItem>
                  <SelectItem value="LIFTING TOOL">LIFTING TOOL</SelectItem>
                  <SelectItem value="ADDITIONAL TOOL">ADDITIONAL TOOL</SelectItem>
                  <SelectItem value="MEASURING TOOL">MEASURING TOOL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolsDescription">Tools Description *</Label>
              <Input
                id="toolsDescription"
                value={formData.toolsDescription}
                onChange={(e) => handleInputChange('toolsDescription', e.target.value)}
                placeholder="e.g., AIR PLASMA CUTTER 45 AMPERE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => handleInputChange('year', value)}
              >
                <SelectTrigger>
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
              <Label htmlFor="statusOpex">Status Opex</Label>
              <Select
                value={formData.statusOpex}
                onValueChange={(value) => handleInputChange('statusOpex', value)}
              >
                <SelectTrigger>
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
                type="number"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', Number(e.target.value))}
                placeholder="0"
                disabled={userRole !== 'Super User'}
                className={userRole !== 'Super User' ? 'bg-gray-100' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="e.g., ENERPAC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="e.g., 80 TON"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pn">PN</Label>
              <Input
                id="pn"
                value={formData.pn}
                onChange={(e) => handleInputChange('pn', e.target.value)}
                placeholder="e.g., STD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="klasifikasiTool">Klasifikasi Tool</Label>
              <Input
                id="klasifikasiTool"
                value={formData.klasifikasiTool}
                onChange={(e) => handleInputChange('klasifikasiTool', e.target.value)}
                placeholder="e.g., STD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirement">Requirement</Label>
              <Input
                id="requirement"
                type="number"
                value={formData.requirement}
                onChange={(e) => handleInputChange('requirement', Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="existing">Existing</Label>
              <Input
                id="existing"
                type="number"
                value={formData.existing}
                onChange={(e) => handleInputChange('existing', Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviasi">Deviasi (Auto-calculated)</Label>
              <Input
                id="deviasi"
                type="number"
                value={formData.deviasi}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost (Auto-calculated)</Label>
              <Input
                id="totalCost"
                value={formatIDR(formData.totalCost || 0)}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks {userRole !== 'PIC Tools' && userRole !== 'Super User' && '(Read Only)'}</Label>
              <Input
                id="remarks"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Additional notes or comments"
                disabled={userRole !== 'PIC Tools' && userRole !== 'Super User'}
                className={userRole !== 'PIC Tools' && userRole !== 'Super User' ? 'bg-gray-100' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalBudget">Final Budget {userRole !== 'Super User' && '(Read Only)'}</Label>
              <Select
                value={formData.finalBudget}
                onValueChange={(value) => handleInputChange('finalBudget', value)}
                disabled={userRole !== 'Super User'}
              >
                <SelectTrigger className={userRole !== 'Super User' ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Select final budget status" />
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
                setIsDeleteDialogOpen(false);
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
