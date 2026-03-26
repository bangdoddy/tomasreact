import { useState, useEffect } from 'react';
import { Button } from '../ui/button'; 
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, Download, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface Certification {
  Kode: string;
  Jobsite: string;
  ToolsId: string;
  ToolsName: string;
  CertType: string;
  CertNumber: string;
  CertBy: string;
  CertStartDate: string;
  CertExpiredDate: string;
  CertDate: string;
  CertStatus: string;
  nextDueDate: string;
}

export default function CertificationCalibrationReport() {
  const { currentUser } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]); 

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const stats = {
    total: certifications.length,
    valid: certifications.filter((c) => c.CertStatus === 'Valid').length,
    expiringSoon: certifications.filter((c) => c.CertStatus === 'Expiring Soon').length,
    expired: certifications.filter((c) => c.CertStatus === 'Expired').length,
  };

  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.ToolsName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.ToolsId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.CertNumber?.toLowerCase().includes(searchTerm.toLowerCase());
       
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredCertifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCertifications.slice(startIndex, endIndex);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Expired':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const saveToExcel = (data: Certification[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Tool ID': tool.ToolsId,
        'Tool Name': tool.ToolsName,
        'Type': tool.CertType,
        'Expiry Date': tool.CertExpiredDate,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Report_Certification_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }


  /*Load Server */
  const ReloadMaster = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite
    });
    fetch(API.CERTIFICATION() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: Certification[]) => {
        setCertifications(json);
      })
      .catch((error) => console.error("Error:", error));
  }; 
  useEffect(() => {
    ReloadMaster(); 
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <Award className="h-7 w-7 text-[#009999]" />
            Certification & Calibration Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">Tool certification and calibration status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Report exported!')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-[#009999] hover:bg-[#008080] text-white"
            onClick={() => saveToExcel(certifications)}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#009999]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Records</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-gray-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Valid</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-green-600">{stats.valid}</div></CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-yellow-600">{stats.expiringSoon}</div></CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Expired</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl text-red-600">{stats.expired}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search certifications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tool ID</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No certification records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((cert) => (
                    <TableRow key={cert.Kode} className="hover:bg-gray-50">
                      <TableCell className="text-[#009999]">{cert.ToolsId }</TableCell>
                      <TableCell>{cert.ToolsName }</TableCell>
                      <TableCell>{cert.CertType }</TableCell>
                      <TableCell>{ cert.CertExpiredDate}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(cert.CertStatus)}`} > 
                          {cert.CertStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {/*<TableRow className="hover:bg-gray-50">*/}
                {/*  <TableCell className="text-[#009999]">TL-0245</TableCell>*/}
                {/*  <TableCell>Digital Multimeter</TableCell>*/}
                {/*  <TableCell>Calibration</TableCell>*/}
                {/*  <TableCell>2025-06-15</TableCell>*/}
                {/*  <TableCell className="text-center">*/}
                {/*    <Badge className="bg-green-100 text-green-700 border-green-300">Valid</Badge>*/}
                {/*  </TableCell>*/}
                {/*</TableRow>*/}
                {/*<TableRow className="hover:bg-gray-50">*/}
                {/*  <TableCell className="text-[#009999]">TL-0089</TableCell>*/}
                {/*  <TableCell>Lifting Equipment</TableCell>*/}
                {/*  <TableCell>Certification</TableCell>*/}
                {/*  <TableCell>2025-01-10</TableCell>*/}
                {/*  <TableCell className="text-center">*/}
                {/*    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Expiring Soon</Badge>*/}
                {/*  </TableCell>*/}
                {/*</TableRow>*/}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
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
        </CardContent>
      </Card>
    </div>
  );
}
