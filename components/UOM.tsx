import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';

interface UOMData {
  id: number;
  code: string;
  description: string;
}

const initialUOMData: UOMData[] = [
  { id: 1, code: 'C', description: 'Celsius: A unit of temperature measurement where 0 is the freezing point and 100 is the boiling point of water at sea level.' },
  { id: 2, code: 'Lus', description: 'Lux: A unit of illuminance, measuring luminous flux per unit area (how much light spreads over a surface).' },
  { id: 3, code: 'Lt', description: 'Liter: A metric unit of volume, equal to 1000 cubic centimeters or one cubic decimeter.' },
  { id: 4, code: 'NM', description: 'Newton Meter: A unit of torque (rotational force), representing one Newton of force applied at a right angle to a lever that is one meter long.' },
  { id: 5, code: 'Kg', description: 'Kilogram: The base unit of mass in the International System of Units (SI).' },
  { id: 6, code: 'min', description: 'Minute: A unit of time equal to 60 seconds.' },
  { id: 7, code: 'Hr', description: 'Hour: A unit of time equal to 60 minutes or 3,600 seconds.' },
  { id: 8, code: 'cm3', description: 'Cubic Centimeter: A metric unit of volume, equal to one milliliter.' },
  { id: 9, code: 'm-3', description: 'Cubic Meter: The SI unit of volume, equal to 1000 liters or approximately 35.3 cubic feet.' },
  { id: 10, code: 'cm', description: 'Centimeter: A metric unit of length, equal to one hundredth of a meter.' },
  { id: 11, code: 'lbft', description: 'Pound-foot: A unit of torque, representing one pound of force exerted at a right angle to a lever one foot long.' },
  { id: 12, code: 'KGF', description: 'Kilogram-force: A non-SI unit of force equal to the force exerted by one kilogram of mass in standard gravity (approx 9.8 Newtons).' },
  { id: 13, code: 'Bar', description: 'Bar: A metric unit of pressure, slightly less than the average atmospheric pressure at sea level.' },
  { id: 14, code: 'PSI', description: 'Pounds per Square Inch: A unit of pressure, equal to one pound of force exerted on one square inch of area.' },
  { id: 15, code: 'KGPH', description: 'Kilograms per hour: A rate unit measuring mass flow over time.' },
  { id: 16, code: 'EA', description: 'Each: A unit used in invention and logistics to denote a single, indivisible item.' },
  { id: 17, code: 'KGF/CM2', description: 'Kilograms per square centimeter: A unit of pressure measurement (similar to KGF/cm²), often used in geotechnical contexts.' },
  { id: 18, code: 'CFM', description: 'Cubic Feet per Minute: A unit of volumetric rate, often used for measuring airflow in HVAC or engines.' },
  { id: 19, code: 'LYR', description: 'Layer: A unit used in material descriptions to indicate a single thickness or ply of a material.' },
  { id: 20, code: 'mm', description: 'Millimeter: A metric unit of length, equal to one thousandth of a meter.' },
  { id: 21, code: 'In', description: 'Inch: A unit of length in the imperial and US customary systems, equal to 2.54 centimeters.' },
  { id: 22, code: 'ft', description: 'Foot: A unit of length in the imperial and US customary systems, equal to 12 inches or 0.3048 meters.' },
  { id: 23, code: 'Ton', description: 'Ton (often metric or short): A unit of mass, typically 1000 kg (metric ton) or 2,000 lbs (short ton).' },
  { id: 24, code: 's', description: 'Second: The base unit of time in the International System of Units (SI).' },
  { id: 25, code: 'A', description: 'Ampere (Amp): The base unit of electric current in the International System of Units (SI).' },
  { id: 26, code: 'V', description: 'Volt: The SI unit of electric potential difference or electromotive force.' },
];

export default function UOM() {
  const [uomData, setUomData] = useState<UOMData[]>(initialUOMData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOMData | null>(null);
  const [editFormData, setEditFormData] = useState({ code: '', description: '' });

  // Filter data based on search query
  const filteredData = uomData.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle edit
  const handleEdit = (uom: UOMData) => {
    setEditingUOM(uom);
    setEditFormData({ code: uom.code, description: uom.description });
    setIsEditDialogOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingUOM(null);
    setEditFormData({ code: '', description: '' });
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editFormData.code.trim() || !editFormData.description.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (editingUOM) {
      setUomData((prev) =>
        prev.map((item) =>
          item.id === editingUOM.id
            ? { ...item, code: editFormData.code, description: editFormData.description }
            : item
        )
      );
      toast.success('UOM updated successfully');
    } else {
      const newUOM: UOMData = {
        id: Math.max(...uomData.map(u => u.id), 0) + 1,
        code: editFormData.code,
        description: editFormData.description,
      };
      setUomData((prev) => [...prev, newUOM]);
      toast.success('UOM added successfully');
    }

    setIsEditDialogOpen(false);
    setEditingUOM(null);
    setEditFormData({ code: '', description: '' });
  };

  // Handle delete
  const handleDelete = (id: number, code: string) => {
    if (window.confirm(`Are you sure you want to delete UOM "${code}"?`)) {
      setUomData((prev) => prev.filter((item) => item.id !== id));
      toast.success('UOM deleted successfully');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#003366] mb-2">Unit of Measurement (UOM)</h1>
        <p className="text-gray-600 text-sm">Manage unit of measurement</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by code or description..."
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#003366] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-sm uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-center text-sm uppercase tracking-wider w-32">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 text-[#009999] hover:text-[#007777] hover:bg-[#009999]/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.code)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredData.length} of {uomData.length} records
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUOM ? 'Edit UOM' : 'Add New UOM'}</DialogTitle>
            <DialogDescription>
              {editingUOM ? 'Update' : 'Enter'} the unit of measurement details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">Code *</Label>
              <Input
                id="edit-code"
                value={editFormData.code}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, code: e.target.value })
                }
                placeholder="Enter UOM code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                placeholder="Enter UOM description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingUOM(null);
                setEditFormData({ code: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#009999] hover:bg-[#007777] text-white"
            >
              {editingUOM ? 'Save Changes' : 'Add UOM'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
