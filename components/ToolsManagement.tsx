import { useState, useRef, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Pencil, Trash2, Download, Search, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import type { Tool } from '../App';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { RegisterTools, GlobalModel } from "../model/Models";
import { API } from '../config';
import ToolCertification from './inspection/ToolCertification';

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};


export default function ToolsManagement() {
  const { currentUser } = useAuth();
  const [itemList, setItemList] = useState<RegisterTools[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*Pagination Items */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(-1);

  /*Model*/
  const [jobsites, setJobsites] = useState<GlobalModel[]>([]);
  const [categories, setCategories] = useState<GlobalModel[]>([]);
  const [toolGroups, setToolGroups] = useState<GlobalModel[]>([]);
  const [stdQuantities, setStdQuantities] = useState<GlobalModel[]>([]);
  const [statusCapex, setStatusCapex] = useState<GlobalModel[]>([]);
  const [toolLocations, setToolLocations] = useState<GlobalModel[]>([]);
  const [subcategories, setSubCategories] = useState<GlobalModel[]>([]);
  const [satuanSpesifikasi, setSatuanSpesifikasi] = useState<GlobalModel[]>([]);
  const [picTools, setPicTools] = useState<GlobalModel[]>([]);
  const [picToolBoxs, setPicToolBoxs] = useState<GlobalModel[]>([]);
  const [toolBoxList, setToolBoxList] = useState<GlobalModel[]>([]);

  const [isDownloadRun, setIsDownloadRun] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RegisterTools | null>(null);
  const [formData, setFormData] = useState({
    ToolsJobsite: '',
    ToolsId: '',
    ToolsIdEll: '',
    ToolsDesc: '',
    ToolsNoPo: '',
    ToolsSerialNo: '',
    ToolsDateIn: '',
    ToolsWeight: '',
    ToolsBrand: '',
    ToolsSize: '',
    ToolsPartNo: '',
    StatusCapex: '',
    ToolsGroupType: '',
    ToolsPICToolBox: '',
    ToolsIDToolBox: '',
    ToolsExpKalibrasi: '',
    ToolsLocation: '',
    ToolsCostDefault: '0',
    PicTools: '',
    HourMeter: '',
    GroupTypeName: '',
    PicToolBox: '',
    NRPBOOKING: '',
    YearMeter: '',
    StTools: '',
    NamaPeminjam: '',
    NO: '',
    StatusStd: '',
    ToolsType: '',
    ToolsCategory: '',
    ToolsWorkgroup: '',
    ToolsWorkgroupId: '',
    ToolIdStdQuantity: '',
    ToolCodeSubType: '',
    ToolCodeVolume: '',
    ToolCodeSatuan: '',
    ToolsNrpMekanik: '',
    ToolsPicPerson: '',
    ToolsQty: '',
    ToolsImage: '',
    ToolsDocument: '',
    ToolsDocumentKalibrasi: '',
    FileNameImage: '',
    FileNameDocument: '',
    FileNameDocumentKalibrasi: '',
  });

  const resetForm = () => {
    setFormData({
      ToolsJobsite: currentUser.Jobsite,
      ToolsId: '',
      ToolsIdEll: '',
      ToolsDesc: '',
      ToolsNoPo: '',
      ToolsSerialNo: '',
      ToolsDateIn: '',
      ToolsWeight: '',
      ToolsBrand: '',
      ToolsSize: '',
      ToolsPartNo: '',
      StatusCapex: '',
      ToolsGroupType: 'TOOL',
      ToolsPICToolBox: '',
      ToolsIDToolBox: '',
      ToolsExpKalibrasi: '',
      ToolsLocation: '',
      ToolsCostDefault: '0',
      PicTools: '',
      HourMeter: '',
      GroupTypeName: '',
      PicToolBox: '',
      NRPBOOKING: '',
      YearMeter: '',
      StTools: '',
      NamaPeminjam: '',
      NO: '',
      StatusStd: '',
      ToolsType: '',
      ToolsCategory: '',
      ToolsWorkgroup: '',
      ToolsWorkgroupId: '',
      ToolIdStdQuantity: '',
      ToolCodeSubType: '',
      ToolCodeVolume: '',
      ToolCodeSatuan: '',
      ToolsNrpMekanik: '',
      ToolsPicPerson: '',
      ToolsQty: '',
      ToolsImage: '',
      ToolsDocument: '',
      ToolsDocumentKalibrasi: '',
      FileNameImage: '',
      FileNameDocument: '',
      FileNameDocumentKalibrasi: '',
    });
  };

  //const formatIDR = (amount: number | undefined) => {
  //  if (amount === undefined || amount === null) return 'Rp 0';
  //  return new Intl.NumberFormat('id-ID', {
  //    style: 'currency',
  //    currency: 'IDR',
  //    minimumFractionDigits: 0,
  //  }).format(amount);
  //};  

  const openNewDialog = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  }

  const openEditDialog = (tool: RegisterTools) => {
    setEditingItem(tool);
    setFormData({
      ToolsJobsite: tool.ToolsJobsite,
      ToolsId: tool.ToolsId,
      ToolsIdEll: tool.ToolsIdEll,
      ToolsDesc: tool.ToolsDesc,
      ToolsNoPo: tool.ToolsNoPo,
      ToolsSerialNo: tool.ToolsSerialNo,
      ToolsDateIn: tool.ToolsDateIn,
      ToolsWeight: tool.ToolsWeight,
      ToolsBrand: tool.ToolsBrand,
      ToolsSize: tool.ToolsSize,
      ToolsPartNo: tool.ToolsPartNo,
      StatusCapex: tool.StatusCapex,
      ToolsGroupType: tool.ToolsGroupType,
      ToolsPICToolBox: tool.ToolsPICToolBox,
      ToolsIDToolBox: tool.ToolsIDToolBox,
      ToolsExpKalibrasi: tool.ToolsExpKalibrasi,
      ToolsLocation: tool.ToolsLocation,
      ToolsCostDefault: tool.ToolsCost,
      PicTools: tool.PicTools,
      HourMeter: tool.HourMeter,
      GroupTypeName: tool.GroupTypeName,
      PicToolBox: tool.PicToolBox,
      NRPBOOKING: tool.NRPBOOKING,
      YearMeter: tool.YearMeter,
      StTools: tool.StTools,
      NamaPeminjam: tool.NamaPeminjam,
      NO: tool.NO,
      StatusStd: tool.StatusStd,
      ToolsType: tool.ToolsType,
      ToolsCategory: tool.ToolsCategory,
      ToolsWorkgroup: tool.ToolsWorkgroup,
      ToolsWorkgroupId: tool.ToolsWorkgroupId,
      ToolIdStdQuantity: 'UPDATE',
      ToolCodeSubType: '',
      ToolCodeVolume: '',
      ToolCodeSatuan: '',
      ToolsNrpMekanik: tool.ToolsNrpMekanik,
      ToolsPicPerson: tool.ToolsPicPerson,
      ToolsQty: tool.ToolsQty,
      ToolsImage: '',
      ToolsDocument: '',
      ToolsDocumentKalibrasi: '',
      FileNameImage: '',
      FileNameDocument: '',
      FileNameDocumentKalibrasi: '',
    });
    setIsDialogOpen(true);
    console.log(tool);
  };

  const openDeleteDialog = (tool: RegisterTools) => {
    setEditingItem(tool);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveTool = async () => {
    if (
      !formData.ToolsJobsite ||
      !formData.ToolsId ||
      !formData.ToolsDesc ||
      !formData.ToolsLocation ||
      !formData.ToolsSerialNo ||
      !formData.ToolsDateIn ||
      !formData.ToolsBrand ||
      !formData.ToolsSize
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(API.REGISTERTOOLS(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: (editingItem ? "UPDATE" : "INSERT"),
          Jobsite: formData.ToolsJobsite,
          ToolId: formData.ToolsId,
          ToolsIdEll: formData.ToolsIdEll,
          ToolsDesc: formData.ToolsDesc,
          ToolsLocation: formData.ToolsLocation,
          ToolsCostDefault: String(formData.ToolsCostDefault),
          ToolsDateIn: (formData.ToolsDateIn ? (formData.ToolsDateIn.includes("T") ? formData.ToolsDateIn.replace("T", " ") + ":00" : formData.ToolsDateIn + " 00:00:00") : ""),
          ToolsBrand: formData.ToolsBrand,
          ToolsType: formData.ToolsType,
          ToolsCategory: formData.ToolsCategory,
          ToolsSize: formData.ToolsSize,
          ToolsNoPO: formData.ToolsNoPo,
          ToolsSerialNo: formData.ToolsSerialNo,
          ToolsNrpMekanik: formData.ToolsNrpMekanik,
          ToolsPicPerson: formData.ToolsPicPerson,
          StatusCapex: formData.StatusCapex,
          ToolsGroupType: formData.ToolsGroupType,
          ToolsWeight: String(formData.ToolsWeight),
          ToolsPartNo: formData.ToolsPartNo,
          ToolsPICToolBox: formData.ToolsPICToolBox,
          ToolsIDToolBox: formData.ToolsIDToolBox,
          ToolsExpKalibrasi: formData.ToolsExpKalibrasi,
          ToolsImage: ((formData.ToolsImage == "") ? null : formData.ToolsImage),
          ToolsDocument: ((formData.ToolsDocument == "") ? null : formData.ToolsDocument),
          ToolsDocumentKalibrasi: ((formData.ToolsDocumentKalibrasi == "") ? null : formData.ToolsDocumentKalibrasi),
        })
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const resData = data[0];
        if (resData?.Status == 1) {
          ReloadMaster();
          setEditingItem(null);
          setIsDialogOpen(false);
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
  };

  const handleDeleteTool = () => {
    if (!editingItem) return;

    setIsDeleteDialogOpen(false);
    setEditingItem(null);
    toast.success('Tool deleted successfully');
  };
  const exportToExcel = async () => {
    setIsDownloadRun(true);
    try {
      const params = new URLSearchParams({
        jobsite: String(currentUser?.Jobsite ?? ""),
        current: "1",
        perpage: "0",
        filter: String(searchTerm ?? "")
      });
      const url = `${API.REGISTERTOOLS()}?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
        return;
      }

      let data;
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
      const itemDownload = (data as RegisterTools[])
      if (Array.isArray(data) && data.length > 0) {
        saveToExcel(data);
      } else if (data && typeof data === "object" && Array.isArray(data.data)) {
        if (data.items.length > 0) {
          saveToExcel(data.data);
        } else {
          toast.error("Failed, No Response");
          return;
        }
      } else {
        toast.error("Failed, No Response");
        return;
      }
    } catch (ex) {
      const message = ex?.message ?? String(ex);
      toast.error("Failed. Message: " + message);
      return;
    }
    setIsDownloadRun(false);
  };

  const saveToExcel = (data: RegisterTools[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((tool) => ({
        'Tools Jobsite': tool.ToolsJobsite,
        'Tools Id': tool.ToolsId,
        'Tools Desc': tool.ToolsDesc,
        'Tools Location': tool.ToolsLocation,
        'Tools Serial No': tool.ToolsSerialNo,
        'Tools Category': tool.ToolsType,
        'Tools Date In': formatDate(tool.ToolsDateIn),
        'Tools Brand': tool.ToolsBrand,
        'Tools Type': tool.ToolsGroupType,
        'Tools Size': tool.ToolsSize,
        'Tools Condition': tool.StTools,
        'Tools Workgroup': "",
        'Cost': tool.ToolsCostDefault,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    XLSX.writeFile(workbook, `SmartTomas_Tools_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data exported successfully');
  }

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const importedTools = jsonData.map((row) => ({
          ToolsJobsite: row['Tools Jobsite'] || row['ToolsJobsite'] || '',
          ToolsId: row['Tools Id'] || row['ToolsId'] || '',
          ToolsDesc: row['Tools Desc'] || row['ToolsDesc'] || '',
          ToolsLocation: row['Tools Location'] || row['ToolsLocation'] || '',
          ToolsSerialNo: row['Tools Serial No'] || row['ToolsSerialNo'] || '',
          ToolsType: row['Tools Category'] || row['ToolsCategory'] || '',
          ToolsDateIn: row['Tools Date In'] || row['ToolsDateIn'] || '',
          ToolsBrand: row['Tools Brand'] || row['ToolsBrand'] || '',
          ToolsGroupType: row['Tools Type'] || row['ToolsType'] || '',
          ToolsSize: row['Tools Size'] || row['ToolsSize'] || '',
          StTools: row['Tools Condition'] || row['ToolsCondition'] || '',
          ToolsCostDefault: row['Cost'] || 0,
          ToolsPicPerson: row['ToolsPicPerson'] || row['ToolsPicPerson'] || '',
        }));

        if (importedTools.length === 0) {
          toast.error("No data found in Excel sheet");
          return;
        }

        toast.info(`Importing ${importedTools.length} tools...`);

        let successCount = 0;
        let failCount = 0;

        for (const tool of importedTools) {
          try {
            const response = await fetch(API.REGISTERTOOLS(), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                action: "INSERT",
                Jobsite: tool.ToolsJobsite || currentUser.Jobsite,
                ToolId: tool.ToolsId,
                ToolsIdEll: "",
                ToolsDesc: tool.ToolsDesc,
                ToolsLocation: tool.ToolsLocation,
                ToolsCostDefault: String(tool.ToolsCostDefault),
                ToolsDateIn: tool.ToolsDateIn ? (String(tool.ToolsDateIn).replace("T", " ") + (String(tool.ToolsDateIn).length <= 10 ? " 00:00:00" : ":00")) : "",
                ToolsBrand: tool.ToolsBrand,
                ToolsType: tool.ToolsType,
                ToolsCategory: "",
                ToolsSize: tool.ToolsSize,
                ToolsNoPO: "",
                ToolsSerialNo: tool.ToolsSerialNo,
                ToolsNrpMekanik: "",
                ToolsPicPerson: "",
                StatusCapex: "",
                ToolsGroupType: tool.ToolsGroupType || "TOOL",
                ToolsWeight: "0",
                ToolsPartNo: "",
                ToolsPICToolBox: "",
                ToolsIDToolBox: "",
                ToolsExpKalibrasi: "",
                ToolsImage: null,
                ToolsDocument: null,
                ToolsDocumentKalibrasi: null,
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.length > 0 && data[0]?.Status == 1) {
                successCount++;
              } else {
                failCount++;
                console.error(`Failed to import tool ${tool.ToolsId}: ${data[0]?.Message ?? 'Unknown error'}`);
              }
            } else {
              failCount++;
            }
          } catch (error) {
            failCount++;
            console.error(`Error importing tool ${tool.ToolsId}:`, error);
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} tools`);
          ReloadMaster();
        }

        if (failCount > 0) {
          toast.error(`Failed to import ${failCount} tools. Check console for details.`);
        }
      } catch (error) {
        toast.error('Failed to import Excel file. Please check the format.');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  /*Load Server */
  const ReloadMaster = () => {
    const params = new URLSearchParams({
      action: "WITHTOTAL",
      jobsite: currentUser.Jobsite,
      current: `${currentPage}`,
      perpage: `${itemsPerPage}`,
      filter: searchTerm,
    });
    fetch(API.REGISTERTOOLS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((data) => {
        setTotalPages(data.total ?? -1);
        setItemList(data.data ?? data);
      })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadJobsites = () => {
    const params = new URLSearchParams({
      kategori: "Jobsite"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setJobsites(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadStatusCapex = () => {
    const params = new URLSearchParams({
      kategori: "StatusCapex"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setStatusCapex(json))
      .catch((error) => console.error("Error:", error));
  }
  const ReloadCategory = () => {
    const params = new URLSearchParams({
      showdata: "TOOLTYPE"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setCategories(json))
      .catch((error) => console.error("Error:", error));
  }
  const ReloadSubCategory = () => {
    const params = new URLSearchParams({
      showdata: "TOOLSUBTYPE"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setSubCategories(json))
      .catch((error) => console.error("Error:", error));
  }
  const ReloadToolGroup = () => {
    const params = new URLSearchParams({
      kategori: "GroupTools"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setToolGroups(json))
      .catch((error) => console.error("Error:", error));
  }
  const ReloadSatuanSpesifikasi = () => {
    const params = new URLSearchParams({
      kategori: "SatuanSpesifikasi"
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setSatuanSpesifikasi(json))
      .catch((error) => console.error("Error:", error));
  }
  const ReloadStdQuantity = () => {
    const params = new URLSearchParams({
      showdata: "STDQUANTITY",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setStdQuantities(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadLocations = () => {
    const params = new URLSearchParams({
      kategori: "ToolsLocation",
      jobsite: currentUser.Jobsite,
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setToolLocations(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadListToolBox = () => {
    const params = new URLSearchParams({
      showdata: "TOOLBOXLIST",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setToolBoxList(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadPicTools = () => {
    const params = new URLSearchParams({
      showdata: "PICTOOLS",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setPicTools(json))
      .catch((error) => console.error("Error:", error));
  }

  const ReloadPicToolBox = () => {
    const params = new URLSearchParams({
      showdata: "PICTOOLBOX",
      jobsite: currentUser.Jobsite
    });
    fetch(API.FILTERS() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GlobalModel[]) => setPicToolBoxs(json))
      .catch((error) => console.error("Error:", error));
  }

  const CheckOptionToolsId = async (type: string, subtipe: string, volume: string, satuan: string) => {
    var codeId = type + subtipe + volume + satuan;
    if (!type || !subtipe || !volume || !satuan) { }
    else {
      codeId = await CekToolId(codeId);
    }
    return codeId;
  }

  const CekToolId = async (partCode: string) => {
    const params = new URLSearchParams({
      action: "NEWIDTOOL",
      jobsite: currentUser.Jobsite,
      toolsid: partCode
    });

    const response = await fetch(API.REGISTERTOOLS() + `?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      toast.error(`HTTP error! status: ${response.status}`);
      return;
    }

    const text = await response.text();
    var data = text ? JSON.parse(text) : null;
    if (Array.isArray(data) && data.length > 0) {
      var item = data[0];
      return item.Kode ?? "-";
    }
    return "";
  }

  useEffect(() => {
    if (itemList.length > 0) {
      console.log("currentPage Load");
      ReloadMaster();
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage == 1) {
      if (itemList.length > 0) {
        console.log("itemsPerPage Load");
        ReloadMaster();
      }
    } else {
      setCurrentPage(1);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    if (currentPage == 1) {
      if (itemList.length > 0) {
        console.log("searchTerm Load");
        ReloadMaster();
      }
    } else {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (itemList.length == 0) {
      console.log("itemList Load");
      ReloadMaster();
    }
    if (jobsites.length === 0) {
      ReloadJobsites();
      console.log("Reload Jobsite")
    }
    if (statusCapex.length === 0) {
      ReloadStatusCapex();
      console.log("Reload statusCapex")
    }
    if (categories.length === 0) {
      ReloadCategory()
      console.log("Reload categories")
    }
    if (toolGroups.length === 0) {
      ReloadToolGroup();
      console.log("Reload toolGroups")
    }
    if (stdQuantities.length === 0) {
      ReloadStdQuantity();
      console.log("Reload stdQuantities")
    }
    if (toolLocations.length === 0) {
      ReloadLocations();
      console.log("Reload toolLocations")
    }
    if (subcategories.length === 0) {
      ReloadSubCategory();
      console.log("Reload subcategories")
    }
    if (satuanSpesifikasi.length === 0) {
      ReloadSatuanSpesifikasi()
      console.log("Reload satuanSpesifikasi")
    }
    if (picTools.length === 0) {
      ReloadPicTools()
      console.log("Reload picTools")
    }
    if (picToolBoxs.length === 0) {
      ReloadPicToolBox()
      console.log("Reload picToolBox")
    }
    if (toolBoxList.length === 0) {
      ReloadListToolBox()
      console.log("Reload toolBoxList")
    }
  }, []);

  const filteredsubType = subcategories.filter(
    (subtype) => subtype.Kategori.includes(formData.ToolsCategory)
  );
  const MAX_SIZE_BYTES = 1 * 1024 * 1024 // 10 MB (ubah sesuai kebutuhan)

  return (
    <div className="space-y-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Data Master Tools</CardTitle>
              <CardDescription>Manage tools inventory and specifications</CardDescription>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
                id="excel-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10"
              >
                <Upload className="h-4 w-4" />
                Import Excel
              </Button>
              <Button onClick={exportToExcel} disabled={isDownloadRun} variant="outline" className="gap-2 border-[#009999] text-[#003366] hover:bg-[#009999]/10">
                <Download className="h-4 w-4" />
                {isDownloadRun ? "Downloading..." : "Export Excel"}
              </Button>
              <Button onClick={() => openNewDialog()} className="gap-2 bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]">
                <Plus className="h-4 w-4" />
                Add Tool
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID, description, brand, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-gray-300 hover:bg-gray-300">
                    <TableHead className="text-right text-gray-900">Actions</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Jobsite</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Tools ID</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center max-w-[50px]">Description</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Condition</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Location</TableHead>
                    {/* <TableHead className="border-r border-gray-400 text-gray-900 text-center">Serial No</TableHead> */}
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Qty</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Category</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Date In</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Brand</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Type</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Size</TableHead>
                    <TableHead className="border-r border-gray-400 text-gray-900 text-center">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                        No tools found
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemList.map((tool) => (
                      <TableRow key={tool.ToolsId} className="hover:bg-gray-50">
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(tool)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(tool)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsJobsite}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsId}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsDesc}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs p-1 ${tool.StTools === 'Good'
                              ? 'bg-green-100 text-green-800'
                              : tool.StTools === 'R1'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {tool.StTools}
                          </span>
                        </TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsLocation}</TableCell>
                        {/* <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsSerialNo}</TableCell> */}
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsQty}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsType}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{formatDate(tool.ToolsDateIn)}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsBrand}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsGroupType}</TableCell>
                        <TableCell className="border-r border-gray-200 text-gray-600">{tool.ToolsSize}</TableCell>
                        <TableCell className="border-r border-gray-200 text-right">{tool.ToolsCostDefault}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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

      {/* Add Tool Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle> {(editingItem ? 'Edit ' : 'Add New ')} Tool</DialogTitle>
            <DialogDescription>{(editingItem ? 'Edit ' : 'Create a new ')} tool record in the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className={`grid grid-cols-3 gap-4`} >
              <div className="grid gap-2">
                <Label htmlFor="add-toolsgroup">Filter *</Label>
                <Select
                  value={formData.ToolsGroupType}
                  disabled={editingItem != null}
                  onValueChange={(value) => setFormData({ ...formData, ToolsGroupType: value })}
                >
                  <SelectTrigger id="add-toolsgroup">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolGroups.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={`grid gap-2 lg:col-span-2 ${editingItem ? "hidden" : "block"}`}>
                <Label htmlFor="add-stdQuantities">Tools Library *</Label>
                <Select
                  value={formData.ToolIdStdQuantity}
                  onValueChange={async (value) => {
                    const selected = stdQuantities.find(j => j.Kode === value);
                    var code = await CekToolId(value);
                    setFormData({ ...formData, ToolIdStdQuantity: value, ToolsDesc: selected.Nama, StatusCapex: selected.Status, ToolsCategory: selected.KategoriId, ToolsType: selected.Kategori, ToolsId: code })
                  }}
                >
                  <SelectTrigger id="add-stdQuantities">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {stdQuantities.map((pos) => (
                      <SelectItem key={pos.Kode} value={pos.Kode}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={`grid grid-cols-6 gap-4 ${formData.ToolIdStdQuantity ? "hidden" : "block"}`}>
              <div className="grid gap-2">
                <Select
                  value={formData.ToolsCategory}
                  onValueChange={async (value) => {
                    var code = await CheckOptionToolsId(value, formData.ToolCodeSubType, formData.ToolCodeVolume, formData.ToolCodeSatuan)
                    setFormData({ ...formData, ToolsCategory: value, ToolsId: code })
                  }}
                >
                  <SelectTrigger id="add-toolsgroup">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((pos) => (
                      <SelectItem key={pos.Kode} value={pos.Kode}>
                        {pos.Kode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Select
                  value={formData.ToolCodeSubType}
                  onValueChange={async (value) => {
                    var code = await CheckOptionToolsId(formData.ToolsCategory, value, formData.ToolCodeVolume, formData.ToolCodeSatuan)
                    setFormData({ ...formData, ToolCodeSubType: value, ToolsId: code })
                  }}
                >
                  <SelectTrigger id="add-toolssubtype">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredsubType.map((pos) => (
                      <SelectItem key={pos.Kode} value={pos.Kode}>
                        {pos.Kode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Input
                  id="add-volume"
                  value={formData.ToolCodeVolume}
                  onChange={async (e) => {
                    //var code = await CheckOptionToolsId(formData.ToolsCategory, formData.ToolCodeSubType, e.target.value, formData.ToolCodeSatuan)
                    setFormData({ ...formData, ToolCodeVolume: e.target.value })
                  }}
                  onBlur={async () => {
                    var code = await CheckOptionToolsId(formData.ToolsCategory, formData.ToolCodeSubType, formData.ToolCodeVolume, formData.ToolCodeSatuan)
                    setFormData({ ...formData, ToolsId: code })
                  }}
                  placeholder="volume 35 "
                />
              </div>
              <div className="grid gap-2">
                <Select
                  value={formData.ToolCodeSatuan}
                  onValueChange={async (value) => {
                    var code = await CheckOptionToolsId(formData.ToolsCategory, formData.ToolCodeSubType, formData.ToolCodeVolume, value)
                    setFormData({ ...formData, ToolCodeSatuan: value, ToolsId: code })
                  }}
                >
                  <SelectTrigger id="add-toolssubtype">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {satuanSpesifikasi.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-id">Tools ID *</Label>
                <Input
                  id="add-id"
                  value={formData.ToolsId}
                  disabled={true}
                  onChange={(e) => setFormData({ ...formData, ToolsId: e.target.value })}
                  placeholder="e.g., AD1000001"
                />
              </div>
              <div className="grid gap-2 lg:col-span-2">
                <Label htmlFor="add-desc">Description *</Label>
                <Input
                  id="add-desc"
                  value={formData.ToolsDesc}
                  onChange={(e) => setFormData({ ...formData, ToolsDesc: e.target.value })}
                  placeholder="Tool description"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-location">Location *</Label>
                <Select
                  value={formData.ToolsLocation}
                  onValueChange={(value) => setFormData({ ...formData, ToolsLocation: value })}
                >
                  <SelectTrigger id="add-location">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolLocations.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-statusCapex">Capex/Opex *</Label>
                <Select
                  value={formData.StatusCapex}
                  onValueChange={(value) => setFormData({ ...formData, StatusCapex: value })}
                >
                  <SelectTrigger id="add-statusCapex">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusCapex.map((pos) => (
                      <SelectItem key={pos.Keterangan} value={pos.Keterangan}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-datein">Date In *</Label>
                <DatePicker
                  selected={formData.ToolsDateIn ? new Date(formData.ToolsDateIn) : null}
                  onChange={(date) => {
                    if (date) {
                      const formatted = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                      setFormData({ ...formData, ToolsDateIn: formatted });
                    } else {
                      setFormData({ ...formData, ToolsDateIn: '' });
                    }
                  }}
                  dateFormat="dd-MM-yyyy"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholderText="dd-MM-yyyy"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-cost">Cost</Label>
                <Input
                  id="add-cost"
                  type="number"
                  value={formData.ToolsCostDefault}
                  onChange={(e) => setFormData({ ...formData, ToolsCostDefault: e.target.value })}
                  placeholder="Enter cost"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-sap">SAP No *</Label>
                <Input
                  id="add-sapno"
                  value={formData.ToolsIdEll}
                  onChange={(e) => setFormData({ ...formData, ToolsIdEll: e.target.value })}
                  placeholder="SAP No"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-weight">Weight *</Label>
                <Input
                  id="add-brand"
                  value={formData.ToolsWeight}
                  onChange={(e) => setFormData({ ...formData, ToolsWeight: e.target.value })}
                  placeholder="Weight"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-brand">Brand *</Label>
                <Input
                  id="add-brand"
                  value={formData.ToolsBrand}
                  onChange={(e) => setFormData({ ...formData, ToolsBrand: e.target.value })}
                  placeholder="Brand name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-size">Size *</Label>
                <Input
                  id="add-size"
                  value={formData.ToolsSize}
                  onChange={(e) => setFormData({ ...formData, ToolsSize: e.target.value })}
                  placeholder="Size"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-serial">Serial No *</Label>
                <Input
                  id="add-serial"
                  value={formData.ToolsSerialNo}
                  onChange={(e) => setFormData({ ...formData, ToolsSerialNo: e.target.value })}
                  placeholder="Serial number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-Part">Part No *</Label>
                <Input
                  id="add-Part"
                  value={formData.ToolsPartNo}
                  onChange={(e) => setFormData({ ...formData, ToolsPartNo: e.target.value })}
                  placeholder="PartNo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-PurchaseNo">Purchase No *</Label>
                <Input
                  id="add-PurchaseNo"
                  value={formData.ToolsNoPo}
                  onChange={(e) => setFormData({ ...formData, ToolsNoPo: e.target.value })}
                  placeholder="Purchase No"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-lastCalDate">Date Last Calibration *</Label>
                <DatePicker
                  selected={formData.ToolsExpKalibrasi ? new Date(formData.ToolsExpKalibrasi) : null}
                  onChange={(date) => {
                    if (date) {
                      const formatted = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                      setFormData({ ...formData, ToolsExpKalibrasi: formatted });
                    } else {
                      setFormData({ ...formData, ToolsExpKalibrasi: '' });
                    }
                  }}
                  dateFormat="dd-MM-yyyy"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholderText="dd-MM-yyyy"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="image-file">Image</Label>
                <label htmlFor="image-file">
                  <Button
                    variant="outline"
                    className="border-[#009999] text-[#009999] hover:bg-[#009999]/10"
                    onClick={() => document.getElementById('image-file')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih Image
                  </Button>
                </label>
                <input
                  id="image-file"
                  type="file"
                  accept="image/jpg,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    // Validasi tipe file: hanya PDF atau image
                    const isPdf = file.type === "application/pdf"
                    const isImage = file.type.startsWith("image/")
                    if (!isPdf && !isImage) {
                      alert("Hanya file PDF atau gambar yang diperbolehkan.")
                      e.target.value = "" // reset input
                      return
                    }

                    // Validasi ukuran file
                    if (file.size > MAX_SIZE_BYTES) {
                      alert(`Ukuran file melebihi ${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`)
                      e.target.value = ""
                      return
                    }

                    const reader = new FileReader()

                    reader.onload = () => {
                      const result = reader.result as string
                      setFormData({ ...formData, ToolsImage: result, FileNameImage: file.name })
                    }

                    reader.onerror = () => {
                      console.error("Gagal membaca file:", reader.error)
                      alert("Terjadi kesalahan saat membaca file.")
                      e.target.value = ""
                    }
                    reader.readAsDataURL(file)
                  }}
                />
                <label className={`filenameSmall ${(formData.FileNameImage === "") ? "block" : "block"}`} >{formData.FileNameImage}</label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="document-file">Document</Label>
                <label htmlFor="document-file">
                  <Button
                    variant="outline"
                    className="border-[#009999] text-[#009999] hover:bg-[#009999]/10"
                    onClick={() => document.getElementById('document-file')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih Document
                  </Button>
                </label>
                <input
                  id="document-file"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    // Validasi tipe file: hanya PDF atau image
                    const isPdf = file.type === "application/pdf"
                    const isImage = file.type.startsWith("image/")
                    if (!isPdf && !isImage) {
                      alert("Hanya file PDF atau gambar yang diperbolehkan.")
                      e.target.value = "" // reset input
                      return
                    }

                    // Validasi ukuran file
                    if (file.size > MAX_SIZE_BYTES) {
                      alert(`Ukuran file melebihi ${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`)
                      e.target.value = ""
                      return
                    }

                    const reader = new FileReader()

                    reader.onload = () => {
                      const result = reader.result as string
                      setFormData({ ...formData, ToolsDocument: result, FileNameDocument: file.name })
                    }

                    reader.onerror = () => {
                      console.error("Gagal membaca file:", reader.error)
                      alert("Terjadi kesalahan saat membaca file.")
                      e.target.value = ""
                    }
                    reader.readAsDataURL(file)
                  }}
                />
                <label className={` filenameSmall ${(formData.FileNameDocument === "") ? "block" : "block"}`} >{formData.FileNameDocument}</label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kalibration-file">Document Kalibrasi</Label>
                <label htmlFor="kalibration-file">
                  <Button
                    variant="outline"
                    className="border-[#009999] text-[#009999] hover:bg-[#009999]/10"
                    onClick={() => document.getElementById('kalibration-file')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih Kalibrasi Doc
                  </Button>
                </label>
                <input
                  id="kalibration-file"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    // Validasi tipe file: hanya PDF atau image
                    const isPdf = file.type === "application/pdf"
                    const isImage = file.type.startsWith("image/")
                    if (!isPdf && !isImage) {
                      alert("Hanya file PDF atau gambar yang diperbolehkan.")
                      e.target.value = "" // reset input
                      return
                    }

                    // Validasi ukuran file
                    if (file.size > MAX_SIZE_BYTES) {
                      alert(`Ukuran file melebihi ${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`)
                      e.target.value = ""
                      return
                    }

                    const reader = new FileReader()

                    reader.onload = () => {
                      const result = reader.result as string
                      setFormData({ ...formData, ToolsDocumentKalibrasi: result, FileNameDocumentKalibrasi: file.name })
                    }

                    reader.onerror = () => {
                      console.error("Gagal membaca file:", reader.error)
                      alert("Terjadi kesalahan saat membaca file.")
                      e.target.value = ""
                    }
                    reader.readAsDataURL(file)
                  }}
                />
                <label className={`filenameSmall ${(formData.FileNameDocumentKalibrasi === "") ? "block" : "block"}`} >{formData.FileNameDocumentKalibrasi}</label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className={`grid gap-2 lg:col-span-2 ${(formData.ToolsGroupType !== "TOOL") ? "hidden" : "block"}`}>
                <Label htmlFor="add-picTools">Pic Tools *</Label>
                <Select
                  value={formData.ToolsNrpMekanik}
                  onValueChange={(value) => {
                    const selected = picTools.find(j => j.Kode === value);
                    setFormData({ ...formData, ToolsNrpMekanik: value, ToolsPicPerson: selected.Nama, PicTools: selected.Keterangan })
                  }}
                >
                  <SelectTrigger id="add-picTools">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {picTools.map((pos) => (
                      <SelectItem key={pos.Kode} value={pos.Kode}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/*<Input*/}
                {/*  id="add-picTools"*/}
                {/*  value={formData.PicTools}*/}
                {/*  onChange={(e) => setFormData({ ...formData, PicTools: e.target.value })}*/}
                {/*  placeholder="Pic Tools"*/}
                {/*/>*/}
              </div>
              <div className={`grid gap-2 lg:col-span-2 ${(formData.ToolsGroupType === "TOOL") ? "hidden" : "block"}`}>
                <Label htmlFor="add-toolboxid">ToolsBoxId *</Label>
                <Select
                  value={formData.ToolsIDToolBox}
                  onValueChange={(value) => {
                    const selected = toolBoxList.find(j => j.Kode === value);
                    setFormData({ ...formData, ToolsIDToolBox: value, ToolsPICToolBox: selected.KategoriId })
                  }}
                >
                  <SelectTrigger id="add-toolboxid">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolBoxList.map((pos) => (
                      <SelectItem key={pos.Kode} value={pos.Kode}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/*<Input*/}
                {/*  id="add-toolboxid"*/}
                {/*  value={formData.ToolsIDToolBox}*/}
                {/*  onChange={(e) => setFormData({ ...formData, ToolsIDToolBox: e.target.value })}*/}
                {/*  placeholder="ID ToolBox"*/}
                {/*/>*/}
              </div>
              <div className="grid gap-2 lg:col-span-2 ">
                <Label htmlFor="add-toolboxpic">Pic ToolBox *</Label>
                <Select
                  value={formData.ToolsPICToolBox}
                  // disabled={formData.ToolsGroupType !== "TOOL"}
                  onValueChange={(value) => setFormData({ ...formData, ToolsPICToolBox: value })}
                >
                  <SelectTrigger id="add-toolboxpic">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {picToolBoxs.map((pos) => (
                      <SelectItem key={pos.Kode} value={pos.Kode}>
                        {pos.Keterangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/*<Input*/}
                {/*  id="add-toolboxpic" */}
                {/*  value={formData.PicToolBox}*/}
                {/*  onChange={(e) => setFormData({ ...formData, PicToolBox: e.target.value })}*/}
                {/*  placeholder="Pic ToolBox"*/}
                {/*/>  */}
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTool} className="bg-gradient-to-r from-[#003366] to-[#009999] hover:from-[#004080] hover:to-[#00b3b3]">
              {editingItem ? "Update" : "Add"} Tool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tool "{editingItem?.ToolsDesc}" (ID: {editingItem?.ToolsId}
              ). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTool} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}