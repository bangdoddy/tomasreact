import { useState, useRef, useEffect, forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Clock, User, Wrench, Search, X, ChevronLeft, ChevronRight, CalendarDays, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { InputRef } from './ui/inputref';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BookingItem {
  toolId: string;
  toolName: string;
  toolType: string;
  bookingDate: string;
  bookingTime: string;
  duration: string;
}

interface Booking {
  id: string;
  employeeNRP: string;
  employeeName: string;
  bookingDate: string;
  bookingTime: string;
  DateTo: string;
  TimeTo: string;
  items: BookingItem[];
  status: string;
  createdAt: string;
}

interface BookingMaster {
  ID: string;
  GroupId: string;
  NRP: string;
  Nama: string;
  ToolsId: string;
  ToolsName: string;
  StatusBooking: string;
  StartBookDate: string;
  StartBookTime: string;
  DateTo: string;
  TimeTo: string;
  Duration: string;
  CREATED_AT: string;
}

const formatDateStr = (dateStr: string, timeStr: string) => {
  if (!dateStr) return "-";
  try {
    const [year, month, day] = dateStr.split('-');
    const time = timeStr ? (timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr) : "00:00:00";
    return `${day}-${month}-${year} ${time}`;
  } catch (e) {
    return dateStr + (timeStr ? " " + timeStr : "");
  }
};

const formatDateObj = (dateStr: string, timeStr: string) => {
  if (!dateStr) return { date: "-", time: "-" };
  try {
    const [year, month, day] = dateStr.split('-');
    const time = timeStr ? (timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr) : "00:00:00";
    return {
      date: `${day}-${month}-${year}`,
      time: time
    };
  } catch (e) {
    return { date: dateStr, time: timeStr || "00:00:00" };
  }
};

const addDays = (dateStr: string, timeStr: string, daysStr: string) => {
  if (!dateStr || !daysStr) return "-";
  try {
    const days = parseInt(daysStr);
    if (isNaN(days)) return "-";
    const dt = new Date(`${dateStr}T${timeStr || '00:00'}`);
    dt.setDate(dt.getDate() + days);

    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const seconds = String(dt.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return "-";
  }
};

const addDaysObj = (dateStr: string, timeStr: string, durStr: string) => {
  if (!dateStr || !durStr) return { date: "-", time: "-" };
  try {
    const days = parseInt(durStr);
    if (isNaN(days)) return { date: "-", time: "-" };

    const dt = new Date(`${dateStr}T${timeStr || '00:00'}`);
    dt.setDate(dt.getDate() + days);

    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const seconds = String(dt.getSeconds()).padStart(2, '0');

    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes}:${seconds}`
    };
  } catch (e) {
    return { date: "-", time: "-" };
  }
};

const CustomDateInput = forwardRef(({ value, onClick, className }: any, ref: any) => (
  <div className="relative w-full">
    <InputRef
      value={value}
      onClick={onClick}
      ref={ref}
      className={className}
    />
    <div className="absolute left-3 top-1/2 -translate-y-1/2">
      <Calendar className="h-4 w-4 text-[#009999]/50" />
    </div>
  </div>
));

const CustomTimeInput = forwardRef(({ value, onClick, className }: any, ref: any) => (
  <div className="relative w-full">
    <InputRef
      value={value}
      onClick={onClick}
      ref={ref}
      className={className}
    />
    <div className="absolute left-3 top-1/2 -translate-y-1/2">
      <Clock className="h-4 w-4 text-[#009999]/50" />
    </div>
  </div>
));

export default function BookingTools() {
  const { currentUser } = useAuth();
  const nrpInputRef = useRef<HTMLInputElement>(null);
  const toolInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const toDateInputRef = useRef<HTMLInputElement>(null);
  const toTimeInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);
  const buttonSubmitRef = useRef<HTMLButtonElement>(null);

  /*Model*/
  const [users, setUsers] = useState<GlobalModel[]>([]);
  const [regtools, setRegTools] = useState<GlobalModel[]>([]);
  const [employeeNRP, setEmployeeNRP] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('');
  const [duration, setDuration] = useState('');
  const [toolId, setToolId] = useState('');
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [isAddScreenOpen, setAddScreenOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string>('');
  // Mock bookings data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination Items
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock data for tools
  const mockTools = [
    { id: 'T001', name: 'Impact Wrench', type: 'Power Tool' },
    { id: 'T002', name: 'Angle Grinder', type: 'Power Tool' },
    { id: 'T003', name: 'Welding Machine', type: 'Heavy Equipment' },
    { id: 'T004', name: 'Hydraulic Jack', type: 'Lifting Equipment' },
    { id: 'T005', name: 'Torque Wrench', type: 'Hand Tool' },
  ];

  const handleEmployeeNRPScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nrp = employeeNRP.trim();
      if (nrp) {
        const selected = users.find(j => j.Kode === nrp) || null;
        if (selected) {
          setEmployeeName(selected.Nama);
          dateInputRef.current?.focus();
          dateInputRef.current?.click?.();
        } else {
          setEmployeeName("");
          toast.success('Employee not found!');
        }
      } else {
        setEmployeeName("");
        toast.success('nrp is empty!');
      }
    }
  };

  const handleToolIdScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const id = toolId.trim();
      if (!id) return;

      // if (!bookingDate || !bookingTime || !duration || !toDate || !toTime) {
      if (!startDate || !duration || !endDate) {
        toast.error('Please fill booking date, time and End booking date first');
        return;
      }

      // Check for duplicate ToolsId in existing bookingItems
      const isDuplicate = bookingItems.some(t => t.toolId.toLowerCase() === id.toLowerCase());
      if (isDuplicate) {
        // toast.error('Tool is already in the booking list');
        setToolId('');
        return;
      }

      const selected = regtools.find(j => j.Kode.toLowerCase() === id.toLowerCase()) || null;
      //const tool = mockTools.find((t) => t.id === id);
      if (selected) {
        console.log(selected.Status);
        if (selected.Status === "New") {
          toast.error(`${selected.Nama} is new, Please info Section Head`);
        } else if (selected.Status === "Booked") {
          toast.error(`${selected.Nama} is booked by Other`);

          const newItem: BookingItem = {
            toolId: selected.Kode,
            toolName: selected.Nama,
            toolType: selected.ToolsType,
            bookingDate,
            bookingTime,
            duration,
          };
          setBookingItems([...bookingItems, newItem]);
          setToolId('');

          setTimeout(() => {
            buttonSubmitRef?.current?.focus();
          }, 100);
        } else {
          const newItem: BookingItem = {
            toolId: selected.Kode,
            toolName: selected.Nama,
            toolType: selected.ToolsType,
            bookingDate,
            bookingTime,
            duration,
          };
          setBookingItems([...bookingItems, newItem]);
          setToolId('');
          toast.success(`${selected.Nama} added to booking`);

          setTimeout(() => {
            buttonSubmitRef?.current?.focus();
          }, 100);
        }
      } else {
        toast.error('Tool not found');
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    setBookingItems(bookingItems.filter((_, i) => i !== index));
    toast.success('Item removed from booking');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleBackToList = () => {
    setAddScreenOpen(false);
    setBookingDate('');
    setBookingTime('');
    setToDate('');
    setToTime('');
    setStartDate(new Date());
    setEndDate(null);
    setSelectedTime(new Date());
    setSelectedEndTime(null);
    setDuration('');
    setToolId('');
    setBookingItems([]);
    setEmployeeNRP('');
    setEmployeeName('');
  };

  const handleSubmitBooking = async () => {
    if (!employeeNRP || !employeeName) {
      toast.error('Please scan employee NRP first');
      return;
    }

    if (bookingItems.length === 0) {
      toast.error('Please add at least one tool to the booking');
      return;
    }

    try {
      var datetimeBooking = startDate + " " + bookingTime;
      var toDateBooking = endDate + " " + toTime;
      const toolIds = bookingItems.map(b => b.toolId).join(',');
      const response = await fetch(API.BOOKING(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "INSERT",
          Jobsite: currentUser.Jobsite,
          nrp: employeeNRP,
          ToolsId: toolIds,
          DateBooking: datetimeBooking,
          DateTo: toDateBooking,
          Duration: duration,
          NrpUser: currentUser.Nrp
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          GetToolsList();
          ReloadMaster();

          // Reset form
          handleBackToList();

          toast.success(resData?.Message ?? 'successfully');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Respont");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    // Placeholder for update logic

    try {
      const response = await fetch(API.BOOKING(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          ToolsId: id,
          jobsite: currentUser?.Jobsite
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadMaster();
          GetToolsList();
          handleBackToList();
          toast.success('Tool ' + id + ' deleted');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Response");
      }

    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }

  };

  const GetUserList = () => {
    const params = new URLSearchParams({
      showdata: "USERS",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setUsers(json))
      .catch((error) => console.error("Error:", error));
  }

  const GetToolsList = () => {
    const params = new URLSearchParams({
      showdata: "REGTOOLS",
      jobsite: currentUser.Jobsite,
      kategori: "BOOKING"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setRegTools(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadMaster = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
    });
    fetch(API.BOOKING() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: BookingMaster[]) => {
        var bookingList = toBookings(json);

        setBookings(bookingList);
      })
      .catch((error) => console.error("Error:", error));
  };


  function toBookings(rows: BookingMaster[]): Booking[] {
    const normalize = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

    // Group by GroupId into a Map
    const map = new Map<string, Booking>();

    for (const r of rows) {
      const groupId = normalize(r.GroupId);
      if (!groupId) continue; // or handle missing GroupId differently

      if (!map.has(groupId)) {
        map.set(groupId, {
          id: groupId,                              // <= json.GroupId -> bookings[].id
          employeeNRP: normalize(r.NRP),
          employeeName: normalize(r.Nama),
          bookingDate: normalize(r.StartBookDate),
          bookingTime: normalize(r.StartBookTime),
          DateTo: normalize(r.DateTo),
          TimeTo: normalize(r.TimeTo),
          items: [],
          status: normalize(r.StatusBooking),
          createdAt: normalize(r.CREATED_AT),
        });
      }

      const booking = map.get(groupId)!;

      // Add one BookingItem per row
      booking.items.push({
        toolId: normalize(r.ToolsId),
        toolName: normalize(r.ToolsName),
        toolType: '', // Not available in BookingMaster; fill if you have it elsewhere
        bookingDate: normalize(r.StartBookDate),
        bookingTime: normalize(r.StartBookTime),
        duration: normalize(r.Duration),
      });
    }

    // Optional sorting
    for (const b of map.values()) {
      b.items.sort((a, b2) => a.toolName.localeCompare(b2.toolName));
    }

    return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const filteredTransactions = bookings.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      transaction.employeeName?.toLowerCase().includes(query) ||
      transaction.items.some(item => item.toolName.toLowerCase().includes(query))
    );
  });

  /*Pagination Items (fallback to client-side if total is not set) */
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  useEffect(() => {
    if (startDate && endDate) {
      // Create a copy of the dates to avoid mutating the state
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set the time from bookingTime and toTime strings if available
      if (bookingTime) {
        const [hours, minutes] = bookingTime.split(':');
        start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      if (toTime) {
        const [hours, minutes] = toTime.split(':');
        end.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        setDuration(diffDays.toString());
      } else {
        setDuration("0");
      }
    } else {
      setDuration("");
    }
  }, [startDate, endDate, bookingTime, toTime]);

  useEffect(() => {
    GetUserList();
    GetToolsList();
    ReloadMaster();
    if (nrpInputRef.current == null) {
      console.log("ref is null")
    } else {
      nrpInputRef.current?.focus();
      console.log("ref is focus");
    }
  }, []);



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl text-white mb-1">Booking Tools</h2>
            <p className="text-white/80">Reserve tools in advance for scheduled maintenance</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className={!isAddScreenOpen ? "block" : "hidden"}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>All tool booking history</CardDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setAddScreenOpen(true)}
                  className="gap-2 bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]"
                >
                  <Plus className="h-4 w-4" />
                  New Booking
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 px-1 mb-4">
              <div className="relative">
                <Input
                  placeholder="Search by employee name or tool..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-10 border-[#009999]/30 focus:border-[#009999] focus:ring-[#009999]/20"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-[#009999]/50" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-200 ">
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm text-gray-600">Booking ID</th>
                    <th className="text-left p-3 text-sm text-gray-600">Employee</th>
                    <th className="text-left p-3 text-sm text-gray-600">Start Date</th>
                    <th className="text-left p-3 text-sm text-gray-600">To Date</th>
                    <th className="text-left p-3 text-sm text-gray-600">Tools</th>
                    <th className="text-left p-3 text-sm text-gray-600">Status</th>
                    <th className="text-left p-3 text-sm text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm text-[#009999]">{booking.id}</td>
                      <td className="p-3 text-sm">
                        <div>
                          <p>{booking.employeeName}</p>
                          <p className="text-xs text-gray-500">{booking.employeeNRP}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {formatDateObj(booking.bookingDate, booking.bookingTime).date}
                      </td>
                      <td className="p-3 text-sm">
                        {formatDateObj(booking.DateTo, '').date}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex flex-col gap-1">
                          {booking.items.map((item, idx) => (
                            <span key={idx} className="text-xs">
                              {item.toolId} - {item.toolName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${booking.status === 'Approved'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            title="Delete"
                            onClick={() => {
                              setDeleteTargetId(booking.items.map(item => item.toolId).join(','));
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center p-2">
                  <Label htmlFor="itemsPerPage" className="mr-2">
                    Items per page:
                  </Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger id="itemsPerPage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="mx-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAddScreenOpen && (
        <div className="gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-end mb-4 p-2">
              <Button variant="outline"
                onClick={handleBackToList}
                className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            {/* Employee Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#009999]" />
                  Employee Information
                </CardTitle>
                <CardDescription>Scan employee NRP to start booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee NRP</Label>
                    <InputRef
                      ref={nrpInputRef}
                      placeholder="Scan NRP..."
                      value={employeeNRP}
                      onChange={(e) => setEmployeeNRP(e.target.value)}
                      onKeyDown={handleEmployeeNRPScan}
                      className="border-gray-300 focus:border-[#009999] focus:ring-[#009999]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employee Name</Label>
                    <Input
                      value={employeeName}
                      readOnly
                      placeholder="Auto-filled"
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#009999]" />
                  Booking Details
                </CardTitle>
                <CardDescription>Set start and end booking date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePicker
                      dateFormat="dd-MM-yyyy"
                      selected={startDate}
                      onChange={(date: any) => {
                        setStartDate(date);
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setBookingDate(`${year}-${month}-${day}`);
                        }
                        const now = new Date();
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        setBookingTime(timeStr);
                        toDateInputRef.current?.focus();
                        toDateInputRef.current?.click?.();
                      }}
                      customInput={
                        <CustomDateInput
                          className="w-full pl-10 h-10 rounded-md bg-gray-100 border border-gray-300 focus:border-[#009999] focus:outline-none"
                        />
                      }
                      wrapperClassName="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <DatePicker
                      selected={selectedTime}
                      onChange={(date: any) => {
                        setSelectedTime(date);
                        if (date) {
                          const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                          setBookingTime(timeStr);
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="Time"
                      dateFormat="HH:mm"
                      timeFormat="HH:mm"
                      customInput={
                        <CustomTimeInput
                          className="w-full pl-10 h-10 rounded-md bg-gray-100 border border-gray-300 focus:border-[#009999] focus:outline-none"
                        />
                      }
                      wrapperClassName="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <DatePicker
                      dateFormat="dd-MM-yyyy"
                      selected={endDate}
                      onChange={(date: any) => {
                        setEndDate(date);
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setToDate(`${year}-${month}-${day}`);
                        }
                        const now = new Date();
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        setToTime(timeStr);
                        toTimeInputRef.current?.focus();
                        toTimeInputRef.current?.click?.();
                      }}
                      customInput={
                        <CustomDateInput
                          className="w-full pl-10 h-10 rounded-md bg-gray-100 border border-gray-300 focus:border-[#009999] focus:outline-none"
                        />
                      }
                      wrapperClassName="w-full"
                      placeholderText="--:--"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Time</Label>
                    <DatePicker
                      selected={selectedEndTime}
                      onChange={(date: any) => {
                        setSelectedEndTime(date);
                        if (date) {
                          const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                          setToTime(timeStr);

                          setTimeout(() => {
                            toolInputRef?.current?.focus();
                          }, 100);

                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="Time"
                      dateFormat="HH:mm"
                      timeFormat="HH:mm"
                      customInput={
                        <CustomTimeInput
                          className="w-full pl-10 h-10 rounded-md bg-gray-100 border border-gray-300 focus:border-[#009999] focus:outline-none"
                        />
                      }
                      wrapperClassName="w-full"
                      placeholderText="--:--"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (Days)</Label>
                    <Input
                      ref={durationInputRef}
                      placeholder="Auto-calculated"
                      value={duration}
                      readOnly
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Tool */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-[#009999]" />
                  Add Tool to Booking
                </CardTitle>
                <CardDescription>Scan tool ID to add to booking list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 p-3">
                  <Label>Tool ID</Label>
                  <InputRef
                    ref={toolInputRef}
                    placeholder="Scan Tool ID and press Enter..."
                    value={toolId}
                    onChange={(e) => setToolId(e.target.value)}
                    onKeyDown={handleToolIdScan}
                    className="border-gray-300 focus:border-[#009999] focus:ring-[#009999]"
                  />
                  <p className="text-xs text-gray-500">Press Enter to add tool to booking list</p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Items List */}
            {bookingItems.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Tools List ({bookingItems.length})</CardTitle>
                  <CardDescription>Tools scheduled for booking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 p-3">
                    {bookingItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-[#009999]">{item.toolId}</span>
                            <span className="text-sm">{item.toolName}</span>
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                              {item.toolType}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateStr(item.bookingDate, item.bookingTime).split(' ')[0]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateStr(item.bookingDate, item.bookingTime).split(' ')[1]}
                            </span>
                            <span>Duration: {item.duration} Days</span>
                            <span className="flex items-center gap-1">
                              To: {addDaysObj(item.bookingDate, item.bookingTime, item.duration).date}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-2">
                    <Button
                      ref={buttonSubmitRef}
                      onClick={handleSubmitBooking}
                      className="w-full bg-[#009999] hover:bg-[#007777] text-white"
                      size="lg"
                    >
                      <CalendarDays className="h-5 w-5 mr-2" />
                      Submit Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="hidden space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-2xl text-[#003366]">{bookings.length}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl text-yellow-600">
                    {bookings.filter((b) => b.status === 'Pending').length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl text-green-600">
                    {bookings.filter((b) => b.status === 'Approved').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteBooking(deleteTargetId);
                setDeleteTargetId('');
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
