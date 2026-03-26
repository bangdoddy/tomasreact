import React from "react";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner"; 
import LoginSplit from "./components/LoginSplit";
import MainLayout from "./components/MainLayout"; 
import { useAuth, AuthUsers } from "./service/AuthContext";


export interface UserAuthModel {
  currentUser: AuthUsers; 
}

export interface User {
  id: number;
  nrp: string;
  name: string;
  supervisorNrp: string;
  supervisorName: string; 
  Jobsite: string;
  JobsiteId: string;
  Jabatan: string;
  JabatanId: string;
  JabatanStructural: string;
  JabatanStructuralId: string;
  Workgroup: string;
  WorkgroupId: string;
}

export interface Tool {
  id: number;
  toolsJobsite: string;
  toolsId: string;
  toolsDesc: string;
  toolsLocation: string;
  toolsSerialNo: string;
  toolsQty: string;
  toolsCategory: string;
  toolsDateIn: string;
  toolsBrand: string;
  toolsType: string;
  toolsSize: string;
  toolsCondition: string;
  toolsWorkgroup: string;
  active?: boolean;
  cost?: number;
}

//export interface AuthUser { 
//  Nrp: string;
//  Nama: string;
//  NrpSuperior: string;
//  Email: string;
//  Jobsite: string;
//  JobsiteId: string; 
//  Jabatan: string;
//  JabatanId: string;
//  JabatanStructural: string;
//  JabatanStructuralId: string;
//  Workgroup: string; 
//}

function App() { 
  const { isAuthenticated, currentUser, login, logout } = useAuth();
   
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" richColors />
      {!isAuthenticated ? (
        <LoginSplit onLogin={login} />
      ) : (
        <MainLayout currentUser={currentUser!} onLogout={logout} />
      )}
    </div>
  );

}

//function App() {
//  const [isAuthenticated, setIsAuthenticated] = useState(false);
//  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
//  const handleLogin = (user: AuthUser) => {
//    setIsAuthenticated(true);
//    setCurrentUser(user);
//      localStorage.setItem("SmartTomasAuth", JSON.stringify(user));
//  };

//  const handleLogout = () => {
//    setIsAuthenticated(false);
//    setCurrentUser(null);
//      localStorage.removeItem("SmartTomasAuth");
//  };

//  useEffect(() => { 
//    console.log("Proses masuk App") 
//    if(!isAuthenticated){
//        const raw = localStorage.getItem("SmartTomasAuth"); 
//      if (raw) {
//        try {
//          const user = JSON.parse(raw); 
//          setCurrentUser(user);
//          setIsAuthenticated(true);
//        } catch {}
//      }
//    }
//  });

//  return (
//    <div className="min-h-screen">
//      <Toaster position="top-right" richColors />
//      {!isAuthenticated ? (
//        <LoginSplit onLogin={handleLogin} />
//      ) : (
//        <MainLayout
//          currentUser={currentUser!}
//          onLogout={handleLogout}
//        />
//      )}
//    </div>
//  );
//}

export default App;