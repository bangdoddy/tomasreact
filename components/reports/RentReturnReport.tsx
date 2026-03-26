import { useState,useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  Download,
  ShoppingCart,
  Calendar,
  TrendingUp,
} from 'lucide-react';
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
  Periode: string;
  PeriodeName: string;
  Total: number;
  Returned: number;
  Rented: number;
  Overdue: number;
  ReturnRates: number; 
}

interface RentReturnReport {
  ToolsId: string;
  NamaTools: string;
  Mekanik: string;
  NamaMekanik: string;
  NamaToolKeeper: string;
  DateRental: string;
  DateReturn: string;
  ReturnCondition: string;
  stRent: string;
  StOverdue: string; 
}

export default function RentReturnReport() {
  const { currentUser } = useAuth();  
  const [reportData, setReportData] = useState<RentReturnData[]>([]);
  const [reportDetails, setReportDetails] = useState<RentReturnReport[]>([]);
  const [isSummary, setIsSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('This Month');
   
  const stats = {
    totalRented: reportData.reduce((sum, d) => sum + d.Total, 0) + reportDetails.length,
    totalReturned: reportData.reduce((sum, d) => sum + d.Returned, 0)+ reportDetails.filter(item => item.stRent === "Return").length,
    currentlyRented: reportData.reduce((sum, d) => sum + d.Rented, 0) + reportDetails.filter(item => item.stRent === "Rent").length,
    overdueReturns: 0,
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

  const saveToExcel2 = (data: RentReturnReport[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'ToolsId': tool.ToolsId,
        'Tools Name': tool.NamaTools,
        'Peminjam': tool.NamaMekanik,
        'Rent Date': tool.DateRental,
        'Return Date': tool.DateReturn,
        'Status': tool.stRent,
        'Condition': tool.ReturnCondition
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `User_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const ReloadMaster = (mode:string) => {
    const params = new URLSearchParams({
      act: "REPORT",
      jobsite: currentUser.Jobsite,
      qty:mode
    });
    fetch(API.RENTTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: RentReturnData[]) => {
        setIsSummary(true);
        setReportDetails([]);
        setReportData(json);
      })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadMaster2 = (mode: string) => {
    const params = new URLSearchParams({
      act: "REPORT",
      jobsite: currentUser.Jobsite,
      qty: mode
    });
    fetch(API.RENTTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: RentReturnReport[]) => {
        setIsSummary(false);
        setReportData([]);
        setReportDetails(json);
      })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadData = () => { 
    if (filterPeriod === "This Month") { ReloadMaster2("0"); }
    else if (filterPeriod === "Last Month") { ReloadMaster2("1"); }
    else if (filterPeriod === "Last 3 Months") { ReloadMaster("3"); }
    else if (filterPeriod === "Last 6 Months") { ReloadMaster("6"); } 
  }

  useEffect(() => {
    ReloadData();
    console.log("Reload Users")
  }, []);

  useEffect(() => {
    ReloadData();
    scrollToTop();
    console.log("Reload filterPeriod : " + filterPeriod);
  }, [filterPeriod]);

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
            if (isSummary) saveToExcel(reportData);
            else saveToExcel2(reportDetails);
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

      {isSummary && (
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
      )}
      <Card>
        <CardContent className="pt-6">
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
            {isSummary && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Rented</TableHead>
                    <TableHead className="text-center">Returned</TableHead>
                    <TableHead className="text-center">Overdue</TableHead>
                    <TableHead className="text-center">Return Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((data) => {
                    const returnRate = data.ReturnRates; // ((data.Returned / data.rented) * 100).toFixed(1);
                    return (
                      <TableRow key={data.Periode} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {data.PeriodeName}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{data.Total}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            {data.Returned}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-100 text-red-700 border-red-300">
                            {data.Overdue}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{returnRate}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {!isSummary && (
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
                  {reportDetails.map((data) => { 
                    return (
                      <TableRow key={data.ToolsId+data.Mekanik+data.DateRental} className="hover:bg-gray-50">
                        <TableCell>{data.ToolsId}</TableCell>
                        <TableCell>{data.NamaTools}</TableCell>
                        <TableCell>{data.NamaMekanik}</TableCell>
                        <TableCell className="text-center">{data.DateRental} </TableCell>
                        <TableCell className="text-center">{data.DateReturn}</TableCell>
                        <TableCell className="text-center">{data.stRent}</TableCell>
                        <TableCell className="text-center">{data.ReturnCondition}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
