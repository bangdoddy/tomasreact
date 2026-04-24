import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  Download,
  ShoppingCart,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface RentReturnData {
  NO: string;
  NRP: string;
  NAMA: string;
  RentStatus: string;
  Total: number;
  StUser: string;
  ActionReturn: string;
  LastCondition: string;
  AgingDay: string;
  AgingHour: string;
  TransIdTools: string;
  ToolsDesc: string;
  ToolsSize: string;
  ToolsType: string;
  TransDateRental: string;
  TransReturnDate: string;
}


export default function RentReturnReport() {
  const { currentUser } = useAuth();
  const [reportData, setReportData] = useState<RentReturnData[]>([]);
  // const [reportDetails, setReportDetails] = useState<RentReturnReport[]>([]);
  const [isSummary, setIsSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('This Month');

  // Pagination Items
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(NaN);
    // Handle dd-MM-yyyy or dd/MM/yyyy
    const datePart = dateStr.split(' ')[0];
    const separator = datePart.includes('-') ? '-' : datePart.includes('/') ? '/' : null;

    if (separator) {
      const parts = datePart.split(separator);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (year && year.length === 4) {
          return new Date(Number(year), Number(month) - 1, Number(day));
        }
      }
    }
    return new Date(dateStr);
  };


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const saveToExcel = (data: RentReturnData[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Periode': tool.PeriodeName,
        'Total': tool.Total,
        'Returned': tool.Returned,
        'rented': tool.Rented,
        'OverDue': tool.Overdue
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `User_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const saveToExcel2 = (data: RentReturnData[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'ToolsId': tool.TransIdTools,
        'Tools Name': tool.ToolsDesc,
        'Peminjam': tool.NAMA,
        'Rent Date': tool.TransDateRental,
        'Return Date': tool.TransReturnDate,
        'Status': tool.RentStatus,
        'Condition': tool.LastCondition
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `User_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const ReloadMaster = () => {
    const params = new URLSearchParams({
      act: "REPORT",
      jobsite: currentUser?.Jobsite || '',
      nrp: currentUser?.Nrp || '',
    });
    fetch(API.RENTTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: RentReturnData[]) => {
        //setIsSummary(true);
        //setReportDetails([]);
        setReportData(json);
        console.log(json);
      })
      .catch((error) => console.error("Error:", error));
  };

  // const ReloadMaster2 = (mode: string) => {
  //   const params = new URLSearchParams({
  //     action: "REPORT",
  //     jobsite: currentUser.Jobsite,
  //     nrp: currentUser?.Nrp,
  //     qty: mode
  //   });
  //   fetch(API.RENTTOOLS() + `?${params.toString()}`, {
  //     method: "GET"
  //   })
  //     .then((response) => response.json())
  //     .then((json: RentReturnData[]) => {
  //       setIsSummary(false);
  //       setReportData(json);
  //       //setReportDetails(json);
  //     })
  //     .catch((error) => console.error("Error:", error));
  // };

  // const ReloadData = () => {
  //   if (filterPeriod === "This Month") { ReloadMaster2("0"); }
  //   else if (filterPeriod === "Last Month") { ReloadMaster2("1"); }
  //   else if (filterPeriod === "Last 3 Months") { ReloadMaster("3"); }
  //   else if (filterPeriod === "Last 6 Months") { ReloadMaster("6"); }
  // }

  const filteredData = reportData
    .filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = (
        item.ToolsDesc.toLowerCase().includes(query) ||
        item.TransIdTools.toLowerCase().includes(query) ||
        item.NAMA.toLowerCase().includes(query)
      );

      const recordDate = parseDate(item.TransDateRental);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let matchesPeriod = true;
      if (filterPeriod === "This Month") {
        matchesPeriod = recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      } else if (filterPeriod === "Last Month") {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        matchesPeriod = recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear;
      } else if (filterPeriod === "Last 3 Months") {
        const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
        matchesPeriod = recordDate >= threeMonthsAgo;
      } else if (filterPeriod === "Last 6 Months") {
        const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
        matchesPeriod = recordDate >= sixMonthsAgo;
      }

      return matchesSearch && matchesPeriod;
    })
    .sort((a, b) => {
      const dateA = parseDate(a.TransDateRental).getTime();
      const dateB = parseDate(b.TransDateRental).getTime();
      return dateB - dateA;
    });

  const stats = {
    totalRented: filteredData.length,
    totalReturned: filteredData.filter(item => item.RentStatus === "Dikembalikan").length,
    currentlyRented: filteredData.filter(item => item.RentStatus === "Dipinjam").length,
    overdueReturns: 0,
  };

  /*Pagination Items (fallback to client-side if total is not set) */
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    ReloadMaster();
    console.log("Reload Users")
  }, []);

  // useEffect(() => {
  //   ReloadMaster();
  //   scrollToTop();
  //   console.log("Reload filterPeriod : " + filterPeriod);
  // }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-[#009999]" />
            Rent Return Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track tool rental and return activities
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Report exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white" onClick={() => {
            // if (isSummary) saveToExcel(reportData);
            saveToExcel2(reportData);
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Rented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{stats.totalRented}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.totalReturned}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Currently Rented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{stats.currentlyRented}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Overdue Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{stats.overdueReturns}</div>
          </CardContent>
        </Card>
      </div>

      {/* {isSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Rent & Return Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Rented" stroke="#009999" name="Rented" />
                <Line type="monotone" dataKey="Returned" stroke="#10b981" name="Returned" />
                <Line type="monotone" dataKey="Overdue" stroke="#ef4444" name="Overdue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )} */}
      <Card>
        <CardContent className="pt-4 p-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ToolsId</TableHead>
                  <TableHead className="text-center">Tools Name</TableHead>
                  <TableHead className="text-center">Peminjam</TableHead>
                  <TableHead className="text-center">Rent Date</TableHead>
                  <TableHead className="text-center">Return Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((data) => (
                    <TableRow key={data.NO} className="hover:bg-gray-50">
                      <TableCell className="text-gray-500">{data.TransIdTools}</TableCell>
                      <TableCell className="text-gray-500">{data.ToolsDesc}</TableCell>
                      <TableCell className="text-gray-500">{data.NAMA}</TableCell>
                      <TableCell className="text-gray-500">{data.TransDateRental}</TableCell>
                      <TableCell className="text-gray-500">{data.TransReturnDate}</TableCell>
                      <TableCell className="">{data.RentStatus}</TableCell>
                      <TableCell className="">{data.LastCondition}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                  Items per page:
                </Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="itemsPerPage" className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 ml-4">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Page {currentPage}</span>
                  <span className="text-sm text-gray-600">of {totalPages || 1}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
