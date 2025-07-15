import React, { useState, useEffect } from 'react';
import {
    PlusCircle,
    MessageSquare,
    Mic,
    Camera,
    Send,
    Globe,
    Bot
} from 'lucide-react';
import { databases, ID } from "../appwrite/client";
import { Query } from "appwrite";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const APPWRITE_CHAT_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CHAT_COLLECTION_ID;

const AICopilotChat = ({ user, getUserDisplayName }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [allUserMessages, setAllUserMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [language, setLanguage] = useState('hinglish');
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const chatSuggestions = [
        "What to stock this month?",
        "Make listing for this product photo",
        "Why are my sales down?",
        "Best pricing for my silk sarees?"
    ];

    const getRelativeTime = (date) => {
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return "just now";
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days === 1) return `1 day ago`;
        if (days < 30) return `${days} days ago`;

        return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    };

    const processChatHistoryToSessions = (messages) => {
        if (!messages || messages.length === 0) {
            setChatSessions([]);
            return;
        }
        const sessions = messages.reduce((acc, msg) => {
            const sessionId = msg.session_id;
            if (!acc[sessionId]) {
                acc[sessionId] = {
                    id: sessionId,
                    preview: msg.content.substring(0, 40) + '...',
                    rawTimestamp: new Date(msg.rawCreatedAt).getTime(),
                    messages: []
                };
            }
            acc[sessionId].messages.push(msg);
            acc[sessionId].rawTimestamp = Math.max(acc[sessionId].rawTimestamp, new Date(msg.rawCreatedAt).getTime());
            return acc;
        }, {});

        const sortedSessions = Object.values(sessions)
            .sort((a, b) => b.rawTimestamp - a.rawTimestamp)
            .map(session => {
                const lastMessageDate = new Date(session.rawTimestamp);
                return {
                    ...session,
                    time: getRelativeTime(lastMessageDate),
                    title: `Chat from ${lastMessageDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                };
            });
        setChatSessions(sortedSessions);
    };

    const fetchChatHistory = async (currentUser) => {
        if (!currentUser || !APPWRITE_CHAT_COLLECTION_ID) {
            setChatMessages([{
                id: 'greeting-new-user', type: 'bot', content: `Namaste! How can I help you grow your business today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            return;
        }

        try {
            const res = await databases.listDocuments(
                APPWRITE_DB_ID, APPWRITE_CHAT_COLLECTION_ID,
                [Query.equal('user_id', currentUser.uid), Query.orderAsc('$createdAt'), Query.limit(100)]
            );

            const userMessages = res.documents.map(doc => ({
                id: doc.$id, type: doc.type, content: doc.content, session_id: doc.session_id,
                rawCreatedAt: doc.$createdAt,
                timestamp: new Date(doc.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            setAllUserMessages(userMessages);

            if (userMessages.length === 0) {
                setChatMessages([{
                    id: 'greeting', type: 'bot', content: `Namaste ${getUserDisplayName(currentUser)}! How can I help you grow your business today?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                processChatHistoryToSessions([]);
            } else {
                setChatMessages(userMessages);
                processChatHistoryToSessions(userMessages);
                if (userMessages.length > 0) {
                    setCurrentSessionId(userMessages[userMessages.length - 1].session_id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
            setChatMessages([{
                id: 'greeting-error', type: 'bot', content: `Namaste ${getUserDisplayName(currentUser)}! How can I help you grow your business today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    useEffect(() => {
        if (user) {
            fetchChatHistory(user);
        }
    }, [user]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;
        const currentChatInput = chatInput;
        setChatInput('');
        const sessionId = currentSessionId || ID.unique();
        if (!currentSessionId) setCurrentSessionId(sessionId);

        const userMessage = {
            id: ID.unique(), type: 'user', content: currentChatInput, session_id: sessionId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawCreatedAt: new Date().toISOString(),
        };

        const historyForBackend = chatMessages.filter(m => !m.id.startsWith('greeting')).slice(-5).map(msg => ({
            role: msg.type === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        
        const newViewMessages = chatMessages.some(m => m.id.startsWith('greeting')) ? [userMessage] : [...chatMessages, userMessage];
        setChatMessages(newViewMessages);
        setIsLoading(true);

        try {
            const payload = { history: historyForBackend, current_query: currentChatInput, language: language };
            const response = await fetch(`${backendURL}/api/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error((await response.json()).detail || `API call failed`);
            const result = await response.json();
            const aiResponse = {
                id: ID.unique(), type: 'bot', content: result.reply, session_id: sessionId,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rawCreatedAt: new Date().toISOString(),
            };
            setChatMessages(prev => [...prev, aiResponse]);

            if (user && APPWRITE_CHAT_COLLECTION_ID) {
                await databases.createDocument(APPWRITE_DB_ID, APPWRITE_CHAT_COLLECTION_ID, userMessage.id, { user_id: user.uid, type: 'user', content: userMessage.content, session_id: sessionId });
                await databases.createDocument(APPWRITE_DB_ID, APPWRITE_CHAT_COLLECTION_ID, aiResponse.id, { user_id: user.uid, type: 'bot', content: aiResponse.content, session_id: sessionId });
                const newAllMessages = [...allUserMessages, userMessage, aiResponse];
                setAllUserMessages(newAllMessages);
                processChatHistoryToSessions(newAllMessages);
            }
        } catch (error) {
            console.error("Error fetching AI response from backend:", error);
            const errorResponse = {
                id: Date.now() + 1, type: 'bot', content: `Oops! Something went wrong. ${error.message}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setChatMessages([{
            id: user ? 'greeting-new-chat' : 'greeting-generic', type: 'bot',
            content: `Namaste ${user ? getUserDisplayName(user) : ''}! How can I help you grow your business today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const handleSessionClick = (sessionId) => {
        const sessionMessages = allUserMessages.filter(msg => msg.session_id === sessionId);
        setChatMessages(sessionMessages);
        setCurrentSessionId(sessionId);
    };

    return (
        <div className="flex h-full">
            <div className="w-80 bg-[#0f172a] border-r border-gray-700 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Chat History</h3>
                    <button onClick={handleNewChat} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm" title="Start New Chat">
                        <PlusCircle className="w-4 h-4" /> New Chat
                    </button>
                </div>
                <div className="space-y-2 overflow-y-auto flex-1">
                    {chatSessions.length > 0 ? (
                        chatSessions.map((chat) => (
                            <div key={chat.id} className="p-3 rounded-lg border border-gray-700 hover:bg-[#1e293b] cursor-pointer bg-[#1e293b] text-gray-100" onClick={() => handleSessionClick(chat.id)}>
                                <h4 className="font-medium text-gray-100 text-sm truncate">{chat.preview}</h4>
                                <p className="text-xs text-gray-400 mt-1">{chat.time}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 text-sm py-8">No chat history found.</div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-900">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>
                                <p className="text-sm whitespace-pre-line">{message.content}</p>
                                <span className="text-xs opacity-75 mt-1 block">{message.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-700 text-white animate-pulse">
                                <p className="text-sm">Saathi AI is typing…</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Smart Suggestions</h4>
                            <div className="flex flex-wrap gap-2">
                                {chatSuggestions.map((suggestion, index) => (
                                    <button key={index} onClick={() => setChatInput(suggestion)} className="px-3 py-1 bg-gray-700 text-blue-300 rounded-full text-sm hover:bg-gray-600 transition-colors">
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                <option value="hinglish">Hinglish</option>
                                <option value="english">English</option>
                                <option value="hindi">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..." className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"/>
                        </div>
                        <button className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"><Mic className="w-5 h-5 text-gray-300" /></button>
                        <button className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"><Camera className="w-5 h-5 text-gray-300" /></button>
                        <button onClick={handleSendMessage} className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><Send className="w-5 h-5 text-white" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICopilotChat; 