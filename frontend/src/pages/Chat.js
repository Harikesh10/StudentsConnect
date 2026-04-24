import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { messageAPI, userAPI } from '../services/api';
import socketService from '../services/socket';

const Chat = ({ user, onLogout }) => {
  const { userId: selectedUserId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup socket listeners
  useEffect(() => {
    socketService.onReceiveMessage((message) => {
      setMessages(prev => {
        // Prevent duplicate messages
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      // Also refresh conversations to update last message
      loadConversations();
    });

    socketService.onMessageSent((message) => {
      setMessages(prev => {
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      loadConversations();
    });

    socketService.onTyping((data) => {
      if (data.senderId === selectedUser?._id) {
        setIsTyping(true);
      }
    });

    socketService.onStopTyping((data) => {
      if (data.senderId === selectedUser?._id) {
        setIsTyping(false);
      }
    });

    socketService.onUserStatusChange((data) => {
      // Update conversation list online status
      setConversations(prev =>
        prev.map(conv => {
          if (conv.user._id === data.userId) {
            return { ...conv, user: { ...conv.user, isOnline: data.isOnline } };
          }
          return conv;
        })
      );
      // Update selected user's online status
      setSelectedUser(prev => {
        if (prev && prev._id === data.userId) {
          return { ...prev, isOnline: data.isOnline };
        }
        return prev;
      });
    });

    return () => {
      socketService.removeAllChatListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?._id]);

  // Load selected user when URL param changes
  useEffect(() => {
    if (selectedUserId) {
      loadUserAndMessages(selectedUserId);
      setMobileShowChat(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when user is selected
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

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
    setMessagesLoading(true);
    try {
      // First fetch user info
      const userRes = await userAPI.getById(userId);
      setSelectedUser(userRes.data);

      // Then fetch messages
      const response = await messageAPI.getConversation(user.id, userId);
      setMessages(response.data);

      // Mark as read
      await messageAPI.markAsRead(user.id, userId);

      // Update unread count in sidebar
      setConversations(prev =>
        prev.map(conv => {
          if (conv.user._id === userId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const selectConversation = (conversation) => {
    navigate(`/chat/${conversation.user._id}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await userAPI.search(query);
      // Filter out current user
      setSearchResults(response.data.filter(u => u._id !== user.id));
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const startChatFromSearch = (searchUser) => {
    navigate(`/chat/${searchUser._id}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTyping = () => {
    if (selectedUser) {
      socketService.sendTyping({
        senderId: user.id,
        receiverId: selectedUser._id,
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendStopTyping({
          senderId: user.id,
          receiverId: selectedUser._id,
        });
      }, 2000);
    }
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
    socketService.sendStopTyping({
      senderId: user.id,
      receiverId: selectedUser._id,
    });
    setNewMessage('');
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDateLabel = (currentMsg, prevMsg) => {
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
    if (currentDate !== prevDate) {
      return formatDate(currentMsg.createdAt);
    }
    return null;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLastMessagePreview = (conv) => {
    const msg = conv.lastMessage;
    if (!msg) return '';
    const prefix = msg.sender._id === user.id ? 'You: ' : '';
    const text = msg.content.length > 35 ? msg.content.slice(0, 35) + '...' : msg.content;
    return prefix + text;
  };

  const getLastMessageTime = (conv) => {
    if (!conv.lastMessage) return '';
    const date = new Date(conv.lastMessage.createdAt);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return formatTime(conv.lastMessage.createdAt);
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chat-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="chat-container">
        {/* ─── Sidebar ─────────────────────────────────────── */}
        <div className={`chat-sidebar ${mobileShowChat ? 'chat-sidebar--hidden-mobile' : ''}`}>
          {/* Sidebar Header */}
          <div className="chat-sidebar__header">
            <h2 className="chat-sidebar__title">Messages</h2>
            <button
              id="new-chat-btn"
              className="chat-sidebar__new-btn"
              onClick={() => setShowSearch(!showSearch)}
              title="New conversation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="12" y1="8" x2="12" y2="14" />
                <line x1="9" y1="11" x2="15" y2="11" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="chat-sidebar__search">
              <div className="chat-sidebar__search-input-wrap">
                <svg className="chat-sidebar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  id="chat-search-input"
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="chat-sidebar__search-input"
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="chat-sidebar__search-results">
                  {searchResults.map(u => (
                    <div
                      key={u._id}
                      className="chat-sidebar__search-item"
                      onClick={() => startChatFromSearch(u)}
                    >
                      <div className="chat-avatar chat-avatar--sm">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="chat-sidebar__search-name">{u.name}</div>
                        <div className="chat-sidebar__search-meta">{u.registerNumber} &middot; {u.userType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conversations List */}
          <div className="chat-sidebar__list">
            {loading ? (
              <div className="chat-sidebar__empty">
                <div className="chat-loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="chat-sidebar__empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 12 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p className="chat-sidebar__empty-title">No conversations yet</p>
                <p className="chat-sidebar__empty-sub">
                  Click the <strong>+</strong> button to start a new chat
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.user._id}
                  id={`conv-${conv.user._id}`}
                  onClick={() => selectConversation(conv)}
                  className={`chat-conversation-item ${selectedUser?._id === conv.user._id ? 'chat-conversation-item--active' : ''}`}
                >
                  <div className="chat-avatar">
                    {getInitials(conv.user.name)}
                    {conv.user.isOnline && <span className="chat-avatar__status" />}
                  </div>
                  <div className="chat-conversation-item__body">
                    <div className="chat-conversation-item__top">
                      <span className="chat-conversation-item__name">{conv.user.name}</span>
                      <span className="chat-conversation-item__time">{getLastMessageTime(conv)}</span>
                    </div>
                    <div className="chat-conversation-item__bottom">
                      <span className="chat-conversation-item__preview">{getLastMessagePreview(conv)}</span>
                      {conv.unreadCount > 0 && (
                        <span className="chat-conversation-item__badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Chat Area ───────────────────────────────────── */}
        <div className={`chat-main ${mobileShowChat ? 'chat-main--show-mobile' : ''}`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-main__header">
                <button
                  className="chat-main__back-btn"
                  onClick={() => { setMobileShowChat(false); navigate('/chat'); }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <div className="chat-avatar chat-avatar--header">
                  {getInitials(selectedUser.name)}
                  {selectedUser.isOnline && <span className="chat-avatar__status" />}
                </div>
                <div className="chat-main__header-info">
                  <h3 className="chat-main__header-name">{selectedUser.name}</h3>
                  <p className="chat-main__header-meta">
                    {selectedUser.isOnline ? (
                      <span className="chat-main__header-online">Online</span>
                    ) : (
                      <span>{selectedUser.registerNumber} &middot; {selectedUser.userType}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="chat-main__messages">
                {messagesLoading ? (
                  <div className="chat-main__loading">
                    <div className="chat-loading-dots chat-loading-dots--lg">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-main__empty-convo">
                    <div className="chat-main__empty-icon">
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    </div>
                    <p className="chat-main__empty-title">Start a conversation</p>
                    <p className="chat-main__empty-sub">Send a message to {selectedUser.name} to get started!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSent = msg.sender._id === user.id;
                    const dateLabel = getDateLabel(msg, messages[index - 1]);
                    return (
                      <React.Fragment key={msg._id || index}>
                        {dateLabel && (
                          <div className="chat-date-divider">
                            <span>{dateLabel}</span>
                          </div>
                        )}
                        <div className={`chat-bubble-row ${isSent ? 'chat-bubble-row--sent' : 'chat-bubble-row--received'}`}>
                          <div className={`chat-bubble ${isSent ? 'chat-bubble--sent' : 'chat-bubble--received'}`}>
                            <p className="chat-bubble__text">{msg.content}</p>
                            <div className="chat-bubble__meta">
                              <span className="chat-bubble__time">{formatTime(msg.createdAt)}</span>
                              {isSent && msg.read && (
                                <svg className="chat-bubble__read" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="chat-bubble-row chat-bubble-row--received">
                    <div className="chat-bubble chat-bubble--received chat-bubble--typing">
                      <div className="chat-loading-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="chat-main__input-area">
                <div className="chat-main__input-wrap">
                  <input
                    ref={inputRef}
                    id="chat-message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="chat-main__input"
                    autoComplete="off"
                  />
                  <button
                    id="chat-send-btn"
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="chat-main__send-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="chat-main__placeholder">
              <div className="chat-main__placeholder-content">
                <div className="chat-main__placeholder-icon">
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 className="chat-main__placeholder-title">Sathyabama Connect Chat</h3>
                <p className="chat-main__placeholder-sub">
                  Select a conversation or start a new one to begin messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
