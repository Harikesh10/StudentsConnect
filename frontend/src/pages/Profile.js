import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { userAPI } from '../services/api';

const Profile = ({ user, onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    skills: user.skills || [],
    email: user.email || '',
    phone: user.phone || '',
    department: user.department || '',
    clubDescription: user.clubDescription || ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await userAPI.update(user.id, formData);

      // Update local storage
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage('Profile updated successfully!');
      setEditing(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.userType === 'student' ? 'My Portfolio' : 'My Profile'}
            </h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-gray-900">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Register Number</label>
              <p className="text-gray-900">{user.registerNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <p className="text-gray-900 capitalize">{user.userType}</p>
            </div>

            {user.userType === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {editing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.bio || 'No bio added yet'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  {editing && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="Add a skill"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          {editing && (
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-white hover:text-gray-200"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added yet</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {user.userType === 'faculty' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-gray-900">{formData.department || 'Not specified'}</p>
                )}
              </div>
            )}

            {user.userType === 'club' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Club Description</label>
                {editing ? (
                  <textarea
                    name="clubDescription"
                    value={formData.clubDescription}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-gray-900">{formData.clubDescription || 'No description added'}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-gray-900">{formData.email || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
