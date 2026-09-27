import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { BottomNav } from '../navigation/BottomNav';
import { RealtimeBadge } from '../common/RealtimeBadge';
import { useAuth } from '../../hooks/useAuth';
import { Flame, ShieldCheck, LogOut } from 'lucide-react';

export function AppLayout() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFF7F1] flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#F0D8CB] sticky top-0 z-30 shadow-warm-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F47B4A] text-white flex items-center justify-center">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-[#343434] leading-tight">DisasterResponse</h1>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#F47B4A]" />
                <span className="text-[10px] font-bold text-[#E9653B] uppercase">{role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RealtimeBadge />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
