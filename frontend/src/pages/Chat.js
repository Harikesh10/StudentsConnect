import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { messageAPI } from '../services/api';
import socketService from '../services/socket';

const Chat = ({ user, onLogout }) => {
  const { userId: selectedUserId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();

    // Socket listeners
    socketService.onReceiveMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    socketService.onMessageSent((message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      // Cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserAndMessages(selectedUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations(user.id);
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAndMessages = async (userId) => {
    try {
      const response = await messageAPI.getConversation(user.id, userId);
      setMessages(response.data);

      // Get user info from conversation
      if (response.data.length > 0) {
        const msg = response.data[0];
        const otherUser = msg.sender._id === user.id ? msg.receiver : msg.sender;
        setSelectedUser(otherUser);
      }

      // Mark as read
      await messageAPI.markAsRead(user.id, userId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const selectConversation = (conversation) => {
    navigate(`/chat/${conversation.user._id}`);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      senderId: user.id,
      receiverId: selectedUser._id,
      content: newMessage.trim()
    };

    socketService.sendMessage(messageData);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>

              {loading ? (
                <div className="p-4 text-center text-gray-600">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  No conversations yet. Search for students and start chatting!
                </div>
              ) : (
                <div>
                  {conversations.map((conv) => (
                    <div
                      key={conv.user._id}
                      onClick={() => selectConversation(conv)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedUser?._id === conv.user._id ? 'bg-blue-50' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{conv.user.name}</h3>
                        {conv.user.isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-block mt-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedUser.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {selectedUser.registerNumber} • {selectedUser.userType}
                        </p>
                      </div>
                      {selectedUser.isOnline && (
                        <span className="flex items-center text-sm text-green-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Online
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => {
                      const isSent = msg.sender._id === user.id;
                      return (
                        <div
                          key={index}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${isSent
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-900'
                              }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isSent ? 'text-gray-200' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary font-medium"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
