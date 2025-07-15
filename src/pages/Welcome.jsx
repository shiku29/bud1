import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwrite/client';
import { Building, User, MapPin, Phone, Mail, FileText, CheckCircle, AlertCircle, Tag } from 'lucide-react';

const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const APPWRITE_PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID;

const Welcome = ({ user }) => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        businessName: "",
        ownerName: "",
        pinCode: "",
        address: "",
        phone: "",
        gstNumber: "",
        categories: []
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categoryOptions = [
        "Sarees", "Kidswear", "Ethnic Wear", "Accessories", "Jewelry", "Footwear",
        "Bags", "Home Decor", "Electronics", "Beauty", "Sports", "Books"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryToggle = (category) => {
        setProfileData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (!user || !user.uid) {
            setError("Authentication error. Please log in again.");
            setIsSubmitting(false);
            return;
        }

        if (!profileData.businessName || !profileData.ownerName || !profileData.pinCode) {
            setError("Please fill out all required fields: Business Name, Owner Name, and PIN Code.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Create a document in the 'profiles' collection
            // The document ID will be the same as the user's UID for easy mapping
            await databases.createDocument(
                APPWRITE_DB_ID,
                APPWRITE_PROFILES_COLLECTION_ID,
                user.uid,
                {
                    ...profileData,
                    email: user.email, // Add the user's email from the auth object
                }
            );

            // Redirect to the dashboard after successful submission
            navigate('/');

        } catch (err) {
            setError("Failed to save profile. Please try again.");
            console.error("Error creating profile:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1e293b] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome to Saathi!</h2>
                    <p className="text-gray-600 mb-8 text-center">Let's set up your business profile to get started.</p>

                    {error && (
                        <div className="my-4 flex items-center gap-3 text-center p-3 bg-red-100 text-red-700 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Business Name */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><Building className="w-5 h-5 text-gray-500" /> Business Name *</label>
                            <input type="text" name="businessName" value={profileData.businessName} onChange={handleChange} required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                        {/* Owner Name */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><User className="w-5 h-5 text-gray-500" /> Owner Name *</label>
                            <input type="text" name="ownerName" value={profileData.ownerName} onChange={handleChange} required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                        {/* PIN Code */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-500" /> PIN Code *</label>
                            <input type="text" name="pinCode" value={profileData.pinCode} onChange={handleChange} required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                         {/* Phone */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><Phone className="w-5 h-5 text-gray-500" /> Phone</label>
                            <input type="tel" name="phone" value={profileData.phone} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-500" /> Full Address</label>
                            <textarea name="address" value={profileData.address} onChange={handleChange} rows="3" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                        </div>
                         {/* GST Number */}
                        <div className="md:col-span-2">
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-500" /> GST Number (Optional)</label>
                            <input type="text" name="gstNumber" value={profileData.gstNumber} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                    </div>

                    {/* Category Preferences */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                           <Tag className="w-5 h-5 text-gray-500" /> What do you sell? (Optional)
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {categoryOptions.map((category) => (
                                <button
                                    type="button"
                                    key={category}
                                    onClick={() => handleCategoryToggle(category)}
                                    className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                                        profileData.categories.includes(category)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Welcome; 