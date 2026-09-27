import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Tag } from 'lucide-react';

export function DisasterCard({ disaster }) {
  const isActive = disaster.status === 'ACTIVE';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#F0D8CB] shadow-warm-sm hover:shadow-warm-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Card Header: Status Badge & Date */}
        <div className="flex justify-between items-center mb-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isActive
                ? 'bg-[#FCE5D8] text-[#E9653B] border border-[#F9C1A5]'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isActive ? 'bg-[#E9653B] animate-pulse' : 'bg-emerald-600'
              }`}
            ></span>
            {disaster.status}
          </span>

          {disaster.createdAt && (
            <span className="inline-flex items-center text-xs font-medium text-[#8A817B]">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#F47B4A]" />
              {formatDate(disaster.createdAt)}
            </span>
          )}
        </div>

        {/* Disaster Title */}
        <h3 className="text-lg font-extrabold text-[#343434] mb-2 group-hover:text-[#E9653B] transition-colors line-clamp-1">
          {disaster.title}
        </h3>

        {/* Location Badge */}
        {disaster.location && (
          <div className="flex items-center text-xs font-semibold text-[#E9653B] mb-3 bg-[#FFF7F1] py-1 px-2.5 rounded-xl w-fit border border-[#F0D8CB]">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-[#F47B4A]" />
            <span className="truncate">{disaster.location}</span>
          </div>
        )}

        {/* Description Preview */}
        <p className="text-sm text-[#8A817B] mb-4 line-clamp-2 leading-relaxed">
          {disaster.description}
        </p>

        {/* Tags */}
        {disaster.tags && disaster.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {disaster.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-lg bg-[#FFF7F1] text-[#343434] border border-[#F0D8CB]"
              >
                <Tag className="w-3 h-3 mr-1 text-[#F47B4A]" />
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-[#FFF7F1] flex items-center justify-between">
        <span className="text-xs font-bold text-[#E9653B]">View Incident Details</span>
        <Link
          to={`/disasters/${disaster.id}`}
          className="w-9 h-9 rounded-2xl bg-[#FFF7F1] group-hover:bg-[#F47B4A] text-[#F47B4A] group-hover:text-white flex items-center justify-center transition-all shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
