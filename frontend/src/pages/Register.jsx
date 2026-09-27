import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Flame, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export function Register({ setToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, role);
      if (setToast) setToast({ type: 'success', message: 'Account created! You are now logged in.' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F1] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white rounded-3xl border border-[#F0D8CB] shadow-warm-lg max-w-4xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Visual Column */}
        <div className="bg-gradient-to-br from-[#F47B4A] via-[#E9653B] to-[#F6B24D] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-sm">
              <Flame className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-4">
              Join Platform
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4">
              Create an Account to Start Reporting
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Register as an Emergency Administrator or Contributor to manage disaster incidents and resources.
            </p>
          </div>

          <div className="pt-8 border-t border-white/20 mt-8">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white/90">
              <ShieldCheck className="w-4 h-4" />
              <span>Email Confirmation Disabled for Immediate Login</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#343434]">Create Account</h2>
            <p className="text-sm text-[#8A817B] mt-1">
              Set up your credentials to manage disaster response.
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

            <div>
              <label className="block text-xs font-bold text-[#343434] mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8A817B]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#343434] mb-1.5 uppercase tracking-wider">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                    role === 'ADMIN'
                      ? 'bg-[#F47B4A] text-white border-[#F47B4A] shadow-xs'
                      : 'bg-[#FFF7F1] text-[#8A817B] border-[#F0D8CB]'
                  }`}
                >
                  ADMIN (Full Controls)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CONTRIBUTOR')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                    role === 'CONTRIBUTOR'
                      ? 'bg-[#F47B4A] text-white border-[#F47B4A] shadow-xs'
                      : 'bg-[#FFF7F1] text-[#8A817B] border-[#F0D8CB]'
                  }`}
                >
                  CONTRIBUTOR (No Delete)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-bold text-sm transition-all shadow-warm-sm hover:shadow-warm-md flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-[#8A817B] font-medium mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#E9653B] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
