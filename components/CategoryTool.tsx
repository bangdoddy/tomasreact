import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface CategoryTool {
  id: number;
  kodetools: string;
  desctools: string;
  maxid: number;
}

const initialCategories: CategoryTool[] = [
  { id: 1, kodetools: 'A', desctools: 'ADDITIONAL TOOL', maxid: 26 },
  { id: 2, kodetools: 'C', desctools: 'COMMON TOOL', maxid: 99 },
  { id: 3, kodetools: 'E', desctools: 'ELECTRICAL TOOL', maxid: 16 },
  { id: 4, kodetools: 'F', desctools: 'FACILITY', maxid: 50 },
  { id: 5, kodetools: 'L', desctools: 'LIFTING TOOL', maxid: 28 },
  { id: 6, kodetools: 'M', desctools: 'MEASURING TOOL', maxid: 45 },
  { id: 7, kodetools: 'S', desctools: 'SPECIAL TOOL', maxid: 48 },
  { id: 8, kodetools: 'T', desctools: 'TYRE TOOL', maxid: 33 },
  { id: 9, kodetools: 'X', desctools: 'TOOL BOX INCH', maxid: 33 },
  { id: 10, kodetools: 'Y', desctools: 'TOOL BOX METRIC', maxid: 33 },
];

export default function CategoryTool() {
  const [categories, setCategories] = useState<CategoryTool[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTool | null>(null);
  const [formData, setFormData] = useState({ kodetools: '', desctools: '', maxid: '' });

  const filteredCategories = categories.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.kodetools.toLowerCase().includes(query) ||
      item.desctools.toLowerCase().includes(query) ||
      item.maxid.toString().includes(query)
    );
  });

  const handleEdit = (category: CategoryTool) => {
    setEditingCategory(category);
    setFormData({ 
      kodetools: category.kodetools, 
      desctools: category.desctools, 
      maxid: category.maxid.toString() 
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({ kodetools: '', desctools: '', maxid: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.kodetools.trim()) {
      toast.error('Kode Tools is required');
      return;
    }

    if (!formData.desctools.trim()) {
      toast.error('Desc Tools is required');
      return;
    }

    if (!formData.maxid.trim()) {
      toast.error('Max ID is required');
      return;
    }

    const maxidNumber = parseInt(formData.maxid);
    if (isNaN(maxidNumber) || maxidNumber < 0) {
      toast.error('Max ID must be a valid number');
      return;
    }

    if (editingCategory) {
      setCategories(categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, kodetools: formData.kodetools, desctools: formData.desctools, maxid: maxidNumber }
          : c
      ));
      toast.success('Category updated successfully');
    } else {
      const newCategory: CategoryTool = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        kodetools: formData.kodetools,
        desctools: formData.desctools,
        maxid: maxidNumber,
      };
      setCategories([...categories, newCategory]);
      toast.success('Category added successfully');
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ kodetools: '', desctools: '', maxid: '' });
  };

  const handleDelete = (category: CategoryTool) => {
    setCategories(categories.filter((c) => c.id !== category.id));
    toast.success('Category deleted successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#003366] mb-2">Category Tool</h1>
        <p className="text-gray-500 text-sm">Manage tool categories with code and maximum ID</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Code, Description, or Max ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-[#009999] hover:bg-[#007777] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#6b7280] hover:bg-[#6b7280]">
              <TableHead className="text-white whitespace-nowrap w-[200px]">KODETOOLS</TableHead>
              <TableHead className="text-white whitespace-nowrap">DESCTOOLS</TableHead>
              <TableHead className="text-white whitespace-nowrap w-[150px]">MAXID</TableHead>
              <TableHead className="text-white whitespace-nowrap text-center w-[120px]">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <TableRow
                  key={category.id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-900 whitespace-nowrap font-medium">
                    {category.kodetools}
                  </TableCell>
                  <TableCell className="text-gray-600 whitespace-nowrap uppercase">
                    {category.desctools}
                  </TableCell>
                  <TableCell className="text-gray-600 whitespace-nowrap">
                    {category.maxid}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Showing {filteredCategories.length} of {categories.length} records
        </p>
        <p>Total Records: {categories.length}</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingCategory ? 'Edit Category Tool' : 'Add New Category Tool'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Edit the category tool details' : 'Add a new category tool'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kodetools">Kode Tools *</Label>
              <Input
                id="kodetools"
                value={formData.kodetools}
                onChange={(e) => setFormData({ ...formData, kodetools: e.target.value })}
                placeholder="e.g., A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desctools">Desc Tools *</Label>
              <Input
                id="desctools"
                value={formData.desctools}
                onChange={(e) => setFormData({ ...formData, desctools: e.target.value })}
                placeholder="e.g., ADDITIONAL TOOL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxid">Max ID *</Label>
              <Input
                id="maxid"
                type="number"
                value={formData.maxid}
                onChange={(e) => setFormData({ ...formData, maxid: e.target.value })}
                placeholder="e.g., 26"
                min="0"
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
              {editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
