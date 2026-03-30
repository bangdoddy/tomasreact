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

interface Location {
  id: number;
  location: string;
  jobsite: string;
  description: string;
}

const initialLocations: Location[] = [
  { id: 1, location: 'HAJU', jobsite: 'MACO', description: 'Lokasi HAJU Hauling Jobsite MACO' },
  { id: 2, location: 'CHPP', jobsite: 'MACO', description: 'Lokasi CHPP Mining Jobsite MACO' },
  { id: 3, location: 'SERA', jobsite: 'SERA', description: 'Lokasi SERA Jobsite SERA' },
  { id: 4, location: 'KLNS', jobsite: 'ADMO', description: 'Lokasi Kelanis Jobsite ADMO' },
  { id: 5, location: 'WS01', jobsite: 'ADMO', description: 'Lokasi Workshop 01 Jobsite ADMO' },
  { id: 6, location: 'WS02', jobsite: 'ADMO', description: 'Lokasi Workshop 02 Jobsite ADMO' },
  { id: 7, location: 'WS03', jobsite: 'ADMO', description: 'Lokasi Workshop 03 Jobsite ADMO' },
  { id: 8, location: 'WSTY', jobsite: 'ADMO', description: 'Lokasi Workshop Tyre Jobsite ADMO' },
  { id: 9, location: 'WS69', jobsite: 'ADMO', description: 'Lokasi Workshop KM69 Jobsite ADMO' },
  { id: 10, location: 'WS65', jobsite: 'ADMO', description: 'Lokasi Workshop KM65 Jobsite ADMO' },
];

export default function Location() {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ location: '', jobsite: '', description: '' });

  const filteredLocations = locations.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.location.toLowerCase().includes(query) ||
      item.jobsite.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({ location: location.location, jobsite: location.jobsite, description: location.description });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData({ location: '', jobsite: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }

    if (!formData.jobsite.trim()) {
      toast.error('Jobsite is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (editingLocation) {
      setLocations(locations.map((l) =>
        l.id === editingLocation.id
          ? { ...l, location: formData.location, jobsite: formData.jobsite, description: formData.description }
          : l
      ));
      toast.success('Location updated successfully');
    } else {
      const newLocation: Location = {
        id: Math.max(...locations.map(l => l.id), 0) + 1,
        location: formData.location,
        jobsite: formData.jobsite,
        description: formData.description,
      };
      setLocations([...locations, newLocation]);
      toast.success('Location added successfully');
    }

    setIsDialogOpen(false);
    setEditingLocation(null);
    setFormData({ location: '', jobsite: '', description: '' });
  };

  const handleDelete = (location: Location) => {
    setLocations(locations.filter((l) => l.id !== location.id));
    toast.success('Location deleted successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#003366] mb-2">Location</h1>
        <p className="text-gray-500 text-sm">Manage workshop and jobsite location codes</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Location or Description..."
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
              <TableHead className="text-white whitespace-nowrap w-[150px]">Location</TableHead>
              <TableHead className="text-white whitespace-nowrap w-[150px]">Jobsite</TableHead>
              <TableHead className="text-white whitespace-nowrap">Description</TableHead>
              <TableHead className="text-white whitespace-nowrap text-center w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <TableRow
                  key={location.id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-900 whitespace-nowrap font-medium">
                    {location.location}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {location.jobsite}
                  </TableCell>
                  <TableCell className="text-gray-900 whitespace-nowrap">
                    {location.description}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(location)}
                        className="h-8 w-8 p-0 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location)}
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
          Showing {filteredLocations.length} of {locations.length} records
        </p>
        <p>Total Records: {locations.length}</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Edit the location details' : 'Add a new location'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Lokasi HAJU Hauling Jobsite MACO"
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
              {editingLocation ? 'Update Location' : 'Add Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
