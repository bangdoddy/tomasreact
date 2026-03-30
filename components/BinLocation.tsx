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

interface BinLocation {
  id: number;
  binLocation: string;
  description: string;
  location: string;
  jobsite: string;
}

const initialBinLocations: BinLocation[] = [
  { id: 1, binLocation: 'BINL0101', description: 'Rak 01 Tingkat01', location: 'HAJU', jobsite: 'MACO' },
  { id: 2, binLocation: 'BINL0102', description: 'Rak 01 Tingkat02', location: 'CHPP', jobsite: 'MACO' },
  { id: 3, binLocation: 'BINL0201', description: 'Rak 02 Tingkat01', location: 'SERA', jobsite: 'SERA' },
  { id: 4, binLocation: 'BINL0202', description: 'Rak 02 Tingkat02', location: 'KLNS', jobsite: 'ADMO' },
  { id: 5, binLocation: 'BINL0301', description: 'Rak 03 Tingkat01', location: 'TTPN', jobsite: 'ADMO' },
  { id: 6, binLocation: 'BINL0302', description: 'Rak 03 Tingkat02', location: 'WS01', jobsite: 'ADMO' },
];

export default function BinLocation() {
  const [binLocations, setBinLocations] = useState<BinLocation[]>(initialBinLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBinLocation, setEditingBinLocation] = useState<BinLocation | null>(null);
  const [formData, setFormData] = useState({ 
    binLocation: '', 
    description: '', 
    location: '', 
    jobsite: '' 
  });

  const filteredBinLocations = binLocations.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.binLocation.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.jobsite.toLowerCase().includes(query)
    );
  });

  const handleEdit = (binLocation: BinLocation) => {
    setEditingBinLocation(binLocation);
    setFormData({ 
      binLocation: binLocation.binLocation, 
      description: binLocation.description,
      location: binLocation.location,
      jobsite: binLocation.jobsite
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingBinLocation(null);
    setFormData({ binLocation: '', description: '', location: '', jobsite: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.binLocation.trim()) {
      toast.error('Bin Location is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }

    if (!formData.jobsite.trim()) {
      toast.error('Jobsite is required');
      return;
    }

    if (editingBinLocation) {
      setBinLocations(binLocations.map((b) =>
        b.id === editingBinLocation.id
          ? { 
              ...b, 
              binLocation: formData.binLocation, 
              description: formData.description,
              location: formData.location,
              jobsite: formData.jobsite
            }
          : b
      ));
      toast.success('Bin Location updated successfully');
    } else {
      const newBinLocation: BinLocation = {
        id: Math.max(...binLocations.map(b => b.id), 0) + 1,
        binLocation: formData.binLocation,
        description: formData.description,
        location: formData.location,
        jobsite: formData.jobsite,
      };
      setBinLocations([...binLocations, newBinLocation]);
      toast.success('Bin Location added successfully');
    }

    setIsDialogOpen(false);
    setEditingBinLocation(null);
    setFormData({ binLocation: '', description: '', location: '', jobsite: '' });
  };

  const handleDelete = (binLocation: BinLocation) => {
    setBinLocations(binLocations.filter((b) => b.id !== binLocation.id));
    toast.success('Bin Location deleted successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#003366] mb-2">Bin Location</h1>
        <p className="text-gray-500 text-sm">Manage bin and rack storage locations</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Bin Location, Description, Location, or Jobsite..."
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
              <TableHead className="text-white whitespace-nowrap w-[150px]">Bin Location</TableHead>
              <TableHead className="text-white whitespace-nowrap">Description</TableHead>
              <TableHead className="text-white whitespace-nowrap w-[150px]">Location</TableHead>
              <TableHead className="text-white whitespace-nowrap w-[120px]">Jobsite</TableHead>
              <TableHead className="text-white whitespace-nowrap text-center w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBinLocations.length > 0 ? (
              filteredBinLocations.map((binLocation, index) => (
                <TableRow
                  key={binLocation.id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-900 whitespace-nowrap font-medium">
                    {binLocation.binLocation}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {binLocation.description}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {binLocation.location}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {binLocation.jobsite}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(binLocation)}
                        className="h-8 w-8 p-0 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(binLocation)}
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
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
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
          Showing {filteredBinLocations.length} of {binLocations.length} records
        </p>
        <p>Total Records: {binLocations.length}</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingBinLocation ? 'Edit Bin Location' : 'Add New Bin Location'}
            </DialogTitle>
            <DialogDescription>
              {editingBinLocation ? 'Edit the details of the bin location.' : 'Add a new bin location.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="binLocation">Bin Location *</Label>
              <Input
                id="binLocation"
                value={formData.binLocation}
                onChange={(e) => setFormData({ ...formData, binLocation: e.target.value })}
                placeholder="e.g., BINL0101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Rak 01 Tingkat01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., HAJU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobsite">Jobsite *</Label>
              <Input
                id="jobsite"
                value={formData.jobsite}
                onChange={(e) => setFormData({ ...formData, jobsite: e.target.value })}
                placeholder="e.g., MACO"
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
              {editingBinLocation ? 'Update Bin Location' : 'Add Bin Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
