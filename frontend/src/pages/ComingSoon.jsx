import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Map, FileText } from 'lucide-react';

export function ComingSoon({ title, featureName, icon: Icon = Map }) {
  return (
    <div className="max-w-xl mx-auto py-12 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FCE5D8] border border-[#F9C1A5] text-[#E9653B] flex items-center justify-center shadow-warm-md">
        <Icon className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FCE5D8] text-[#E9653B] text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 2 Feature</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[#343434] tracking-tight">
          {title || featureName || 'Interactive Feature'}
        </h1>
        <p className="text-sm text-[#8A817B] max-w-md mx-auto">
          The {featureName || 'requested module'} is scheduled for release in Phase 2 of the Disaster Response Coordination Platform implementation.
        </p>
      </div>

      <div className="pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-extrabold text-sm shadow-warm-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
