import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MapPin, Target, AlertTriangle, Calendar, Filter, RefreshCw, Eye, Zap, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TrendsInsightsPage = () => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('week');
    const [selectedCategory, setSelectedCategory] = useState('kurtis');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // Personalized AI Insight Cards
    const personalizedInsights = [
        {
            location: 'Jaipur',
            trend: 'Cotton Anarkali Sets',
            change: '+32%',
            period: '10 days',
            type: 'opportunity',
            message: 'Cotton Anarkali sets are trending in Jaipur. 32% rise in searches over last 10 days. You sell similar items — consider boosting stock.',
            action: 'Promote now',
            icon: '🔥',
            color: 'bg-green-50 border-green-200',
            actionColor: 'bg-green-500 text-white'
        },
        {
            location: 'Lucknow',
            trend: 'Wool Kurtas',
            change: '-28%',
            period: '7 days',
            type: 'warning',
            message: 'Avoid restocking wool kurtas in Lucknow — return rate rising due to heat.',
            action: 'Avoid restock',
            icon: '⚠️',
            color: 'bg-red-50 border-red-200',
            actionColor: 'bg-red-500 text-white'
        },
        {
            location: 'Delhi NCR',
            trend: 'Printed Dupattas',
            change: '+45%',
            period: '5 days',
            type: 'trending',
            message: 'Printed Dupattas seeing massive demand for upcoming Karva Chauth. Stock up on festive colors.',
            action: 'Stock up',
            icon: '🚀',
            color: 'bg-blue-50 border-blue-200',
            actionColor: 'bg-blue-500 text-white'
        },
        {
            location: 'Mumbai',
            trend: 'Light Fabrics',
            change: '+67%',
            period: '3 days',
            type: 'seasonal',
            message: 'Monsoon ending, light cotton fabrics in high demand. Perfect timing for your cotton collection.',
            action: 'Push cotton',
            icon: '☀️',
            color: 'bg-yellow-50 border-yellow-200',
            actionColor: 'bg-yellow-500 text-white'
        }
    ];

    // Category-wise trend data
    const categoryData = {
        kurtis: [
            { period: 'Week 1', searches: 1200, purchases: 340, events: null },
            { period: 'Week 2', searches: 1450, purchases: 410, events: null },
            { period: 'Week 3', searches: 1100, purchases: 290, events: null },
            { period: 'Week 4', searches: 1780, purchases: 520, events: 'Karva Chauth' },
            { period: 'Week 5', searches: 2100, purchases: 650, events: null },
        ],
        sarees: [
            { period: 'Week 1', searches: 800, purchases: 220, events: null },
            { period: 'Week 2', searches: 950, purchases: 280, events: null },
            { period: 'Week 3', searches: 1200, purchases: 350, events: 'Diwali Prep' },
            { period: 'Week 4', searches: 1600, purchases: 480, events: null },
            { period: 'Week 5', searches: 1800, purchases: 520, events: null },
        ],
        jewelry: [
            { period: 'Week 1', searches: 600, purchases: 150, events: null },
            { period: 'Week 2', searches: 720, purchases: 180, events: null },
            { period: 'Week 3', searches: 890, purchases: 220, events: null },
            { period: 'Week 4', searches: 1100, purchases: 290, events: 'Festive Season' },
            { period: 'Week 5', searches: 1250, purchases: 340, events: null },
        ]
    };

    // Heat map data with PIN code hotspots
    const hotspots = [
        { area: 'Connaught Place', pincode: '110001', city: 'Delhi', sales: 47, trend: 'up', product: 'Designer Kurtis' },
        { area: 'Bandra West', pincode: '400050', city: 'Mumbai', sales: 32, trend: 'up', product: 'Casual Wear' },
        { area: 'Koramangala', pincode: '560095', city: 'Bangalore', sales: 28, trend: 'up', product: 'Ethnic Wear' },
        { area: 'Anna Nagar', pincode: '600040', city: 'Chennai', sales: 25, trend: 'stable', product: 'Sarees' },
        { area: 'Hazratganj', pincode: '226001', city: 'Lucknow', sales: 22, trend: 'down', product: 'Traditional Wear' },
        { area: 'Park Street', pincode: '700016', city: 'Kolkata', sales: 20, trend: 'up', product: 'Festive Wear' },
        { area: 'Malviya Nagar', pincode: '302017', city: 'Jaipur', sales: 18, trend: 'up', product: 'Anarkali Sets' },
        { area: 'Ashram Road', pincode: '380009', city: 'Ahmedabad', sales: 15, trend: 'stable', product: 'Cotton Kurtis' },
    ];

    // Trending products similar to seller's inventory
    const trendingProducts = [
        {
            product: 'Cotton Kurti Set (Printed)',
            trend: '+32%',
            avgPrice: '₹799',
            action: 'Promote Now',
            similarity: 95,
            icon: '🔥',
            actionType: 'promote'
        },
        {
            product: 'Silk Dupatta (Embroidered)',
            trend: '+18%',
            avgPrice: '₹449',
            action: 'Good Demand',
            similarity: 88,
            icon: '📈',
            actionType: 'maintain'
        },
        {
            product: 'Palazzo Set (Rayon)',
            trend: '+25%',
            avgPrice: '₹599',
            action: 'Stock Up',
            similarity: 92,
            icon: '⚡',
            actionType: 'stock'
        },
        {
            product: 'Silk Dupatta (Plain)',
            trend: '-12%',
            avgPrice: '₹249',
            action: 'Low Demand',
            similarity: 75,
            icon: '👀',
            actionType: 'watch'
        },
        {
            product: 'Heavy Lehenga Sets',
            trend: '-35%',
            avgPrice: '₹1299',
            action: 'Avoid',
            similarity: 60,
            icon: '⚠️',
            actionType: 'avoid'
        }
    ];

    // Top returned products matching seller's listings
    const returnedProducts = [
        {
            product: 'Cotton Printed Kurtis',
            returnRate: '18%',
            mainReason: 'Size Issue',
            otherReasons: ['Color Mismatch', 'Fabric Quality'],
            suggestion: 'Add detailed size chart and fabric description',
            similarity: 'Items like yours'
        },
        {
            product: 'Rayon Palazzo Sets',
            returnRate: '15%',
            mainReason: 'Fabric Mismatch',
            otherReasons: ['Size Issue', 'Color Fade'],
            suggestion: 'Highlight rayon care instructions',
            similarity: 'Similar to your listings'
        },
        {
            product: 'Woolen Kurtas',
            returnRate: '42%',
            mainReason: 'Seasonality',
            otherReasons: ['Too Warm', 'Heavy Feel'],
            suggestion: 'Remove from active listings until winter',
            similarity: 'Matches your inventory'
        }
    ];

    const categories = ['kurtis', 'sarees', 'jewelry', 'lehenga', 'dupatta'];

    const refreshData = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    const getTrendIcon = (trend) => {
        if (trend.includes('+')) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend.includes('-')) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    };

    const getActionButtonClass = (actionType) => {
        switch (actionType) {
            case 'promote': return 'bg-green-500 text-white hover:bg-green-600';
            case 'stock': return 'bg-blue-500 text-white hover:bg-blue-600';
            case 'maintain': return 'bg-yellow-500 text-white hover:bg-yellow-600';
            case 'watch': return 'bg-gray-500 text-white hover:bg-gray-600';
            case 'avoid': return 'bg-red-500 text-white hover:bg-red-600';
            default: return 'bg-blue-500 text-white hover:bg-blue-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            📊 Your Personalized Trends
                        </h1>
                        <p className="text-gray-600 text-lg">
                            AI-powered insights tailored to your business
                        </p>
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>

                {/* Personalized AI Insight Cards */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Personalized Trend Summary</h2>
                    <div className="grid lg:grid-cols-2 gap-4">
                        {personalizedInsights.map((insight, index) => (
                            <div key={index} className={`p-4 rounded-xl border-2 ${insight.color} hover:shadow-lg transition-shadow`}>
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl">{insight.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {insight.location}
                                            </span>
                                            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                {getTrendIcon(insight.change)}
                                                {insight.change}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-800 mb-1">{insight.trend}</h3>
                                        <p className="text-gray-700 text-sm mb-3">{insight.message}</p>
                                        <button className={`px-3 py-1 rounded-full text-xs font-medium ${insight.actionColor}`}>
                                            {insight.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trend Graph */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">📈 Buyer Interest Over Time</h2>
                        <div className="flex gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 capitalize"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium capitalize">"{selectedCategory}"</span> saw a <span className="font-bold text-green-600">+47%</span> spike in your district during last 15 days.
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={categoryData[selectedCategory]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                                                <p className="font-medium">{label}</p>
                                                <p className="text-blue-600">Searches: {data.searches}</p>
                                                <p className="text-green-600">Purchases: {data.purchases}</p>
                                                {data.events && (
                                                    <p className="text-purple-600 font-medium">📅 {data.events}</p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="searches" stroke="#3b82f6" strokeWidth={3} name="Searches" />
                            <Line type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={3} name="Purchases" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Heat Map and Trending Products */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Heat Map */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-600" />
                            PIN-Code Hotspots
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {hotspots.map((spot, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-800">{spot.area}</h3>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {spot.pincode}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{spot.city} • {spot.product}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">{spot.sales}</span>
                                        {spot.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                                        {spot.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                                        {spot.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trending Products */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Trending Products (Similar to Yours)
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Product</th>
                                        <th className="text-center py-2">Trend</th>
                                        <th className="text-center py-2">Avg. Price</th>
                                        <th className="text-center py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trendingProducts.map((product, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{product.icon}</span>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{product.product}</p>
                                                        <p className="text-xs text-gray-500">{product.similarity}% match</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-3">
                                                <span className={`font-bold ${product.trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                                                    {product.trend}
                                                </span>
                                            </td>
                                            <td className="text-center py-3 font-medium">{product.avgPrice}</td>
                                            <td className="text-center py-3">
                                                <button className={`px-3 py-1 rounded-full text-xs font-medium ${getActionButtonClass(product.actionType)}`}>
                                                    {product.action}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Top Returned Products */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Top Returned Products (Match with Your Listings)
                    </h2>
                    <div className="grid lg:grid-cols-3 gap-4">
                        {returnedProducts.map((item, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800">{item.product}</h3>
                                    <span className="text-red-600 font-bold">{item.returnRate}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{item.similarity}</p>
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700">Main reason: {item.mainReason}</p>
                                    <p className="text-xs text-gray-500">Also: {item.otherReasons.join(', ')}</p>
                                </div>
                                <div className="bg-white p-2 rounded border border-red-200">
                                    <p className="text-xs font-medium text-gray-700">💡 Suggestion:</p>
                                    <p className="text-xs text-gray-600">{item.suggestion}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Summary Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6" />
                        AI Weekly Summary
                    </h2>
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                        <p className="text-lg font-medium mb-2">📊 This Week's Focus:</p>
                        <p className="text-white/90 leading-relaxed">
                            <strong>Focus on cotton pastel sets for Karva Chauth.</strong> High demand in your zone with 67% increase in searches.
                            <strong> Promote your top listings</strong> and restock light fabrics immediately.
                            <strong> Avoid wool items</strong> — return rate spiking 42% due to heat wave in North India.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white bg-opacity-10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-green-300" />
                                <span className="font-medium">Opportunity</span>
                            </div>
                            <p className="text-sm text-white/90">Cotton kurtis, palazzo sets, light dupattas</p>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-300" />
                                <span className="font-medium">Caution</span>
                            </div>
                            <p className="text-sm text-white/90">Heavy fabrics, wool items, dark colors</p>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-blue-300" />
                                <span className="font-medium">Action</span>
                            </div>
                            <p className="text-sm text-white/90">Boost cotton inventory, update size charts</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendsInsightsPage;