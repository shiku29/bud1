import React, { useState, useEffect } from 'react';
import {
    Home, Bot, Package, Edit3, TrendingUp, RotateCcw, User, Globe, Search, Bell, Plus, Star, ArrowUp, ArrowDown, Zap, AlertTriangle, Target
} from 'lucide-react';
import InventoryPlanner from './InventoryPlanner';
import ProductListingGenerator from './ProductListingGenerator';
import TrendsInsightsPage from './TrendsInsightsPage';
import OrdersReturnsPage from './OrdersReturnsPage';
import Profile from './Profile';
import Products from "./Products";
import AddProduct from "./AddProduct";
import AICopilotChat from "./AICopilotChat"; // Import the new component
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../auth/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { databases, ID } from "../appwrite/client";
import { Query } from "appwrite";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID;

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifications] = useState([
        { id: 1, text: 'Raksha Bandhan next week – prepare stock!', type: 'festival', time: '2 hours ago' },
        { id: 2, text: 'Your silk saree listing got 50 views today', type: 'success', time: '4 hours ago' },
        { id: 3, text: 'Low stock alert: Traditional earrings', type: 'warning', time: '1 day ago' }
    ]);
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

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
        { label: 'View your products', icon: Package, color: 'bg-purple-500' }
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('view') === 'addProduct') {
            setActiveTab('addProduct');
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

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
        } catch (error) {
            console.error("Error checking user profile:", error);
            if (error.code === 404) {
                console.log("Profile not found (404). Redirecting to /welcome");
                navigate('/welcome');
            } else {
                console.error("A different error occurred while checking profile. See details above.");
            }
        }
    };

    const fetchUserProducts = async (currentUser) => {
        if (!currentUser) {
            setProducts([]);
            return;
        }
        try {
            const res = await databases.listDocuments(
                APPWRITE_DB_ID,
                APPWRITE_COLLECTION_ID,
                [Query.equal('user_id', currentUser.uid)]
            );
            setProducts(res.documents);
        } catch (err) {
            console.error("Failed to fetch user products:", err);
            setProducts([]);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserProducts(user);
        } else {
            setProducts([]);
        }
    }, [user]);

    const getUserDisplayName = (user) => {
        if (!user) return " ";
        if (user.displayName) return user.displayName.split(" ")[0];
        if (user.email) return user.email.split("@")[0];
        return "User";
    };
    
    const handleAskAI = () => {
        setActiveTab('ai-chat');
    };

    const handleQuickAction = (actionLabel) => {
        if (actionLabel === 'Add Product') setActiveTab('addProduct');
        else if (actionLabel === 'View your products') navigate('/products');
        else if (actionLabel === 'View Local Trends') setActiveTab('trends');
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
                        <button key={index} className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-3`}
                            onClick={() => handleQuickAction(action.label)}>
                            <action.icon className="w-5 h-5" />
                            <span className="font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'ai-chat': return <AICopilotChat user={user} getUserDisplayName={getUserDisplayName} />;
            case 'inventory': return <InventoryPlanner />;
            case 'listing': return <ProductListingGenerator />;
            case 'trends': return <TrendsInsightsPage />;
            case 'orders': return <OrdersReturnsPage />;
            case 'profile': return user ? <Profile user={user} /> : <div className="p-8 text-center text-gray-500">Please login to view your profile.</div>;
            case 'products': return user ? <Products user={user} /> : <div className="p-8 text-center text-gray-500">Please login to view your products.</div>;
            case 'addProduct':
                return user ? (
                    <AddProduct onAddProduct={handleAddProduct} user={user} setProducts={setProducts} onBack={handleBackToDashboard} />
                ) : (
                    <div className="p-8 text-center text-gray-500">Please login to add products.</div>
                );
            default:
                return (
                    <div className="p-6 text-center">
                        <div className="bg-gray-100 rounded-lg p-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{sidebarItems.find(item => item.id === activeTab)?.label}</h3>
                            <p className="text-gray-600">This page is under construction.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen bg-[#1e293b] flex">
            <div className="w-64 bg-white border-r border-gray-200 sticky top-0 h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Bud AI</h1>
                    <p className="text-sm text-gray-600">Your Business Copilot</p>
                    {!user ? (
                        <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700" onClick={() => navigate("/login")}>
                            Login
                        </button>
                    ) : (
                        <div className="mt-4 flex flex-col items-center">
                            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {user.email[0].toUpperCase()}
                            </div>
                            <div className="mt-2 text-gray-800 text-sm font-medium">{user.email}</div>
                            <button className="mt-2 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                                onClick={async () => {
                                    await signOut(auth);
                                    setUser(null);
                                }}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;