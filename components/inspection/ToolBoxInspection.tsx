import { useState, useEffect } from 'react';
import AutoComplete from '../ui/AutoComplete';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User, ChevronRight, ChevronLeft, RefreshCcw, ArrowUp
} from 'lucide-react';
import { cn } from '../ui/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { useAuth, AuthUsers } from "../../service/AuthContext";
import { GlobalModel, AuditRequest, RegisterTools } from "../../model/Models";
import { API } from '../../config';
import * as XLSX from 'xlsx';

interface ToolBoxInspection {
  id: string;
  toolBoxId: string;
  inspectionDate: string;
  inspector: string;
  location: string;
  toolsCount: number;
  status: string; // 'Pass' | 'Fail' | 'Partial';
  issues: string;
  nextInspection: string;
}

interface ToolBoxData {
  Idx: string;
  ToolsBoxType: string;
  ToolsBoxBrand: string;
  ToolsDesc: string;
  ToolsIDToolBox: string;
  ToolsSize: string;
}

interface ToolBoxItems {
  Kode: string;
  Nama: string;
  ToolsIDToolBox: string;
  ToolsCondition: string;
}

export default function ToolBoxInspection() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [toolBox, setToolBox] = useState<ToolBoxData[]>([]);
  const [toolsList, setToolsList] = useState<ToolBoxItems[]>([]);
  const [toolConditions, setToolConditions] = useState<Record<string, string>>({});

  const toolBoxOptions = toolBox.map(box => ({
    id: box.ToolsIDToolBox,
    label: box.ToolsIDToolBox + ' - ' + box.ToolsDesc
  }));


  const handleSelectToolBox = (option: { id: string, label: string }) => {
    setSearchTerm(option.id);
    console.log(searchTerm);
    setTodoCurrentPage(1); // Reset page on selection
    GetToolsList();
  };

  /*Pagination History */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /*Pagination Todo List */
  const [todoCurrentPage, setTodoCurrentPage] = useState(1);
  const [todoItemsPerPage, setTodoItemsPerPage] = useState(10);

  const [inspections, setInspections] = useState<ToolBoxInspection[]>([
    {
      id: 'TBI-001',
      toolBoxId: 'TB-A001',
      inspectionDate: '2024-12-10',
      inspector: 'John Doe',
      location: 'Site Alpha',
      toolsCount: 25,
      status: 'Pass',
      issues: 'None',
      nextInspection: '2025-01-10',
    },
    //{
    //  id: 'TBI-002',
    //  toolBoxId: 'TB-B002',
    //  inspectionDate: '2024-12-09',
    //  inspector: 'Jane Smith',
    //  location: 'Site Beta',
    //  toolsCount: 30,
    //  status: 'Fail',
    //  issues: '3 missing tools, 2 damaged',
    //  nextInspection: '2024-12-16',
    //},
    //{
    //  id: 'TBI-003',
    //  toolBoxId: 'TB-C003',
    //  inspectionDate: '2024-12-11',
    //  inspector: 'Bob Johnson',
    //  location: 'Workshop Central',
    //  toolsCount: 20,
    //  status: 'Partial',
    //  issues: '1 tool requires calibration',
    //  nextInspection: '2024-12-18',
    //},
    //{
    //  id: 'TBI-004',
    //  toolBoxId: 'TB-D004',
    //  inspectionDate: '2024-12-08',
    //  inspector: 'Sarah Wilson',
    //  location: 'Site Gamma',
    //  toolsCount: 28,
    //  status: 'Pass',
    //  issues: 'None',
    //  nextInspection: '2025-01-08',
    //},
  ]);


  const filteredInspections = inspections.filter((inspection) => {
    if (!searchTerm || searchTerm === "") return true;

    // Check if searchTerm matches a selected box's ToolsIDToolBox
    const selectedBox = toolBox.find(b => b.ToolsIDToolBox === searchTerm);
    if (selectedBox) {
      return inspection.toolBoxId.toLowerCase().includes(selectedBox.ToolsIDToolBox.toLowerCase());
    }

    return (
      inspection.toolBoxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInspections.slice(startIndex, endIndex);
  const isPagingShow = filteredInspections.length > itemsPerPage;

  /* Todo List Pagination Logic */
  const totalTodoPages = Math.ceil(toolsList.length / todoItemsPerPage);
  const startTodoIndex = (todoCurrentPage - 1) * todoItemsPerPage;
  const currentTodoItems = toolsList.slice(startTodoIndex, startTodoIndex + todoItemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Fail':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Pending':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Fail':
        return <XCircle className="h-4 w-4" />;
      case 'Partial':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleDelete = (id: string) => {
    setInspections(inspections.filter((i) => i.id !== id));
    toast.success('Tool box inspection deleted successfully!');
  };

  const stats = {
    total: inspections.length,
    passed: inspections.filter((i) => i.status === 'Pass').length,
    failed: inspections.filter((i) => i.status === 'Fail').length,
    partial: inspections.filter((i) => i.status === 'Partial').length,
    pending: inspections.filter((i) => i.status === 'Pending').length,
  };

  const GetToolBox = () => {
    const params = new URLSearchParams({
      showdata: "TOOLBOX",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolBoxData[]) => setToolBox(json))
      .catch((error) => console.error("Error:", error));
  }

  // const GetToolsList = (boxId?: string) => {
  const GetToolsList = () => {
    if (!currentUser) return;
    // const targetBoxId = boxId || searchTerm;
    // if (!targetBoxId) return;

    const params = new URLSearchParams({
      showdata: "AUDITTOOLS",
      jobsite: currentUser.Jobsite,
      nrp: currentUser.Nrp
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: ToolBoxItems[]) => {
        // Filter tools that belong to the selected toolbox
        // const filtered = (json || []).filter(t => t.ToolsIDToolBox === targetBoxId);
        const filtered = (json);
        setToolsList(filtered);
        setSearchTerm(filtered[0].ToolsIDToolBox);

        // Initialize conditions
        const initialConditions: Record<string, string> = {};
        filtered.forEach(t => initialConditions[t.Kode] = t.ToolsCondition || "");
        setToolConditions(initialConditions);

        console.log("Tools in Box:", json);
      })
      .catch((error) => console.error("Error fetching tools list:", error));
  }

  const handleReset = () => {
    setSearchTerm('');
    setToolsList([]);
    setToolConditions({});
  };

  const handleSubmitInspection = async () => {
    // Validation: Check if all tools in the list have a selected condition
    const incompleteTools = toolsList.filter(tool => !toolConditions[tool.Kode] || toolConditions[tool.Kode] === "");

    if (incompleteTools.length > 0) {
      toast.error(`Inspection Incomplete: Please select a condition for all ${incompleteTools.length} tool(s) remaining.`);
      return;
    }

    const checkedToolIds = Object.keys(toolConditions).filter(id => toolConditions[id] !== "");
    const now = new Date();
    const auditDateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    let successCount = 0;
    let failCount = 0;
    let errorMessage = "";

    try {
      // Process each checked tool individually
      for (const toolId of checkedToolIds) {
        try {
          const response = await fetch(API.AUDITTOOLS(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "INSERTAUDITTOOLBOX",
              ToolIdParent: searchTerm,
              ToolIdChild: toolId,
              Jobsite: currentUser.Jobsite,
              Nrpuser: currentUser.Nrp,
              AuditDate: auditDateStr,
              ToolCondition: toolConditions[toolId]
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.length > 0) {
            const resData = data[0];

            if (resData?.Status == 1) {
              successCount++;
              // toast.success(`Inspection submitted! ${successCount} tools verified successfully.`);
            } else {
              failCount++;
              errorMessage = data[0]?.Message || "Unknown error";
            }
          }
        } catch (itemError: any) {
          failCount++;
          errorMessage = itemError.message;
        }
      }

      if (successCount > 0) {
        toast.success(`Inspection submitted! ${successCount} tools verified successfully.`);
        if (failCount > 0) {
          toast.warning(`${failCount} tools failed to save: ${errorMessage}`);
        }
        // handleReset();
        // Optionally reload audit history
        GetToolsList();
        // ReloadAuditData();
      } else if (failCount > 0) {
        toast.error(`Failed to submit inspection: ${errorMessage}`);
      }

    } catch (ex: any) {
      toast.error("An error occurred during submission: " + ex.message);
    }
  };


  useEffect(() => {
    // GetToolBox();
    GetToolsList();
    // ReloadAuditData();
  }, []);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-[#009999]" />
            Tool Box Inspection
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage tool box inspections and track tool inventory
          </p>
        </div>
      </div>

      {/* Header Tool Box */}
      <Card className="border-none shadow-sm bg-gray-50/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tool Box Information</span>
                <div className="flex items-center gap-2">
                  <span className="uppercase font-medium text-gray-600 tracking-wider">
                    {toolsList.length > 0 ? toolsList[0].ToolsIDToolBox : '---'}
                  </span>

                  <span className="text-gray-600 font-medium">
                    {toolsList.length > 0 ? toolsList[0].Nama : 'No Toolbox Selected'}
                  </span>
                </div>
              </div>
            </div>

            {/* <Button
              variant="outline"
              onClick={handleReset}
              className="h-10 px-4 flex items-center gap-2 border-gray-200 hover:bg-gray-100 text-gray-600"
              disabled={!searchTerm}
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button> */}
          </div>
        </CardContent>
      </Card>

      {/* Tool Todo List */}
      {toolsList.length > 0 ? (
        <Card className="border-0 shadow-xl bg-white/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 p-2">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 py-5">
            <div className="flex items-center justify-end">

              <Badge variant="outline" className="bg-[#009999]/5 text-[#009999] border-[#009999]/20 px-3 py-1">
                {Object.values(toolConditions).filter(val => val !== "").length} / {toolsList.length} Checked
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="w-16 text-center font-bold text-gray-700">No</TableHead>
                    <TableHead className="font-bold text-gray-700">Tool Description</TableHead>
                    <TableHead className="w-40 text-center font-bold text-gray-700">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(currentTodoItems.map((tool, index) => (
                    <TableRow
                      key={tool.Kode}
                      className={`hover:bg-[#009999]/5 transition-all duration-200 ${toolConditions[tool.Kode] ? 'bg-green-50/30' : ''}`}
                    >
                      <TableCell className="text-center text-gray-400 font-medium">
                        {String(startTodoIndex + index + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col py-1">
                          <span className={`font-semibold transition-all ${toolConditions[tool.Kode] ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {tool.Nama}
                          </span>
                          <span className="text-xs font-mono text-gray-400 mt-0.5 tracking-wider">
                            {tool.Kode}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center h-full">
                          <RadioGroup
                            value={toolConditions[tool.Kode] || ""}
                            onValueChange={(value) => {
                              setToolConditions(prev => ({
                                ...prev,
                                [tool.Kode]: value
                              }));

                              // setToolsList(prev => prev.map(t =>
                              //   t.Kode === tool.Kode ? { ...t, ToolsCondition: value } : t
                              // ));
                            }}

                            className="flex items-center gap-2 justify-center"
                          >
                            {[
                              { value: 'Con1', label: 'Good' },
                              { value: 'Con2', label: 'R1' },
                              { value: 'Con3', label: 'TA' },
                            ].map((opt) => (
                              <div key={opt.value} className="flex items-center">
                                <RadioGroupItem
                                  value={opt.value}
                                  id={`${opt.value}-${tool.Kode}`}
                                  className="h-5 w-5 border-black text-black"
                                />
                                <Label
                                  htmlFor={`${opt.value}-${tool.Kode}`}
                                  className="text-sm font-medium cursor-pointer text-gray-700 p-1"
                                >
                                  {opt.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}

                </TableBody>
              </Table>
            </div>

            {/* Todo List Pagination Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-50/30 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Label htmlFor="todoItemsPerPage" className="text-xs text-gray-500">
                  Items per page:
                </Label>
                <Select
                  value={todoItemsPerPage.toString()}
                  onValueChange={(value) => {
                    setTodoItemsPerPage(Number(value));
                    setTodoCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="todoItemsPerPage" className="h-8 w-20 text-xs bg-white">
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
                  Page {todoCurrentPage} of {totalTodoPages || 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={() => setTodoCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={todoCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={() => setTodoCurrentPage((prev) => Math.min(prev + 1, totalTodoPages))}
                    disabled={todoCurrentPage === totalTodoPages || totalTodoPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Ensure all tools are present and in good condition before submitting.
              </p>
              <Button
                onClick={handleSubmitInspection}
                disabled={toolsList.length === 0}
                className="bg-green-500 hover:bg-green-600 h-10 rounded-xl"
              >
                Submit Inspection
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4 bg-yellow-50 border-yellow-500">
          <CardContent>
            <p className="text-center text-yellow-600 py-8">No tools to be checked</p>
          </CardContent>
        </Card>
      )
      }

      {/* Inspection Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">

            {/* Pagination */}

          </div>
        </CardContent>
      </Card>

    </div >
  );
}
