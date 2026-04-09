import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GlobalModel } from "../model/Models";
import { API } from '../config';
import { toast } from 'sonner@2.0.3';

interface BAKTItem {
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

interface BaktUser {
  BaktNo: string;
  NRP: string;
  Nama: string;
  Jabatan: string;
  NRP_PIC_Tools: string;
  PIC_Tools: string;
  NRP_Group_Leader: string;
  Group_Leader: string;
  NRP_Section_Head: string;
  Section_Head: string;
}

interface BAKTDetail {
  ToolsJobsite: string;
  ToolsId: string;
  ToolsDesc: string;
  ToolsQty: string;
  StatusCapex: string;
  ToolsCostDefault: string;
  ToolsCostDeprecition: string;
  ToolsDateIn: string;
  LifeMonth: string;
  RTP: string;
  ToolsBrand: string;
  ToolsSize: string;
  WO_No: string;
  PayrollDeduction: string;
  ToolsCostDefaultShow: string;
  PayrollDeductionShow: string;
}

interface CreateBAKTFormProps {
  isOpen: boolean;
  onClose: () => void;
  baktItem: BAKTItem | null;
}

export default function CreateBAKTForm({
  isOpen,
  onClose,
  baktItem,
}: CreateBAKTFormProps) {
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<BaktUser | null>(null);
  const [detailBakt, setDetailBakt] = useState<BAKTDetail | null>(null);
  const [formData, setFormData] = useState({
    baktNo: 'Auto Generated',
    name: '',
    position: 'Mechanic',
    jobActivity: '',
    brokenReason: '',
    picTools: '',
    glSpv: '',
    sectionHead: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create BAKT:', formData);
    // Implement BAKT creation logic
    try {
      const response = await fetch(API.BAKT(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "CREATEBAKT",
          Jobsite: currentUser.Jobsite,
          NrpUser: currentUser.Nrp,
          ItemKey: baktItem.ItemKey,
          Nrp: baktItem.NrpMekanik,
          BaktNo: formData.baktNo,
          Reason: formData.brokenReason,
          JobActivity: formData.jobActivity,
          OutFrom: baktItem.ToolsFrom
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
            adaSuccess = true;
            message += ((message == "") ? "" : "<br />") + " " + item.Message;
          } else if (item.Status == 0) {
            adaFailed = true;
            message += ((message == "") ? "" : "<br />") + " " + item.Message;
          }
        }
        if (!adaFailed) {
          onClose();
          toast.success('Transaction successfully');
        } else {
          toast.error(message ?? "Failed");
        }
      } else {
        toast.error("Failed, No Respont");
      }
    } catch (ex) {
      toast.error("Failed. Message: " + ex.Message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const ReloadNrpUser = (nrpUser: string) => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "DETAILOUTNRP",
      nrp: nrpUser
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: BaktUser[]) => {
        if (json.length > 0) {
          const user = json[0]
          setSelectedUser(user);
          setFormData((prev) => ({
            ...prev,
            baktNo: user.BaktNo,
            name: user.Nama,
            position: user.Jabatan,
            picTools: user.PIC_Tools,
            glSpv: user.Group_Leader,
            sectionHead: user.Section_Head
          }));
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadDetailBakt = (itemkey: string) => {
    const params = new URLSearchParams({
      jobsite: currentUser.Jobsite,
      act: "DETAILOUTSTANDING",
      itemkey: itemkey
    });
    fetch(API.BAKT() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: BAKTDetail[]) => {
        if (json.length > 0) {
          const detail = json[0]
          setDetailBakt(detail);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    if (baktItem) {
      ReloadNrpUser(baktItem.NrpMekanik);
      ReloadDetailBakt(baktItem.ItemKey);
    }
  }, [baktItem]);

  if (!baktItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-full max-h-full  sm:max-w-[900px] overflow-y-auto p-3 rounded-none">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-[#003366] flex items-center justify-between">
            Create BAKT Form
            {/*<Button*/}
            {/*  variant="ghost"*/}
            {/*  size="sm"*/}
            {/*  onClick={onClose}*/}
            {/*  className="h-8 w-8 p-0"*/}
            {/*>*/}
            {/*  <X className="h-4 w-4" />*/}
            {/*</Button>*/}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Fill out the form to create a new BAKT.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full text-sm">
          <div className="flex-1 overflow-y-auto">
            {/* Tool Information Table - Full Width Edge to Edge */}
            <div className="w-full border rounded-lg overflow-x-auto ">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#009999] hover:bg-[#009999]">
                    <TableHead className="text-white">MRP</TableHead>
                    <TableHead className="text-white">MEKANIK</TableHead>
                    <TableHead className="text-white">TOOLS ID</TableHead>
                    <TableHead className="text-white">DESCRIPTION</TableHead>
                    <TableHead className="text-white">TYPE</TableHead>
                    <TableHead className="text-white">SIZE</TableHead>
                    <TableHead className="text-white">TRANSDATE</TableHead>
                    {/*<TableHead className="text-white">TOOLS CONDITION</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow key={1} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">{baktItem.NrpMekanik}</TableCell>
                    <TableCell className="text-gray-900">{baktItem.NamaMekanik}</TableCell>
                    <TableCell className="text-gray-900">{baktItem.ToolsId}</TableCell>
                    <TableCell className="text-gray-900">{baktItem.ToolsName}</TableCell>
                    <TableCell className="text-gray-900">{baktItem.ToolsType}</TableCell>
                    <TableCell className="text-gray-900">{baktItem.ToolsSize}</TableCell>
                    <TableCell className="text-gray-900">{baktItem.TransDate}</TableCell>
                    {/*<TableCell className="text-gray-900">{baktItem.ToolsConditionName}</TableCell>*/}
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* BAKT Form Fields - Single Column Full Width */}
            <div className="space-y-6 bg-gray-50 p-4">
              {/* BAKT No */}
              <div className="grid grid-cols-[200px_auto_1fr] items-center gap-0 max-w-7xl">
                <Label htmlFor="baktNo" className="text-gray-700">
                  BAKT No
                </Label>
                <span className="text-gray-500">:</span>
                <Input
                  id="baktNo"
                  name="baktNo"
                  value={formData.baktNo}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Name */}
              <div className="grid grid-cols-[200px_auto_1fr] items-center gap-0 max-w-7xl">
                <Label htmlFor="name" className="text-gray-700">
                  Name
                </Label>
                <span className="text-gray-500">:</span>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="NRP Belum terisi..."
                  className="bg-white"
                  disabled
                />
              </div>

              {/* Position */}
              <div className="grid grid-cols-[200px_auto_1fr] items-center gap-0 max-w-7xl">
                <Label htmlFor="position" className="text-gray-700">
                  Position
                </Label>
                <span className="text-gray-500">:</span>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="bg-white"
                  disabled
                />
              </div>

              {/* Job Activity */}
              <div className="grid grid-cols-[200px_auto_1fr] items-start gap-0 max-w-7xl">
                <Label htmlFor="jobActivity" className="text-gray-700 pt-2">
                  Job Activity
                </Label>
                <span className="text-gray-500 pt-2">:</span>
                <Textarea
                  id="jobActivity"
                  name="jobActivity"
                  value={formData.jobActivity}
                  onChange={handleChange}
                  rows={4}
                  className="resize-none bg-white"
                />
              </div>

              {/* Broken / Missing Reason */}
              <div className="grid grid-cols-[200px_auto_1fr] items-start gap-0 max-w-7xl">
                <Label htmlFor="brokenReason" className="text-gray-700 pt-2">
                  Broken / Missing Reason
                </Label>
                <span className="text-gray-500 pt-2">:</span>
                <Textarea
                  id="brokenReason"
                  name="brokenReason"
                  value={formData.brokenReason}
                  onChange={handleChange}
                  rows={4}
                  className="resize-none bg-white"
                />
              </div>

              {/* PIC Tools */}
              <div className="grid grid-cols-[200px_auto_1fr] items-center gap-0 max-w-7xl">
                <Label htmlFor="picTools" className="text-gray-700">
                  PIC Tools
                </Label>
                <span className="text-gray-500">:</span>
                <Input
                  id="picTools"
                  name="picTools"
                  value={formData.picTools}
                  onChange={handleChange}
                  className="bg-white"
                  disabled
                />
              </div>

              {/* GL / SPV */}
              <div className="grid grid-cols-[200px_auto_1fr] items-center gap-0 max-w-7xl">
                <Label htmlFor="glSpv" className="text-gray-700">
                  GL / SPV
                </Label>
                <span className="text-gray-500">:</span>
                <Input
                  id="glSpv"
                  name="glSpv"
                  value={formData.glSpv}
                  onChange={handleChange}
                  className="bg-white"
                  disabled
                />
              </div>

              {/* Section Head */}
              <div className="grid grid-cols-[200px_auto_1fr] items-center gap-0 max-w-7xl">
                <Label htmlFor="sectionHead" className="text-gray-700">
                  Section Head
                </Label>
                <span className="text-gray-500">:</span>
                <Input
                  id="sectionHead"
                  name="sectionHead"
                  value={formData.sectionHead}
                  onChange={handleChange}
                  className="bg-white"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="border-t bg-white p-3">
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-[140px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#009999] hover:bg-[#00b8b8] text-white min-w-[140px]"
              >
                Submit BAKT
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}