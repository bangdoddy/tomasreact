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

interface WorkGroup {
  id: number;
  jobsite: string;
  description: string;
}

const initialWorkGroups: WorkGroup[] = [
  { id: 1, jobsite: 'AD01001', description: 'PLANT PRIME MOVER' },
  { id: 2, jobsite: 'AD01002', description: 'PLANT VESSEL' },
  { id: 3, jobsite: 'AD01003', description: 'PLANT TYRE & SUPPORT' },
  { id: 4, jobsite: 'AD01004', description: 'PLANT FUEL TRANSPORT' },
  { id: 5, jobsite: 'AD01005', description: 'PLANT FMC KELANIS' },
  { id: 6, jobsite: 'AD01006', description: 'PLANT HAULING' },
  { id: 7, jobsite: 'AD02001', description: 'PLANT SUPPORT EQUIPMENT' },
  { id: 8, jobsite: 'AD02002', description: 'GOH' },
  { id: 9, jobsite: 'AD02003', description: 'HAULER' },
  { id: 10, jobsite: 'AD02004', description: 'DRILL & LOADER' },
  { id: 11, jobsite: 'AD02005', description: 'PPS & DEWATERING' },
  { id: 12, jobsite: 'AD02006', description: 'TYRE' },
  { id: 13, jobsite: 'JA00001', description: 'GOH' },
  { id: 14, jobsite: 'JA00002', description: 'ENGINE' },
  { id: 15, jobsite: 'JA00003', description: 'POWER TRAIN' },
  { id: 16, jobsite: 'JA00004', description: 'YARD' },
  { id: 17, jobsite: 'MH00000', description: 'PLANT HAULING' },
  { id: 18, jobsite: 'MH00001', description: 'HAULER' },
  { id: 19, jobsite: 'MH00002', description: 'SUPPORT' },
  { id: 20, jobsite: 'MH00003', description: 'PORT' },
  { id: 21, jobsite: 'MH00004', description: 'TYRE' },
  { id: 22, jobsite: 'MH00005', description: 'PLANT TYRE HAULING' },
  { id: 23, jobsite: 'MM00001', description: 'PLANT MINING' },
  { id: 24, jobsite: 'MM00002', description: 'PLANT LOADER DRILLING' },
  { id: 25, jobsite: 'MM00003', description: 'PLANT PIT SERVICES' },
  { id: 26, jobsite: 'MM00004', description: 'PLANT WHEEL' },
  { id: 27, jobsite: 'MM00005', description: 'PLANT SUPPORT' },
  { id: 28, jobsite: 'MM00006', description: 'PLANT TYRE MINING' },
  { id: 29, jobsite: 'SE00001', description: 'PLANT SECTION HEAD' },
  { id: 30, jobsite: 'SE00002', description: 'PLANNER' },
  { id: 31, jobsite: 'SE00003', description: 'PLANT ENGINEER' },
  { id: 32, jobsite: 'SE00004', description: 'PLANT HAULING COAL' },
  { id: 33, jobsite: 'SE00005', description: 'PLANT HAULING OB' },
  { id: 34, jobsite: 'SE00006', description: 'PLANT LOADER DRILLING' },
  { id: 35, jobsite: 'SE00007', description: 'PLANT PIT SERVICE' },
  { id: 36, jobsite: 'SE00008', description: 'PLANT SUPPORT EQUIPMENT' },
  { id: 37, jobsite: 'SE00009', description: 'PLANT' },
  { id: 38, jobsite: 'SE00010', description: 'PSD' },
  { id: 39, jobsite: 'SE00011', description: 'TYRE' },
  { id: 40, jobsite: 'SE00012', description: 'PPD' },
];

export default function WorkGroup() {
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>(initialWorkGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkGroup, setEditingWorkGroup] = useState<WorkGroup | null>(null);
  const [formData, setFormData] = useState({ jobsite: '', description: '' });

  const filteredWorkGroups = workGroups.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.jobsite.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleEdit = (workGroup: WorkGroup) => {
    setEditingWorkGroup(workGroup);
    setFormData({ 
      jobsite: workGroup.jobsite, 
      description: workGroup.description 
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingWorkGroup(null);
    setFormData({ jobsite: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.jobsite.trim()) {
      toast.error('Jobsite is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (editingWorkGroup) {
      setWorkGroups(workGroups.map((w) =>
        w.id === editingWorkGroup.id
          ? { ...w, jobsite: formData.jobsite, description: formData.description }
          : w
      ));
      toast.success('Work Group updated successfully');
    } else {
      const newWorkGroup: WorkGroup = {
        id: Math.max(...workGroups.map(w => w.id), 0) + 1,
        jobsite: formData.jobsite,
        description: formData.description,
      };
      setWorkGroups([...workGroups, newWorkGroup]);
      toast.success('Work Group added successfully');
    }

    setIsDialogOpen(false);
    setEditingWorkGroup(null);
    setFormData({ jobsite: '', description: '' });
  };

  const handleDelete = (workGroup: WorkGroup) => {
    setWorkGroups(workGroups.filter((w) => w.id !== workGroup.id));
    toast.success('Work Group deleted successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#003366] mb-2">Work Group</h1>
        <p className="text-gray-500 text-sm">Manage work groups and departments</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Jobsite or Description..."
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
              <TableHead className="text-white whitespace-nowrap w-[200px]">Work Group</TableHead>
              <TableHead className="text-white whitespace-nowrap">Description</TableHead>
              <TableHead className="text-white whitespace-nowrap text-center w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkGroups.length > 0 ? (
              filteredWorkGroups.map((workGroup, index) => (
                <TableRow
                  key={workGroup.id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-900 whitespace-nowrap font-medium">
                    {workGroup.jobsite}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {workGroup.description}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(workGroup)}
                        className="h-8 w-8 p-0 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(workGroup)}
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
          Showing {filteredWorkGroups.length} of {workGroups.length} records
        </p>
        <p>Total Records: {workGroups.length}</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingWorkGroup ? 'Edit Work Group' : 'Add New Work Group'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkGroup ? 'Edit the details of the work group.' : 'Add a new work group.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobsite">Jobsite *</Label>
              <Input
                id="jobsite"
                value={formData.jobsite}
                onChange={(e) => setFormData({ ...formData, jobsite: e.target.value })}
                placeholder="e.g., AD01001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., PLANT PRIME MOVER"
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
              {editingWorkGroup ? 'Update Work Group' : 'Add Work Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
