import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MapPin, Target, AlertTriangle, Calendar, Filter, RefreshCw, Eye, Zap, Clock, AlertCircle, Flame, Rocket, Sun } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TrendsInsightsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('kurtis');
    const [selectedRegion, setSelectedRegion] = useState('Delhi');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${backendURL}/api/trends/full-trends-report?location=${selectedRegion}&category=${selectedCategory}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
                throw new Error(errorData.detail || 'Failed to fetch data');
            }
            const data = await response.json();
            setTrendsData(data);
        } catch (error) {
            setError(error.message);
            console.error("Failed to fetch trends data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCategory, selectedRegion]);

    const refreshData = () => {
        fetchData();
    };

    const {
        personalizedInsights = [],
        categoryData = [],
        hotspots = [],
        trendingProducts = [],
        returnedProducts = []
    } = trendsData || {};

    const getTrendIcon = (trend, size = 'w-5 h-5') => {
        if (!trend) return null;
        // For percentage strings like '+25%' or '-10%'
        if (trend.includes('+')) return <TrendingUp className={`${size} text-green-500`} />;
        if (trend.includes('-')) return <TrendingDown className={`${size} text-red-500`} />;
        // For word strings like 'up' or 'down' from hotspots
        if (trend.toLowerCase() === 'up') return <TrendingUp className={`${size} text-green-500`} />;
        if (trend.toLowerCase() === 'down') return <TrendingDown className={`${size} text-red-500`} />;
        // Fallback for 'stable' or other cases
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    };

    const getActionButtonClass = (actionType) => {
        switch (actionType) {
            case 'Promote Now': return 'bg-green-500 text-white hover:bg-green-600';
            case 'Stock Up': return 'bg-blue-500 text-white hover:bg-blue-600';
            case 'Good Demand': return 'bg-yellow-500 text-white hover:bg-yellow-600';
            case 'Low Demand': return 'bg-gray-500 text-white hover:bg-gray-600';
            case 'Avoid': return 'bg-red-500 text-white hover:bg-red-600';
            default: return 'bg-indigo-500 text-white hover:bg-indigo-600';
        }
    };

    const InsightCard = ({ insight }) => {
        const getInsightIcon = (type) => {
            switch (type) {
                case 'opportunity':
                    return <Flame className="w-5 h-5 text-orange-500" />;
                case 'warning':
                    return <AlertTriangle className="w-5 h-5 text-red-500" />;
                case 'trending':
                    return <Rocket className="w-5 h-5 text-blue-500" />;
                case 'seasonal':
                    return <Sun className="w-5 h-5 text-yellow-500" />;
                default:
                    return <Zap className="w-5 h-5 text-gray-500" />;
            }
        };

        const getCardColors = (type) => {
            switch (type) {
                case 'opportunity':
                    return 'bg-green-50 border-green-200';
                case 'warning':
                    return 'bg-red-50 border-red-200';
                case 'trending':
                    return 'bg-blue-50 border-blue-200';
                case 'seasonal':
                    return 'bg-yellow-50 border-yellow-200';
                default:
                    return 'bg-gray-50 border-gray-200';
            }
        };

        const getButtonClass = (type) => {
            switch (type) {
                case 'opportunity':
                    return 'bg-green-500 hover:bg-green-600 text-white';
                case 'warning':
                    return 'bg-red-500 hover:bg-red-600 text-white';
                case 'trending':
                    return 'bg-blue-500 hover:bg-blue-600 text-white';
                case 'seasonal':
                    return 'bg-yellow-500 hover:bg-yellow-600 text-white';
                default:
                    return 'bg-gray-500 hover:bg-gray-600 text-white';
            }
        };

        return (
            <div className={`p-5 rounded-xl border shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full ${getCardColors(insight.type)}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0">
                        {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="bg-white px-2.5 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            {insight.location}
                        </span>
                        <span className="bg-white px-2.5 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
                            {getTrendIcon(insight.change, 'w-4 h-4')}
                            {insight.change}
                        </span>
                    </div>
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{insight.trend}</h3>
                    <p className="text-gray-600 text-sm mb-4">{insight.message}</p>
                </div>
                <div>
                    <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${getButtonClass(insight.type)}`}>
                        {insight.action}
                    </button>
                </div>
            </div>
        );
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
                        {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>

                {/* Loading and Error States */}
                {isLoading && (
                    <div className="flex justify-center items-center h-96">
                        <div className="text-center">
                            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                            <p className="mt-4 text-lg text-gray-700">Brewing fresh insights for you...</p>
                            <p className="text-sm text-gray-500">This might take a moment.</p>
                        </div>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex justify-center items-center h-96 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                            <h3 className="mt-4 text-xl font-semibold text-red-700">Oops! Something went wrong.</h3>
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                            <p className="text-sm text-gray-600 mt-2">Could not fetch data. Please ensure the backend is running and try again.</p>
                            <button onClick={refreshData} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {!isLoading && !error && trendsData && (
                    <>
                        {/* Personalized AI Insight Cards */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Local Trend Summary</h2>
                            <div className="grid lg:grid-cols-2 gap-6">
                                {personalizedInsights.map((insight, index) => <InsightCard key={index} insight={insight} />)}
                            </div>
                        </div>

                        {/* Category Trend Chart & Filters */}
                        <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm">
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <h2 className="text-2xl font-bold text-gray-800">📈 Category Performance: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</h2>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="kurtis">Kurtis</option>
                                        <option value="sarees">Sarees</option>
                                        <option value="jewelry">Jewelry</option>
                                    </select>
                                    <select
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Delhi">Delhi</option>
                                        <option value="Mumbai">Mumbai</option>
                                        <option value="Bangalore">Bangalore</option>
                                    </select>
                                </div>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={categoryData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="searches" stroke="#8884d8" strokeWidth={2} name="Searches" />
                                        <Line type="monotone" dataKey="purchases" stroke="#82ca9d" strokeWidth={2} name="Purchases" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Demand Hotspots */}
                        <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-red-500" /> PIN-Code Hotspots
                            </h2>
                            <div className="space-y-3">
                                {hotspots.map((spot, index) => (
                                    <div key={index} className="grid grid-cols-3 items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        {/* Left Column */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{spot.area}</h3>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                                    {spot.pincode}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{spot.city}</p>
                                        </div>

                                        {/* Middle Column */}
                                        <div className="text-center">
                                            <p className="font-medium text-gray-800">{spot.product}</p>
                                        </div>

                                        {/* Right Column */}
                                        <div className="flex items-center justify-end gap-2 text-lg font-bold text-gray-800">
                                            <span>{spot.activity}</span>
                                            {getTrendIcon(spot.trend)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Trending Products */}
                            <div className="p-6 bg-white rounded-2xl shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡ Trending Products from your Inventory</h2>
                                <div className="space-y-4">
                                    {trendingProducts.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center font-bold text-gray-500 text-xs">
                                                {item.product.substring(0, 3).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.product}</h3>
                                                <p className="text-sm text-gray-500">Avg. Price: {item.avgPrice}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold flex items-center justify-end gap-1">
                                                    {getTrendIcon(item.trend)}
                                                    {item.trend}
                                                </div>
                                                <button className={`text-xs mt-1 px-2 py-1 rounded-full font-medium ${getActionButtonClass(item.action)}`}>
                                                    {item.action}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* High-Return Products */}
                            <div className="p-6 bg-white rounded-2xl shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ High-Return Products</h2>
                                <div className="space-y-4">
                                    {returnedProducts.map((item, index) => (
                                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-red-800">{item.product}</h3>
                                                <span className="text-red-600 font-bold">{item.returnRate} Return Rate</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">
                                                <strong>Reason:</strong> {item.mainReason}
                                            </p>
                                            <p className="text-sm text-blue-700 mt-2 bg-blue-100 p-2 rounded-md">
                                                <strong>Suggestion:</strong> {item.suggestion}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TrendsInsightsPage;