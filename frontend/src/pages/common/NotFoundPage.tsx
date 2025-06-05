import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-6">
      <AlertTriangle className="w-24 h-24 text-amber-500 mb-6" />
      <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-slate-700 mb-3">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link to="/">
        <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;