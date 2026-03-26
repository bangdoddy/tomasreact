import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Eye, EyeOff, Lock, Mail, Wrench, HardHat, Database, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import workshopImage from 'figma:asset/9f480a3ee033d67a91e035e629964638717b1427.png';
import type { AuthUser } from '../App';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  onViewSummary: () => void;
}

export default function Login({ onLogin, onViewSummary }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials
  const validUsers = [
    { username: 'admin', password: 'admin123', role: 'Administrator' },
    { username: 'manager', password: 'manager123', role: 'Manager' },
    { username: 'user', password: 'user123', role: 'User' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    // Simulate authentication
    setTimeout(() => {
      const user = validUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        toast.success('Login successful!');
        onLogin({ username: user.username, role: user.role });
      } else {
        toast.error('Invalid username or password');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Workshop Visual */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Workshop Image Background */}
        <div className="absolute inset-0">
          <img 
            src={workshopImage} 
            alt="Smart Workshop" 
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/90 via-[#003366]/70 to-[#009999]/80" />
        </div>

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 153, 153, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 153, 153, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        {/* Animated Scan Lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#009999] to-transparent opacity-70"
              style={{
                top: `${i * 20}%`,
                animation: `scanLine ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Top Section - Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#009999]/20 border border-[#009999]/40 rounded-lg backdrop-blur-sm">
                <Wrench className="w-8 h-8 text-[#009999]" />
              </div>
              <div>
                <h1 className="text-4xl text-white tracking-tight">Smart Tomas</h1>
                <p className="text-sm text-gray-300">Tools Management System</p>
              </div>
            </div>
          </div>

          {/* Middle Section - Features */}
          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl mb-6 text-white">Advanced Workshop Management</h2>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="flex items-start gap-3 p-4 bg-[#009999]/10 border border-[#009999]/30 rounded-xl backdrop-blur-sm hover:bg-[#009999]/20 transition-all">
                  <div className="p-2 bg-[#009999]/20 rounded-lg">
                    <Database className="w-5 h-5 text-[#009999]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-white mb-1">Real-time Tracking</h3>
                    <p className="text-xs text-gray-400">Monitor all tools & equipment</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3 p-4 bg-[#009999]/10 border border-[#009999]/30 rounded-xl backdrop-blur-sm hover:bg-[#009999]/20 transition-all">
                  <div className="p-2 bg-[#009999]/20 rounded-lg">
                    <HardHat className="w-5 h-5 text-[#009999]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-white mb-1">Smart Inventory</h3>
                    <p className="text-xs text-gray-400">Automated management</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3 p-4 bg-[#009999]/10 border border-[#009999]/30 rounded-xl backdrop-blur-sm hover:bg-[#009999]/20 transition-all">
                  <div className="p-2 bg-[#009999]/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#009999]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-white mb-1">Analytics Dashboard</h3>
                    <p className="text-xs text-gray-400">Insights & reporting</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3 p-4 bg-[#009999]/10 border border-[#009999]/30 rounded-xl backdrop-blur-sm hover:bg-[#009999]/20 transition-all">
                  <div className="p-2 bg-[#009999]/20 rounded-lg">
                    <Wrench className="w-5 h-5 text-[#009999]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-white mb-1">Maintenance Alert</h3>
                    <p className="text-xs text-gray-400">Preventive scheduling</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex gap-4">
              <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-3xl text-[#009999] mb-1">75,500+</div>
                <div className="text-xs text-gray-400">Total Tools</div>
              </div>
              <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-3xl text-[#009999] mb-1">98%</div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>
              <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-3xl text-[#009999] mb-1">24/7</div>
                <div className="text-xs text-gray-400">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-gray-300">
              "Empowering coal mining operations with intelligent tools management and real-time insights."
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-2 h-2 bg-[#009999] rounded-full animate-ping" />
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-[#009999] rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-[#009999]/10 border border-[#009999]/20 rounded-lg">
                <Wrench className="w-8 h-8 text-[#009999]" />
              </div>
            </div>
            <h1 className="text-3xl text-[#003366]">Smart Tomas</h1>
            <p className="text-sm text-gray-600">Tools Management System</p>
          </div>

          {/* Login Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl text-[#003366] mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-gray-700">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-12 border-gray-300 focus:border-[#009999] focus:ring-[#009999] rounded-lg"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 border-gray-300 focus:border-[#009999] focus:ring-[#009999] rounded-lg"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#009999] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#009999] hover:bg-[#008080] text-white rounded-lg shadow-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* View Summary Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onViewSummary}
              className="text-sm text-[#009999] hover:text-[#008080] hover:underline transition-colors"
            >
              View Summary
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-700 space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#009999]" />
                <span>admin / admin123</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#009999]" />
                <span>manager / manager123</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#009999]" />
                <span>user / user123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Styles */}
      <style>{`
        @keyframes scanLine {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}