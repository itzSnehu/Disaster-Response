import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Flame, Map as MapIcon, MessageSquare, Plus } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F0D8CB] px-3 py-2 shadow-warm-lg safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E9653B]' : 'text-[#8A817B]'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/disasters"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E9653B]' : 'text-[#8A817B]'
            }`
          }
        >
          <Flame className="w-5 h-5 mb-0.5" />
          <span>Disasters</span>
        </NavLink>

        {/* Central Floating Elevated Add Button */}
        <NavLink
          to="/disasters/new"
          aria-label="Report New Disaster"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F47B4A] text-white shadow-warm-md -mt-5 transition-transform active:scale-95 border-4 border-[#FFF7F1]"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E9653B]' : 'text-[#8A817B]'
            }`
          }
        >
          <MapIcon className="w-5 h-5 mb-0.5" />
          <span>Map</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E9653B]' : 'text-[#8A817B]'
            }`
          }
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Reports</span>
        </NavLink>
      </div>
    </nav>
  );
}
