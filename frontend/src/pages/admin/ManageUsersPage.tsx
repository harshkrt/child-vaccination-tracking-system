import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import type { User } from '../../types'; // Assuming User type from AuthContext is similar enough or use src/types/User
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage, formatDate } from '../../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table"; // We need to create a basic Table component
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/AlertDialog"; // Basic AlertDialog
import { Users, Trash2, AlertTriangle, UserX, RotateCcw, Filter, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { ROLES } from '../../constants';
import { useAuth } from '../../hooks/useAuth'; // To ensure admin doesn't delete themselves
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';

// Simple Table Components (Create these in src/components/ui/)
// src/components/ui/Table.tsx
/*
export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table ref={ref} className={`w-full caption-bottom text-sm ${className}`} {...props} />
  </div>
));
export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={`[&_tr]:border-b ${className}`} {...props} />
));
export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
));
export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={`bg-slate-900 font-medium text-slate-50 ${className}`} {...props} />
));
export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={`border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 ${className}`} {...props} />
));
export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th ref={ref} className={`h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
));
export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
));
export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={`mt-4 text-sm text-slate-500 ${className}`} {...props} />
));
*/

// src/components/ui/AlertDialog.tsx - Simplified for this example
/*
import React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn("fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg", className)}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Action>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 ring-offset-white transition-colors hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Cancel>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} className={cn("mt-2 inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0", className)} {...props} />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };
*/

// ---- Start of ManageUsersPage.tsx ----
const ManageUsersPage: React.FC = () => {
  const { user: adminUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'parent' | 'doctor' | 'admin'>('all');

  const roleFilterOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Roles' },
    { value: ROLES.PARENT, label: 'Parents' },
    { value: ROLES.DOCTOR, label: 'Doctors' },
    { value: ROLES.ADMIN, label: 'Admins' },
  ];

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionMessage(null);
    try {
      const response = await api.get<User[]>('/admin/users'); // Assuming User type is compatible
      setAllUsers(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let currentUsers = [...allUsers];
    if (roleFilter !== 'all') {
        currentUsers = currentUsers.filter(user => user.role === roleFilter);
    }
    // Sort: Admins first, then doctors, then parents, then by name
    currentUsers.sort((a, b) => {
        const rolePriority = { admin: 0, doctor: 1, parent: 2 };
        if (rolePriority[a.role as keyof typeof rolePriority] < rolePriority[b.role as keyof typeof rolePriority]) return -1;
        if (rolePriority[a.role as keyof typeof rolePriority] > rolePriority[b.role as keyof typeof rolePriority]) return 1;
        return a.name.localeCompare(b.name);
    });
    setFilteredUsers(currentUsers);
  }, [allUsers, roleFilter]);


  const handleDeleteUser = async (userId: string, userName: string) => {
    setActionMessage(null);
    if (adminUser?._id === userId) {
        setActionMessage({type: 'error', text: "You cannot delete your own account."});
        return;
    }
    const userToDelete = allUsers.find(u => u._id === userId);
    if (userToDelete?.role === ROLES.ADMIN) {
         setActionMessage({type: 'error', text: "Admins cannot be deleted through this interface."});
        return;
    }

    try {
      await api.delete(`/admin/user/${userId}`);
      setActionMessage({type: 'success', text: `User "${userName}" deleted successfully.`});
      fetchUsers(); // Re-fetch users list
    } catch (err) {
      setActionMessage({type: 'error', text: getErrorMessage(err)});
    }
  };
  
  const RoleIcon = ({ role }: { role: string }) => {
    switch (role) {
        case ROLES.ADMIN: return <ShieldCheck className="w-5 h-5 text-purple-600" />;
        case ROLES.DOCTOR: return <Shield className="w-5 h-5 text-green-600" />;
        case ROLES.PARENT: return <ShieldOff className="w-5 h-5 text-blue-600" />;
        default: return <Users className="w-5 h-5 text-slate-500" />;
    }
  };


  if (isLoading && allUsers.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-cyan-600" />
                <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
            </div>
            {/* <Link to="/admin/create-user"> // Or link to create-doctor
                <Button size="lg">
                    <UserPlus className="w-5 h-5 mr-2" /> Create New User
                </Button>
            </Link> */}
        </div>

      {error && (
         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error</p>
            <p>{error}</p>
             <Button onClick={fetchUsers} variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
                <RotateCcw className="w-4 h-4 mr-2"/> Retry
            </Button>
        </div>
      )}
      {actionMessage && (
        <div className={`p-3 rounded-md text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {actionMessage.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>View and manage all users in the system.</CardDescription>
          <div className="pt-4">
             <Label htmlFor="roleFilter" className="sr-only">Filter by role</Label>
             <Select
                id="roleFilter"
                options={roleFilterOptions}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'parent' | 'doctor' | 'admin')}
                className="max-w-xs"
             />
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 && !isLoading ? (
            <div className="text-center py-10">
                <UserX className="w-16 h-16 text-slate-400 mx-auto mb-4"/>
                <p className="text-xl text-slate-600">No users found matching your criteria.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"><Filter className="w-4 h-4 inline-block mr-1"/> Role</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user._id || user._id}> {/* Backend might use id or _id */}
                    <TableCell><RoleIcon role={user.role} /></TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.createdAt ? formatDate(user.createdAt, 'PP') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        {adminUser?._id !== (user._id || user._id) && user.role !== ROLES.ADMIN && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                Are you sure you want to delete user: <strong>{user.name} ({user.email})</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                onClick={() => handleDeleteUser(user._id || user._id!, user.name)}
                                className="bg-red-600 hover:bg-red-700"
                                >
                                Delete User
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        )}
                         {adminUser?._id === (user._id || user._id) && <span className="text-xs text-slate-400">(Current Admin)</span>}
                         {user.role === ROLES.ADMIN && adminUser?._id !== (user._id || user._id) && <span className="text-xs text-slate-400">(Admin)</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsersPage;