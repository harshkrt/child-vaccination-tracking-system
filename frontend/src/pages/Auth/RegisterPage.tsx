import React, { useState, useEffect } from "react"; // Added useEffect for debugging/logging
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../types"; // Assuming your types/index.ts has the User interface
import api from "../../lib/api";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { AlertTriangle, UserPlus, Mail, Lock, Users2 } from "lucide-react";
import { getErrorMessage } from "../../lib/utils";
import { ROLES } from "../../constants";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role] = useState(ROLES.PARENT);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Local loading state for the form submission
  
  // Destructure all relevant values from useAuth for clarity and logging
  const { login, user: contextUser, token: contextToken, isLoading: contextIsLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Log initial context state when component mounts or context values change
  useEffect(() => {
    console.log("RegisterPage effect (mount/context change). AuthContext state:", { 
      user: contextUser?.email, 
      isAuthenticated: isAuthenticated(), // Call the function
      token: contextToken?.substring(0,10)+"...", 
      isLoading: contextIsLoading 
    });

    // Redirect if a user is definitively authenticated and not in a loading phase from context
    if (isAuthenticated() && contextUser && !contextIsLoading) {
        console.log(`RegisterPage: User (${contextUser.email}) is authenticated and not loading. Attempting redirect.`);
        if (contextUser.role === ROLES.ADMIN) navigate("/admin/dashboard", { replace: true });
        else if (contextUser.role === ROLES.DOCTOR) navigate("/doctor/dashboard", { replace: true });
        else if (contextUser.role === ROLES.PARENT) navigate("/parent/dashboard", { replace: true });
        else navigate("/", { replace: true });
    }
  }, [contextUser, contextToken, contextIsLoading, isAuthenticated, navigate]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Form submission is loading

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    console.log("RegisterPage handleSubmit: Attempting to sign up with email:", email);
    try {
      const response = await api.post<{ token: string; user: User }>( // Ensure 'User' from types matches backend structure
        "/auth/signup",
        {
          name,
          email,
          password,
          role,
        }
      );
      console.log("RegisterPage handleSubmit: Signup API success. Response User:", response.data.user.email, "Token:", response.data.token.substring(0,10)+"...");
      
      // Call context login. This will update AuthContext's state (user, token, isLoading).
      login(response.data.token, response.data.user); 
      
      // For navigation, rely on the user data JUST received from the signup response,
      // as the context update might involve an async profile fetch via its useEffect.
      const newUserFromResponse = response.data.user;
      console.log(`RegisterPage handleSubmit: Navigating new user (${newUserFromResponse.email}) from response to their dashboard based on role: ${newUserFromResponse.role}`);

      if (newUserFromResponse.role === ROLES.PARENT) {
        navigate("/parent/dashboard", { replace: true });
      } else if (newUserFromResponse.role === ROLES.DOCTOR) {
        navigate("/doctor/dashboard", { replace: true });
      } else if (newUserFromResponse.role === ROLES.ADMIN) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true }); 
      }
    } catch (err: unknown) {
      console.error("RegisterPage handleSubmit: Signup API failed.", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false); // Form submission loading finished
    }
  };

  // Render null if we are certain the user is logged in AND auth context isn't in an intermediate loading state
  // This check is also now inside useEffect for more robust handling.
  // You could simplify by removing this top-level "if (contextUser)" if the useEffect handles redirection well.
  if (isAuthenticated() && contextUser && !contextIsLoading) {
      console.log("RegisterPage render: User is authenticated, rendering null as redirect should occur from useEffect.");
      return null; 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto mb-4">
            <div className="p-3 bg-cyan-600 rounded-full">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Create Your Account
          </CardTitle>
          <CardDescription>
            Join VaxTracker today to protect your child's health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... form fields ... same as your provided code ... */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1">
                <Users2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input id="password" type="password" placeholder="•••••••• (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading} // Uses local form isLoading
              size="lg"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="w-full">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-cyan-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;