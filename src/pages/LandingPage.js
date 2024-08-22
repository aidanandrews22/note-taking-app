import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, FileText, BarChart2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Aidan Andrews App</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Hero section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Boost Your Productivity</h2>
                <p className="text-gray-600">
                  Manage your tasks, notes, and schedule all in one place. Stay organized and boost your productivity with my all-in-one solution.
                </p>
                <Link to="/signin" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-blue-500" />}
              title="Notes"
              description="Create and organize your thoughts with our powerful note-taking system."
              link="/notes"
            />
            <FeatureCard
              icon={<CheckSquare className="h-8 w-8 text-green-500" />}
              title="Todos"
              description="Keep track of your tasks and never miss a deadline."
              link="/todos"
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-purple-500" />}
              title="Calendar"
              description="Manage your schedule with our intuitive calendar interface."
              link="/calendar"
            />
            <FeatureCard
              icon={<BarChart2 className="h-8 w-8 text-red-500" />}
              title="Analytics"
              description="Gain insights into your productivity with detailed analytics."
              link="/analytics"
            />
          </div>

          {/* Call to action */}
          <div className="mt-12 bg-blue-500 rounded-lg shadow-lg">
            <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to boost your productivity?</span>
                <span className="block">Start using my app today.</span>
              </h2>
              <Link to="/signin" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto">
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, link }) => {
  return (
    <Link to={link} className="block">
      <div className="bg-white overflow-hidden shadow rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            {icon}
            <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default LandingPage;