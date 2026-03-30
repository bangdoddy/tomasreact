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
  Circle,
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
      label: 'Dashboard Tool',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'dashboard-facility',
      label: 'Dashboard Facility',
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
        { id: 'tools-management', label: 'Tool & Facility Register' },
        { id: 'standard-quantity', label: 'Standard Quantity' },
        { id: 'tool-activation', label: 'Tool & Facility Activation' },
      ],
    },
    {
      id: 'approval',
      label: 'Approval',
      icon: <CheckSquare className="h-5 w-5" />,
      subItems: [
        { id: 'activation-tool-approval', label: 'Activation Approval' },
        { id: 'bakt-approval', label: 'Damage & Loss Report Approval' },
        { id: 'trf-approval', label: 'TRF Approval' },
      ],
    },
    {
      id: 'transaction',
      label: 'Transaction',
      icon: <ShoppingCart className="h-5 w-5" />,
      subItems: [
        { id: 'booking-tools', label: 'Booking' },
        { id: 'rent-tools', label: 'Rent and Return' },
      ],
    },
    {
      id: 'inspection',
      label: 'Inspection',
      icon: <ClipboardCheck className="h-5 w-5" />,
      subItems: [
        { id: 'inspection-scheduling', label: 'Inspection Scheduling' },
        { id: 'toolbox-inspection', label: 'Tool Box Inspection' },
        { id: 'toolroom-inspection', label: 'Tool Room Inspection' },
        { id: 'tool-certification', label: 'Certification and Calibration' },
        { id: 'facility-inspection', label: 'Facility Inspection' },
      ],
    },
    {
      id: 'bakt',
      label: 'Damage & Loss Report',
      icon: <ClipboardList className="h-5 w-5" />,
      subItems: [
        { id: 'outstanding-bakt', label: 'Outstanding Damage & Loss Report' },
        { id: 'follow-up', label: 'Follow Up' },
        { id: 'reactivation-disposed', label: 'Reactivation / Dispose' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      subItems: [
        { id: 'user-population', label: 'User Population' },
        { id: 'tool-population', label: 'Tool Population' },
        { id: 'facility-population-report', label: 'Facility Population' },
        { id: 'rent-return-report', label: 'Rent Return Report' },
        { id: 'activation-report', label: 'Activation Report' },
        { id: 'bakt-report', label: 'Damage & Loss Report' },
        { id: 'disposed-tool-report', label: 'Disposed Report' },
        { id: 'toolroom-inspection-report', label: 'Tool Room Inspection Report' },
        { id: 'toolbox-inspection-report', label: 'Tool Box Inspection Report' },
        { id: 'certification-calibration-report', label: 'Certification and Calibration Report' },
        { id: 'facility-inspection-report', label: 'Facility Inspection Report' },
        { id: 'tool-order-monitoring-report', label: 'Order Monitoring Report' },
      ],
    },
    {
      id: 'settings',
      label: 'General Settings',
      icon: <Settings className="h-5 w-5" />,
      subItems: [
        { id: 'roles', label: 'Roles' },
        { id: 'permissions', label: 'Access Permissions' },
        { id: 'category-tool', label: 'Category Tool' },
        { id: 'condition-tool', label: 'Condition Tool' },
        { id: 'group-tools', label: 'Group Tools' },
        { id: 'jobsite', label: 'Jobsite' },
        { id: 'location', label: 'Location' },
        { id: 'bin-location', label: 'Bin Location' },
        { id: 'uom', label: 'Unit of Measurement (UoM)' },
        { id: 'work-group', label: 'Work Group' },
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

  return (
    <aside
      className={cn(
        'bg-gradient-to-b from-[#003366] to-[#002244] border-r border-[#004488]/30 transition-all duration-300 flex-shrink-0 shadow-xl',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#004488]/30">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#009999] to-[#007777] flex items-center justify-center shadow-lg">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">Smart Toofast</h2>
                  <p className="text-[#009999] text-xs">Side Menu</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="hover:bg-white/10 text-white h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hover:bg-white/10 text-white w-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin scrollbar-thumb-[#004488] scrollbar-track-transparent">
          {menuItems.map((item, index) => (
            <div key={item.id} className="mb-1">
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleMenu(item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                  currentPage === item.id && !item.subItems 
                    ? 'bg-gradient-to-r from-[#009999] to-[#007777] text-white shadow-lg shadow-[#009999]/30' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active indicator */}
                {currentPage === item.id && !item.subItems && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                
                <span className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  currentPage === item.id && !item.subItems 
                    ? 'text-white scale-110' 
                    : 'text-[#009999] group-hover:text-white group-hover:scale-110'
                )}>{item.icon}</span>
                
                {!isCollapsed && (
                  <>
                    <span className={cn(
                      'flex-1 text-left text-sm font-medium',
                      currentPage === item.id && !item.subItems && 'font-semibold'
                    )}>{item.label}</span>
                    {item.subItems && (
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-all duration-200',
                          expandedMenus.includes(item.id) && 'rotate-90 text-[#009999]'
                        )}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {item.subItems && expandedMenus.includes(item.id) && !isCollapsed && (
                <div className="mt-1 ml-3 pl-3 border-l-2 border-[#004488]/40 space-y-0.5">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => !subItem.disabled && onNavigate(subItem.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm text-left group',
                        subItem.disabled 
                          ? 'text-gray-500 cursor-not-allowed opacity-40' 
                          : currentPage === subItem.id
                          ? 'bg-white/15 text-white font-medium shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      )}
                      disabled={subItem.disabled}
                    >
                      <Circle 
                        className={cn(
                          'h-1.5 w-1.5 flex-shrink-0 transition-all duration-200',
                          currentPage === subItem.id 
                            ? 'fill-[#009999] text-[#009999]' 
                            : 'fill-gray-500 text-gray-500 group-hover:fill-white group-hover:text-white'
                        )} 
                      />
                      <span className="flex-1">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-[#004488]/30 bg-black/20">
            <div className="text-xs text-gray-400 text-center">
              <p className="font-medium text-[#009999]">Version 1.0.0</p>
              <p className="mt-0.5">© 2026 Smart Toofast</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
