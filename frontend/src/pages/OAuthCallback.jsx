import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    
    // Determine provider from state or some other logic. 
    // Since we only set state for Microsoft/Github, we can deduce it from the URL or session.
    // For simplicity, let's infer it from session storage or URL state if we added it,
    // but we can also just check the window location or have passed a state.
    // Let's rely on standard state param. Since we didn't add state to the URL in Login.jsx,
    // let's infer from the URL if it's GitHub vs Microsoft based on the format, or we'll just try them.
    // Wait, let's look at Login.jsx: we didn't add a state parameter. Let's fix that later,
    // or we can deduce: Microsoft auth code is a very long JWT-like string or base64, GitHub is a short 20 char hex string.
    
    const urlProvider = window.location.pathname.includes('github') ? 'github' : 
                        window.location.pathname.includes('microsoft') ? 'microsoft' : null;
    
    // Actually, a better way: we should have distinct callback URLs, e.g. /oauth/callback/github.
    // Let's assume the route matches /oauth/callback/:provider
    const match = location.pathname.match(/\/oauth\/callback\/(.+)/);
    const provider = match ? match[1] : 'unknown';

    if (!code || provider === 'unknown') {
      setError('Invalid OAuth callback parameters.');
      return;
    }

    handled.current = true;
    
    const exchangeCode = async () => {
      try {
        const response = await axios.post('/api/auth/callback', {
          provider,
          code,
          redirectUri: `${window.location.origin}/oauth/callback/${provider}`
        });
        
        loginWithToken(response.data.token, response.data.user);
        navigate('/');
      } catch (err) {
        console.error(err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    exchangeCode();
  }, [location, navigate, loginWithToken]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white">
        <div className="text-center">
          <div className="text-rose-500 mb-2 font-bold">OAuth Error</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <h2 className="text-xl font-bold">Authenticating...</h2>
        <p className="text-sm text-slate-500">Please wait while we securely log you in.</p>
      </div>
    </div>
  );
}
