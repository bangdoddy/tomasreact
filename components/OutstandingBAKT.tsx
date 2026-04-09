import { useState, useEffect, useRef } from 'react';
import { Search, FileDown, File } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import CreateBAKTForm from './CreateBAKTForm';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';
import * as XLSX from 'xlsx';

interface ItemBAKT {
  ItemKey: string;
  ToolsId: string;
  ToolsName: string;
  ToolsCategory: string;
  ToolsType: string;
  ToolsSize: string;
  NrpPicTools: string;
  NamaPicTools: string;
  NrpMekanik: string;
  NamaMekanik: string;
  ToolsCondition: string;
  ToolsConditionName: string;
  TransDate: string;
  MoNo: string;
  ToolsFrom: string;
}

export default function OutstandingBAKT() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemBAKT | null>(null);
  const [listBAKT, setListBAKT] = useState<ItemBAKT[]>([]);
  const searchBox = useRef<HTMLInputElement>(null);

  const filteredItems = listBAKT.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.NrpMekanik.toLowerCase().includes(query) ||
      item.NamaMekanik.toLowerCase().includes(query) ||
      item.ToolsId.toLowerCase().includes(query) ||
      item.ToolsName.toLowerCase().includes(query) ||
      item.ToolsSize.toLowerCase().includes(query) ||
      item.ToolsType.toLowerCase().includes(query) ||
      item.NamaPicTools.toLowerCase().includes(query) ||
      item.ToolsConditionName.toLowerCase().includes(query)
    );
  });

  const handleCreateBAKT = (item: ItemBAKT) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleExport = () => {

    const worksheet = XLSX.utils.json_to_sheet(
      listBAKT.map((tool) => ({
        'MRP': tool.NrpMekanik,
        'MEKANIK': tool.NamaMekanik,
        'TOOLS ID': tool.ToolsId,
        'DESCRIPTION': tool.ToolsName,
        'TYPE': tool.ToolsType,
        'SIZE': tool.ToolsSize,
        'TRANSDATE': tool.TransDate,
        'TOOLS CONDITION': tool.ToolsConditionName
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `Bakt_Outstanding_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  };


  const ReloadOutstanding = () => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "OUTSTANDING"
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ItemBAKT[]) => setListBAKT(json))
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    ReloadOutstanding();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <File className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl text-white mb-1">Outstanding BAKT</h2>
            <p className="text-white/80">List of tools with Damaged or Missing status</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end p-1">
        <Button
          onClick={handleExport}
          className="gap-2 bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchBox}
            type="text"
            placeholder="Search by MRP, Mekanik, Tools ID, Description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#009999] hover:bg-[#009999]">
              <TableHead className="text-white">NRP</TableHead>
              <TableHead className="text-white">MEKANIK</TableHead>
              <TableHead className="text-white">TOOLS ID</TableHead>
              <TableHead className="text-white">DESCRIPTION</TableHead>
              <TableHead className="text-white">TYPE</TableHead>
              <TableHead className="text-white">SIZE</TableHead>
              <TableHead className="text-white">TRANSDATE</TableHead>
              <TableHead className="text-white">TOOLS CONDITION</TableHead>
              <TableHead className="text-white text-center bg-gray-600">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="text-gray-600">{item.NrpMekanik}</TableCell>
                  <TableCell className="text-gray-600">{item.NamaMekanik}</TableCell>
                  <TableCell className="text-gray-600">{item.ToolsId}</TableCell>
                  <TableCell className="text-gray-600">{item.ToolsName}</TableCell>
                  <TableCell className="text-gray-600">{item.ToolsType}</TableCell>
                  <TableCell className="text-gray-600">{item.ToolsSize}</TableCell>
                  <TableCell className="text-gray-600">{item.TransDate}</TableCell>
                  <TableCell className="text-gray-600">{item.ToolsConditionName}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleCreateBAKT(item)}
                      className="bg-[#009999] hover:bg-[#00b8b8] text-white"
                    >
                      Create BAKT
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  No outstanding BAKT items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Showing {filteredItems.length} of {listBAKT.length} items
        </p>
        <p>Total Outstanding: {listBAKT.length} tools</p>
      </div>

      <CreateBAKTForm
        isOpen={isFormOpen}
        baktItem={selectedItem}
        onClose={() => {
          setIsFormOpen(false);
          ReloadOutstanding();
          searchBox.current?.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}