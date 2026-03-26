export interface GlobalModel {
  Kode: string;
  Keterangan: string;
  Kategori: string;
  KategoriId: string;
  Nama: string;
  Status: string;
  ToolsType: string;
}
 
export interface StdQuantity { 
  ToolsId: string;
  Jobsite: string;
  ToolsCategory: string;
  ToolsDesc: string;
  StatusCapex: string;
  StdQuantity: string;
  ActualQuantity: string;
  RiskCategory: string;
  Sertification: string;
  Status: string; 
}

export interface GenSetting { 
  Kode: string;
  Keterangan: string;
  Detail: string;
  Kategori: string;
  Jumlah: number;
}
export interface ToolsTypeModel {
  Kode: string;
  Keterangan: string;
  MaxId: string;
  PartCode: string; 
}
 
export interface RegisterTools {
  ToolsJobsite: string;
  ToolsId: string;
  ToolsIdEll: string;
  ToolsDesc: string;
  ToolsNoPo: string;
  ToolsSerialNo: string;
  ToolsDateIn: string;
  ToolsWeight: string;
  ToolsBrand: string;
  ToolsSize: string;
  ToolsPartNo: string;
  StatusCapex: string;
  ToolsGroupType: string;
  ToolsPICToolBox: string;
  ToolsIDToolBox: string;
  ToolsExpKalibrasi: string;
  ToolsLocation: string;
  ToolsCostDefault: string;
  ToolsCost: string;
  ToolsType: string;
  ToolsCategory: string;
  ToolsWorkgroup: string;
  ToolsWorkgroupId: string;
  PicTools: string;
  HourMeter: string;
  GroupTypeName: string;
  PicToolBox: string;
  NRPBOOKING: string;
  YearMeter: string;
  StTools: string;
  NamaPeminjam: string;
  NO: string;
  StatusStd: string;
  ToolsNrpMekanik: string,
  ToolsPicPerson: string,
  ToolsQty:string
}

export interface AuditRequest {
  NoUrut: string;
  IdToolBox: string;
  ToolsJobsite: string;
  ToolsPICToolBox: string;
  NamaPicToolBox: string;
  ToolsLocation: string;
  AuditDate: string;
  Total: string;
  Audited: string;
  RemarkAudit: string;
  StAudit: string;  
}