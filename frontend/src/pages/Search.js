import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { userAPI } from '../services/api';

const Search = ({ user, onLogout }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await userAPI.search(query);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Students</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, register number, or skills..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary font-medium"
            >
              Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No students found matching your search.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((student) => (
            <div key={student._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{student.registerNumber}</p>
              
              {student.bio && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{student.bio}</p>
              )}

              {student.skills && student.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-primary text-white px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {student.skills.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{student.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleChat(student._id)}
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary font-medium"
              >
                Message
              </button>
            </div>
          ))}
        </div>

        {!searched && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Try searching for "React", "Python", "41520104001", or "Rahul"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
