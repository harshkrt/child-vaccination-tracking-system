import React, { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { getErrorMessage } from '../../lib/utils';
import { Stethoscope, Mail, Lock, UserCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const CreateDoctorPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!name || !email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        setIsLoading(false);
        return;
    }


    try {
      await api.post('/admin/doctor', { name, email, password });
      setMessage({ type: 'success', text: 'Doctor account created successfully! They can now log in.' });
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-3">
            <Stethoscope className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">Create Doctor Account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor's Details</CardTitle>
          <CardDescription>Enter the details for the new doctor account.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-md flex items-center text-sm ${
                message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' 
                                          : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name"><UserCircle className="inline w-4 h-4 mr-1"/> Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email"><Mail className="inline w-4 h-4 mr-1"/> Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor../..example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password"><Lock className="inline w-4 h-4 mr-1"/> Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
               <p className="text-xs text-slate-500 mt-1">Doctor will be able to change this password after login.</p>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
              <Stethoscope className="w-5 h-5 mr-2" />
              {isLoading ? 'Creating Account...' : 'Create Doctor Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDoctorPage;