import { Link } from 'react-router-dom';

export default function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: 'hsl(var(--outer-bg))' }}>
      <div className="w-full max-w-4xl">
        {/* Top banner with home and user icons - matching mockup */}
        <div 
          className="flex items-center justify-between rounded-t-lg px-4 py-3"
          style={{ backgroundColor: 'hsl(var(--banner-bg))' }}
        >
          <Link to="/">
            <button className="h-10 w-10 rounded-full bg-white text-primary hover:bg-gray-100 flex items-center justify-center">
              <span>🏠</span>
            </button>
          </Link>
          <button className="h-10 w-10 rounded-full bg-white text-primary hover:bg-gray-100 flex items-center justify-center">
            <span>👤</span>
          </button>
        </div>

        {/* Content area */}
        <div 
          className="flex min-h-[70vh] flex-col items-center justify-center rounded-b-lg border-4 border-t-0 border-black p-12"
          style={{ backgroundColor: 'hsl(var(--content-bg))' }}
        >
          <h1 className="mb-12 text-6xl font-bold text-gray-700">The Playlister</h1>
          
          <div className="mb-16 text-gray-800 text-9xl">🎵</div>
          
          <div className="flex gap-6">
            <Link to="/" className="min-w-[180px] rounded-full bg-gray-800 px-8 py-6 text-lg text-white hover:bg-gray-700 text-center no-underline">
              Continue as Guest
            </Link>
            
            <Link to="/login" className="min-w-[180px] rounded-full bg-gray-800 px-8 py-6 text-lg text-white hover:bg-gray-700 text-center no-underline">
              Login
            </Link>
            
            <Link to="/register" className="min-w-[180px] rounded-full bg-gray-800 px-8 py-6 text-lg text-white hover:bg-gray-700 text-center no-underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
