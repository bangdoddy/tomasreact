import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Shield, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Permission {
  module: string;
  subModule: string;
  permissions: {
    [role: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
}

const roles = ['PIC Tools', 'Supervisor', 'Walder', 'Tool Keeper', 'Mechanic'];

const initialPermissions: Permission[] = [
  {
    module: 'Dashboard',
    subModule: 'Dashboard',
    permissions: {
      'PIC Tools': { view: true, create: false, edit: false, delete: false },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Budgeting',
    subModule: 'Form Budgeting CAPEX',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Budgeting',
    subModule: 'Form Budgeting OPEX',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Budgeting',
    subModule: 'Form Order Budget',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Budgeting',
    subModule: 'Repair Maintenance Cost',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Data Master',
    subModule: 'User Register',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Data Master',
    subModule: 'Tool Register',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: true },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Data Master',
    subModule: 'Standard Quantity',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Data Master',
    subModule: 'Tool Activation',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Approval',
    subModule: 'Activation Tool Approval',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Approval',
    subModule: 'BAKT Approval',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Approval',
    subModule: 'TRF Approval',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Transaction',
    subModule: 'Booking Tools',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: true, create: true, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: true, create: true, edit: false, delete: false },
    },
  },
  {
    module: 'Transaction',
    subModule: 'Rent Tools',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: true, create: true, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: true, create: true, edit: false, delete: false },
    },
  },
  {
    module: 'Transaction',
    subModule: 'Return Tools',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: true, create: true, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: true, create: true, edit: false, delete: false },
    },
  },
  {
    module: 'Inspection Tool',
    subModule: 'Inspection Scheduling',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Inspection Tool',
    subModule: 'Tool Box Inspection',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Inspection Tool',
    subModule: 'Tool Room Inspection',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Inspection Tool',
    subModule: 'Certification and Calibration',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'BAKT',
    subModule: 'Outstanding BAKT',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'BAKT',
    subModule: 'Follow Up',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'BAKT',
    subModule: 'Reactivation / Disposed Tools',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: true, edit: true, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'User Population',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Tool Population',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Rent Return Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Activation Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'BAKT Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Disposed Tool Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Tool Room Inspection Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Tool Box Inspection Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Certification and Calibration Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Reports',
    subModule: 'Tool Order Monitoring Report',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: false, delete: false },
      'Supervisor': { view: true, create: true, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Roles',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Access Permissions',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: false, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Category Tool',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Condition Tool',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Group Tools',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Title',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: false, create: false, edit: false, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Jobsite',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Location',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Bin Location',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Unit of Measurement (UoM)',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'General Settings',
    subModule: 'Workgroup',
    permissions: {
      'PIC Tools': { view: true, create: true, edit: true, delete: true },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: false, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: true, edit: true, delete: false },
      'Mechanic': { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Help',
    subModule: 'User Guide',
    permissions: {
      'PIC Tools': { view: true, create: false, edit: false, delete: false },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Help',
    subModule: 'FAQ',
    permissions: {
      'PIC Tools': { view: true, create: false, edit: false, delete: false },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Help',
    subModule: 'Video Tutorial',
    permissions: {
      'PIC Tools': { view: true, create: false, edit: false, delete: false },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Help',
    subModule: 'Contact Us',
    permissions: {
      'PIC Tools': { view: true, create: false, edit: false, delete: false },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'Help',
    subModule: 'Tips & Tricks',
    permissions: {
      'PIC Tools': { view: true, create: false, edit: false, delete: false },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    module: 'About',
    subModule: 'About',
    permissions: {
      'PIC Tools': { view: true, create: false, edit: false, delete: false },
      'Supervisor': { view: true, create: false, edit: false, delete: false },
      'Walder': { view: true, create: false, edit: false, delete: false },
      'Tool Keeper': { view: true, create: false, edit: false, delete: false },
      'Mechanic': { view: true, create: false, edit: false, delete: false },
    },
  },
];

export default function PermissionsManagement() {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  const togglePermission = (
    moduleIndex: number,
    role: string,
    permType: 'view' | 'create' | 'edit' | 'delete'
  ) => {
    setPermissions((prev) =>
      prev.map((perm, idx) => {
        if (idx === moduleIndex) {
          return {
            ...perm,
            permissions: {
              ...perm.permissions,
              [role]: {
                ...perm.permissions[role],
                [permType]: !perm.permissions[role][permType],
              },
            },
          };
        }
        return perm;
      })
    );
  };

  const handleSave = () => {
    toast.success('Permissions saved successfully');
  };

  //const result = initialPermissions.map(p => ({
  //  module: p.module,
  //  subModule: p.subModule,
  //}));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#003366]">Permissions Management</h1>
          <p className="text-gray-600 mt-1">Configure role-based access control</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[#009999] hover:bg-[#007777] text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="border-l-4 border-l-[#009999]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Shield className="h-5 w-5 text-[#009999]" />
            Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Menu</TableHead>
                <TableHead className="min-w-[150px]">Sub Menu</TableHead>
                {roles.map((role) => (
                  <TableHead key={role} className="text-center min-w-[120px]">
                    <div>
                      <div className="text-[#003366] mb-1">{role}</div>
                      <div className="grid grid-cols-4 gap-1 text-xs text-gray-500">
                        <span>V</span>
                        <span>C</span>
                        <span>E</span>
                        <span>D</span>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((perm, moduleIndex) => (
                <TableRow key={`${perm.module}-${perm.subModule}`}>
                  <TableCell>{perm.module}</TableCell>
                  <TableCell className="text-gray-600">{perm.subModule}</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role}>
                      <div className="grid grid-cols-4 gap-2 items-center justify-items-center">
                        <Checkbox
                          checked={perm.permissions[role]?.view}
                          onCheckedChange={() => togglePermission(moduleIndex, role, 'view')}
                        />
                        <Checkbox
                          checked={perm.permissions[role]?.create}
                          onCheckedChange={() => togglePermission(moduleIndex, role, 'create')}
                        />
                        <Checkbox
                          checked={perm.permissions[role]?.edit}
                          onCheckedChange={() => togglePermission(moduleIndex, role, 'edit')}
                        />
                        <Checkbox
                          checked={perm.permissions[role]?.delete}
                          onCheckedChange={() => togglePermission(moduleIndex, role, 'delete')}
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Legend:</strong> V = View, C = Create, E = Edit, D = Delete
            </p>
          </div> 
        </CardContent>
      </Card>
    </div>
  );
}