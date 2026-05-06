import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  Download,
  Wrench,
  Package,
  AlertTriangle,
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface ToolData {
  catId: string;
  category: string;
  total: number;
  good: number;
  r1: number;
  r2: number;
  ta: number;
  GoodRates: number;
}

interface ToolReport {
  Kode: string;
  Keterangan: string;
  Total: number;
  Good: number;
  R1: number;
  R2: number;
  TA: number;
  GoodRates: number;

}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function ToolPopulation() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [toolData, setToolData] = useState<ToolData[]>([]);

  const filteredData = toolData.filter((data) => {
    const matchesSearch = data.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || data.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalTools: toolData.reduce((sum, d) => sum + d.total, 0),
    good: toolData.reduce((sum, d) => sum + d.good, 0),
    r1: toolData.reduce((sum, d) => sum + d.r1, 0),
    r2: toolData.reduce((sum, d) => sum + d.r2, 0),
    ta: toolData.reduce((sum, d) => sum + d.ta, 0),
  };

  const pieData = [
    { name: 'Good', value: stats.good },
    { name: 'R1', value: stats.r1 },
    { name: 'R2', value: stats.r2 },
    { name: 'TA', value: stats.ta },
  ];

  const saveToExcel = (data: ToolData[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Category': tool.catId,
        'Category Name': tool.category,
        'Total': tool.total,
        'Good': tool.good,
        'R1': tool.r1,
        'R2': tool.r2,
        'TA': tool.ta,
        'Good Rates': tool.GoodRates,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Tools_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const ReloadMaster = () => {
    const params = new URLSearchParams({
      action: "REPORT",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.REGISTERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolReport[]) => {
        const deptData = json.map((r) => ({
          catId: r.Kode,
          category: r.Keterangan ?? '',
          total: r.Total ?? 0,
          good: r.Good ?? 0,
          r1: r.R1 ?? 0,
          r2: r.R2 ?? 0,
          ta: r.TA ?? 0,
          GoodRates: r.GoodRates ?? 0,
        }));
        setToolData(deptData);
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
            <Wrench className="h-7 w-7 text-[#009999]" />
            Tool Population Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Overview of tool inventory and condition status
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
            onClick={() => saveToExcel(toolData)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="shadow-sm p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-gray-900">{stats.totalTools}</div>
              <div className="p-2 bg-[#009999]/10 rounded-lg">
                <Wrench className="h-5 w-5 text-[#009999]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Good Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-green-600">{stats.good}</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">R1 Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-blue-600">{stats.r1}</div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">R2 Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-orange-600">{stats.r2}</div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">TA Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl text-red-600">{stats.ta}</div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Condition Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {toolData.map((d) => (
                  <SelectItem key={d.category} value={d.category}>
                    {d.category}
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
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Good</TableHead>
                  <TableHead className="text-center">R1</TableHead>
                  <TableHead className="text-center">R2</TableHead>
                  <TableHead className="text-center">TA</TableHead>
                  <TableHead className="text-center">Good Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((data) => {
                    const goodRate = data.GoodRates; //  ((data.good / data.total) * 100).toFixed(1);
                    return (
                      <TableRow key={data.category} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-gray-400" />
                            <span className="text-[#009999]">{data.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{data.total}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            {data.good}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {data.r1}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                            {data.r2}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-100 text-red-700 border-red-300">
                            {data.ta}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">{goodRate}%</span>
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
        Showing {filteredData.length} of {toolData.length} categories
      </div>
    </div>
  );
}
