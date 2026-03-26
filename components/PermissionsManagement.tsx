import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Shield, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth, AuthUsers } from "../service/AuthContext";
import { GenSetting, GlobalModel } from "../model/Models";
import { API } from '../config';


interface MenuAccess {
  ID: string;
  NamaSubMenu: string;
  NamaMenu: string;
  KodeMenu: string;
  Jabatan: string;  
}

interface MenuGroup {
  ID: string;
  NamaSubMenu: string;
  NamaMenu: string;
  KodeMenu: string;
  Jabatan: string[];
}
  

export default function PermissionsManagement() { 
  const { currentUser } = useAuth(); 
  const [edited, setEdited] = useState<boolean>(false);
  const [menuAccessList, setMenuAccessList] = useState<MenuAccess[]>([]);
  const [menuGroupList, setMenuGroupList] = useState<MenuGroup[]>([]);
  const [jabatanList, setJabatanList] = useState<GenSetting[]>([]);

  function GetFirstChar(text: string) {
    if (!text) return "";
    else {
      return text.split(" ").map(w => w[0]).join("")
    }
  }

  const toggleMenuGroup = (
    moduleIndex: number,
    role: string
  ) => { 
    setEdited(true);
    setMenuGroupList((prev) =>
      prev.map((perm, idx) => { 
        if (idx !== moduleIndex) return perm;

        // Pastikan Jabatan selalu berupa array
        const currentRoles = Array.isArray(perm.Jabatan) ? perm.Jabatan : [];

        const exists = currentRoles.some(jab => jab.toLowerCase() === role.toLowerCase());
        const nextRoles = exists
          ? currentRoles.filter((r) => r !== role) // hapus kalau sudah ada
          : [...currentRoles, role];               // tambah kalau belum ada

        return {
          ...perm,
          Jabatan: nextRoles,
        };

      })
    );
  }; 
  //const result = initialPermissions.map(p => ({
  //  module: p.module,
  //  subModule: p.subModule,
  //}));


  const convertToMenuGroup = (data: MenuAccess[]): MenuGroup[] => { 
    const grouped = data.reduce((acc, curr) => {
      const key = curr.ID;

      if (!acc[key]) {
        acc[key] = {
          ID: curr.ID,
          NamaSubMenu: curr.NamaSubMenu,
          NamaMenu: curr.NamaMenu,
          KodeMenu: curr.KodeMenu,
          Jabatan: []
        };
      }

      // Tambahkan jabatan jika belum ada (hindari duplikasi)
      if (!acc[key].Jabatan.some(jab => jab.toLowerCase() === curr.Jabatan.toLowerCase()) && curr.Jabatan !== "") { 
        acc[key].Jabatan.push(curr.Jabatan);
      }

      return acc;
    }, {} as Record<string, MenuGroup>);

    const list: MenuGroup[] = [];
    for (const key in grouped) {
      list.push(grouped[key]);
    }

    return list;
  };

  function toMenuAccessList(menuGroupList: MenuGroup[]): MenuAccess[] {

    const seen = new Set<string>();
    const result: MenuAccess[] = [];

    for (const mg of menuGroupList) {
      const roles = Array.isArray(mg.Jabatan) ? mg.Jabatan : [];
      for (const role of roles) {
        const r = (role ?? "").trim();
        if (!r) continue; 
        // Kunci dedup bisa disesuaikan (misal ID+Jabatan saja, atau tambah KodeMenu)
        const key = `${mg.ID}::${mg.KodeMenu}::${r}`;
        if (seen.has(key)) continue;

        seen.add(key);
        result.push({
          ID: mg.ID,
          NamaSubMenu: mg.NamaSubMenu,
          NamaMenu: mg.NamaMenu,
          KodeMenu: mg.KodeMenu,
          Jabatan: r,
        });
      }
    } 
    return result; 
  }
  /*action */ 
  const handleSave = async () => {
    if (!edited) { 
      toast.error("Belum ada perubahan");
      return;
    }

    const menuAccess = toMenuAccessList(menuGroupList);

    const accessMenu = menuAccess.map(p => ({
      ID: p.ID,
      Jabatan: p.Jabatan,
    }));
    try {
      const response = await fetch(API.GENERALSETTING(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "SAVEMENUACCESS",
          Nrp: currentUser.Nrp,
          JsonText: JSON.stringify(accessMenu)
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


  /*Load Server */
  const ReloadMaster = () => {
    const params = new URLSearchParams({
      act: 'MENUACCESS',
      jobsite: currentUser.Jobsite
    });
    fetch(API.GENERALSETTING() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: MenuAccess[]) => {
        const group = convertToMenuGroup(json);
        setMenuAccessList(json);
        setMenuGroupList(group);
      })
      .catch((error) => console.error("Error:", error));
  };

  const ReloadJabatan = () => {
    const params = new URLSearchParams({
      Kategori: "Jabatan",
      jobsite: currentUser.Jobsite
    });
    fetch(API.GENERALSETTING() + `?${params.toString()}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((json: GenSetting[]) => {

        const sorted = [...json].sort((a, b) => {
          const numA = parseInt(a.Kode.replace(/^\D+/g, ''), 10); // ambil angka
          const numB = parseInt(b.Kode.replace(/^\D+/g, ''), 10);
          return numA - numB;
        });

        setJabatanList(sorted)
      })
      .catch((error) => console.error("Error:", error));
  }; 

  useEffect(() => { 
    ReloadMaster(); 
    ReloadJabatan();
  },[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#003366]">Permissions Management</h1>
          <p className="text-gray-600 mt-1">Configure role-based access control</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[#009999] hover:bg-[#007777] text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
        
      <Card className="border-l-4 border-l-[#009999]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Shield className="h-5 w-5 text-[#009999]" />
            Permission Matrix
          </CardTitle>
        </CardHeader> 
        <CardContent className="overflow-x-auto"> 
          <div className="mt-0 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Legend:</strong>
              {jabatanList.map((role) => (
                " " + GetFirstChar(role.Keterangan)/*role.Kode.replace("Jab", "A")*/ + " = " + role.Keterangan + ",  "
              ))}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Menu</TableHead>
                <TableHead className="min-w-[150px]">Sub Menu</TableHead>
                {jabatanList.map((role) => (
                  <TableHead key={role.Kode} className="text-center min-w-[15px]"> 
                    <div className="text-[#003366] mb-1">{GetFirstChar(role.Keterangan)/*role.Kode.replace("Jab","A")*/}</div>  
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuGroupList.map((perm, moduleIndex) => (
                <TableRow key={`${perm.ID}`}>
                  <TableCell>{perm.NamaMenu}</TableCell>
                  <TableCell className="text-gray-600">{perm.NamaSubMenu}</TableCell>
                  {jabatanList.map((role) => (
                    <TableCell key={role.Kode}> 
                      <Checkbox
                        checked={perm.Jabatan.some(jab => jab.toLowerCase() === role.Kode.toLowerCase())} 
                        onCheckedChange={() => toggleMenuGroup(moduleIndex, role.Kode)}
                      /> 
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table> 
        </CardContent>
      </Card>
    </div>
  );
}