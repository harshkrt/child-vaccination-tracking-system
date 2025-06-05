import React from 'react';
import { Heart, Shield, Calendar, Users, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../../hooks/useAuth'; // Import useAuth

const Homepage: React.FC = () => {
  const { user } = useAuth(); // Get user info

  return (
    <div className="min-h-screen p-6 space-y-8"> {/* Removed bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 to simplify and rely on PageLayout's bg */}
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="floating-animation inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
          Child Vaccination Tracker
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"> {/* Changed text-gray-600 to text-slate-600 to match theme */}
          Keep your child's immunization records safe, organized, and always accessible.
          Never miss another vaccination with our smart tracking system.
        </p>
        <div className="mt-8 space-x-4">
          {user ? (
             <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'doctor' ? '/doctor/dashboard' : '/parent/dashboard'}>
              <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                Get Started
              </Button>
            </Link>
          )}
          {/* <Button variant="outline" className="border-cyan-400 text-cyan-600 hover:bg-cyan-50 px-8 py-3 rounded-full">
            Learn More
          </Button> */}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: Users, label: 'Families Protected', value: '10,000+', color: 'from-cyan-400 to-blue-500' },
          { icon: Shield, label: 'Vaccines Tracked', value: '25,000+', color: 'from-teal-400 to-green-500' },
          { icon: Calendar, label: 'Appointments Set', value: '5,000+', color: 'from-blue-400 to-indigo-500' },
          { icon: Award, label: 'Health Records', value: '99.9%', color: 'from-purple-400 to-pink-500' }
        ].map((stat, index) => (
          <Card key={index} className="glass-morphism border-cyan-200/30 hover:shadow-lg transition-all duration-300"> {/* Ensure Card is defined and imported if glass-morphism specific styles were in Card, else apply here directly or in global.css */}
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div> {/* text-gray-800 to text-slate-800 */}
              <div className="text-sm text-slate-600">{stat.label}</div> {/* text-gray-600 to text-slate-600 */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: Calendar,
            title: 'Smart Scheduling',
            description: 'Intelligent reminders and appointment scheduling to keep your child\'s vaccinations on track.',
            gradient: 'from-cyan-500 to-blue-500'
          },
          {
            icon: Shield,
            title: 'Secure Records',
            description: 'Military-grade encryption keeps your child\'s medical records safe and accessible only to you.',
            gradient: 'from-teal-500 to-green-500'
          },
          {
            icon: Heart,
            title: 'Health Insights',
            description: 'Track your child\'s health journey with detailed analytics and vaccination history.',
            gradient: 'from-pink-500 to-rose-500'
          },
          {
            icon: Users,
            title: 'Family Sharing',
            description: 'Share records securely with family members, doctors, and schools when needed.',
            gradient: 'from-purple-500 to-indigo-500'
          },
          {
            icon: TrendingUp,
            title: 'Progress Tracking',
            description: 'Visual progress indicators show completion status and upcoming vaccination needs.',
            gradient: 'from-orange-500 to-red-500'
          },
          {
            icon: Award,
            title: 'Compliance Reports',
            description: 'Generate official reports for school enrollment and travel requirements instantly.',
            gradient: 'from-emerald-500 to-teal-500'
          }
        ].map((feature, index) => (
          <Card key={index} className="glass-morphism border-cyan-200/30 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-800 mb-2"> {/* text-gray-800 to text-slate-800 */}
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-slate-600 leading-relaxed"> {/* text-gray-600 to text-slate-600 */}
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="glass-morphism rounded-3xl p-12 text-center mt-16 border border-cyan-200/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Ready to Protect Your Child's Future?
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed"> {/* text-gray-600 to text-slate-600 */}
            Join thousands of parents who trust VaxTracker to keep their children's vaccination records
            organized and up-to-date. Get started now.
          </p>
          <div className="space-x-4">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'doctor' ? '/doctor/dashboard' : '/parent/dashboard'}>
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                  View My Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                  Sign Up Now
                </Button>
              </Link>
            )}
            {/* <Button variant="outline" className="border-cyan-400 text-cyan-600 hover:bg-cyan-50 px-8 py-3 rounded-full">
              Learn More
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;