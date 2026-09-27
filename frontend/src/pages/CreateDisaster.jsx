import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createDisaster } from '../api/disasters';
import { useToast } from '../components/common/Toast';
import { ArrowLeft, Tag, MapPin, AlertTriangle, Plus, X, Send } from 'lucide-react';

export function CreateDisaster() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tag Handlers
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        ...(location.trim() ? { location: location.trim() } : {}),
        tags,
        status,
      };

      const res = await createDisaster(payload);
      const created = res.data;
      addToast('Disaster incident created successfully!', 'success');
      navigate(`/disasters/${created.id}`);
    } catch (err) {
      console.error('Failed to create disaster:', err);
      setError(err.message || 'Failed to create disaster incident.');
      addToast(err.message || 'Failed to create disaster incident.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          to="/disasters"
          className="inline-flex items-center text-xs font-bold text-[#E9653B] hover:underline mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Disasters List
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#343434] tracking-tight">
          Report New Disaster Incident
        </h1>
        <p className="text-sm text-[#8A817B]">
          Provide details about emergency events to alert emergency response teams.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="font-medium">{error}</div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-[#F0D8CB] shadow-warm-md space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#343434]">
            Incident Title <span className="text-[#E9653B]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flood Alert in Sumedang Region"
            className="w-full px-4 py-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434]"
          />
        </div>

        {/* Location & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343434]">
              Location <span className="text-xs text-[#8A817B] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8A817B]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Manhattan, NYC"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434]"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343434]">
              Incident Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434]"
            >
              <option value="ACTIVE">ACTIVE (Emergency in progress)</option>
              <option value="RESOLVED">RESOLVED (Threat contained)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#343434]">
            Detailed Description <span className="text-[#E9653B]">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the nature of the disaster, affected areas, severity, and immediate hazards..."
            className="w-full px-4 py-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434] resize-none"
          />
        </div>

        {/* Tag Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#343434]">
            Tags / Category Keywords
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Tag className="w-5 h-5 absolute left-3.5 top-3 text-[#8A817B]" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter (e.g. flood, water)"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const cleaned = tagInput.trim().toLowerCase().replace(/^#/, '');
                if (cleaned && !tags.includes(cleaned)) {
                  setTags([...tags, cleaned]);
                  setTagInput('');
                }
              }}
              className="p-2.5 rounded-2xl bg-[#FCE5D8] text-[#E9653B] hover:bg-[#F9C1A5] font-bold text-xs"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-xl bg-[#FCE5D8] text-[#E9653B] font-bold text-xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-[#E9653B] hover:text-[#343434]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#F0D8CB]">
          <Link
            to="/disasters"
            className="px-5 py-3 rounded-2xl border border-[#F0D8CB] bg-[#FFF7F1] text-[#8A817B] font-bold text-sm hover:bg-[#FCE5D8] hover:text-[#343434] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-extrabold text-sm transition-all shadow-warm-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Incident Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
