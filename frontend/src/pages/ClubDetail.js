import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clubAPI, applicationAPI } from '../services/api';

const ClubDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [selectedHiring, setSelectedHiring] = useState(null);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadClub();
  }, [id]);

  const loadClub = async () => {
    try {
      const response = await clubAPI.getById(id);
      setClub(response.data);
    } catch (error) {
      console.error('Error loading club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (hiring) => {
    if (user.userType !== 'student') {
      alert('Only students can apply');
      return;
    }

    setSelectedHiring(hiring);
  };

  const submitApplication = async () => {
    setApplying(true);
    setMessage('');

    try {
      await applicationAPI.submit({
        studentId: user.id,
        clubId: club._id,
        hiringId: selectedHiring._id,
        hiringTitle: selectedHiring.title,
        message: applicationMessage
      });

      setMessage('Application submitted successfully!');
      setSelectedHiring(null);
      setApplicationMessage('');

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  const handleChat = () => {
    navigate(`/chat/${club._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Club not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
              {club.clubType && (
                <span className="inline-block bg-primary text-white px-3 py-1 rounded text-sm">
                  {club.clubType}
                </span>
              )}
            </div>

            <button
              onClick={handleChat}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary"
            >
              Message Club
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-gray-700">{club.clubDescription}</p>
          </div>

          {club.email && (
            <p className="text-gray-600 text-sm">Email: {club.email}</p>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Open Positions</h2>

          {club.hirings && club.hirings.filter(h => h.status === 'open').length > 0 ? (
            <div className="space-y-4">
              {club.hirings.filter(h => h.status === 'open').map((hiring) => (
                <div key={hiring._id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {hiring.title}
                  </h3>
                  <p className="text-gray-700 mb-3">{hiring.description}</p>

                  {hiring.requirements && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                      <p className="text-sm text-gray-600">{hiring.requirements}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mb-4">
                    Posted: {new Date(hiring.postedDate).toLocaleDateString()}
                  </p>

                  {user.userType === 'student' && (
                    <button
                      onClick={() => handleApply(hiring)}
                      className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No open positions at the moment.</p>
            </div>
          )}
        </div>

        {/* Application Modal */}
        {selectedHiring && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Apply for {selectedHiring.title}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows="4"
                  placeholder="Why are you interested in this position?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={submitApplication}
                  disabled={applying}
                  className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-secondary disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  onClick={() => {
                    setSelectedHiring(null);
                    setApplicationMessage('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetail;
