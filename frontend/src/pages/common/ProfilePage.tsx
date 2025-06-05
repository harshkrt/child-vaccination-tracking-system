import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { AlertTriangle, CheckCircle, UserCircle2 } from 'lucide-react';
import { getErrorMessage } from '../../lib/utils';

const ProfilePage: React.FC = () => {
  const { user, login, token, isLoading: authLoading } = useAuth(); // Using `login` to update context if user data changes
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Password change fields (optional)
  // const [currentPassword, setCurrentPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsLoadingData(false);
    } else if (!authLoading) {
        // Handle case where user is null but auth is not loading (e.g., direct navigation without being logged in)
        // This should ideally be caught by ProtectedRoute, but as a safeguard:
        setIsLoadingData(false);
        // navigate('/login'); // or show an error
    }
  }, [user, authLoading]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsUpdating(true);

    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Name and email cannot be empty.' });
      setIsUpdating(false);
      return;
    }

    try {
      setMessage({ type: 'info', text: 'Profile display updated. (No backend update endpoint for now)' });
       if (user) {
           const updatedDisplayUser: User = { ...user, name, email };
           login(token!, updatedDisplayUser);
       }


    } catch (err: unknown) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsUpdating(false);
    }
  };


  if (isLoadingData || authLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (!user) {
     return <div className="p-6 text-center text-red-500">User data not available. Please try logging in again.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-6">
            <UserCircle2 className="w-10 h-10 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-md flex items-center text-sm ${
                message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' 
                                          : message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700'
                                          : 'bg-blue-100 border border-blue-400 text-blue-700' // for info
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
              {message.text}
            </div>
          )}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // disabled // Email usually not changeable without verification
              />
            </div>
             <div>
                <Label htmlFor="role">Role</Label>
                <Input
                    id="role"
                    type="text"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} // Capitalize
                    disabled
                    className="bg-slate-100"
                />
             </div>
            <Button type="submit" isLoading={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Optional: Password Change Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            // ... password fields ...
            <Button type="submit" isLoading={isUpdatingPassword}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default ProfilePage;