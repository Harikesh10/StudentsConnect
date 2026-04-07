import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { applicationAPI } from '../services/api';

const Applications = ({ user, onLogout }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadApplications = useCallback(async () => {
    try {
      let response;
      if (user.userType === 'student') {
        response = await applicationAPI.getByStudent(user.id);
      } else if (user.userType === 'club') {
        response = await applicationAPI.getByClub(user.id);
      }
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleStatusChange = async (appId, status) => {
    try {
      await applicationAPI.updateStatus(appId, status);
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {user.userType === 'student' ? 'My Applications' : 'Club Applications'}
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {user.userType === 'student'
                ? 'You haven\'t applied to any positions yet.'
                : 'No applications received yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow p-6">
                {user.userType === 'student' ? (
                  // Student view
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {app.hiringTitle}
                        </h3>
                        <p className="text-gray-600">
                          {app.club.name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    {app.message && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Message:</p>
                        <p className="text-gray-600">{app.message}</p>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mb-4">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() => handleChat(app.club._id)}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary text-sm"
                    >
                      Message Club
                    </button>
                  </>
                ) : (
                  // Club view
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {app.student.name}
                        </h3>
                        <p className="text-gray-600">
                          {app.student.registerNumber}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Position:</p>
                      <p className="text-gray-900">{app.hiringTitle}</p>
                    </div>

                    {app.student.skills && app.student.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {app.student.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-primary text-white px-2 py-1 rounded text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.student.bio && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Bio:</p>
                        <p className="text-gray-600">{app.student.bio}</p>
                      </div>
                    )}

                    {app.message && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Application Message:</p>
                        <p className="text-gray-600">{app.message}</p>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mb-4">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app._id, 'accepted')}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(app._id, 'rejected')}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleChat(app.student._id)}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary text-sm"
                      >
                        Message Student
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
