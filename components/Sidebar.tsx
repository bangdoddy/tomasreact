import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  Database,
  ChevronRight,
  HelpCircle,
  Info,
  ChevronLeft,
  Wrench,
  ShoppingCart,
  DollarSign,
  ClipboardList,
  ClipboardCheck,
  CheckSquare,
  Award,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { id: string; label: string; disabled?: boolean }[];
}

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['datamaster', 'transaction']);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'budgeting',
      label: 'Budgeting',
      icon: <DollarSign className="h-5 w-5" />,
      subItems: [
        { id: 'capex', label: 'Form Budgeting CAPEX' },
        { id: 'opex', label: 'Form Budgeting OPEX' },
        { id: 'order-budget', label: 'Form Order Budget' },
        { id: 'repair-maintenance-cost', label: 'Repair Maintenance Cost', disabled: true },
      ],
    },
    {
      id: 'datamaster',
      label: 'Data Master',
      icon: <Database className="h-5 w-5" />,
      subItems: [
        { id: 'user-management', label: 'User Register' },
        { id: 'tools-management', label: 'Tool Register' },
        { id: 'standard-quantity', label: 'Standard Quantity' },
        { id: 'toolstype', label: 'Tools Type' },
        { id: 'tool-activation', label: 'Tool Activation' },
      ],
    },
    {
      id: 'approval',
      label: 'Approval',
      icon: <CheckSquare className="h-5 w-5" />,
      subItems: [
        { id: 'activation-tool-approval', label: 'Activation Tool Approval' },
        { id: 'bakt-approval', label: 'BAKT Approval' },
        { id: 'trf-approval', label: 'TRF Approval' },
      ],
    },
    {
      id: 'transaction',
      label: 'Transaction',
      icon: <ShoppingCart className="h-5 w-5" />,
      subItems: [
        { id: 'booking-tools', label: 'Booking Tools' },
        { id: 'rent-tools', label: 'Rent Tools' },
        { id: 'return-tools', label: 'Return Tools' },
      ],
    },
    {
      id: 'inspection',
      label: 'Inspection Tool',
      icon: <ClipboardCheck className="h-5 w-5" />,
      subItems: [
        { id: 'inspection-scheduling', label: 'Inspection Scheduling' },
        { id: 'toolbox-inspection', label: 'Tool Box Inspection' },
        { id: 'toolroom-inspection', label: 'Tool Room Inspection' },
        { id: 'tool-certification', label: 'Certification and Calibration' },
      ],
    },
    {
      id: 'bakt',
      label: 'BAKT',
      icon: <ClipboardList className="h-5 w-5" />,
      subItems: [
        { id: 'outstanding-bakt', label: 'Outstanding BAKT' },
        { id: 'follow-up', label: 'Follow Up' },
        { id: 'reactivation-disposed', label: 'Reactivation / Disposed Tools' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      subItems: [
        { id: 'user-population', label: 'User Population' },
        { id: 'tool-population', label: 'Tool Population' },
        { id: 'rent-return-report', label: 'Rent Return Report' },
        { id: 'activation-report', label: 'Activation Report' },
        { id: 'bakt-report', label: 'BAKT Report' },
        { id: 'disposed-tool-report', label: 'Disposed Tool Report' },
        { id: 'toolroom-inspection-report', label: 'Tool Room Inspection Report' },
        { id: 'toolbox-inspection-report', label: 'Tool Box Inspection Report' },
        { id: 'certification-calibration-report', label: 'Certification and Calibration Report' },
        { id: 'tool-order-monitoring-report', label: 'Tool Order Monitoring Report' },
      ],
    },
    {
      id: 'settings',
      label: 'General Settings',
      icon: <Settings className="h-5 w-5" />,
      subItems: [
        { id: 'setting', label: 'General Setting' },
        { id: 'roles', label: 'Roles' },
        { id: 'permissions', label: 'Access Permissions' },
        { id: 'category-tool', label: 'Category Tool' },
        { id: 'condition-tool', label: 'Condition Tool' },
        { id: 'group-tools', label: 'Group Tools' },
        { id: 'title', label: 'Title' },
        { id: 'jobsite', label: 'Jobsite' },
        { id: 'location', label: 'Location' },
        { id: 'bin-location', label: 'Bin Location' },
        { id: 'uom', label: 'Unit of Measurement (UoM)' },
        { id: 'workgroup', label: 'Workgroup' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle className="h-5 w-5" />,
      subItems: [
        { id: 'user-guide', label: 'User Guide' },
        { id: 'faq', label: 'FAQ' },
        { id: 'video-tutorial', label: 'Video Tutorial' },
        { id: 'contact-us', label: 'Contact Us' },
        { id: 'tips-tricks', label: 'Tips & Tricks' },
      ],
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="h-5 w-5" />,
    },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };


  //const allIdsAndLabels = menuItems.map(menu => {
  //    const parent = { id: menu.id, label: menu.label };
  //    const children = (menu.subItems ?? []).map(sub => ({
  //      id: sub.id,
  //      label: sub.label,
  //    }));
  //    return [parent, ...children];
  //  });

  //const allIdsAndLabels = menuItems.reduce((acc, menu) => {
  //  acc.push({ id: menu.id, label: menu.label, groupid: '' });

  //  if (menu.subItems) {
  //    for (const sub of menu.subItems) {
  //      acc.push({ id: sub.id, label: sub.label, groupid: menu.label });
  //    }
  //  }

  //  return acc;
  //}, [] as { id: string; label: string, groupid: string }[]);

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 shadow-sm',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#009999]" />
              <span className="text-sm text-gray-600">Menu</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform', isCollapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2"> 
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleMenu(item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors group',
                  currentPage === item.id && !item.subItems && 'bg-[#009999]/10 border-r-4 border-[#009999] text-[#009999]'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={cn(
                  'flex-shrink-0 text-gray-600 group-hover:text-[#009999]',
                  currentPage === item.id && !item.subItems && 'text-[#009999]'
                )}>{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className={cn(
                      'flex-1 text-left text-sm text-gray-700',
                      currentPage === item.id && !item.subItems && 'text-[#009999]'
                    )}>{item.label}</span>
                    {item.subItems && (
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform text-gray-400',
                          expandedMenus.includes(item.id) && 'rotate-90 text-[#009999]'
                        )}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {item.subItems && expandedMenus.includes(item.id) && !isCollapsed && (
                <div className="bg-gray-50">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => !subItem.disabled && onNavigate(subItem.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 pl-8 transition-colors text-sm',
                        subItem.disabled 
                          ? 'text-gray-400 cursor-not-allowed opacity-50' 
                          : 'text-gray-600 hover:bg-gray-100',
                        currentPage === subItem.id && !subItem.disabled && 'bg-[#009999]/10 text-[#009999] border-r-4 border-[#009999]'
                      )}
                      disabled={subItem.disabled}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}