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
import { Scan, Plus, Trash2, ShoppingCart, User, Check, X, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';
import { InputRef } from './ui/inputref';

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

interface CompletedTransaction {
  id: string;
  employeeNrp: string;
  employeeName: string;
  toolId: string;
  toolName: string;
  quantity: number;
  rentDate: string;
  rentTime: string;
  estimatedReturnDate: string;
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
  const [titlePage, setTitlePage] =useState<string>("MO");

  // Quick entry form state
  const [toolIdScan, setToolIdScan] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isSettingMO, setIsSettingMO] = useState(false);
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

  // Handle tool ID scan/lookup
  const handleToolIdScan = () => {
    //const tool = mockTools[toolIdScan.trim().toUpperCase()]; 

    const tool = regtools.find(j => j.Kode.toUpperCase() === toolIdScan.trim().toUpperCase()) || null;
    if (tool) {
      console.log(tool.Status);
      if (tool.Status === "New") {
        toast.error(`${tool.Nama} is new, Please info Section Head`);
      //} else if (tool.Status === "Rented") {
      //  toast.error(`${tool.Nama} is Rented`);
      } else if (tool.Status === "Missing") {
        toast.error(`${tool.Nama} is Missing or Broken`);
      } else {
        setSelectedToolData({
          id: toolIdScan.trim(),
          name: tool.Nama,
          type: tool.ToolsType,
          status: tool.Status,
        });
        //toast.success(`Tool found: ${tool.Nama}`); 
        setTitlePage((tool.Status !== "Rented")?"MO":"Condition")
        setIsSettingMO(tool.Status!=="Rented")
        setFormData({
          toolsId: toolIdScan.trim(),
          toolsName: tool.Nama,
          toolsType: tool.ToolsType,
          condition: tool.Status,
          rentnote: '',
        });
        setIsActionDialogOpen(true);
      }
    } else {
      toast.error('Tool not found. Please check the Tool ID.');
      setSelectedToolData(null);
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

  // Handle adding tool to transaction immediately (on Enter/Scan)
  const handleAddToolImmediate = (toolId: string, toolName: string, toolType: string, toolCond: string, rentNote: string) => {
    if (!employeeData) {
      toast.error('Please scan employee code first');
      return;
    }
    if (toolCond === null || toolCond === "") toolCond = "Good";
    else if (toolCond === "Open") toolCond = "Good";

    if (toolCond !== "Rented") setAdaRentTrans(true);

    const now = new Date();
    const newTool: RentedTool = {
      id: Date.now().toString() + Math.random(),
      toolsId: toolId,
      toolsName: toolName,
      toolsType: toolType,
      quantity: 1,
      condition: toolCond,
      addedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rentnote: rentNote,
    };

    setRentedTools([...rentedTools, newTool]);
    
    // Reset for next item (like a cashier scanner)
    setToolIdScan('');
    setSelectedToolData(null);
    
    toast.success('Tool added to transaction');
    
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
          setRentedTools([]);
          setToolIdScan('');
          setSelectedToolData(null);
          setIsConfirmDialogOpen(false);
          toast.success('Transaction successfully');
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

  // Reset transaction
  const handleResetTransaction = () => {
    setEmployeeCode('');
    setEmployeeData(null);
    setRentedTools([]);
    setToolIdScan('');
    setSelectedToolData(null);
    toast.info('Transaction reset');
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

  useEffect(() => { 
    GetUserList();
    GetToolsList();
    GetToolCondition();
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
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl mb-1">Rent Tools Transaction</h2>
            <p className="text-white/80">Process tool rentals for employees</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                    onChange={(e) => setToolIdScan(e.target.value.toUpperCase())}
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
                    disabled={!employeeData || !toolIdScan.trim()}
                    variant="outline"
                    className="h-11 px-4"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Available: T001-T007</p>
              </div>

              {/* Tool Details (shown after scanning) */}
              {selectedToolData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-800">Tool Found</p>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">
                    {selectedToolData.id} - {selectedToolData.name}
                  </p>
                  <p className="text-xs text-gray-600">{selectedToolData.type}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Transaction Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction Items</CardTitle>
                  <CardDescription>
                    {rentedTools.length} item{rentedTools.length !== 1 ? 's' : ''} in current transaction
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rentedTools.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No tools added yet</p>
                  <p className="text-sm text-gray-500">Scan employee NRP and tool ID to start</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        {/*<TableHead>Time Added</TableHead>*/}
                        <TableHead>Tool ID</TableHead>
                        <TableHead>Tool Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Condition/MO</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rentedTools.map((tool) => (
                        <TableRow key={tool.id}>
                          {/*<TableCell className="text-gray-600">{tool.addedTime}</TableCell>*/}
                          <TableCell>{tool.toolsId}</TableCell>
                          <TableCell>{tool.toolsName}</TableCell>
                          <TableCell className="text-sm text-gray-600">{tool.toolsType}</TableCell>
                          <TableCell className="text-center">{tool.quantity}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                (tool.condition === 'BAIK' || tool.condition === 'Good' )
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {tool.condition}
                            </span>
                          </TableCell>
                          <TableCell>{tool.rentnote}</TableCell>
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Removed (was Transaction Summary) */}
        <div className="space-y-6">

          {/* Transaction Summary - Moved Below Add Tool */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
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
      {completedTransactions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#009999]" />
              Recent Rental Transactions
            </CardTitle>
            <CardDescription>List of tools that have been borrowed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Time Entered</TableHead>
                    <TableHead>Who Borrowed</TableHead>
                    <TableHead>NRP</TableHead>
                    <TableHead>Tool ID</TableHead>
                    <TableHead>Tool Name</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>Estimated Return Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-900">{transaction.rentDate}</div>
                          <div className="text-gray-500 text-xs">{transaction.rentTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.employeeName}</TableCell>
                      <TableCell className="text-gray-600">{transaction.employeeNrp}</TableCell>
                      <TableCell>{transaction.toolId}</TableCell>
                      <TableCell>{transaction.toolName}</TableCell>
                      <TableCell className="text-center">{transaction.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{transaction.estimatedReturnDate}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="text-gray-900">
                    {rentedTools.reduce((sum, tool) => sum + tool.quantity, 0)}
                  </span>
                </div>
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
            </div>) }
            
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
              Confirm Transaction
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
                </Select>) }
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
    </div>
  );
}