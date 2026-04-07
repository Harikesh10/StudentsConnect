import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { clubAPI, applicationAPI } from '../services/api';

const MaplaBot = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [clubsContext, setClubsContext] = useState([]);
    const [appsContext, setAppsContext] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!user) return;
        
        // Load history from local storage
        const savedHistory = localStorage.getItem(`maplabot_history_${user.id}`);
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (parsed.length > 0) {
                    setMessages(parsed);
                } else {
                    setMessages([{ text: `Hi ${user.name}! I'm Mapla Bot, your Sathyabama Connect assistant. How can I help you today?`, isBot: true }]);
                }
            } catch (e) {
                setMessages([{ text: `Hi ${user.name}! I'm Mapla Bot, your Sathyabama Connect assistant. How can I help you today?`, isBot: true }]);
            }
        } else {
            setMessages([{ text: `Hi ${user.name}! I'm Mapla Bot, your Sathyabama Connect assistant. How can I help you today?`, isBot: true }]);
        }

        // Fetch context data
        const fetchContextData = async () => {
            try {
                const clubsRes = await clubAPI.getAll();
                setClubsContext(clubsRes.data);
                
                if (user.userType === 'student') {
                    const appsRes = await applicationAPI.getByStudent(user.id);
                    setAppsContext(appsRes.data);
                }
            } catch (err) {
                console.error("Error fetching context for bot:", err);
            }
        };
        fetchContextData();
    }, [user]);

    useEffect(() => {
        if (user && messages.length > 0) {
            localStorage.setItem(`maplabot_history_${user.id}`, JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages, isOpen, user]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        const currentMessages = [...messages, { text: userMsg, isBot: false }];
        setMessages(currentMessages);
        setInput('');
        setIsLoading(true);

        try {
            const chatPayload = {
                message: userMsg,
                user: user,
                clubs: clubsContext,
                applications: appsContext,
                history: messages.slice(-10) // Send recent context
            };
            const res = await axios.post('http://localhost:5000/api/bot/chat', chatPayload);
            setMessages(prev => [...prev, { text: res.data.response, isBot: true }]);
        } catch (error) {
            console.error('Bot Error:', error);
            const errorMessage = error.response?.data?.message || 'Sorry, I am having trouble connecting right now.';
            setMessages(prev => [...prev, { text: errorMessage, isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chatbot Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ease-in-out transform origin-bottom-right">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex justify-between items-center rounded-t-2xl shadow-md">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-inner">
                                <span className="text-xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">Mapla Bot</h3>
                                <p className="text-xs text-gray-200 font-medium">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="h-80 sm:h-96 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.isBot
                                    ? "bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm self-start"
                                    : "bg-primary text-white rounded-tr-sm shadow-md self-end"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-tl-sm w-16 border border-gray-100 shadow-sm self-start flex justify-center items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent px-3 text-sm text-gray-700 outline-none placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={`p-2 rounded-full flex items-center justify-center transition-colors ${(!input.trim() || isLoading)
                                    ? "text-gray-400"
                                    : "bg-primary text-white hover:bg-secondary shadow-sm"
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group bg-primary hover:bg-secondary text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                    <svg className="w-6 h-6 transform group-hover:-rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default MaplaBot;
