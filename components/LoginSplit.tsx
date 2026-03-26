import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Eye, EyeOff, User, Lock, Wrench } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Toaster, toast } from "sonner";  
import alamTriGeoLogo from "../assets/0bfe9d43d56ef6906c84e49273c2571d01152438.png";
import hologramTech from "../assets/13d68dac9a712845228f3564d2578a29b44d6be3.png";
import backgroundImage from "../assets/9f480a3ee033d67a91e035e629964638717b1427.png";
import type { AuthUsers } from "../service/AuthContext";
import { API } from '../config';

interface LoginSplitProps {
  onLogin: (user: AuthUsers) => void;
}

export default function LoginSplit({
  onLogin,
}: LoginSplitProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
      console.log("CLick Login");
    // Validation
    if (!username.trim() || !password.trim()) {
      console.log("Please enter both username and password");
      toast.error("Please enter both username and password");
      setIsLoading(false);
      return;
    } 

    //const url = new URL(API.DETAILUSER()+username);
    // url.searchParams.set("page", String(page));
    // url.searchParams.set("pageSize", String(pageSize)); 
    // fetch(url)
    //   .then((res) => res.json())
    //   .then((data) => setItems(data.Data ?? data))
    //   .catch(console.error);
 
    try {
      const response = await fetch(API.LOGINUSER(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nrp: username,
          password: password
        })
      });
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } 

      const data = await response.json();
      console.log("Response:", data); 
      if(data.Keterangan == "Success") {
        const user = data.Data;
        toast.success("Login Success"); 
        onLogin({   
          Nrp:user.Nrp, 
          Nama:user.Nama,  
          Email:user.Email, 
          NrpSuperior:user.NrpSuperior,
          Workgroup:user.Workgroup,
          Jobsite:user.Jobsite,
          JobsiteId:user.JobsiteId,
          Jabatan:user.Jabatan,
          JabatanId:user.JabatanId,
          JabatanStructural:user.JabatanStructural,
          JabatanStructuralId:user.JabatanStructuralId, 
        });
      } else { 
        toast.error(data.Message??"Failed Login");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setIsLoading(false); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      {/* Centered Container with 75% width */}
      <div className="w-full max-w-[75%] flex rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Welcome Section */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-[#003d5c]/40" />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo Icon */}
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2
                  className="text-white text-2xl tracking-wider"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  Tools Management System
                </h2>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-4 mb-8">
              <h1 className="text-white/80 text-xl">
                Welcome to
              </h1>
              <h2
                className="text-white text-6xl mb-6"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                Smart Tomas
              </h2>
              <p className="text-white/90 text-lg">
                Excellence Tool for World-Class Maintenance
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-white/70 text-sm">
              © 2025 Smart Tomas. Plant Support Equipment
              Department
            </p>
          </div>

          {/* Load Google Font */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
          `}</style>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <img
                src={alamTriGeoLogo}
                alt="AlamTri Geo"
                className="h-16 object-contain"
              />
            </div>

            {/* Sign In Header */}
            <div>
              <h2 className="text-3xl text-[#003366] mb-2">
                Sign In
              </h2>
              <p className="text-gray-500">
                Welcome back! Please enter your credentials
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm text-[#003366]"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    className="pl-12 h-12 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#009999] focus:ring-[#009999]"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm text-[#003366]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="pl-12 pr-12 h-12 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#009999] focus:ring-[#009999]"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#009999] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-[#009999] hover:text-[#00b8b8] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#009999] hover:bg-[#00b8b8] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form> 
             
            <div style={{ height: "70px", width: "100%", backgroundColor: "#FFFFFF" }}>
               
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}