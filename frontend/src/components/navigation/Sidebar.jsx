import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RealtimeBadge } from '../common/RealtimeBadge';
import {
  LayoutDashboard,
  Flame,
  Map as MapIcon,
  MessageSquare,
  LogOut,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

export function Sidebar() {
  const { user, role, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/disasters', label: 'Disasters', icon: Flame },
    { to: '/map', label: 'Map', icon: MapIcon },
    { to: '/reports', label: 'Reports', icon: MessageSquare },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#F0D8CB] min-h-screen p-5 justify-between sticky top-0 h-screen shadow-warm-sm">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F47B4A] text-white flex items-center justify-center shadow-warm-sm">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-[#343434]">DisasterResponse</h1>
              <p className="text-xs text-[#8A817B] font-medium">Coordination Platform</p>
            </div>
          </div>
        </div>

        {/* Realtime Stream Badge */}
        <div className="px-2">
          <RealtimeBadge />
        </div>

        {/* Quick Action Button */}
        <div className="px-2">
          <NavLink
            to="/disasters/new"
            className="flex items-center justify-center w-full py-3 px-4 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-semibold text-sm transition-all shadow-warm-sm hover:shadow-warm-md"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Report Disaster
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FCE5D8] text-[#E9653B] shadow-warm-sm'
                      : 'text-[#8A817B] hover:bg-[#FFF7F1] hover:text-[#343434]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Role Switcher */}
      <div className="pt-4 border-t border-[#F0D8CB] space-y-3">
        {/* User Card */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB]">
          <div className="w-9 h-9 rounded-xl bg-[#F9C1A5] text-[#E9653B] flex items-center justify-center font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#343434] truncate">{user?.email || 'user@example.com'}</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#F47B4A]" />
              <span className="text-[11px] font-semibold text-[#E9653B] uppercase tracking-wider">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher for Demo Evaluator */}
        <div className="px-1">
          <label className="text-[11px] font-bold text-[#8A817B] block mb-1">
            Demo Role Switcher:
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[#FFF7F1] p-1 rounded-xl border border-[#F0D8CB]">
            <button
              onClick={() => switchDemoRole('ADMIN')}
              className={`py-1 text-xs font-bold rounded-lg transition-all ${
                role === 'ADMIN' ? 'bg-[#F47B4A] text-white shadow-xs' : 'text-[#8A817B] hover:text-[#343434]'
              }`}
            >
              ADMIN
            </button>
            <button
              onClick={() => switchDemoRole('CONTRIBUTOR')}
              className={`py-1 text-xs font-bold rounded-lg transition-all ${
                role === 'CONTRIBUTOR' ? 'bg-[#F47B4A] text-white shadow-xs' : 'text-[#8A817B] hover:text-[#343434]'
              }`}
            >
              CONTRIBUTOR
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
