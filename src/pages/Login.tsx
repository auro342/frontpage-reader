import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
     if (localStorage.getItem('user')) {
         navigate('/');
     }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    // Simulate minor network delay for premium feel
    setTimeout(() => {
      localStorage.setItem('user', name);
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
             <div className="w-4 h-4 bg-white rounded-sm absolute left-2.5 top-2.5 opacity-90"></div>
             <div className="w-4 h-4 border-[3px] border-white bg-[#3b82f6] rounded-sm absolute left-4 top-4"></div>
          </div>
        </div>
        <h2 className="mt-2 text-center text-[28px] font-bold text-gray-900 tracking-tight">
          Sign in to Frontpage
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Your personal tech feed reader
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Display Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all sm:text-sm font-medium"
                  placeholder="e.g. Alex"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#3b82f6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 text-[12px] font-medium tracking-wide string">OR CONTINUE GUEST</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setName("Guest");
                  setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 0);
                }}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
