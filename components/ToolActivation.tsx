import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input'; 
import { InputRef } from './ui/inputref';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';

interface ToolActivationItem {
  id: string;
  toolsId: string;
  toolsName: string;
  toolsBrand: string;
  toolsSize: string;
  toolsQty: number;
  statusActive: boolean;
  statusTools: string;
}

interface ActivationRecord {
  activationNo: string;
  name: string;
  nrp: string;
  position: string;
  nrpReceiver: string;
  nameReceiver: string;
  items: ToolActivationItem[];
  createdAt: Date;
}

export default function ToolActivation() {
  const { currentUser } = useAuth(); 
  const nrpInputRef = useRef<HTMLInputElement>(null);
  const toolInputRef = useRef(null);

  /*Model*/
  const [users, setUsers] = useState<GlobalModel[]>([]);
  const [regtools, setRegTools] = useState<GlobalModel[]>([]);
  const [activationNo, setActivationNo] = useState('0024/SERA/20/11/2025');
  const [name, setName] = useState('ALFIAN NOVIALDI LAKSONO');
  const [nrp, setNrp] = useState('80005731_1');
  const [position, setPosition] = useState('Super-iver');
  const [nrpReceiver, setNrpReceiver] = useState('');
  const [nameReceiver, setNameReceiver] = useState('');
  const [items, setItems] = useState<ToolActivationItem[]>([]);
  const [nextItemNo, setNextItemNo] = useState(1);

  // Form state for adding new item
  const [newItem, setNewItem] = useState<Partial<ToolActivationItem>>({
    toolsId: '',
    toolsName: '',
    toolsBrand: '',
    toolsSize: '',
    toolsQty: 1,
    statusActive: true,
    statusTools:""
  });


  const generateActivationNo = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    // Get the last number from current activation number
    const currentNo = parseInt(activationNo.split('/')[0]);
    const newNo = String(currentNo + 1).padStart(4, '0');
    
    return `${newNo}/SERA/${day}/${month}/${year}`;
  };

  const handleAddItem = () => {
    if (!newItem.toolsId || !newItem.toolsName) {
      toast.error('Please fill in Tools ID and Tools Name');
      return;
    }

    if (newItem.statusTools !== "New") { 
      toast.error('Tools has been Activated');
      return;
    }

    const item: ToolActivationItem = {
      id: Date.now().toString(),
      toolsId: newItem.toolsId || '',
      toolsName: newItem.toolsName || '',
      toolsBrand: newItem.toolsBrand || '',
      toolsSize: newItem.toolsSize || '',
      toolsQty: newItem.toolsQty || 1,
      statusActive: newItem.statusActive ?? true,
      statusTools:newItem.statusTools
    };

    setItems([...items, item]);
    setNextItemNo(nextItemNo + 1);
    
    // Reset form
    setNewItem({
      toolsId: '',
      toolsName: '',
      toolsBrand: '',
      toolsSize: '',
      toolsQty: 1,
      statusActive: true,
    });

    toast.success('Item added successfully');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Item removed successfully');
  };

  const handleSubmit = async () => {
    if (!name || !nrp || !position) {
      toast.error('Please fill in all required fields (Name, NRP, Position)');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one tool item');
      return;
    }

    try {
      const response = await fetch(API.ACTIVATIONTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "INSERT",
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          BastNo: activationNo,
          Nrp: nrpReceiver,
          Nama: nameReceiver, 
          Tools: items
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) { 
          // Reset form
          setItems([]);
          setNextItemNo(1);
          setNrpReceiver('');
          setNameReceiver('');
          toast.success(resData?.Message ?? 'successfully');
        } else {
          toast.error(resData?.Message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Respont");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }  

    //const activationRecord: ActivationRecord = {
    //  activationNo,
    //  name,
    //  nrp,
    //  position,
    //  nrpReceiver,
    //  nameReceiver,
    //  items,
    //  createdAt: new Date(),
    //};

    //// Here you would save to your tools master data
    //console.log('Activation Record:', activationRecord);
    
    //toast.success(`Tool Activation ${activationNo} submitted successfully!`);

    //// Generate new activation number for next transaction
    //setActivationNo(generateActivationNo());
    
    //// Reset form
    //setItems([]);
    //setNextItemNo(1);
    //setNrpReceiver('');
    //setNameReceiver('');
  };

  const GetActivationId = () => {
    const params = new URLSearchParams({
      showdata: "BASTID",
      jobsite: currentUser.Jobsite 
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => {
        json.map((dt) =>setActivationNo(dt.Kode)); 
      })
      .catch((error) => console.error("Error:", error));
  }
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

  useEffect(() => { 
    setName(currentUser.Nama);
    setNrp(currentUser.Nrp);
    setPosition(currentUser.Jabatan);
    GetActivationId();
    GetUserList();
    GetToolsList();
    if (nrpInputRef.current == null) {
      console.log("ref is null")
    } else {
      nrpInputRef.current?.focus();
      console.log("ref is focus")
    }
  },[]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#009999] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Save className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl mb-1">Tool Activation</h2>
            <p className="text-white/80">Activate tools for rental availability</p>
          </div>
        </div>
      </div>

      {/* Activation Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#003366]">Activation Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Activation No.</Label>
              <Input 
                value={activationNo}
                disabled
                className="bg-gray-50 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input disabled
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
              />
            </div>

            <div className="space-y-2">
              <Label>NRP</Label>
              <Input disabled
                value={nrp}
                onChange={(e) => setNrp(e.target.value)}
                placeholder="Enter NRP"
              />
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Input disabled
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Enter Position"
              />
            </div>

            <div className="space-y-2">
              <Label>NRP Receiver</Label>
              <InputRef
                ref={nrpInputRef}
                value={nrpReceiver}
                placeholder="Enter NRP Receiver"
                onChange={(e) => {
                  var nrpVal = e.target.value;
                  setNrpReceiver(nrpVal); 
                  const selected = users.find(j => j.Kode === nrpVal) || null;;
                  if (selected) {
                    setNameReceiver(selected.Nama);
                    toolInputRef.current?.focus();
                  } else {
                    if (nameReceiver !== "") {
                      setNameReceiver("");
                    }
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Name Receiver</Label>
              <Input disabled
                value={nameReceiver}
                onChange={(e) => setNameReceiver(e.target.value)}
                placeholder="Enter Name Receiver"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Tool Item Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#003366]">Add Tool Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4 mb-4">
            <div className="space-y-2">
              <Label>TOOLS ID *</Label>
              <InputRef
                ref={toolInputRef}
                value={newItem.toolsId}
                onChange={(e) => {
                  var tool = e.target.value;
                  const selected = regtools.find(j => j.Kode === tool) || null;
                  if (selected) {
                    setNewItem({ ...newItem, toolsId: tool, toolsName:selected.Nama, toolsBrand: selected.Kategori, toolsSize:selected.Keterangan, statusTools:selected.Status})
                  } else {
                    setNewItem({ ...newItem, toolsId: tool })
                  }
                }}
                placeholder="Enter Tools ID"
              />
            </div>

            <div className="space-y-2">
              <Label>TOOLS NAME *</Label>
              <Input
                disabled
                value={newItem.toolsName}
                onChange={(e) => setNewItem({ ...newItem, toolsName: e.target.value })}
                placeholder="Enter Tools Name"
              />
            </div>

            <div className="space-y-2">
              <Label>TOOLS BRAND</Label>
              <Input
                disabled
                value={newItem.toolsBrand}
                onChange={(e) => setNewItem({ ...newItem, toolsBrand: e.target.value })}
                placeholder="Enter Brand"
              />
            </div>

            <div className="space-y-2">
              <Label>TOOLS SIZE</Label>
              <Input
                disabled
                value={newItem.toolsSize}
                onChange={(e) => setNewItem({ ...newItem, toolsSize: e.target.value })}
                placeholder="Enter Size"
              />
            </div>

            <div className="space-y-2">
              <Label>TOOLS QTY</Label>
              <Input
                type="number"
                value={newItem.toolsQty}
                onChange={(e) => setNewItem({ ...newItem, toolsQty: Number(e.target.value) })}
                placeholder="Qty"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>STATUS ACTIVE</Label>
              <Select
                value={String(newItem.statusActive)}
                onValueChange={(value) => setNewItem({ ...newItem, statusActive: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAddItem}
            className="bg-gradient-to-r from-[#003366] to-[#009999] hover:opacity-90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#003366]">Tool Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items added yet. Add tools using the form above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#003366]">
                    <TableHead className="text-white">NO</TableHead>
                    <TableHead className="text-white">TOOLS ID</TableHead>
                    <TableHead className="text-white">TOOLS NAME</TableHead>
                    <TableHead className="text-white">TOOLS BRAND</TableHead>
                    <TableHead className="text-white">TOOLS SIZE</TableHead>
                    <TableHead className="text-white">TOOLS QTY</TableHead>
                    <TableHead className="text-white">STATUS ACTIVE</TableHead>
                    <TableHead className="text-white text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.toolsId}</TableCell>
                      <TableCell>{item.toolsName}</TableCell>
                      <TableCell>{item.toolsBrand}</TableCell>
                      <TableCell>{item.toolsSize}</TableCell>
                      <TableCell>{item.toolsQty}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded text-xs ${
                            item.statusActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.statusActive ? 'True' : 'False'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setItems([]);
            setNextItemNo(1);
            setNrpReceiver('');
            setNameReceiver('');
          }}
        >
          Reset
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={items.length === 0}
          className="bg-gradient-to-r from-[#003366] to-[#009999] hover:opacity-90 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Submit Activation
        </Button>
      </div>
    </div>
  );
}