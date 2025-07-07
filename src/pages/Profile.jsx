import React, { useState } from 'react';
import { User, MapPin, Store, Edit3, Trophy, Star, Target, TrendingUp, Award, Mic, Calendar, ShieldCheck, CheckCircle, Settings, Camera, Bell, Lock, HelpCircle } from 'lucide-react';

const ProfileSmartScorePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        businessName: "Rani Fashion Store",
        ownerName: "Rani Devi",
        pinCode: "110001",
        address: "Connaught Place, New Delhi",
        phone: "+91 98765 43XXX",
        email: "rani@fashionstore.com",
        gstNumber: "07AAAAA0000A1Z5",
        categories: ["Sarees", "Kidswear", "Ethnic Wear", "Accessories"]
    });

    const smartScore = 85;
    const totalListings = 156;
    const optimizedListings = 132;

    const badges = [
        // {
        //     id: 1,
        //     name: "Voice Listing Creator",
        //     description: "Created 50+ listings using voice commands",
        //     icon: <Mic className="w-6 h-6" />,
        //     color: "bg-blue-500",
        //     earned: true,
        //     date: "2024-06-15"
        // },
        {
            id: 2,
            name: "Festival Ready",
            description: "Optimized inventory for festival seasons",
            icon: <Calendar className="w-6 h-6" />,
            color: "bg-orange-500",
            earned: true,
            date: "2024-06-20"
        },
        {
            id: 3,
            name: "Return Reducer",
            description: "Reduced return rate by 40%",
            icon: <ShieldCheck className="w-6 h-6" />,
            color: "bg-green-500",
            earned: true,
            date: "2024-07-01"
        },
        {
            id: 4,
            name: "Quality Master",
            description: "Maintained 4.8+ star rating for 3 months",
            icon: <Star className="w-6 h-6" />,
            color: "bg-yellow-500",
            earned: false,
            progress: 75
        },
        {
            id: 5,
            name: "Sales Champion",
            description: "Achieved ₹1L+ monthly sales",
            icon: <Trophy className="w-6 h-6" />,
            color: "bg-purple-500",
            earned: false,
            progress: 60
        },
        {
            id: 6,
            name: "Growth Guru",
            description: "Increased sales by 100% in 6 months",
            icon: <TrendingUp className="w-6 h-6" />,
            color: "bg-pink-500",
            earned: false,
            progress: 45
        }
    ];

    const categoryOptions = [
        "Sarees", "Kidswear", "Ethnic Wear", "Accessories", "Jewelry", "Footwear",
        "Bags", "Home Decor", "Electronics", "Beauty", "Sports", "Books"
    ];

    const scoreBreakdown = [
        { metric: "Product Images", score: 90, maxScore: 100 },
        { metric: "Descriptions", score: 85, maxScore: 100 },
        { metric: "Pricing Strategy", score: 80, maxScore: 100 },
        { metric: "Inventory Management", score: 88, maxScore: 100 },
        { metric: "Customer Response", score: 92, maxScore: 100 },
        { metric: "Shipping & Delivery", score: 75, maxScore: 100 }
    ];

    const handleSave = () => {
        setIsEditing(false);
        // Save logic would go here
    };

    const handleCategoryToggle = (category) => {
        setProfileData(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (score) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Smart Score</h1>
                    <p className="text-gray-600">Manage your business profile and track your optimization progress</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Business Profile Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-blue-500" />
                                    Business Profile
                                </h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.businessName}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-medium text-gray-900">{profileData.businessName}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.ownerName}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, ownerName: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-medium text-gray-900">{profileData.ownerName}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.pinCode}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, pinCode: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">{profileData.pinCode}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-medium text-gray-900">{profileData.phone}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    {isEditing ? (
                                        <textarea
                                            value={profileData.address}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-medium text-gray-900">{profileData.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Category Preferences */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-500" />
                                Category Preferences
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {categoryOptions.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryToggle(category)}
                                        className={`p-3 rounded-lg border-2 transition-all ${profileData.categories.includes(category)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{category}</span>
                                            {profileData.categories.includes(category) && (
                                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Smart Score Breakdown */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Score Breakdown
                            </h3>
                            <div className="space-y-4">
                                {scoreBreakdown.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getProgressColor(item.score)}`}
                                                    style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-sm font-semibold ${getScoreColor(item.score)}`}>
                                                {item.score}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Smart Score & Badges */}
                    <div className="space-y-6">
                        {/* Smart Score Widget */}
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-lg text-white shadow-lg">
                            <div className="text-center mb-6">
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="white"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 56}`}
                                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - smartScore / 100)}`}
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold">{smartScore}%</div>
                                            <div className="text-sm opacity-90">Smart Score</div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">🧠 Smart Score</h3>
                                <p className="text-blue-100">
                                    You've optimized {optimizedListings} out of {totalListings} listings.
                                </p>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Next Steps:</h4>
                                <ul className="text-sm space-y-1 text-blue-100">
                                    <li>• Add more product images</li>
                                    <li>• Improve shipping options</li>
                                    <li>• Update pricing strategy</li>
                                </ul>
                            </div>
                        </div>

                        {/* Badges Section
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-500" />
                                Achievement Badges
                            </h3>
                            <div className="space-y-4">
                                {badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className={`p-4 rounded-lg border-2 transition-all ${badge.earned
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full ${badge.color} text-white`}>
                                                {badge.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                                                    {badge.earned && (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{badge.description}</p>

                                                {badge.earned ? (
                                                    <div className="text-xs text-green-600 font-medium">
                                                        Earned on {badge.date}
                                                    </div>
                                                ) : (
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${badge.color}`}
                                                            style={{ width: `${badge.progress}%` }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3">
                                    <Camera className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Update Profile Photo</span>
                                </button>
                                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3">
                                    <Bell className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Notification Settings</span>
                                </button>
                                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Privacy Settings</span>
                                </button>
                                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3">
                                    <HelpCircle className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Help & Support</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSmartScorePage;