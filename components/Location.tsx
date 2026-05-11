import { useState, useEffect } from 'react';
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
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';

interface LocationItem {
  GroupId: string;
  Jobsite: string;
  Keterangan: string;
}

export default function Location() {
  const { currentUser } = useAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [formData, setFormData] = useState({ location: '', jobsite: '', description: '' });
  const [jobsites, setJobsites] = useState<GlobalModel[]>([]);

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

  const GetToolsLocation = () => {
    const params = new URLSearchParams({
      showdata: "TOOLSLOCATION",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: any[]) => {
        // Map API response to our interface if needed, or just handle the properties
        // Usually GlobalModel has Jobsite and Keterangan
        const mappedData = json.map(item => ({
          GroupId: item.GroupId || item.Kode || "",
          Jobsite: item.Jobsite || item.jobsite || "",
          Keterangan: item.Keterangan || item.description || item.Nama || ""
        }));
        setLocations(mappedData);
        console.log("Locations loaded:", mappedData);
      })
      .catch((error) => console.error("Error:", error));
  }

  const filteredLocations = locations.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.Keterangan?.toLowerCase().includes(query) ||
      item.Jobsite?.toLowerCase().includes(query)
    );
  });

  const handleEdit = (location: LocationItem) => {
    setEditingLocation(location);
    setFormData({
      location: location.GroupId,
      jobsite: location.Jobsite,
      description: location.Keterangan
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData({ location: '', jobsite: currentUser.Jobsite, description: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.location.trim() || !formData.jobsite.trim() || !formData.description.trim()) {
      toast.error('All fields are required');
      return;
    }

    // Since we don't have a specific CRUD API for Location yet, we just update local state
    // In a real app, this would be a POST/PUT request to API.GENERALSETTING() or similar
    if (editingLocation) {
      setLocations(locations.map((l) =>
        l.GroupId === editingLocation.GroupId
          ? { ...l, Jobsite: formData.jobsite, Keterangan: formData.description }
          : l
      ));
      toast.success('Location updated locally');
    } else {
      const newLocation: LocationItem = {
        GroupId: formData.location,
        Jobsite: formData.jobsite,
        Keterangan: formData.description,
      };
      setLocations([...locations, newLocation]);
      toast.success('Location added locally');
    }

    setIsDialogOpen(false);
    setEditingLocation(null);
    setFormData({ location: '', jobsite: '', description: '' });
  };

  const handleDelete = (groupId: string) => {
    setLocations(locations.filter((l) => l.GroupId !== groupId));
    toast.success('Location removed locally');
  };

  useEffect(() => {
    GetToolsLocation();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className='text-2xl font-semibold text-[#003366]'>Location</h1>
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
            className="pl-10 h-10 border-[#009999]/30 focus:border-[#009999] focus:ring-[#009999]/20"
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
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-gray-300 hover:bg-gray-300">
              <TableHead className="bg-gray-100 text-sm text-gray-900">Jobsite</TableHead>
              <TableHead className="bg-gray-100 text-sm text-gray-900">Location Description</TableHead>
              <TableHead className="bg-gray-100 text-sm text-gray-900 text-center w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <TableRow
                  key={location.GroupId}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="text-gray-700 whitespace-nowrap font-medium text-[#009999]">
                    {location.Jobsite}
                  </TableCell>
                  <TableCell className="text-gray-700 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{location.GroupId}</span>
                      <span className="text-gray-500">{location.Keterangan}</span>
                    </div>
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
                        onClick={() => handleDelete(location.GroupId)}
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
              <Label htmlFor="location">Location ID *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., HAJU"
                disabled={!!editingLocation}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobsite">Jobsite *</Label>
              <Input
                disabled={true}
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


