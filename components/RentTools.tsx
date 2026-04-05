import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Scan, Plus, Trash2, ShoppingCart, Eye, Edit, User, Check, X, Calendar, Clock,
  ChevronRight, ChevronLeft, Search, Download, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';
import { Separator } from './ui/separator';
import { InputRef } from './ui/inputref';
import * as XLSX from 'xlsx';

interface RentedTool {
  id: string;
  toolsId: string;
  toolsName: string;
  toolsType: string;
  quantity: number;
  condition: string;
  rentnote: string; //MO OR rent Condition
  addedTime: string;
}

interface Employee {
  nrp: string;
  name: string;
  position: string;
  jobsite: string;
  workgroup: string;
}

// interface CompletedTransaction {
//   id: string;
//   employeeNrp: string;
//   employeeName: string;
//   toolId: string;
//   toolName: string;
//   quantity: number;
//   rentDate: string;
//   rentTime: string;
//   estimatedReturnDate: string;
// }

interface CompletedTransaction {
  NO: string;
  TransIdTools: string;
  ToolsDesc: string;
  ToolsType: string;
  NRP: string;
  NAMA: string;
  TransDateRental: string;
  TransEstReturnDate: string;
  TransReturnDate: string;
  MONumber: string;
  ToolCondition: string;
  Tools: RentedTool[];
}
export default function RentTools() {
  const { currentUser } = useAuth();
  const nrpInputRef = useRef<HTMLInputElement>(null);
  const toolInputRef = useRef(null);

  /*Model*/
  const [users, setUsers] = useState<GlobalModel[]>([]);
  const [regtools, setRegTools] = useState<GlobalModel[]>([]);
  const [toolCondition, setToolCondition] = useState<GlobalModel[]>([]);

  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [rentedTools, setRentedTools] = useState<RentedTool[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<CompletedTransaction[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [adaRentTrans, setAdaRentTrans] = useState(false);
  const [estimatedReturnDays, setEstimatedReturnDays] = useState('7');
  const [titlePage, setTitlePage] = useState<string>("MO");
  const [searchQuery, setSearchQuery] = useState('');


  // Quick entry form state
  const [toolIdScan, setToolIdScan] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isSettingMO, setIsSettingMO] = useState(false);
  const [isAddScreenOpen, setAddScreenOpen] = useState(false);
  const [selectedToolData, setSelectedToolData] = useState<{
    id: string;
    name: string;
    type: string;
    status: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    toolsId: '',
    toolsName: '',
    toolsType: '',
    condition: '',
    rentnote: '',
  });
  const [isToolFound, setToolFound] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nrp: '',
    name: '',
    toolsId: '',
    toolsName: '',
    woNo: '',
    rentDate: '',
    quantity: 0,
    transIdTools: '',
    condition: ''
  });
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnToolData, setReturnToolData] = useState<CompletedTransaction | null>(null);
  const [returnCondition, setReturnCondition] = useState('Good');

  // Pagination Items
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const handleEditClick = (transaction: CompletedTransaction) => {
    setEditFormData({
      nrp: transaction.NRP,
      name: transaction.NAMA,
      toolsId: transaction.TransIdTools,
      toolsName: transaction.ToolsDesc,
      woNo: transaction.MONumber,
      rentDate: transaction.TransDateRental,
      quantity: transaction.Tools && transaction.Tools.length > 0 ? transaction.Tools[0].quantity : 1,
      transIdTools: transaction.TransIdTools,
      condition: transaction.Tools && transaction.Tools.length > 0 ? transaction.Tools[0].condition : '',
    });
    setIsEditDialogOpen(true);
  };

  const handleReturnClick = (transaction: CompletedTransaction) => {
    setReturnToolData(transaction);
    setIsReturnDialogOpen(true);
  };

  const handleUpdateTransaction = async () => {
    // Placeholder for update logic
    if (
      !editFormData.woNo
    ) {
      toast.error('Please fill WO Number fields');
      return;
    }

    const selectedTools = [{
      toolsId: editFormData.toolsId,
      toolsName: editFormData.toolsName,
      rentnote: editFormData.woNo
    }];

    try {
      const response = await fetch(API.RENTTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "UPDATE",
          ToolsId: editFormData.toolsId,
          Nrp: editFormData.nrp,
          Tools: selectedTools
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          GetTransactionList();
          handleBackToList();
          console.log('Updating transaction:', editFormData);
          toast.success('Transaction updated successfully');
          setIsEditDialogOpen(false);
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Response");
      }

    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }

  };


  // Handle employee code scan/input
  const handleEmployeeScan = () => {
    const nrp = employeeCode;
    if (nrp) {
      const selected = users.find(j => j.Kode === nrp) || null;
      if (selected) {
        const employee: Employee = {
          nrp: selected.Kode,
          name: selected.Nama,
          position: selected.Status,
          jobsite: "",
          workgroup: selected.Keterangan
        };
        setEmployeeData(employee);

        const timer = setTimeout(() => {
          if (toolInputRef.current == null) {
            console.log("ref is null")
          } else {
            toolInputRef.current?.focus();
            console.log("reftool is focus")
          }
        }, 1000);

        //toast.success('Employee ada!');
      } else {
        setEmployeeData(null);
        toast.success('Employee not found!');
      }
    } else {
      setEmployeeData(null);
      toast.success('nrp is empty!');
    }
  };

  // Handle adding tool to transaction immediately (on Enter/Scan)
  // const handleAddToolImmediate = (toolId: string, toolName: string, toolType: string, toolStatus: string, rentNote: string) => {
  //   if (!employeeData) {
  //     toast.error('Please scan employee code first');
  //     return;
  //   }
  //   let toolCond = toolStatus;
  //   if (toolCond === null || toolCond === "") toolCond = "Good";
  //   else if (toolCond === "Open") toolCond = "Good";

  //   if (toolCond !== "Rented") setAdaRentTrans(true);

  //   const now = new Date();
  //   const newTool: RentedTool = {
  //     id: Date.now().toString() + Math.random(),
  //     toolsId: toolId,
  //     toolsName: toolName,
  //     toolsType: toolType,
  //     quantity: 1,
  //     condition: toolCond,
  //     addedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  //     rentnote: rentNote,
  //   };

  //   setRentedTools([...rentedTools, newTool]);

  //   // Reset for next item (like a cashier scanner)
  //   setToolIdScan('');
  //   setSelectedToolData(null);

  //   // Auto-focus back to tool ID input for continuous scanning
  //   setTimeout(() => {
  //     document.getElementById('tool-id-input')?.focus();
  //   }, 100);
  // };

  const handleAddToolImmediate = (toolId: string, toolName: string, toolType: string, toolStatus: string, rentnote: string = '') => {
    if (!employeeData) {
      toast.error('Please scan employee code first');
      return;
    }

    const now = new Date();
    const newTool: RentedTool = {
      id: Date.now().toString() + Math.random(),
      toolsId: toolId,
      toolsName: toolName,
      toolsType: toolType,
      quantity: 1,
      condition: 'BAIK',
      rentnote: rentnote,
      addedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setRentedTools([...rentedTools, newTool]);

    // Reset for next item (like a cashier scanner)
    setToolIdScan('');
    // setSelectedToolData(null);


    // Auto-focus back to tool ID input for continuous scanning
    setTimeout(() => {
      document.getElementById('tool-id-input')?.focus();
    }, 100);
  };

  // Remove tool from transaction
  const handleRemoveTool = (id: string) => {
    setRentedTools(rentedTools.filter((tool) => tool.id !== id));
    toast.success('Tool removed from transaction');
  };

  const handleUpdateRentNote = (id: string, note: string) => {
    setRentedTools(prev => prev.map(tool =>
      tool.id === id ? { ...tool, rentnote: note } : tool
    ));
  };

  // Handle tool ID scan/lookup
  const handleToolIdScan = () => {
    const trimmedId = toolIdScan.trim().toUpperCase();
    if (!trimmedId) return;

    // Check for duplicate ToolsId in existing rentedTools
    const isDuplicate = rentedTools.some(t => t.toolsId.toUpperCase() === trimmedId);
    if (isDuplicate) {
      setToolIdScan('');
      return;
    }

    const tool = regtools.find(j => j.Kode.toUpperCase() === trimmedId) || null;
    if (tool) {
      setSelectedToolData({
        id: trimmedId,
        name: tool.Nama,
        type: tool.ToolsType,
        status: tool.Status,
      });

      handleAddToolImmediate(trimmedId, tool.Nama, tool.ToolsType, tool.Status);
      setToolFound(true);
      toast.success('Tool added !');
    } else {
      setSelectedToolData(null);
      setToolFound(false);
    }
  };


  const handleSave = () => {
    if (!formData.toolsId || !formData.toolsName || !formData.rentnote) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsActionDialogOpen(false);
    handleAddToolImmediate(formData.toolsId, formData.toolsName, formData.toolsType, formData.condition, formData.rentnote);
  }


  // Complete transaction
  const handleCompleteTransaction = () => {
    if (!employeeData) {
      toast.error('Please scan employee code first');
      return;
    }

    if (rentedTools.length === 0) {
      toast.error('Please add at least one tool to the transaction');
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const confirmTransaction = async () => {
    if (!employeeData) return;

    const now = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + parseInt(estimatedReturnDays));

    const newTransactions: CompletedTransaction[] = rentedTools.map((tool) => ({
      id: Date.now().toString() + Math.random(),
      employeeNrp: employeeData.nrp,
      employeeName: employeeData.name,
      toolId: tool.toolsId,
      toolName: tool.toolsName,
      quantity: tool.quantity,
      rentDate: now.toLocaleDateString('en-US'),
      rentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      estimatedReturnDate: returnDate.toLocaleDateString('en-US'),
    }));

    const rentedToolList = rentedTools.map((tool) => ({
      toolsId: tool.toolsId,
      toolsName: tool.toolsName,
      quantity: String(tool.quantity),
      toolsType: tool.toolsType,
      condition: tool.condition,
      rentnote: tool.rentnote,
    }));

    try {
      const response = await fetch(API.RENTTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "INSERT",
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          Nrp: employeeData.nrp,
          EstReturndays: estimatedReturnDays,
          Tools: rentedToolList
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        var message = "";
        var adaSuccess = false;
        var adaFailed = false;
        for (const item of data) {
          if (item.Status == 1) {
            deleteByToolsId(item.Data);
            adaSuccess = true;
          }
          if (item.Status == 0) {
            adaFailed = true;
            message += ((message == "") ? "" : "<br />") + item.Data + " " + item.Message;
          }
        }

        if (!adaFailed) {
          GetToolsList();

          setCompletedTransactions([...newTransactions, ...completedTransactions]);
          toast.success('Transaction completed successfully!');

          // Reset transaction states
          GetTransactionList();
          setRentedTools([]);
          setToolIdScan('');
          setSelectedToolData(null);
          setIsConfirmDialogOpen(false);
          toast.success('Transaction successfully');
          handleBackToList();
        } else {
          toast.error(message ?? "Failed");
        }

        //const resData = data[0];
        //if (resData?.Status == 1) {

        //} else {
        //  toast.error(resData?.Message ?? "Failed");
        //}
      } else {
        toast.error("Failed, No Respont");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }


  };

  function deleteByToolsId(id) {
    setRentedTools(prev => prev.filter(tool => tool.toolsId !== id));
  }

  const handleDeleteTransaction = async (id: string, nrp: string) => {
    try {
      const response = await fetch(API.RENTTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "DELETE",
          Jobsite: currentUser?.Jobsite,
          Nrp: nrp,
          Tools: [{ toolsId: id }] // Fixed structure
        })
      });

      console.log(nrp);
      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      } else {
        const data = await response.json();
        // Check if backend returned success
        if (data && data[0]?.Status === 1) {
          toast.success('Transaction deleted successfully');
          // Update local state
          setCompletedTransactions(prev => prev.filter(t => t.TransIdTools !== id));
          // Refresh from server to be sure
          GetTransactionList();
        } else {
          toast.error(data[0]?.Message || 'Failed to delete transaction');
        }
      }
    } catch (ex: any) {
      toast.error("Failed. Message: " + ex.message);
    }
  };

  // Reset transaction
  const handleResetTransaction = () => {
    setEmployeeCode('');
    setEmployeeData(null);
    setRentedTools([]);
    setToolIdScan('');
    setSelectedToolData(null);
  };

  // Toggle state for New Rent vs List
  const handleNewRent = () => {
    setAddScreenOpen(true);
  };

  const handleBackToList = () => {
    setAddScreenOpen(false);
    setEmployeeCode('');
    setEmployeeData(null);
    setRentedTools([]);
    setToolIdScan('');
    setSelectedToolData(null);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const GetUserList = () => {
    const params = new URLSearchParams({
      showdata: "USERS",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setUsers(json))
      .catch((error) => console.error("Error:", error));
  }

  const GetToolsList = () => {
    const params = new URLSearchParams({
      showdata: "REGTOOLS",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setRegTools(json))
      .catch((error) => console.error("Error:", error));
  }
  const GetToolCondition = () => {
    const params = new URLSearchParams({
      showdata: "TOOLCONDITION",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setToolCondition(json))
      .catch((error) => console.error("Error:", error));
  }

  const GetTransactionList = () => {
    const params = new URLSearchParams({
      // action: "WITHTOTAL",
      jobsite: currentUser.Jobsite,
      // current: `${currentPage}`,
      // perpage: `${itemsPerPage}`,
      // filter: searchQuery
    });
    fetch(API.RENTTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: CompletedTransaction[]) => {
        setCompletedTransactions(json);
      })
      .catch((error) => console.error("Error:", error));
  }

  const filteredTransactions = completedTransactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      transaction.NAMA?.toLowerCase().includes(query) ||
      transaction.ToolsDesc?.toLowerCase().includes(query) ||
      transaction.NRP?.toLowerCase().includes(query)
    );
  });

  /*Pagination Items (fallback to client-side if total is not set) */
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);


  useEffect(() => {
    GetUserList();
    GetToolsList();
    GetToolCondition();
    GetTransactionList();
    if (nrpInputRef.current == null) {
      console.log("ref is null")
    } else {
      nrpInputRef.current?.focus();
      console.log("ref is focus")
    }
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      completedTransactions.map((rent) => ({
        'Jobsite': '',
        'Tools ID': rent.TransIdTools,
        'Tools Name': rent.ToolsDesc,
        'Tools Type': rent.ToolsType,
        'MO Number': rent.MONumber,
        'Rent Date': rent.TransDateRental,
        'Rented To': rent.NAMA,
        'NRP': rent.NRP,
        'Est. Return Date': rent.TransEstReturnDate,
        'Return Date': rent.TransReturnDate,
        'Condition': rent.ToolCondition,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rent Transaction');

    XLSX.writeFile(workbook, `SmartTomas_Rent_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl text-white mb-1">Rent Tools Transaction</h2>
            <p className="text-white/80">Process tool rentals for employees</p>
          </div>
        </div>
      </div>

      {/* Add new rent Screen */}
      <div className={isAddScreenOpen ? "block" : "hidden"}>
        <div className="flex justify-end mb-4 p-2">
          <Button variant="outline" onClick={handleBackToList} className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        {/* Left Side - Main Transaction Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Employee Scanner */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#009999]" />
                Employee Information
              </CardTitle>
              <CardDescription>Scan or enter employee NRP from ID card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputRef
                    ref={nrpInputRef}
                    placeholder="Enter or scan employee NRP..."
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEmployeeScan();
                      }
                    }}
                    className="text-lg h-12"
                  />
                </div>
                <Button
                  onClick={handleEmployeeScan}
                  className="h-12 px-6 bg-gradient-to-r from-[#003366] to-[#009999]"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan
                </Button>
              </div>

              {employeeData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">NRP</p>
                        <p className="text-sm text-gray-900">{employeeData.nrp}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="text-sm text-gray-900">{employeeData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Position</p>
                        <p className="text-sm text-gray-900">{employeeData.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Workgroup</p>
                        <p className="text-sm text-gray-900">{employeeData.workgroup}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tool Entry - Like Cashier Scanner */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#009999]" />
                Add Tool
              </CardTitle>
              <CardDescription>Scan tool ID or enter manually - Add multiple items continuously</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tool ID Scanner */}
              <div className="grid gap-2">
                <Label htmlFor="tool-id-input">Tool ID *</Label>
                <div className="flex gap-2">
                  <InputRef
                    ref={toolInputRef}
                    id="tool-id-input"
                    placeholder="Scan or enter Tool ID (e.g., T001)..."
                    value={toolIdScan}
                    onChange={(e) => {
                      setToolIdScan(e.target.value.toUpperCase());
                      if (!isToolFound) setToolFound(true);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleToolIdScan();
                      }
                    }}
                    disabled={!employeeData}
                    className="flex-1 h-11"
                    autoComplete="off"
                  />
                  <Button
                    onClick={handleToolIdScan}
                    disabled={!employeeData}
                    variant="outline"
                    className="text-white h-12 px-6 bg-gradient-to-r from-[#003366] to-[#009999]"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Available: T001-T007</p>
              </div>

              {/* Tool Details (shown after scanning) */}
              {!isToolFound && toolIdScan !== '' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="h-4 w-4 text-red-600" />
                    <p className="text-xs text-red-800 font-medium">Tool Not Found</p>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="bg-gray-100">Tool ID</TableHead>
                    <TableHead className="bg-gray-100">Tool Name</TableHead>
                    <TableHead className="bg-gray-100 text-center">Type</TableHead>
                    <TableHead className="bg-gray-100 text-center">WO No.</TableHead>
                    <TableHead className="bg-gray-100 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentedTools.length > 0 ? rentedTools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell className="font-medium">{tool.toolsId}</TableCell>
                      <TableCell>{tool.toolsName}</TableCell>
                      <TableCell className="text-center text-sm text-gray-600">{tool.toolsType}</TableCell>
                      {/* <TableCell className="text-center">{tool.quantity}</TableCell> */}
                      <TableCell className="font-medium">
                        <Input
                          value={tool.rentnote || ''}
                          onChange={(e) => handleUpdateRentNote(tool.id, e.target.value)}
                          className="h-8 bg-yellow-50 text-xs border-[#009999]/30 focus:border-[#009999]"
                          placeholder="Enter WO No."
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTool(tool.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No tools added to current transaction</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <Button variant="outline"
                  disabled={rentedTools.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleCompleteTransaction}>SUBMIT RENT</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Removed (was Transaction Summary) */}
        <div className="space-y-6">

          {/* Transaction Summary - Moved Below Add Tool */}
          <Card className="hidden border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-[#003366]">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Employee</p>
                  <p className="text-sm text-gray-900">{employeeData?.name || '-'}</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">NRP</p>
                  <p className="text-sm text-gray-900">{employeeData?.nrp || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">

                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Total Items</p>
                  <p className="text-lg text-[#009999]">{rentedTools.length}</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Total Qty</p>
                  <p className="text-lg text-[#009999]">
                    {rentedTools.reduce((sum, tool) => sum + tool.quantity, 0)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <p className="text-sm text-gray-900">{new Date().toLocaleDateString('en-US')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={handleCompleteTransaction}
                  disabled={!employeeData || rentedTools.length === 0}
                  className="h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Submit
                </Button>
                <Button
                  onClick={handleResetTransaction}
                  variant="outline"
                  className="h-12"
                  disabled={!employeeData && rentedTools.length === 0}
                >
                  <X className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Completed Transactions List - At Bottom */}
      {!isAddScreenOpen && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#009999]" />
                  Recent Rental Transactions
                </CardTitle>
                <CardDescription>List of rent transactions</CardDescription>
              </div>

              <div className="flex gap-2">
                <Button onClick={exportToExcel} variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10">
                  <Download className="h-4 w-4" />
                  Export to Excel
                </Button>

                <Button
                  onClick={handleNewRent}
                  className="gap-2 bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]"
                >
                  <Plus className="h-4 w-4" />
                  New Rent
                </Button>
              </div>
            </div>
            <div className="mt-4 px-1">
              <div className="relative">
                <Input
                  placeholder="Search by employee name or tool..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-10 border-[#009999]/30 focus:border-[#009999] focus:ring-[#009999]/20"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-[#009999]/50" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Rent Date</TableHead>
                    <TableHead>Rented to</TableHead>
                    <TableHead>NRP</TableHead>
                    <TableHead>Tools Name</TableHead>
                    <TableHead className="text-center">MO No.</TableHead>
                    <TableHead>Est. Return Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.length > 0 ? currentTransactions.map((transaction) => (
                    <TableRow key={transaction.NO}>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{transaction.TransDateRental}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{transaction.NAMA}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{transaction.NRP}</TableCell>
                      <TableCell className="text-gray-600">{transaction.ToolsDesc}</TableCell>
                      <TableCell className="text-center text-gray-600">{transaction.MONumber}</TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{transaction.TransEstReturnDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            title="Return Tool"
                            onClick={() => handleReturnClick(transaction)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                            title="Edit Transaction"
                            onClick={() => handleEditClick(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            title="Delete Transaction"
                            onClick={() => handleDeleteTransaction(transaction.TransIdTools, transaction.NRP)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No details found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Footer */}
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center p-2">
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
            </div>
          </CardContent>
        </Card>
      )}


      {/* Confirm Transaction Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review the transaction details before confirming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm text-gray-900 mb-3">Employee Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">NRP:</p>
                  <p className="text-gray-900">{employeeData?.nrp}</p>
                </div>
                <div>
                  <p className="text-gray-600">Name:</p>
                  <p className="text-gray-900">{employeeData?.name}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm text-gray-900 mb-3">Transaction Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="text-gray-900">{rentedTools.length}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="text-gray-900">
                    {rentedTools.reduce((sum, tool) => sum + tool.quantity, 0)}
                  </span>
                </div> */}
              </div>
            </div>
            {adaRentTrans && (<div className="grid gap-2">
              <Label htmlFor="return-days">Estimated Return (Days)</Label>
              <Input
                id="return-days"
                type="number"
                min="1"
                value={estimatedReturnDays}
                onChange={(e) => setEstimatedReturnDays(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Expected return date: {new Date(Date.now() + parseInt(estimatedReturnDays) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')}
              </p>
            </div>)}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmTransaction}
              className="bg-gradient-to-r from-green-600 to-green-500"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {(selectedToolData ? 'SET ' : 'Add ') + titlePage}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="toolsName">Nama/Keterangan *</Label>
              <Input
                id="toolsName"
                disabled={selectedToolData != null}
                value={formData.toolsName}
                onChange={(e) => setFormData({ ...formData, toolsName: e.target.value })}
                placeholder="e.g., Welding Machine"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="toolsId">Kode  *</Label>
                <Input
                  id="toolsId"
                  disabled={selectedToolData != null}
                  value={formData.toolsId}
                  onChange={(e) => setFormData({ ...formData, toolsId: e.target.value })}
                  placeholder="e.g., JB001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  disabled={selectedToolData != null}
                  value={formData.toolsType}
                  onChange={(e) => setFormData({ ...formData, toolsType: e.target.value })}
                  placeholder="e.g., Welding Machine All"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Status *</Label>
                <Input
                  id="condition"
                  disabled={selectedToolData != null}
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g., Welding Machine All"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (MO / Condition)*</Label>
              {isSettingMO && (
                <Input
                  id="note"
                  value={formData.rentnote}
                  onChange={(e) => setFormData({ ...formData, rentnote: e.target.value })}
                  placeholder="e.g., MO123"
                />
              )}
              {!isSettingMO && (
                <Select
                  value={formData.rentnote}
                  onValueChange={(value) => setFormData({ ...formData, rentnote: value })}
                >
                  <SelectTrigger id="itemsPerPage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toolCondition.map((pos) => (
                      <SelectItem key={pos.Kode} value={pos.Kode}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#009999] hover:bg-[#007777] text-white"
            >
              {selectedToolData ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">Edit Rental Transaction</DialogTitle>
            <DialogDescription>
              Update the rental details for this transaction
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-20 gap-y-[5px] py-4">
            <div className="space-y-3 mb-4">
              <Label htmlFor="edit-nrp" className="text-xs">NRP</Label>
              <Input
                id="edit-nrp"
                value={editFormData.nrp}
                disabled={true}
                className="h-9 bg-gray-50"
              />
            </div>
            <div className="space-y-3 mb-4">
              <Label htmlFor="edit-name" className="text-xs">Employee Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                disabled={true}
                className="h-9 bg-gray-50"
              />
            </div>
            <div className="space-y-3 mb-4">
              <Label htmlFor="edit-toolsId" className="text-xs">Tools ID</Label>
              <Input
                id="edit-toolsId"
                value={editFormData.toolsId}
                disabled={true}
                className="h-9 bg-gray-50"
              />
            </div>
            <div className="space-y-3 mb-4">
              <Label htmlFor="edit-toolsName" className="text-xs">Tools Name</Label>
              <Input
                id="edit-toolsName"
                value={editFormData.toolsName}
                disabled={true}
                className="h-9 bg-gray-50"
              />
            </div>
            <div className="space-y-1 mb-4">
              <Label htmlFor="edit-toolsRentDate" className="text-xs">Rent Date</Label>
              <Input
                id="edit-toolsRentDate"
                value={editFormData.rentDate}
                disabled={true}
                className="h-9 bg-gray-50"
              />
            </div>
            <div className="space-y-1 mb-4">
              <Label htmlFor="edit-condition" className="text-xs">Condition</Label>
              <Input
                id="edit-condition"
                value={editFormData.condition}
                className="h-9"
                disabled={true}
              />
            </div>
            <div className="w-20 space-y-1 mb-4">
              <Label htmlFor="edit-qty" className="text-xs">Qty</Label>
              <Input
                id="edit-qty"
                type="number"
                value={editFormData.quantity}
                // onChange={(e) => setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) || 0 })}
                className="h-9"
                disabled={true}
              />
            </div>
            <div className="space-y-1 mb-4">
              <Label htmlFor="edit-woNo" className="text-xs">WO Number</Label>
              <Input
                id="edit-woNo"
                value={editFormData.woNo}
                onChange={(e) => setEditFormData({ ...editFormData, woNo: e.target.value })}
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTransaction}
              className="bg-[#009999] hover:bg-[#007777] text-white"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Tool Details Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-[#003366] to-[#009999] px-6 py-4 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl text-white">Return Tool Details</DialogTitle>
                  <DialogDescription className="text-white/80">
                    Review and confirm tool return information
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Employee Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#003366] flex items-center gap-2 mb-2">
                Employee Information
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">NRP</Label>
                  <p className="font-medium text-gray-900">{returnToolData?.NRP || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Employee Name</Label>
                  <p className="font-medium text-gray-900">{returnToolData?.NAMA || '-'}</p>
                </div>
              </div>
            </div>

            {/* Tool Details Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#003366] flex items-center gap-2 mb-2">
                Tool Details
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Tools ID</Label>
                  <p className="font-medium text-[#003366]">{returnToolData?.TransIdTools || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Rent Date</Label>
                  <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <p className="font-medium">{returnToolData?.TransDateRental || '-'}</p>
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-gray-500">Tools Name</Label>
                  <p className="font-medium text-gray-800">{returnToolData?.ToolsDesc || '-'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-gray-500">Condition</Label>
                  <Select
                    value={returnCondition}
                    onValueChange={(value: string) => setReturnCondition(value)}
                  >
                    <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good" className="focus:bg-green-50 focus:text-green-700">Good</SelectItem>
                      <SelectItem value="R1" className="focus:bg-red-50 focus:text-red-700">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50/80 px-6 py-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsReturnDialogOpen(false)}
              className="px-6 hover:bg-slate-100 transition-colors"
            >
              Close
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-500"
              onClick={() => {
                setIsReturnDialogOpen(false);
                toast.success("Return reviewed successfully");
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}