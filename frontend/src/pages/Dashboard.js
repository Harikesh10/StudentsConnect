import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clubAPI, applicationAPI } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClubs: 0,
    myApplications: 0
  });
  const [recentClubs, setRecentClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [clubsRes] = await Promise.all([
        clubAPI.getAll()
      ]);

      setRecentClubs(clubsRes.data.slice(0, 3));
      setStats({
        totalClubs: clubsRes.data.length,
        totalStudents: 5
      });

      if (user.userType === 'student') {
        const appsRes = await applicationAPI.getByStudent(user.id);
        setStats(prev => ({ ...prev, myApplications: appsRes.data.length }));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {user.userType === 'student' && 'Discover opportunities and connect with peers'}
            {user.userType === 'club' && 'Manage your club and review applications'}
            {user.userType === 'faculty' && 'View student portfolios and mentor students'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {user.userType === 'student' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Active Clubs</h3>
                <p className="text-3xl font-bold text-primary mt-2">{stats.totalClubs}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">My Applications</h3>
                <p className="text-3xl font-bold text-primary mt-2">{stats.myApplications}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
                <p className="text-3xl font-bold text-primary mt-2">{stats.totalStudents}</p>
              </div>
            </>
          )}
          {user.userType === 'club' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Open Positions</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                {user.hirings?.filter(h => h.status === 'open').length || 0}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {user.userType === 'student' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/search"
                className="border-2 border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition text-center font-medium"
              >
                Search Students
              </Link>
              <Link
                to="/clubs"
                className="border-2 border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition text-center font-medium"
              >
                Browse Clubs
              </Link>
              <Link
                to="/profile"
                className="border-2 border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition text-center font-medium"
              >
                Update Portfolio
              </Link>
            </div>
          </div>
        )}

        {/* Recent Clubs */}
        {user.userType === 'student' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Active Clubs</h2>
              <Link to="/clubs" className="text-primary hover:text-secondary font-medium">
                View All →
              </Link>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-4">
                {recentClubs.map(club => (
                  <Link
                    key={club._id}
                    to={`/clubs/${club._id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary transition"
                  >
                    <h3 className="font-semibold text-lg text-gray-900">{club.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{club.clubDescription}</p>
                    {club.hirings?.filter(h => h.status === 'open').length > 0 && (
                      <p className="text-primary text-sm mt-2 font-medium">
                        {club.hirings.filter(h => h.status === 'open').length} open position(s)
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Club Dashboard */}
        {user.userType === 'club' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Club Overview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{user.clubDescription}</p>
              </div>
              <div>
                <Link
                  to="/applications"
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary inline-block"
                >
                  View Applications
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
