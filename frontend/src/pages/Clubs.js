import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clubAPI } from '../services/api';

const Clubs = ({ user, onLogout }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await clubAPI.getAll();
      setClubs(response.data);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Clubs</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading clubs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Link
                key={club._id}
                to={`/clubs/${club._id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h2>
                
                {club.clubType && (
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mb-3">
                    {club.clubType}
                  </span>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {club.clubDescription}
                </p>

                {club.hirings && club.hirings.filter(h => h.status === 'open').length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800 font-medium text-sm">
                      {club.hirings.filter(h => h.status === 'open').length} Open Position(s)
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <p className="text-gray-600 text-sm">No open positions</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {!loading && clubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No clubs available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clubs;
