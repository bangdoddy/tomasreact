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

interface GroupTool {
  id: number;
  groupTools: string;
  description: string;
}

const initialGroups: GroupTool[] = [
  { id: 1, groupTools: 'GroupTools', description: 'TOOL' },
  { id: 2, groupTools: 'GroupTools', description: 'TOOL BOX ITEM' },
];

export default function GroupTools() {
  const [groups, setGroups] = useState<GroupTool[]>(initialGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupTool | null>(null);
  const [formData, setFormData] = useState({ groupTools: '', description: '' });

  const filteredGroups = groups.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.groupTools.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleEdit = (group: GroupTool) => {
    setEditingGroup(group);
    setFormData({ groupTools: group.groupTools, description: group.description });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingGroup(null);
    setFormData({ groupTools: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.groupTools.trim()) {
      toast.error('Group Tools is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (editingGroup) {
      setGroups(groups.map((g) =>
        g.id === editingGroup.id
          ? { ...g, groupTools: formData.groupTools, description: formData.description }
          : g
      ));
      toast.success('Group updated successfully');
    } else {
      const newGroup: GroupTool = {
        id: Math.max(...groups.map(g => g.id), 0) + 1,
        groupTools: formData.groupTools,
        description: formData.description,
      };
      setGroups([...groups, newGroup]);
      toast.success('Group added successfully');
    }

    setIsDialogOpen(false);
    setEditingGroup(null);
    setFormData({ groupTools: '', description: '' });
  };

  const handleDelete = (group: GroupTool) => {
    setGroups(groups.filter((g) => g.id !== group.id));
    toast.success('Group deleted successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#003366] mb-2">Group Tools</h1>
        <p className="text-gray-500 text-sm">Manage tool group classifications</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Group Tools or Description..."
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
              <TableHead className="text-white whitespace-nowrap w-[200px]">GroupTools</TableHead>
              <TableHead className="text-white whitespace-nowrap">Description</TableHead>
              <TableHead className="text-white whitespace-nowrap text-center w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, index) => (
                <TableRow
                  key={group.id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-900 whitespace-nowrap font-medium">
                    {group.groupTools}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {group.description}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(group)}
                        className="h-8 w-8 p-0 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(group)}
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
          Showing {filteredGroups.length} of {groups.length} records
        </p>
        <p>Total Records: {groups.length}</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingGroup ? 'Edit Group Tools' : 'Add New Group Tools'}
            </DialogTitle>
            <DialogDescription>
              {editingGroup ? 'Edit the group tools details' : 'Add a new group tools'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="groupTools">Group Tools *</Label>
              <Input
                id="groupTools"
                value={formData.groupTools}
                onChange={(e) => setFormData({ ...formData, groupTools: e.target.value })}
                placeholder="e.g., GroupTools"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., TOOL"
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
              {editingGroup ? 'Update Group' : 'Add Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
