import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { AlertTriangle, LogIn, Mail, Lock } from 'lucide-react'; // Icons
import { getErrorMessage } from '../../lib/utils'; // Error message utility
import { ROLES } from '../../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user: contextUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  if (contextUser) {
    if (contextUser.role === ROLES.ADMIN) navigate('/admin/dashboard', { replace: true });
    else if (contextUser.role === ROLES.DOCTOR) navigate('/doctor/dashboard', { replace: true });
    else if (contextUser.role === ROLES.PARENT) navigate('/parent/dashboard', { replace: true });
    else navigate('/', { replace: true });
    return null; // Render nothing while redirecting
  }


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post<{ token: string; user: User }>('/auth/signin', { email, password });
      login(response.data.token, response.data.user);
      
      // Redirect based on role after successful login
      const userRole = response.data.user.role;
      if (userRole === ROLES.ADMIN) {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === ROLES.DOCTOR) {
        navigate('/doctor/dashboard', { replace: true });
      } else if (userRole === ROLES.PARENT) {
        navigate('/parent/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true }); // Fallback to 'from' or '/'
      }

    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto mb-4">
            <div className="p-3 bg-cyan-600 rounded-full">
                <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <Link to="/forgot-password" /* Implement if needed */ className="text-cyan-600 hover:underline">
            Forgot password?
          </Link>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-cyan-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;