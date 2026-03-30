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

interface Jobsite {
  id: number;
  jobsite: string;
  description: string;
}

const initialJobsites: JobsiteData[] = [
  { id: 1, jobsite: '40AI', description: 'MACO MINING' },
  { id: 2, jobsite: '40AD', description: 'SERA MINING' },
  { id: 3, jobsite: '40AB', description: 'ADMO MINING' },
  { id: 4, jobsite: '40AC', description: 'ADMO HAULING' },
  { id: 5, jobsite: '4090', description: 'NAROGONG' },
];

export default function Jobsite() {
  const [jobsites, setJobsites] = useState<Jobsite[]>(initialJobsites);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJobsite, setEditingJobsite] = useState<Jobsite | null>(null);
  const [formData, setFormData] = useState({ jobsite: '', description: '' });

  const filteredJobsites = jobsites.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.jobsite.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleEdit = (jobsite: Jobsite) => {
    setEditingJobsite(jobsite);
    setFormData({ jobsite: jobsite.jobsite, description: jobsite.description });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingJobsite(null);
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

    if (editingJobsite) {
      setJobsites(jobsites.map((j) =>
        j.id === editingJobsite.id
          ? { ...j, jobsite: formData.jobsite, description: formData.description }
          : j
      ));
      toast.success('Jobsite updated successfully');
    } else {
      const newJobsite: Jobsite = {
        id: Math.max(...jobsites.map(j => j.id), 0) + 1,
        jobsite: formData.jobsite,
        description: formData.description,
      };
      setJobsites([...jobsites, newJobsite]);
      toast.success('Jobsite added successfully');
    }

    setIsDialogOpen(false);
    setEditingJobsite(null);
    setFormData({ jobsite: '', description: '' });
  };

  const handleDelete = (jobsite: Jobsite) => {
    setJobsites(jobsites.filter((j) => j.id !== jobsite.id));
    toast.success('Jobsite deleted successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#003366] mb-2">Jobsite</h1>
        <p className="text-gray-500 text-sm">Manage jobsite locations and codes</p>
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
              <TableHead className="text-white whitespace-nowrap w-[200px]">Jobsite</TableHead>
              <TableHead className="text-white whitespace-nowrap">Description</TableHead>
              <TableHead className="text-white whitespace-nowrap text-center w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobsites.length > 0 ? (
              filteredJobsites.map((jobsite, index) => (
                <TableRow
                  key={jobsite.id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-900 whitespace-nowrap font-medium">
                    {jobsite.jobsite}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {jobsite.description}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(jobsite)}
                        className="h-8 w-8 p-0 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(jobsite)}
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
          Showing {filteredJobsites.length} of {jobsites.length} records
        </p>
        <p>Total Records: {jobsites.length}</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingJobsite ? 'Edit Jobsite' : 'Add New Jobsite'}
            </DialogTitle>
            <DialogDescription>
              {editingJobsite ? 'Edit the jobsite details' : 'Add a new jobsite'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobsite">Jobsite *</Label>
              <Input
                id="jobsite"
                value={formData.jobsite}
                onChange={(e) => setFormData({ ...formData, jobsite: e.target.value })}
                placeholder="e.g., ADMO"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Jobsite ADMO"
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
              {editingJobsite ? 'Update Jobsite' : 'Add Jobsite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
