import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { IParentChild } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Link } from 'react-router-dom';
import { getErrorMessage, formatDate, getAge } from '../../lib/utils';
import { Users, Calendar, Cake, PlusCircle, AlertTriangle, UserX } from 'lucide-react'; // UserX for no children

const ViewChildrenPage: React.FC = () => {
  const [children, setChildren] = useState<IParentChild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<IParentChild[]>('/parent/children');
        setChildren(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
       <div className="p-6 text-center">
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col items-center" role="alert">
            <AlertTriangle className="w-12 h-12 mb-2 text-red-500" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-cyan-600" />
                <h1 className="text-3xl font-bold text-slate-800">My Children</h1>
            </div>
            <Link to="/parent/add-child">
                <Button size="lg">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add New Child
                </Button>
            </Link>
        </div>
      

      {children.length === 0 ? (
        <Card>
            <CardContent className="p-10 text-center">
                <UserX className="w-16 h-16 text-slate-400 mx-auto mb-4"/>
                <p className="text-xl font-semibold text-slate-700">No Children Found</p>
                <p className="text-slate-500">You haven't added any children yet. Add one to start tracking vaccinations.</p>
                 <Link to="/parent/add-child" className="mt-4 inline-block">
                    <Button>Add Your First Child</Button>
                </Link>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map(child => (
            <Card key={child._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <Users className={`w-6 h-6 ${child.gender === 'male' ? 'text-blue-500' : child.gender === 'female' ? 'text-pink-500' : 'text-gray-500'}`}/>
                </div>
                <CardDescription>{getAge(child.dob)} old</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="flex items-center text-sm text-slate-600">
                  <Cake className="w-4 h-4 mr-2 text-rose-500" />
                  DOB: {formatDate(child.dob, 'PPP')}
                </p>
                <p className="flex items-center text-sm text-slate-600 capitalize">
                   Gender: {child.gender}
                </p>
                {/* Add more details or actions here if needed */}
                <div className="mt-4 pt-4 border-t">
                    <Link to={`/parent/schedule-vaccination?childId=${child._id}`}>
                         <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="w-4 h-4 mr-2"/> Schedule Vaccination
                         </Button>
                    </Link>
                     {/* <Link to={`/parent/child/${child._id}/schedules`}> // Example for viewing specific child's schedules
                         <Button variant="link" size="sm" className="w-full mt-2">
                            View Schedules
                         </Button>
                    </Link> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewChildrenPage;