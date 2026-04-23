import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { Search, Download, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { API } from '../../config';

interface DisposedTool {
  ID: string;
  ItemKey: string;
  ToolsId: string;
  ToolsName: string;
  ToolType: string;
  DisposalDate: string;
  DisposalReason: string;
  ProposedByNRP: string;
  Status: string; // 'Pending Disposal' | 'Disposed' | 'Reactivated' | 'Under Review';
  Condition: string; // 'TA' | 'R2' | 'Damaged' | 'Obsolete';
  LastUsedDate: string;
  EstimatedValue: number;
  TindakLanjut: string;
  ToolsCondition: string;
  ToolsStatus: string;
}

export default function DisposedToolReport() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  // const stats = { total: 45, thisMonth: 8, thisQuarter: 22, thisYear: 45 };
  const [disposedTools, setDisposedTools] = useState<DisposedTool[]>([])

  const ReloadDisposeTool = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "DISPOSALTOOL"
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: DisposedTool[]) => {
        console.log(json);
        setDisposedTools(json.filter(req => req.ToolsStatus === 'R2' || req.ToolsStatus === 'TA'));
      }).catch((error) => console.error("Error:", error));
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(NaN);
    const [day, month, year] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const stats = {
    total: disposedTools.length,
    thisMonth: disposedTools.filter((t) => {
      const disposalDate = parseDate(t.DisposalDate);
      const now = new Date();

      return disposalDate.getMonth() === now.getMonth() &&
        disposalDate.getFullYear() === now.getFullYear();
    }).length,
    thisQuarter: disposedTools.filter((t) => {
      const disposalDate = parseDate(t.DisposalDate);
      const now = new Date();
      const disposalQuarter = Math.floor(disposalDate.getMonth() / 3);
      const currentQuarter = Math.floor(now.getMonth() / 3);
      return disposalQuarter === currentQuarter &&
        disposalDate.getFullYear() === now.getFullYear();
    }).length,
    thisYear: disposedTools.filter((t) => {
      const disposalDate = parseDate(t.DisposalDate);
      const now = new Date();
      return disposalDate.getFullYear() === now.getFullYear();
    }).length
  };

  const filteredRequests = disposedTools.filter(req => {
    const matchesSearch =
      req.ToolsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.ToolsName.toLowerCase().includes(searchTerm.toLowerCase());

    //   // const matchesStatus = filterStatus === 'All' || req.StReportBAKT === filterStatus;

    return matchesSearch;
  });

  useEffect(() => {
    ReloadDisposeTool();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <XCircle className="h-7 w-7 text-[#009999]" />
            Disposed Tool Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track disposed and decommissioned tools</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10" onClick={() => toast.success('Report exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10" onClick={() => toast.success('Excel exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Disposed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-blue-200 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-blue-600">{stats.thisMonth}</div></CardContent>
        </Card>
        <Card className="border-purple-200 p-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">This Quarter</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-purple-600">{stats.thisQuarter}</div></CardContent>
        </Card>
        <Card className="border-orange-200 p-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">This Year</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-orange-600">{stats.thisYear}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4 p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search disposed tools..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>BAKT Number</TableHead>
                  <TableHead>Tool ID</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Disposal Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-center">Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.ID} className="hover:bg-gray-50">
                      <TableCell className="text-[#009999]">{request.ItemKey}</TableCell>
                      <TableCell>{request.ToolsId}</TableCell>
                      <TableCell>{request.ToolsName}</TableCell>
                      <TableCell>{request.DisposalDate}</TableCell>
                      <TableCell>{request.DisposalReason}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-red-100 text-red-700 border-red-300">{request.ToolsStatus}</Badge>
                      </TableCell>
                    </TableRow>
                  )))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
