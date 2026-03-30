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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface ConditionTool {
  id: number;
  conditionTools: string;
  description: string;
}

const initialConditions: ConditionTool[] = [
  { id: 1, conditionTools: 'Good', description: 'Good Condition, ready to use' },
  { id: 2, conditionTools: 'R1', description: 'Damaged, can repair' },
  { id: 3, conditionTools: 'R2', description: "Damaged, can't repair" },
  { id: 4, conditionTools: 'TA', description: 'Lost' },
];

export default function ConditionTool() {
  const [conditions, setConditions] = useState<ConditionTool[]>(initialConditions);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<ConditionTool | null>(null);
  const [formData, setFormData] = useState({ conditionTools: '', description: '' });

  const filteredConditions = conditions.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.conditionTools.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleEdit = (condition: ConditionTool) => {
    setEditingCondition(condition);
    setFormData({ conditionTools: condition.conditionTools, description: condition.description });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCondition(null);
    setFormData({ conditionTools: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.conditionTools.trim()) {
      toast.error('Condition Tools is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (editingCondition) {
      setConditions(conditions.map((c) =>
        c.id === editingCondition.id
          ? { ...c, conditionTools: formData.conditionTools, description: formData.description }
          : c
      ));
      toast.success('Condition updated successfully');
    } else {
      const newCondition: ConditionTool = {
        id: Math.max(...conditions.map(c => c.id), 0) + 1,
        conditionTools: formData.conditionTools,
        description: formData.description,
      };
      setConditions([...conditions, newCondition]);
      toast.success('Condition added successfully');
    }

    setIsDialogOpen(false);
    setEditingCondition(null);
    setFormData({ conditionTools: '', description: '' });
  };

  const handleDelete = (condition: ConditionTool) => {
    setConditions(conditions.filter((c) => c.id !== condition.id));
    toast.success('Condition deleted successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#003366] mb-2">Condition Tool</h1>
        <p className="text-gray-500 text-sm">Manage tool condition statuses and descriptions</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Condition Tools or Description..."
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
            <TableRow className="bg-[#003366] hover:bg-[#003366]">
              <TableHead className="text-white whitespace-nowrap w-[200px]">Condition Tools</TableHead>
              <TableHead className="text-white whitespace-nowrap">Description</TableHead>
              <TableHead className="text-white whitespace-nowrap text-center w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConditions.length > 0 ? (
              filteredConditions.map((condition, index) => (
                <TableRow
                  key={condition.id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-900 whitespace-nowrap font-medium">
                    {condition.conditionTools}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {condition.description}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(condition)}
                        className="h-8 w-8 p-0 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(condition)}
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
                <TableCell colSpan={3} className="text-center text-gray-500 py-8">
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
          Showing {filteredConditions.length} of {conditions.length} records
        </p>
        <p>Total Records: {conditions.length}</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingCondition ? 'Edit Condition Tool' : 'Add New Condition Tool'}
            </DialogTitle>
            <DialogDescription>
              {editingCondition ? 'Edit the condition tool details' : 'Add a new condition tool'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="conditionTools">Condition Tools *</Label>
              <Input
                id="conditionTools"
                value={formData.conditionTools}
                onChange={(e) => setFormData({ ...formData, conditionTools: e.target.value })}
                placeholder="e.g., Good"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Good Condition, ready to use"
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
              {editingCondition ? 'Update Condition' : 'Add Condition'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
