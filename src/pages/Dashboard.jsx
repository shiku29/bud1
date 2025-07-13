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
    Zap
} from 'lucide-react';
import InventoryPlanner from './InventoryPlanner';
import ProductListingGenerator from './ProductListingGenerator';
import TrendsInsightsPage from './TrendsInsightsPage';
import OrdersReturnsPage from './OrdersReturnsPage';
import Profile from './Profile';
import Products from "./Products";
import AddProduct from "./AddProduct";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { databases } from "../appwrite/client"; // Add this import at the top
// If using Appwrite v10+, also import Query: import { Query } from "appwrite";



const backendURL = import.meta.env.VITE_BACKEND_URL;
const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [chatMessages, setChatMessages] = useState([
        { id: 1, type: 'bot', content: 'Namaste Rani Devi! How can I help you grow your business today?', timestamp: '10:30 AM' },
        { id: 2, type: 'user', content: 'What should I stock for Raksha Bandhan?', timestamp: '10:32 AM' },
        { id: 3, type: 'bot', content: 'Based on local trends, I recommend stocking:\n• Rakhi sets (silk threads perform 40% better)\n• Sweets boxes (Kaju Katli & Rasgulla top sellers)\n• Gift wrapping materials\n• Brothers\' gifts under ₹500\n\nShall I help you create listings for these?', timestamp: '10:33 AM' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [notifications] = useState([
        { id: 1, text: 'Raksha Bandhan next week – prepare stock!', type: 'festival', time: '2 hours ago' },
        { id: 2, text: 'Your silk saree listing got 50 views today', type: 'success', time: '4 hours ago' },
        { id: 3, text: 'Low stock alert: Traditional earrings', type: 'warning', time: '1 day ago' }
    ]);
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);

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
            setUser(currentUser);
            if (!currentUser) setProducts([]);
        });
        return () => unsubscribe();
    }, []);

    // Fetch products for the logged-in user
    const fetchUserProducts = async (currentUser) => {
        if (!currentUser) {
            setProducts([]);
            return;
        }
        try {
            const res = await databases.listDocuments(
                APPWRITE_DB_ID, // from .env
                APPWRITE_COLLECTION_ID // from .env
                // For Appwrite v10+, use: [Query.equal('user_id', currentUser.uid)]
            );
            // For Appwrite v9, filter manually:
            const userProducts = res.documents.filter(doc => doc.user_id === currentUser.uid);
            setProducts(userProducts);
        } catch (err) {
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

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;

        const newMessage = {
            id: Date.now(),
            type: 'user',
            content: chatInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const currentChatInput = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const historyForBackend = chatMessages.slice(-5).map(msg => ({
                role: msg.type === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const payload = {
                history: historyForBackend,
                current_query: currentChatInput
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
                id: Date.now() + 1,
                type: 'bot',
                content: result.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, aiResponse]);

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

    const getUserDisplayName = (user) => {
        if (!user) return " ";

        if (user.displayName) return user.displayName.split(" ")[0];
        if (user.email) return user.email.split("@")[0];
        return "User";
    };

    // Update quickActions to handle Add Product navigation
    const handleQuickAction = (actionLabel) => {
        if (actionLabel === "Add Product") {
            setActiveTab("add-product");
        } else if (actionLabel === "View your products") {
            navigate("/products"); // <-- open new page
        }
        // You can handle other quick actions here if needed
    };

    // Pass this to AddProduct
    const handleAddProduct = (product) => {
        setProducts(prev => [...prev, product]);
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

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Your "Traditional Silk Saree" listing got 15 new views</span>
                        <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">AI suggested 3 new products for your inventory</span>
                        <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Festival season preparation reminder</span>
                        <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAIChat = () => (
        <div className="flex h-full">
            {/* Chat History Sidebar */}
            <div className="w-80 bg-[#0f172a] border-r border-gray-200 p-4"> {/* Changed to darkest blue */}
                <h3 className="text-lg font-semibold text-white mb-4">Chat History</h3>
                <div className="space-y-2">
                    {chatHistory.map((chat) => (
                        <div
                            key={chat.id}
                            className="p-3 rounded-lg border border-gray-700 hover:bg-[#1e293b] cursor-pointer bg-[#1e293b] text-gray-100"
                        >
                            <h4 className="font-medium text-gray-100 text-sm">{chat.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{chat.preview}</p>
                            <span className="text-xs text-gray-500 mt-2 block">{chat.time}</span>
                        </div>
                    ))}
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
                return user ? <Profile products={products} /> : <div className="p-8 text-center text-gray-500">Please login to view your profile.</div>;
            case 'products':
                return user ? <Products products={products} /> : <div className="p-8 text-center text-gray-500">Please login to view your products.</div>;
            case 'add-product':
                return user ? (
                    <AddProduct
                        onAddProduct={handleAddProduct}
                        user={user}
                        setProducts={setProducts}
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