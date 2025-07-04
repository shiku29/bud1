import React, { useState } from 'react';
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
        { label: 'Ask AI a Question', icon: MessageSquare, color: 'bg-purple-500' }
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

    const handleSendMessage = () => {
        if (chatInput.trim()) {
            const newMessage = {
                id: chatMessages.length + 1,
                type: 'user',
                content: chatInput,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages([...chatMessages, newMessage]);
            setChatInput('');


            setTimeout(() => {
                const aiResponse = {
                    id: chatMessages.length + 2,
                    type: 'bot',
                    content: 'I understand your query. Let me analyze your data and provide personalized recommendations...',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setChatMessages(prev => [...prev, aiResponse]);
            }, 1000);
        }
    };

    const renderDashboard = () => (
        <div className="p-6 space-y-6">

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Good Morning, Rani Devi 👋</h2>
                <p className="text-gray-600 mb-4">Ready to boost your sales today?</p>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="font-semibold text-gray-800">Saathi AI Suggestion</p>
                            <p className="text-gray-600">"Want help planning for the festive season?" 💬</p>
                        </div>
                        <button className="ml-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
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
                        >
                            <action.icon className="w-5 h-5" />
                            <span className="font-medium">{action.label}</span>
                        </button>
                    ))}
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
            <div className="w-80 bg-white border-r border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Chat History</h3>
                <div className="space-y-2">
                    {chatHistory.map((chat) => (
                        <div key={chat.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <h4 className="font-medium text-gray-800 text-sm">{chat.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{chat.preview}</p>
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
                </div>


                <div className="px-6 py-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Smart Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                        {chatSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => setChatInput(suggestion)}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
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
        <div className="h-screen bg-gray-50 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 sticky top-0 h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Buddy</h1>
                    <p className="text-sm text-gray-600">AI Copilot</p>
                </div>

                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === item.id
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
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

                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search products, orders, insights..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notificat */}
                        <div className="relative">
                            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            </button>
                        </div>


                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">R</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 text-sm">Rani Devi</p>
                                <p className="text-xs text-gray-600">Seller</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        </div>
                    </div>
                </div>


                <div className="flex-1 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;