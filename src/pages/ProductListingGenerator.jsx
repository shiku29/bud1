import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Globe, Tag, Type, FileText, RefreshCw, Copy, Check } from 'lucide-react';

const ProductListingGenerator = () => {
    const [productData, setProductData] = useState({
        description: '',
        category: '',
        image: null,
        imagePreview: null
    });

    const [generatedListing, setGeneratedListing] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [copiedField, setCopiedField] = useState(null);
    const [translations, setTranslations] = useState({});

    const fileInputRef = useRef(null);

    const languages = {
        en: 'English',
        hi: 'Hindi',
        mr: 'Marathi',
        bn: 'Bengali',
        ta: 'Tamil',
        te: 'Telugu',
        gu: 'Gujarati',
        kn: 'Kannada'
    };

    const categories = [
        'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys',
        'Beauty & Personal Care', 'Automotive', 'Food & Beverages', 'Health',
        'Jewelry', 'Pet Supplies', 'Office Supplies', 'Music', 'Art & Crafts'
    ];

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProductData({
                    ...productData,
                    image: file,
                    imagePreview: e.target.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const generateSEOTitle = (description, category) => {
        const keywords = description.toLowerCase().split(' ').filter(word => word.length > 3);
        const mainKeywords = keywords.slice(0, 3).join(' ');
        return `${mainKeywords} - Premium ${category} | Best Quality Online`;
    };

    const generateTags = (description, category) => {
        const words = description.toLowerCase().split(' ');
        const tags = [
            category.toLowerCase(),
            ...words.filter(word => word.length > 3).slice(0, 8),
            'premium', 'quality', 'online', 'india'
        ];
        return [...new Set(tags)];
    };

    const generateDescription = (input, category) => {
        const features = [
            'Premium quality materials',
            'Excellent craftsmanship',
            'Fast delivery across India',
            'Easy returns and exchanges',
            'Customer satisfaction guaranteed'
        ];

        return `Experience the finest ${category.toLowerCase()} with our ${input}. 
    
Key Features:
• ${features.join('\n• ')}

Perfect for daily use and special occasions. Our products are carefully selected to ensure the highest quality standards. Order now and enjoy fast, reliable delivery to your doorstep.

Why Choose Us:
✓ Trusted by thousands of customers
✓ Secure payment options
✓ 24/7 customer support
✓ Authentic products only`;
    };

    const translateContent = (text, targetLang) => {
        // Simplified translation mapping (in real app, use Google Translate API)
        const translations = {
            hi: {
                'Premium': 'प्रीमियम',
                'Quality': 'गुणवत्ता',
                'Best': 'सर्वश्रेष्ठ',
                'Online': 'ऑनलाइन',
                'Fast delivery': 'तेज़ डिलीवरी',
                'Customer satisfaction': 'ग्राहक संतुष्टि'
            },
            mr: {
                'Premium': 'प्रीमियम',
                'Quality': 'गुणवत्ता',
                'Best': 'सर्वोत्तम',
                'Online': 'ऑनलाइन',
                'Fast delivery': 'जलद वितरण',
                'Customer satisfaction': 'ग्राहक समाधान'
            },
            bn: {
                'Premium': 'প্রিমিয়াম',
                'Quality': 'গুণমান',
                'Best': 'সেরা',
                'Online': 'অনলাইন',
                'Fast delivery': 'দ্রুত ডেলিভারি',
                'Customer satisfaction': 'গ্রাহক সন্তুষ্টি'
            }
        };

        if (targetLang === 'en') return text;

        let translated = text;
        if (translations[targetLang]) {
            Object.entries(translations[targetLang]).forEach(([en, local]) => {
                translated = translated.replace(new RegExp(en, 'gi'), local);
            });
        }

        return translated;
    };

    const generateListing = async () => {
        if (!productData.description && !productData.image) return;

        setIsGenerating(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const description = productData.description || 'Quality product with excellent features';
        const category = productData.category || 'General';

        const listing = {
            title: generateSEOTitle(description, category),
            description: generateDescription(description, category),
            tags: generateTags(description, category),
            category: category,
            seoKeywords: [
                'buy online',
                'best price',
                'premium quality',
                'fast delivery',
                'India',
                category.toLowerCase()
            ]
        };

        setGeneratedListing(listing);
        setIsGenerating(false);
    };

    const improveListing = async () => {
        if (!generatedListing) return;

        setIsImproving(true);

        // Simulate AI improvement
        await new Promise(resolve => setTimeout(resolve, 1500));

        const improved = {
            ...generatedListing,
            title: generatedListing.title.replace('Premium', 'Ultra Premium') + ' ⭐',
            description: generatedListing.description + '\n\n🎯 LIMITED TIME OFFER: Free shipping on orders above ₹500!',
            tags: [...generatedListing.tags, 'bestseller', 'trending', 'new arrival'],
            seoKeywords: [...generatedListing.seoKeywords, 'bestseller', 'trending', 'top rated']
        };

        setGeneratedListing(improved);
        setIsImproving(false);
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const translateListing = (language) => {
        if (!generatedListing) return;

        const translated = {
            title: translateContent(generatedListing.title, language),
            description: translateContent(generatedListing.description, language)
        };

        setTranslations({
            ...translations,
            [language]: translated
        });
    };

    const currentListing = translations[selectedLanguage] || generatedListing;

    return (
        <div className="min-h-screen bg-[#1e293b] p-0"> {/* Match Dashboard: dark blue background */}
            <div className="max-w-6xl mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🏷️ Product Listing Generator
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Create SEO-optimized product listings with AI-powered content generation
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Upload className="w-6 h-6 text-indigo-600" />
                            Input Section
                        </h2>

                        {/* Image Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Image
                            </label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {productData.imagePreview ? (
                                    <img
                                        src={productData.imagePreview}
                                        alt="Product preview"
                                        className="max-w-full max-h-48 mx-auto rounded-lg"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Camera className="w-12 h-12 text-gray-400 mb-2" />
                                        <p className="text-gray-500">Click to upload product image</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Product Description */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Description
                            </label>
                            <textarea
                                value={productData.description}
                                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                placeholder="Describe your product in detail..."
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={productData.category}
                                onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateListing}
                            disabled={isGenerating || (!productData.description && !productData.image)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Listing
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-green-600" />
                                Generated Listing
                            </h2>

                            {generatedListing && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={improveListing}
                                        disabled={isImproving}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
                                    >
                                        {isImproving ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        Improve
                                    </button>
                                </div>
                            )}
                        </div>

                        {generatedListing ? (
                            <div className="space-y-6">
                                {/* Language Selection */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => {
                                            setSelectedLanguage(e.target.value);
                                            if (e.target.value !== 'en') {
                                                translateListing(e.target.value);
                                            }
                                        }}
                                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Object.entries(languages).map(([code, name]) => (
                                            <option key={code} value={code}>{name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* SEO Title */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <Type className="w-4 h-4" />
                                            SEO Title
                                        </h3>
                                        <button
                                            onClick={() => copyToClipboard(currentListing.title, 'title')}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {copiedField === 'title' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-gray-700 font-medium">{currentListing.title}</p>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Description
                                        </h3>
                                        <button
                                            onClick={() => copyToClipboard(currentListing.description, 'description')}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {copiedField === 'description' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-line">{currentListing.description}</div>
                                </div>

                                {/* Tags */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            Tags
                                        </h3>
                                        <button
                                            onClick={() => copyToClipboard(generatedListing.tags.join(', '), 'tags')}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {copiedField === 'tags' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedListing.tags.map((tag, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Category</h3>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {generatedListing.category}
                                    </span>
                                </div>

                                {/* SEO Keywords */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">SEO Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedListing.seoKeywords.map((keyword, index) => (
                                            <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Upload an image or describe your product to generate a listing</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListingGenerator;