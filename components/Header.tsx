import { useState, useEffect } from 'react';
import { LogOut, User, Bell, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button'; 
import type { AuthUsers } from '../service/AuthContext';
import logoImage from 'figma:asset/53408374755378de61555740ced8514efca8131d.png';

interface HeaderProps {
  currentUser: AuthUsers;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="bg-gray-50 border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left - Date/Time */}
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[#003366] to-[#009999] text-white">
          <span>{formatDate(currentDateTime)}</span>
          <span className="text-white/50">|</span>
          <span>{formatTime(currentDateTime)}</span>
        </div>

        {/* Center - Logo and App Name */}
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="Company Logo" className="h-15 object-contain" />
          <div>
            <h1 className="text-3xl text-[#003366]">Smart Tomas</h1>
            <p className="text-sm text-gray-500">Tools Management System</p>
          </div>
        </div>

        {/* Right - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <Button variant="ghost" size="icon" className="hidden md:flex text-gray-600 hover:text-[#009999] hover:bg-[#009999]/10">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#009999] hover:bg-[#009999]/10 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#003366] to-[#009999] flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm text-gray-900">{currentUser.Nama}</p>
                  <p className="text-xs text-[#009999]">{currentUser.Jabatan} - {currentUser.Jobsite}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm">{currentUser.Nrp}</p>
                  <p className="text-xs text-gray-500">{currentUser.Jabatan}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}