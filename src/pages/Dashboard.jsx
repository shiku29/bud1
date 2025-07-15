import React, { useState, useEffect } from 'react';
import {
    Home,
    Bot,
    Package,
    Edit3,
    TrendingUp,
    RotateCcw,
    User,
    Globe,
    Search,
    Bell,
    Plus,
    PlusCircle, // Add PlusCircle for the new chat button
    MessageSquare,
    Mic,
    Camera,
    Send,
    ChevronDown,
    Star,
    ArrowUp,
    ArrowDown,
    ShoppingCart,
    Eye,
    Calendar,
    Target,
    Zap,
    AlertTriangle // Add AlertTriangle for the summary
} from 'lucide-react';
import InventoryPlanner from './InventoryPlanner';
import ProductListingGenerator from './ProductListingGenerator';
import TrendsInsightsPage from './TrendsInsightsPage';
import OrdersReturnsPage from './OrdersReturnsPage';
import Profile from './Profile';
import Products from "./Products";
import AddProduct from "./AddProduct";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../auth/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { databases, ID } from "../appwrite/client"; // Add ID to import
import { Query } from "appwrite";



const backendURL = import.meta.env.VITE_BACKEND_URL;
const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_CHAT_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CHAT_COLLECTION_ID;
const APPWRITE_PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID;


const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    // Remove static chat messages
    const [chatMessages, setChatMessages] = useState([]);
    const [allUserMessages, setAllUserMessages] = useState([]); // Add state for all user messages
    const [chatInput, setChatInput] = useState('');
    const [currentSessionId, setCurrentSessionId] = useState(null); // Add state for current session ID
    // Add state for language selection
    const [language, setLanguage] = useState('hinglish'); // 'english', 'hindi', 'hinglish'
    const [chatSessions, setChatSessions] = useState([]); // Add state for dynamic sessions
    const [notifications] = useState([
        { id: 1, text: 'Raksha Bandhan next week – prepare stock!', type: 'festival', time: '2 hours ago' },
        { id: 2, text: 'Your silk saree listing got 50 views today', type: 'success', time: '4 hours ago' },
        { id: 3, text: 'Low stock alert: Traditional earrings', type: 'warning', time: '1 day ago' }
    ]);
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const location = useLocation();

    const aiWeeklySummary = {
        focus: "Focus on cotton pastel sets for Karva Chauth. High demand in your zone with 67% increase in searches. Promote your top listings and restock light fabrics immediately. Avoid wool items — return rate spiking 42% due to heat wave in North India.",
        opportunity: "Cotton kurtis, palazzo sets, light dupattas",
        caution: "Heavy fabrics, wool items, dark colors",
        action: "Boost cotton inventory, update size charts"
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'ai-chat', label: 'AI Copilot Chat', icon: Bot },
        { id: 'inventory', label: 'Inventory Planner', icon: Package },
        { id: 'listing', label: 'Product Listing', icon: Edit3 },
        { id: 'trends', label: 'Trends & Insights', icon: TrendingUp },
        { id: 'orders', label: 'Orders & Returns', icon: RotateCcw },
        { id: 'profile', label: 'Profile & Settings', icon: User },
        { id: 'language', label: 'Language', icon: Globe }
    ];

    const kpiCards = [
        { title: 'Stocked Items', value: '247', change: '+12', trend: 'up', icon: Package },
        { title: 'Best Seller', value: 'Silk Saree', subtitle: '₹2,850', trend: 'up', icon: Star },
        { title: 'Return Rate', value: '2.3%', change: '-0.5%', trend: 'down', icon: RotateCcw },
        { title: 'AI Suggestions Taken', value: '18', change: '+5', trend: 'up', icon: Zap }
    ];

    const quickActions = [
        { label: 'Add Product', icon: Plus, color: 'bg-blue-500' },
        { label: 'View Local Trends', icon: TrendingUp, color: 'bg-green-500' },
        { label: 'View your products', icon: MessageSquare, color: 'bg-purple-500' }
    ];

    const chatHistory = [
        { id: 1, title: 'Festival Stock Planning', time: '2 hours ago', preview: 'Raksha Bandhan recommendations...' },
        { id: 2, title: 'Saree Listing Help', time: '1 day ago', preview: 'Created 3 new listings...' },
        { id: 3, title: 'Sales Analytics', time: '2 days ago', preview: 'Your top performers are...' },
        { id: 4, title: 'Inventory Alerts', time: '3 days ago', preview: 'Low stock items need...' },
        { id: 5, title: 'Pricing Strategy', time: '1 week ago', preview: 'Competitive pricing for...' }
    ];

    const chatSuggestions = [
        "What to stock this month?",
        "Make listing for this product photo",
        "Why are my sales down?",
        "Best pricing for my silk sarees?"
    ];

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('view') === 'addProduct') {
            setActiveTab('addProduct');
            // Clean the URL to avoid keeping the view state on refresh
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

    // Helper function to calculate relative time
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

    // Process raw chat messages into daily sessions
    const processChatHistoryToSessions = (messages) => {
        if (!messages || messages.length === 0) {
            setChatSessions([]);
            return;
        }

        // Group messages by session_id
        const sessions = messages.reduce((acc, msg) => {
            const sessionId = msg.session_id;
            if (!acc[sessionId]) {
                acc[sessionId] = {
                    id: sessionId,
                    // Use the first message's content for the preview
                    preview: msg.content.substring(0, 40) + '...',
                    // Use the timestamp of the *last* message in the session for sorting
                    rawTimestamp: new Date(msg.rawCreatedAt).getTime(),
                    messages: []
                };
            }
            acc[sessionId].messages.push(msg);
            // Update timestamp to the latest message in the session
            acc[sessionId].rawTimestamp = Math.max(acc[sessionId].rawTimestamp, new Date(msg.rawCreatedAt).getTime());
            return acc;
        }, {});

        // Sort sessions by the most recent message
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

    useEffect(() => {
        // REMOVE this block entirely if you are not using Firebase Auth
        // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        //     setUser(currentUser);
        //     if (!currentUser) setProducts([]);
        // });
        // return () => unsubscribe();
    }, []);

    // useEffect(() => {
    //     const getUser = async () => {
    //         const { data: { user } } = await supabase.auth.getUser();
    //         setUser(user);
    //     };
    //     getUser();

    //     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    //         setUser(session?.user ?? null);
    //     });

    //     return () => {
    //         listener?.subscription.unsubscribe();
    //     };
    // }, []);

    // Firebase Auth

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth state changed. User:", currentUser);
            setUser(currentUser);
            if (currentUser) {
                checkUserProfile(currentUser);
            } else {
                setProducts([]);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const checkUserProfile = async (currentUser) => {
        if (!APPWRITE_PROFILES_COLLECTION_ID) {
            console.error("Profile check skipped: VITE_APPWRITE_PROFILES_COLLECTION_ID is not set.");
            return;
        }
        console.log(`Checking profile for user UID: ${currentUser.uid}`);
        try {
            await databases.getDocument(APPWRITE_DB_ID, APPWRITE_PROFILES_COLLECTION_ID, currentUser.uid);
            console.log("User profile found. User is not new.");
            // Profile exists, do nothing
        } catch (error) {
            // Appwrite throws an error if the document is not found, which is expected for new users.
            console.error("Error checking user profile:", error);
            if (error.code === 404) {
                console.log("Profile not found (404). Redirecting to /welcome");
                navigate('/welcome');
            } else {
                console.error("A different error occurred while checking profile. See details above.");
            }
        }
    };

    // Fetch products for the logged-in user
    const fetchUserProducts = async (currentUser) => {
        if (!currentUser) {
            setProducts([]);
            return;
        }
        try {
            const res = await databases.listDocuments(
                APPWRITE_DB_ID, // from .env
                APPWRITE_COLLECTION_ID, // from .env
                [Query.equal('user_id', currentUser.uid)] // Use server-side query
            );
            // The filtering is now done by the query, so we can use the documents directly
            setProducts(res.documents);
        } catch (err) {
            console.error("Failed to fetch user products:", err);
            setProducts([]);
        }
    };

    // Fetch products when user logs in
    useEffect(() => {
        if (user) {
            fetchUserProducts(user);
        } else {
            setProducts([]);
        }
    }, [user]);

    // Fetch products when switching to "products" or "profile" tab
    useEffect(() => {
        if ((activeTab === "products" || activeTab === "profile") && user) {
            fetchUserProducts(user);
        }
    }, [activeTab, user]);


    // Fetch chat history when user logs in or switches to the chat tab
    const fetchChatHistory = async (currentUser) => {
        if (!currentUser || !APPWRITE_CHAT_COLLECTION_ID) {
            // If no user or collection, start with a greeting
            setChatMessages([{
                id: 'greeting-new-user',
                type: 'bot',
                content: `Namaste! How can I help you grow your business today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            return;
        }

        try {
            const res = await databases.listDocuments(
                APPWRITE_DB_ID,
                APPWRITE_CHAT_COLLECTION_ID,
                [Query.equal('user_id', currentUser.uid), Query.orderAsc('$createdAt'), Query.limit(100)]
            );

            const userMessages = res.documents.map(doc => ({
                id: doc.$id,
                type: doc.type,
                content: doc.content,
                session_id: doc.session_id, // Include session_id
                rawCreatedAt: doc.$createdAt, // Keep raw date for processing
                timestamp: new Date(doc.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            setAllUserMessages(userMessages); // Store all messages for session management

            if (userMessages.length === 0) {
                // If no history, add dynamic greeting
                setChatMessages([{
                    id: 'greeting',
                    type: 'bot',
                    content: `Namaste ${getUserDisplayName(currentUser)}! How can I help you grow your business today?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                processChatHistoryToSessions([]); // Clear sessions
            } else {
                setChatMessages(userMessages);
                processChatHistoryToSessions(userMessages); // Process messages into sessions
                // Set the current session to the most recent one
                if (userMessages.length > 0) {
                    setCurrentSessionId(userMessages[userMessages.length - 1].session_id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
            // On error, fall back to a generic, friendly greeting without mentioning the error.
            setChatMessages([{
                id: 'greeting-error',
                type: 'bot',
                content: `Namaste ${getUserDisplayName(currentUser)}! How can I help you grow your business today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    // Fetch chat history when the chat tab becomes active
    useEffect(() => {
        if (activeTab === 'ai-chat' && user) {
            fetchChatHistory(user);
        }
    }, [activeTab, user]);


    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;

        const currentChatInput = chatInput;
        setChatInput('');

        // Determine the session ID for the new message
        const sessionId = currentSessionId || ID.unique();
        if (!currentSessionId) {
            setCurrentSessionId(sessionId);
        }

        const userMessage = {
            id: ID.unique(),
            type: 'user',
            content: currentChatInput,
            session_id: sessionId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawCreatedAt: new Date().toISOString(),
        };

        // History for backend should be from the state *before* adding the new message.
        // And it should not include greeting messages.
        const historyForBackend = chatMessages
            .filter(m => !m.id.startsWith('greeting'))
            .slice(-5)
            .map(msg => ({
                role: msg.type === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
        
        // Optimistically update UI
        // If the current view is a greeting, replace it. Otherwise append.
        const newViewMessages = chatMessages.some(m => m.id.startsWith('greeting'))
            ? [userMessage]
            : [...chatMessages, userMessage];

        setChatMessages(newViewMessages);
        setIsLoading(true);

        try {
            const payload = {
                history: historyForBackend,
                current_query: currentChatInput,
                language: language // Pass selected language
            };

            // Connect to backend using backendURL from .env
            const response = await fetch(`${backendURL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `API call failed`);
            }

            const result = await response.json();

            const aiResponse = {
                id: ID.unique(), // Use Appwrite ID for key
                type: 'bot',
                content: result.reply,
                session_id: sessionId,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rawCreatedAt: new Date().toISOString(),
            };
            setChatMessages(prev => [...prev, aiResponse]);

            // --- Persist and update global state ---
            if (user && APPWRITE_CHAT_COLLECTION_ID) {
                // Save user message
                await databases.createDocument(
                    APPWRITE_DB_ID,
                    APPWRITE_CHAT_COLLECTION_ID,
                    userMessage.id,
                    { user_id: user.uid, type: 'user', content: userMessage.content, session_id: sessionId }
                );
                // Save AI response
                await databases.createDocument(
                    APPWRITE_DB_ID,
                    APPWRITE_CHAT_COLLECTION_ID,
                    aiResponse.id, // Use same ID for consistency
                    { user_id: user.uid, type: 'bot', content: aiResponse.content, session_id: sessionId }
                );
                
                // Update the global message list and re-process sessions
                const newAllMessages = [...allUserMessages, userMessage, aiResponse];
                setAllUserMessages(newAllMessages);
                processChatHistoryToSessions(newAllMessages);
            }
            // ------------------------------------

        } catch (error) {
            console.error("Error fetching AI response from backend:", error);
            const errorResponse = {
                id: Date.now() + 1,
                type: 'bot',
                content: `Oops! Something went wrong. ${error.message}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAskAI = () => {
        setActiveTab('ai-chat');
    };

    const handleNewChat = () => {
        // Resets the chat to the initial greeting state
        setCurrentSessionId(null); // This is the key change to start a new session
        if (user) {
            setChatMessages([{
                id: 'greeting-new-chat',
                type: 'bot',
                content: `Namaste ${getUserDisplayName(user)}! How can I help you grow your business today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } else {
            setChatMessages([{
                id: 'greeting-generic',
                type: 'bot',
                content: `Namaste! How can I help you grow your business today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const handleSessionClick = (sessionId) => {
        const sessionMessages = allUserMessages.filter(msg => msg.session_id === sessionId);
        setChatMessages(sessionMessages);
        setCurrentSessionId(sessionId);
    };

    const getUserDisplayName = (user) => {
        if (!user) return " ";

        if (user.displayName) return user.displayName.split(" ")[0];
        if (user.email) return user.email.split("@")[0];
        return "User";
    };

    // Update quickActions to handle Add Product navigation
    const handleQuickAction = (actionLabel) => {
        if (actionLabel === 'Add Product') {
            setActiveTab('addProduct');
        } else if (actionLabel === 'View your products') {
            navigate('/products');
        } else if (actionLabel === 'View Local Trends') {
            setActiveTab('trends');
        }
    };

    const handleBackToDashboard = () => {
        setActiveTab('dashboard');
    };

    const handleAddProduct = (product) => {
        setProducts((prev) => [product, ...prev]);
    };

    const renderDashboard = () => (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Good Morning, {getUserDisplayName(user)} 👋
                </h2>
                <p className="text-gray-600 mb-4">Ready to boost your sales today?</p>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="font-semibold text-gray-800">Saathi AI Suggestion</p>
                            <p className="text-gray-600">"Want help planning for the festive season?" 💬</p>
                        </div>
                        <button
                            className="ml-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            onClick={handleAskAI}
                        >
                            Ask AI
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Weekly Summary */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6" />
                    <h3 className="text-xl font-bold">AI Weekly Summary</h3>
                </div>
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2">📊 This Week's Focus:</h4>
                    <p className="text-sm">{aiWeeklySummary.focus}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 font-semibold mb-2">
                            <TrendingUp className="w-5 h-5 text-green-300" />
                            <span>Opportunity</span>
                        </div>
                        <p>{aiWeeklySummary.opportunity}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 font-semibold mb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-300" />
                            <span>Caution</span>
                        </div>
                        <p>{aiWeeklySummary.caution}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 font-semibold mb-2">
                            <Target className="w-5 h-5 text-red-300" />
                            <span>Action</span>
                        </div>
                        <p>{aiWeeklySummary.action}</p>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <card.icon className="w-8 h-8 text-blue-600" />
                            {card.trend && (
                                <span className={`flex items-center gap-1 text-sm ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {card.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                    {card.change}
                                </span>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
                        <p className="text-gray-600 text-sm">{card.title}</p>
                        {card.subtitle && <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>}
                    </div>
                ))}
            </div>


            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-3`}
                            onClick={() => handleQuickAction(action.label)}
                        >
                            <action.icon className="w-5 h-5" />
                            <span className="font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Inventory Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Details */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">PRODUCT DETAILS</h3>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">This Month</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Low Stock Items</span>
                                <span className="text-lg font-semibold text-red-600">9</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">All Item Groups</span>
                                <span className="text-lg font-semibold text-gray-800">2</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">All Items</span>
                                <span className="text-lg font-semibold text-gray-800">21</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Unconfirmed Items</span>
                                <span className="text-lg font-semibold text-gray-800">0</span>
                            </div>
                        </div>
                        {/* 
                        <div className="flex items-center justify-center">
                            <div className="relative w-24 h-24">
                                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-green-400 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">100%</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs text-gray-600 mt-8">Active Items</span>
                                </div>
                            </div>
                        </div>
                        */}
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">TOP SELLING ITEMS</h3>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">This Month</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg mb-2 flex items-center justify-center mx-auto">
                                <Package className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-600 mb-1">silk saree</p>
                            <p className="text-sm font-semibold text-gray-800">52 <span className="text-xs text-gray-500">pcs</span></p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg mb-2 flex items-center justify-center mx-auto">
                                <div className="w-6 h-6 bg-blue-400 rounded"></div>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">Multi-color Bedsheet</p>
                            <p className="text-sm font-semibold text-gray-800">41 <span className="text-xs text-gray-500">pcs</span></p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg mb-2 flex items-center justify-center mx-auto">
                                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">Cotton kurti</p>
                            <p className="text-sm font-semibold text-gray-800">13 <span className="text-xs text-gray-500">pcs</span></p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg mb-2 flex items-center justify-center mx-auto">
                                <div className="w-6 h-6 bg-teal-400 rounded"></div>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">Dupatta</p>
                            <p className="text-sm font-semibold text-gray-800">14 <span className="text-xs text-gray-500">pcs</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Order & Sales Order */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">PURCHASE ORDER</h3>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">This Month</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">PO-2024-001</p>
                                    <p className="text-xs text-gray-600">Silk Saree Collection</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">₹45,000</p>
                                <p className="text-xs text-green-600">Delivered</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">PO-2024-002</p>
                                    <p className="text-xs text-gray-600">Traditional Jewelry</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">₹28,500</p>
                                <p className="text-xs text-orange-600">Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">PO-2024-003</p>
                                    <p className="text-xs text-gray-600">Festival Decorations</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">₹12,200</p>
                                <p className="text-xs text-blue-600">Processing</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total Orders: 3</span>
                            <span className="font-semibold text-gray-800">₹85,700</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">SALES ORDER</h3>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">This Month</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">SO-2024-015</p>
                                    <p className="text-xs text-gray-600">Banarasi Silk Saree</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">₹8,500</p>
                                <p className="text-xs text-green-600">Completed</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">SO-2024-016</p>
                                    <p className="text-xs text-gray-600">Gold Plated Earrings</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">₹2,200</p>
                                <p className="text-xs text-blue-600">Shipped</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">SO-2024-017</p>
                                    <p className="text-xs text-gray-600">Rakhi Gift Set</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">₹1,800</p>
                                <p className="text-xs text-yellow-600">Confirmed</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">SO-2024-018</p>
                                    <p className="text-xs text-gray-600">Traditional Kurta Set</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">₹3,500</p>
                                <p className="text-xs text-pink-600">New</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total Orders: 4</span>
                            <span className="font-semibold text-gray-800">₹16,000</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

    const renderAIChat = () => (
        <div className="flex h-full">
            {/* Chat History Sidebar */}
            <div className="w-80 bg-[#0f172a] border-r border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Chat History</h3>
                    <button
                        onClick={handleNewChat}
                        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
                        title="Start New Chat"
                    >
                        <PlusCircle className="w-4 h-4" />
                        New Chat
                    </button>
                </div>
                <div className="space-y-2">
                    {chatSessions.length > 0 ? (
                        chatSessions.map((chat) => (
                            <div
                                key={chat.id}
                                className="p-3 rounded-lg border border-gray-700 hover:bg-[#1e293b] cursor-pointer bg-[#1e293b] text-gray-100"
                                onClick={() => handleSessionClick(chat.id)}
                            >
                                <h4 className="font-medium text-gray-100 text-sm truncate">{chat.preview}</h4>
                                <p className="text-xs text-gray-400 mt-1">{chat.time}</p>
                                <span className="text-xs text-gray-500 mt-2 block">{chat.title.replace('Chat from ', '')}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 text-sm py-8">
                            No chat history found.
                            <br />
                            Start a new conversation!
                        </div>
                    )}
                </div>
            </div>


            <div className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                <p className="text-sm whitespace-pre-line">{message.content}</p>
                                <span className="text-xs opacity-75 mt-1 block">{message.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800 animate-pulse">
                                <p className="text-sm">Saathi AI is typing…</p>
                            </div>
                        </div>
                    )}
                </div>


                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Smart Suggestions</h4>
                            <div className="flex flex-wrap gap-2">
                                {chatSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setChatInput(suggestion)}
                                        className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-50 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="hinglish">Hinglish</option>
                                <option value="english">English</option>
                                <option value="hindi">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>


                <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message... (Hindi, English, Hinglish supported)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            <Mic className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            <Camera className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Input Modes: Type ✍️ | Voice 🎤 | Upload Photo 📸</p>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'ai-chat':
                return renderAIChat();
            case 'inventory':
                return <InventoryPlanner />;
            case 'listing':
                return <ProductListingGenerator />;
            case 'trends':
                return <TrendsInsightsPage />;
            case 'orders':
                return <OrdersReturnsPage />;
            case 'profile':
                return user ? <Profile user={user} /> : <div className="p-8 text-center text-gray-500">Please login to view your profile.</div>;
            case 'products':
                return user ? <Products user={user} /> : <div className="p-8 text-center text-gray-500">Please login to view your products.</div>;
            case 'addProduct':
                return user ? (
                    <AddProduct
                        onAddProduct={handleAddProduct}
                        user={user}
                        setProducts={setProducts}
                        onBack={handleBackToDashboard}
                    />
                ) : (
                    <div className="p-8 text-center text-gray-500">Please login to add products.</div>
                );
            default:
                return (
                    <div className="p-6 text-center">
                        <div className="bg-gray-100 rounded-lg p-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {sidebarItems.find(item => item.id === activeTab)?.label}
                            </h3>
                            <p className="text-gray-600">/.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen bg-[#1e293b] flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-gray-300 border-r border-gray-200 sticky top-0 h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">SAATHI</h1>
                    <p className="text-sm text-gray-600">AI Copilot</p>
                    {/* Show Login button if not logged in, else show user info and logout */}
                    {!user ? (
                        <button
                            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    ) : (
                        <div className="mt-4 flex flex-col items-center">
                            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {user.email[0].toUpperCase()}
                            </div>
                            <div className="mt-2 text-gray-800 text-sm font-medium">{user.email}</div>
                            <button
                                className="mt-2 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 transition-colors"
                                onClick={async () => {
                                    await signOut(auth); // <-- Use Firebase signOut
                                    setUser(null);
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === item.id
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                {/* Top navbar removed */}
                <div className="flex-1 overflow-y-auto bg-[#1e293b]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;