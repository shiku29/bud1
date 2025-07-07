import React, { useState, useMemo } from 'react';
import { Search, Filter, TrendingDown, Package, Calendar, AlertCircle, CheckCircle, XCircle, Clock, BarChart3, PieChart, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const OrdersReturnsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedReason, setSelectedReason] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Sample data
    const ordersData = [
        { id: 'ORD-001', product: 'Wireless Bluetooth Headphones', category: 'Electronics', returnReason: 'Poor Sound Quality', status: 'returned', date: '2024-07-01', customerName: 'John Doe', amount: 89.99 },
        { id: 'ORD-002', product: 'Cotton Summer Dress', category: 'Clothing', returnReason: 'Wrong Size', status: 'returned', date: '2024-07-02', customerName: 'Jane Smith', amount: 59.99 },
        { id: 'ORD-003', product: 'Smartphone Case', category: 'Electronics', returnReason: 'Damaged in Transit', status: 'processing', date: '2024-07-03', customerName: 'Mike Johnson', amount: 24.99 },
        { id: 'ORD-004', product: 'Kitchen Knife Set', category: 'Home & Kitchen', returnReason: 'Not as Described', status: 'returned', date: '2024-07-04', customerName: 'Sarah Wilson', amount: 149.99 },
        { id: 'ORD-005', product: 'Running Shoes', category: 'Sports', returnReason: 'Defective Product', status: 'refunded', date: '2024-07-05', customerName: 'Tom Brown', amount: 129.99 },
        { id: 'ORD-006', product: 'Laptop Backpack', category: 'Electronics', returnReason: 'Poor Quality', status: 'returned', date: '2024-06-28', customerName: 'Lisa Davis', amount: 79.99 },
        { id: 'ORD-007', product: 'Yoga Mat', category: 'Sports', returnReason: 'Wrong Color', status: 'processing', date: '2024-06-30', customerName: 'Alex Chen', amount: 39.99 },
        { id: 'ORD-008', product: 'Coffee Maker', category: 'Home & Kitchen', returnReason: 'Damaged in Transit', status: 'refunded', date: '2024-06-29', customerName: 'Emma White', amount: 199.99 },
    ];

    const returnTrendsData = [
        { month: 'Jan', returns: 45, orders: 320 },
        { month: 'Feb', returns: 52, orders: 280 },
        { month: 'Mar', returns: 38, orders: 340 },
        { month: 'Apr', returns: 61, orders: 390 },
        { month: 'May', returns: 49, orders: 420 },
        { month: 'Jun', returns: 72, orders: 480 },
        { month: 'Jul', returns: 58, orders: 510 },
    ];

    const returnReasonsData = [
        { name: 'Poor Sound Quality', value: 25, color: '#ef4444' },
        { name: 'Wrong Size', value: 30, color: '#f97316' },
        { name: 'Damaged in Transit', value: 20, color: '#eab308' },
        { name: 'Not as Described', value: 15, color: '#22c55e' },
        { name: 'Defective Product', value: 10, color: '#3b82f6' },
    ];

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports'];
    const returnReasons = ['Poor Sound Quality', 'Wrong Size', 'Damaged in Transit', 'Not as Described', 'Defective Product', 'Poor Quality', 'Wrong Color'];
    const statuses = ['returned', 'processing', 'refunded'];

    const filteredOrders = useMemo(() => {
        return ordersData.filter(order => {
            const matchesSearch = order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || order.category === selectedCategory;
            const matchesReason = selectedReason === 'all' || order.returnReason === selectedReason;
            const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;

            return matchesSearch && matchesCategory && matchesReason && matchesStatus;
        });
    }, [searchTerm, selectedCategory, selectedReason, selectedStatus, ordersData]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'returned': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'refunded': return <XCircle className="w-4 h-4 text-blue-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case 'returned': return `${baseClass} bg-green-100 text-green-800`;
            case 'processing': return `${baseClass} bg-yellow-100 text-yellow-800`;
            case 'refunded': return `${baseClass} bg-blue-100 text-blue-800`;
            default: return baseClass;
        }
    };

    const returnRate = ((filteredOrders.length / (filteredOrders.length + 100)) * 100).toFixed(1);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders & Returns</h1>
                    <p className="text-gray-600">Track and manage your order returns with AI-powered insights</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Returns</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Return Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{returnRate}%</p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Processing</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredOrders.filter(o => o.status === 'processing').length}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Refunded</p>
                                <p className="text-2xl font-bold text-gray-900">${filteredOrders.filter(o => o.status === 'refunded').reduce((sum, o) => sum + o.amount, 0).toFixed(2)}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* AI Suggestion Banner */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg mb-8 shadow-lg">
                    <div className="flex items-center gap-4">
                        <Lightbulb className="w-8 h-8 text-yellow-300" />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">🧠 AI Suggestion</h3>
                            <p className="text-purple-100">Too many returns? Here's how to improve listings: Add more detailed product descriptions, include size charts, and use higher quality images to reduce return rates by up to 40%.</p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Return Trends */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Return Trends
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={returnTrendsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} />
                                <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Return Reasons */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            Return Reasons
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsPieChart>
                                <Pie
                                    data={returnReasonsData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {returnReasonsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, Product, or Customer..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason</label>
                                <select
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Reasons</option>
                                    {returnReasons.map(reason => (
                                        <option key={reason} value={reason}>{reason}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Statuses</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">{order.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.product}</div>
                                            <div className="text-sm text-gray-500">{order.category}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{order.customerName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                                                <span className="text-sm text-gray-900">{order.returnReason}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(order.status)}
                                                <span className={`ml-2 ${getStatusBadge(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{order.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${order.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersReturnsPage;