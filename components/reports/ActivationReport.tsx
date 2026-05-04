import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';


interface ActivationToolData {
  Idx: number;
  ToolsId: string;
  ToolsDesc: string;
  ToolsDateIn: string;
  NoBAST: string;
  Jobsite: string;
  GivenDate: string;
  IsConfirmed: string;
  NRPPenerima: string;
  NamaPenerima: string;
  NamaPenyerah: string;
  ApprovedBy: string;
  ApprovedByName: string;
  ApprovalDate: string;
  StApprovedBAST: string;
  StUser: string;
  StApproved: number;
  Tools: ActivationToolData[];
}

export default function ActivationReport() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const [activationTools, setActivationTools] = useState<ActivationToolData[]>([])

  const stats = {
    total: activationTools.length,
    pending: activationTools.filter((r) => r.StApprovedBAST === 'Pending').length,
    approved: activationTools.filter((r) => r.StApprovedBAST === 'Approved').length,
    rejected: activationTools.filter((r) => r.StApprovedBAST === 'Rejected').length,
  };


  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const filteredData = activationTools.filter((req) => {
    const matchesSearch =
      req.NamaPenerima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.NamaPenyerah?.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === "";

    const matchesStatus = true;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };


  const saveToExcel = (data: ActivationToolData[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Tool ID': tool.ToolsId,
        'Tool Name': tool.ToolsDesc,
        'Request Date': formatDate(tool.GivenDate),
        'Requested By': tool.NamaPenerima,
        'Status': tool.StApprovedBAST,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Tools_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const GetActivationList = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      nrp: currentUser.Nrp,
      showDetail: "SHOW"
    });
    fetch(API.ACTIVATIONTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ActivationToolData[]) => { setActivationTools(json); console.log(json) })
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    GetActivationList();
  }, []);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-7 w-7 text-[#009999]" />
            Activation Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Tool activation status and history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10" onClick={() => toast.success('Report exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10" onClick={() => saveToExcel(activationTools)}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Activations</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-green-600">{stats.approved}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-yellow-600">{stats.pending}</div></CardContent>
        </Card>
        <Card className="shadow-md p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-red-600">{stats.rejected}</div></CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by Tool ID, Tool name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white border-gray-400" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto shadow-md rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>BAST No.</TableHead>
                  <TableHead>Tool ID</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No activation requests found
                    </TableCell>
                  </TableRow>
                ) : (filteredData.map((tool) => (
                  <TableRow className="hover:bg-gray-50">
                    <TableCell className="text-[#009999]">{tool.NoBAST}</TableCell>
                    <TableCell>{tool.ToolsId}</TableCell>
                    <TableCell>{tool.ToolsDesc}</TableCell>
                    <TableCell>{formatDate(tool.ToolsDateIn)}</TableCell>
                    <TableCell>{tool.NamaPenerima}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`w-fit ${getStatusColor(tool.StApprovedBAST)}`}>
                        {tool.StApprovedBAST}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
