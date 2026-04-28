import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { API } from '../../config';
import { useAuth } from '../../service/AuthContext';
import * as XLSX from 'xlsx';

interface ToolBoxItems {
  ToolsId: string;
  ToolsDesc: string;
  ToolsBrand: string;
  ToolsSize: string;
  ToolsPartNumber: string;
  ToolsCondition: string;
  ToolsLocation: string;
  Jan?: string | null;
  Feb?: string | null;
  Mar?: string | null;
  Apr?: string | null;
  May?: string | null;
  Jun?: string | null;
  Jul?: string | null;
  Aug?: string | null;
  Sep?: string | null;
  Oct?: string | null;
  Nov?: string | null;
  Dec?: string | null;
  AuditMonth: { month: string; status: string | null }[];
}

export default function ToolBoxInspectionReport() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState<ToolBoxItems[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredData = reportData.filter(row =>
    row.ToolsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.ToolsDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.ToolsBrand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const stats = useMemo(() => {
    let totalInspections = 0;
    let passed = 0;
    let failed = 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    reportData.forEach(tool => {
      months.forEach(month => {
        const status = (tool as any)[month];
        if (status && status.trim() !== '') {
          totalInspections++;
          if (status === 'Good') {
            passed++;
          } else if (status === 'R1' || status === 'R2' || status === 'TA') {
            failed++;
          }
        }
      });
    });

    return {
      total: totalInspections,
      passed: passed,
      failed: failed,
      pending: reportData.length // Total tools tracked
    };
  }, [reportData]);

  const ReloadAuditData = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "AUDITTOOLSBOX"
    });
    fetch(API.AUDITTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolBoxItems[]) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mapped = (json || []).map(item => ({
          ...item,
          AuditMonth: months.map(m => ({
            month: m,
            status: (item as any)[m] || null
          }))
        }));

        setReportData(mapped);
        console.log(mapped);
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleExportExcel = () => {
    try {
      const currentYear = new Date().getFullYear();
      const filename = `Toolbox_items_Audit_${currentYear}.xlsx`;

      const exportData = reportData.map((item, index) => ({
        'NO': index + 1,
        'TOOLS LOCATION': item.ToolsLocation,
        'TOOLSID': item.ToolsId,
        'DESCRIPTION': item.ToolsDesc,
        'BRAND': item.ToolsBrand,
        'SIZE': item.ToolsSize,
        'Jan': item.Jan || '',
        'Feb': item.Feb || '',
        'Mar': item.Mar || '',
        'Apr': item.Apr || '',
        'May': item.May || '',
        'Jun': item.Jun || '',
        'Jul': item.Jul || '',
        'Aug': item.Aug || '',
        'Sep': item.Sep || '',
        'Oct': item.Oct || '',
        'Nov': item.Nov || '',
        'Dec': item.Dec || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Report");

      XLSX.writeFile(workbook, filename);
      toast.success('Excel report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel report.');
    }
  };

  useEffect(() => {
    ReloadAuditData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-[#009999]" />
            Tool Box Inspection Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Tool box inspection results and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10" onClick={() => toast.success('Report exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Inspections</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Passed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-green-600">{stats.passed}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-red-600">{stats.failed}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1 hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-yellow-600">{stats.pending}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4 p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by Tool ID, Tool Name or Brand..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border border-gray-200">
              <TableHeader>
                <TableRow className="border-b-0 divide-x divide-gray-300">
                  {['NO', 'TOOLS LOCATION', 'TOOLSID', 'DESCRIPTION', 'BRAND', 'SIZE'].map((col, i) => (
                    <TableHead key={i} className="bg-gray-100 text-gray-700 font-bold text-[10px] py-3 text-center whitespace-nowrap px-4 border-b-2 border-gray-300">
                      {col}
                    </TableHead>
                  ))}
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                    <TableHead key={i} className="bg-yellow-100 font-bold py-3 text-center whitespace-nowrap px-4 border-b-2">
                      {month}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((row, index) => (
                  <TableRow key={row.ToolsId} className="hover:bg-gray-50 divide-x divide-gray-100">
                    <TableCell className="text-center text-xs py-2">{startIndex + index + 1}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{row.ToolsLocation}</TableCell>
                    <TableCell className="text-xs font-mono whitespace-nowrap">{row.ToolsId}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{row.ToolsDesc}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{row.ToolsBrand}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-center">{row.ToolsSize}</TableCell>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                      const audit = row.AuditMonth?.find(a => a.month === month);
                      return (
                        <TableCell key={i} className="text-center text-[10px] py-2 border-l border-gray-100">
                          {audit?.status ? (
                            <span className="text-green-600 font-bold">{audit.status}</span>
                          ) : '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {currentItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={19} className="h-32 text-center text-gray-500 italic">
                      No records found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50/30 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage" className="text-xs text-gray-500">
                Items per page:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="itemsPerPage" className="h-8 w-20 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-white"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-white"
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
