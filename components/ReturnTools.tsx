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
import * as XLSX from 'xlsx';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';
import { InputRef } from './ui/inputref';
import * as XLSX from 'xlsx';

interface ReturnedTool {
  id: string;
  toolsId: string;
  toolsName: string;
  toolsType: string;
  quantity: number;
  rentCondition: string;
  returnCondition: string;
  notes: string;
}

interface Employee {
  nrp: string;
  name: string;
  position: string;
  jobsite: string;
  workgroup: string;
}

interface RentedToolRecord {
  toolsId: string;
  toolsName: string;
  toolsType: string;
  quantity: number;
  rentDate: string;
  condition: string;
  Tools: ReturnedTool[];
}

interface CompletedTransaction {
  NO: string;
  TransIdTools: string;
  ToolsDesc: string;
  ToolsType: string;
  NRP: string;
  Mechanic: string;
  TransDateRental: string;
  TransEstReturnDate: string;
  TransReturnDate: string;
  WONumber: string;
  ToolsCondition: string;
  Tools: ReturnedTool[];
}

export default function ReturnTools() {
  const { currentUser } = useAuth();
  const nrpInputRef = useRef<HTMLInputElement>(null);
  const toolInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<GlobalModel[]>([]);
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [completedTransactions, setCompletedTransactions] = useState<CompletedTransaction[]>([]);
  const [rentedToolsRecord, setRentedToolsRecord] = useState<RentedToolRecord[]>([]);
  const [returnedTools, setReturnedTools] = useState<ReturnedTool[]>([]);
  const [isReturnToolDialogOpen, setIsReturnToolDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isAddScreenOpen, setAddScreenOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination Items
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state for returning tools
  const [returnFormData, setReturnFormData] = useState({
    toolsId: '',
    toolsName: '',
    toolsType: '',
    quantity: '1',
    rentCondition: 'BAIK',
    returnCondition: 'BAIK',
    notes: '',
  });

  // Mock employee database
  const mockEmployees: Record<string, Employee> = {
    '00018083': {
      nrp: '00018083',
      name: 'ROZA RIFANI',
      position: 'PIC Tools',
      jobsite: 'HAJU',
      workgroup: 'AD02001',
    },
    '00102016': {
      nrp: '00102016',
      name: 'SUHAILIN',
      position: 'Supervisor',
      jobsite: 'HAJU',
      workgroup: 'AD02003',
    },
    '00103242': {
      nrp: '00103242',
      name: 'FAHRIS AL GHAZI',
      position: 'Walder',
      jobsite: 'HAJU',
      workgroup: 'MM00001',
    },
  };

  interface Employee {
    nrp: string;
    name: string;
    position: string;
    jobsite: string;
    workgroup: string;
  }

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
        GetRentedToolsRecord(employee.nrp);

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
        setRentedToolsRecord([]);
        toast.success('Employee not found!');
      }
    } else {
      setEmployeeData(null);
      setRentedToolsRecord([]);
      toast.success('nrp is empty!');
    }
  };

  const handleBackToList = () => {
    setAddScreenOpen(false);
    setEmployeeCode('');
    setEmployeeData(null);
    // setRentedTools([]);
    // setToolIdScan('');
    // setSelectedToolData(null);
  };

  // Handle returning tool
  const handleReturnTool = () => {
    if (!employeeData) {
      toast.error('Please scan employee code first');
      return;
    }

    if (!returnFormData.toolsId || !returnFormData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newReturnedTool: ReturnedTool = {
      id: Date.now().toString(),
      toolsId: returnFormData.toolsId,
      toolsName: returnFormData.toolsName,
      toolsType: returnFormData.toolsType,
      quantity: parseInt(returnFormData.quantity),
      rentCondition: returnFormData.rentCondition,
      returnCondition: returnFormData.returnCondition,
      notes: returnFormData.notes,
    };

    setReturnedTools([...returnedTools, newReturnedTool]);
    setIsReturnToolDialogOpen(false);
    resetReturnForm();

    if (returnFormData.returnCondition !== returnFormData.rentCondition) {
      toast.warning('Tool condition has changed!');
    } else {
      toast.success('Tool added to return transaction');
    }
  };

  // Remove tool from return transaction
  const handleRemoveReturnedTool = (id: string) => {
    setReturnedTools(returnedTools.filter((tool) => tool.id !== id));
    toast.success('Tool removed from transaction');
  };

  // Reset return form
  const resetReturnForm = () => {
    setReturnFormData({
      toolsId: '',
      toolsName: '',
      toolsType: '',
      quantity: '1',
      rentCondition: 'BAIK',
      returnCondition: 'BAIK',
      notes: '',
    });
  };

  // Toggle state for New Rent vs List
  const handleNewReturn = () => {
    setAddScreenOpen(true);
  };

  // Complete transaction
  const handleCompleteTransaction = () => {
    if (!employeeData) {
      toast.error('Please scan employee code first');
      return;
    }

    if (returnedTools.length === 0) {
      toast.error('Please add at least one tool to return');
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const confirmTransaction = () => {
    // Here you would save the return transaction to your backend
    toast.success('Return transaction completed successfully!');

    // Reset all states
    setEmployeeCode('');
    setEmployeeData(null);
    setRentedToolsRecord([]);
    setReturnedTools([]);
    setIsConfirmDialogOpen(false);
  };

  // Reset transaction
  const handleResetTransaction = () => {
    setEmployeeCode('');
    setEmployeeData(null);
    setRentedToolsRecord([]);
    setReturnedTools([]);
    toast.info('Transaction reset');
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const hasConditionChange = returnedTools.some(
    (tool) => tool.returnCondition !== tool.rentCondition
  );

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

  const GetTransactionList = () => {
    const params = new URLSearchParams({
      // action: "WITHTOTAL",
      jobsite: currentUser.Jobsite,
      // current: `${currentPage}`,
      // perpage: `${itemsPerPage}`,
      // filter: searchQuery
    });
    fetch(API.RETURNTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: CompletedTransaction[]) => {
        setCompletedTransactions(json);
        console.log(json);
      })
      .catch((error) => console.error("Error:", error));
  }

  const GetRentedToolsRecord = (nrp: string) => {
    const params = new URLSearchParams({
      showdata: "RENTEDTOOLS",
      jobsite: currentUser.Jobsite,
      nrp: nrp
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: RentedToolRecord[]) => setRentedToolsRecord(json))
      .catch((error) => console.error("Error:", error));
  }

  const filteredTransactions = completedTransactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      transaction.Mechanic?.toLowerCase().includes(query) ||
      transaction.ToolsDesc?.toLowerCase().includes(query) ||
      transaction.NRP?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  useEffect(() => {
    GetUserList();
    // GetToolsList();
    // GetToolCondition();
    GetTransactionList();
    if (nrpInputRef.current == null) {
      console.log("ref is null")
    } else {
      nrpInputRef.current?.focus();
      console.log("ref is focus")
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <RotateCcw className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl text-white mb-1">Return Tools Transaction</h2>
            <p className="text-white/80">Process tool returns from employees</p>
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
        {/* Left Side - Employee and Transaction */}
        <div className="lg:col-span-2 space-y-6">
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
                  <Input
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
                        <p className="text-xs text-gray-600">Tools Rented</p>
                        <p className="text-sm text-gray-900">{rentedToolsRecord.length} items</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rented Tools Record */}
          {employeeData && rentedToolsRecord.length > 0 && (
            <Card className="border-0 shadow-lg bg-blue-50">
              <CardHeader>
                <CardTitle className="text-[#003366]">Tools Currently Rented</CardTitle>
                <CardDescription>Tools that need to be returned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Tool ID</TableHead>
                        <TableHead>Tool Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead>Rent Date</TableHead>
                        <TableHead>Condition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rentedToolsRecord.map((tool, index) => (
                        <TableRow key={index}>
                          <TableCell>{tool.toolsId}</TableCell>
                          <TableCell>{tool.toolsName}</TableCell>
                          <TableCell>{tool.toolsType}</TableCell>
                          <TableCell className="text-center">{tool.quantity}</TableCell>
                          <TableCell>{new Date(tool.rentDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                              {tool.condition}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Return Tools List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Return Transaction Items</CardTitle>
                  <CardDescription>Tools being returned in this transaction</CardDescription>
                </div>
                <Button
                  onClick={() => setIsReturnToolDialogOpen(true)}
                  disabled={!employeeData || rentedToolsRecord.length === 0}
                  className="bg-gradient-to-r from-[#003366] to-[#009999]"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return Tool
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {returnedTools.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <RotateCcw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No tools added yet</p>
                  <p className="text-sm">Click "Return Tool" to start the transaction</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Tool ID</TableHead>
                        <TableHead>Tool Name</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead>Rent Cond.</TableHead>
                        <TableHead>Return Cond.</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnedTools.map((tool) => (
                        <TableRow key={tool.id}>
                          <TableCell>{tool.toolsId}</TableCell>
                          <TableCell>{tool.toolsName}</TableCell>
                          <TableCell className="text-center">{tool.quantity}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                              {tool.rentCondition}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${tool.returnCondition === 'BAIK'
                                ? 'bg-green-100 text-green-700'
                                : tool.returnCondition === 'RUSAK'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                }`}
                            >
                              {tool.returnCondition}
                            </span>
                            {tool.returnCondition !== tool.rentCondition && (
                              <AlertCircle className="inline h-3 w-3 ml-1 text-orange-500" />
                            )}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">{tool.notes || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveReturnedTool(tool.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Transaction Summary */}
        <div className="space-y-6">
          <Card className="hidden border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-[#003366]">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Return Items</span>
                  <span className="text-sm text-gray-900">{returnedTools.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Quantity</span>
                  <span className="text-sm text-gray-900">
                    {returnedTools.reduce((sum, tool) => sum + tool.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Employee</span>
                  <span className="text-sm text-gray-900">
                    {employeeData ? employeeData.name : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Return Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date().toLocaleDateString('en-US')}
                  </span>
                </div>
              </div>

              {hasConditionChange && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-orange-800">Condition Changed</p>
                      <p className="text-xs text-orange-600">
                        Some tools have different return conditions
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleCompleteTransaction}
                  disabled={!employeeData || returnedTools.length === 0}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Complete Return
                </Button>
                <Button
                  onClick={handleResetTransaction}
                  variant="outline"
                  className="w-full h-12"
                  disabled={!employeeData && returnedTools.length === 0}
                >
                  <X className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardContent className="p-4">
              <h4 className="text-sm text-[#003366] mb-2">Quick Tips</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Scan employee barcode first</li>
                <li>• Check tool condition carefully</li>
                <li>• Add notes for damaged tools</li>
                <li>• Review summary before completing</li>
              </ul>
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
                  Recent Return Transactions
                </CardTitle>
                <CardDescription>List of rent transactions</CardDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  // onClick={exportToExcel} 
                  variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10">
                  <Download className="h-4 w-4" />
                  Export to Excel
                </Button>

                <Button
                  onClick={handleNewReturn}
                  className="gap-2 bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]"
                >
                  <Plus className="h-4 w-4" />
                  New Return
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
                    <TableHead>Return Date</TableHead>
                    <TableHead>Rented to</TableHead>
                    <TableHead>NRP</TableHead>
                    <TableHead>Tools Name</TableHead>
                    <TableHead className="text-center">MO No.</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.length > 0 ? currentTransactions.map((transaction) => (
                    <TableRow key={transaction.NO}>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{transaction.TransReturnDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{transaction.Mechanic}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{transaction.NRP}</TableCell>
                      <TableCell className="text-gray-600">{transaction.ToolsDesc}</TableCell>
                      <TableCell className="text-center text-gray-600">{transaction.WONumber}</TableCell>
                      <TableCell className="text-gray-600">
                        <span>{transaction.ToolsCondition}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
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
                            className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
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
              {<div className="flex items-center justify-between mt-4">
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
              </div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Return Tool Dialog */}
      <Dialog open={isReturnToolDialogOpen} onOpenChange={setIsReturnToolDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Return Tool</DialogTitle>
            <DialogDescription>Enter tool details for the return transaction</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tool-select">Select Tool *</Label>
              <Select
                value={returnFormData.toolsId}
                onValueChange={(value) => {
                  const tool = rentedToolsRecord.find((t) => t.toolsId === value);
                  if (tool) {
                    setReturnFormData({
                      ...returnFormData,
                      toolsId: tool.toolsId,
                      toolsName: tool.toolsName,
                      toolsType: tool.toolsType,
                      rentCondition: tool.condition,
                      returnCondition: tool.condition,
                    });
                  }
                }}
              >
                <SelectTrigger id="tool-select">
                  <SelectValue placeholder="Select a tool to return" />
                </SelectTrigger>
                <SelectContent>
                  {rentedToolsRecord.map((tool) => (
                    <SelectItem key={tool.toolsId} value={tool.toolsId}>
                      {tool.toolsId} - {tool.toolsName} (Qty: {tool.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={returnFormData.quantity}
                  onChange={(e) => setReturnFormData({ ...returnFormData, quantity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="return-condition">Return Condition *</Label>
                <Select
                  value={returnFormData.returnCondition}
                  onValueChange={(value) =>
                    setReturnFormData({ ...returnFormData, returnCondition: value })
                  }
                >
                  <SelectTrigger id="return-condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAIK">BAIK (Good)</SelectItem>
                    <SelectItem value="RUSAK">RUSAK (Damaged)</SelectItem>
                    <SelectItem value="HILANG">HILANG (Lost)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add notes about the tool condition..."
                value={returnFormData.notes}
                onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
              />
            </div>

            {returnFormData.returnCondition !== returnFormData.rentCondition && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-xs text-orange-800">
                    <p>Condition has changed from <strong>{returnFormData.rentCondition}</strong> to <strong>{returnFormData.returnCondition}</strong></p>
                    <p className="mt-1 text-orange-600">Please provide notes explaining the change</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReturnToolDialogOpen(false);
                resetReturnForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReturnTool} className="bg-gradient-to-r from-[#003366] to-[#009999]">
              <RotateCcw className="h-4 w-4 mr-2" />
              Add to Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Transaction Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Return Transaction</DialogTitle>
            <DialogDescription>
              Please review the return details before confirming
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
              <h4 className="text-sm text-gray-900 mb-3">Return Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Returned:</span>
                  <span className="text-gray-900">{returnedTools.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="text-gray-900">
                    {returnedTools.reduce((sum, tool) => sum + tool.quantity, 0)}
                  </span>
                </div>
                {hasConditionChange && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition Changes:</span>
                    <span className="text-orange-600">Yes</span>
                  </div>
                )}
              </div>
            </div>
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
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
