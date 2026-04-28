import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  Download,
  Users,
  TrendingUp,
  Calendar,
  Building2,
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface UserData {
  department: string;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  activeRate: number;
}

interface UserResponse {
  Kode: string;
  Keterangan: string;
  ID: string;
  Total: number;
  Active: number;
  NotActive: number;
  ActiveRate: number;

}

export default function UserPopulation() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [userData, setUserData] = useState<UserData[]>([]);

  const filteredData = userData.filter((data) => {
    const matchesSearch = data.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || data.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const stats = {
    totalUsers: userData.reduce((sum, d) => sum + d.totalUsers, 0),
    activeUsers: userData.reduce((sum, d) => sum + d.activeUsers, 0),
    inactiveUsers: userData.reduce((sum, d) => sum + d.inactiveUsers, 0),
    departments: userData.length,
  };

  const saveToExcel = (data: UserData[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Department': tool.department,
        'Total': tool.totalUsers,
        'Aktif': tool.activeUsers,
        'Inactive': tool.inactiveUsers,
        'Aktif Rate': tool.activeRate
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `User_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const ReloadMaster = () => {
    const params = new URLSearchParams({
      action: "REPORT",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.DETAILUSER() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: UserResponse[]) => {
        const deptData = json.map((r) => ({
          department: r.Keterangan ?? '',
          totalUsers: r.Total ?? 0,
          activeUsers: r.Active ?? 0,
          inactiveUsers: r.NotActive ?? 0,
          activeRate: r.ActiveRate ?? 0,
        }));
        setUserData(deptData);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    ReloadMaster();
    console.log("Reload Users")
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-[#009999]" />
            User Population Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Overview of user distribution across departments
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
            onClick={() => toast.success('Report exported successfully!')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            className="bg-[#009999] hover:bg-[#008080] text-white"
            onClick={() => saveToExcel(userData)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.totalUsers}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <Users className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.activeUsers}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-red-600">{stats.inactiveUsers}</div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-blue-600">{stats.departments}</div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activeUsers" fill="#10b981" name="Active Users" />
              <Bar dataKey="inactiveUsers" fill="#ef4444" name="Inactive Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 p-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                {userData.map((d) => (
                  <SelectItem key={d.department} value={d.department}>
                    {d.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Total Users</TableHead>
                  <TableHead className="text-center">Active Users</TableHead>
                  <TableHead className="text-center">Inactive Users</TableHead>
                  <TableHead className="text-center">Active Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((data) => {
                    const activeRate = data.activeRate; // ((data.activeUsers / data.totalUsers) * 100).toFixed(1);
                    return (
                      <TableRow key={data.department} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-[#009999]">{data.department}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{data.totalUsers}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            {data.activeUsers}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-100 text-red-700 border-red-300">
                            {data.inactiveUsers}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">{activeRate}%</span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {userData.length} departments
      </div>
    </div>
  );
}
