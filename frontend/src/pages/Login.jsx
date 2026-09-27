import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Flame, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export function Login({ setToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoRole, setDemoRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      if (setToast) setToast({ type: 'success', message: 'Signed in successfully!' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials or create an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setError('');
    demoLogin(demoRole);
    if (setToast) setToast({ type: 'info', message: `Signed in using offline Demo mode as ${demoRole}` });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FFF7F1] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white rounded-3xl border border-[#F0D8CB] shadow-warm-lg max-w-4xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Visual Column (Desktop) */}
        <div className="bg-gradient-to-br from-[#F47B4A] via-[#E9653B] to-[#F6B24D] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Abstract Emergency Pattern */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-sm">
              <Flame className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-4">
              Emergency Response Platform
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4">
              Coordinate Disaster Relief Effortlessly
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Real-time incident reporting, geospatial emergency resource mapping, and role-based coordination.
            </p>
          </div>

          <div className="pt-8 border-t border-white/20 mt-8">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white/90">
              <ShieldCheck className="w-4 h-4" />
              <span>Role-Based Authorization & Supabase Auth</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#343434]">Welcome back</h2>
            <p className="text-sm text-[#8A817B] mt-1">
              Sign in to coordinate disaster response operations.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#343434] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8A817B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#343434] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8A817B]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-bold text-sm transition-all shadow-warm-sm hover:shadow-warm-md flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Optional Quick Demo Mode for Evaluators */}
          <div className="mt-6 pt-5 border-t border-[#F0D8CB]">
            <div className="p-3 bg-[#FCE5D8]/60 rounded-2xl border border-[#F9C1A5]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#E9653B] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Evaluator Quick Demo Mode:
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setDemoRole('ADMIN')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    demoRole === 'ADMIN'
                      ? 'bg-[#F47B4A] text-white'
                      : 'bg-white text-[#8A817B] border border-[#F0D8CB]'
                  }`}
                >
                  ADMIN Role
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRole('CONTRIBUTOR')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    demoRole === 'CONTRIBUTOR'
                      ? 'bg-[#F47B4A] text-white'
                      : 'bg-white text-[#8A817B] border border-[#F0D8CB]'
                  }`}
                >
                  CONTRIBUTOR Role
                </button>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 px-3 bg-white hover:bg-orange-50 text-[#E9653B] font-bold text-xs rounded-xl border border-[#F9C1A5] transition-colors"
              >
                Launch Offline Demo Session ({demoRole})
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#8A817B] font-medium mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#E9653B] hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
