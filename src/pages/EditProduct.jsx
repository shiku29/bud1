import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databases, storage } from "../appwrite/client";
import { PackagePlus, Tag, CircleDollarSign, Warehouse, FileText, ImageUp, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const EditProduct = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
    });
    const [newImage, setNewImage] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const doc = await databases.getDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, id);
                setProduct(doc);
                setFormData({
                    name: doc.name,
                    category: doc.category,
                    price: doc.price.toString(),
                    stock: doc.stock.toString(),
                    description: doc.description || "",
                });
            } catch (err) {
                setError("Failed to fetch product data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        if (!user || !user.uid) {
            setError("User not authenticated. Please login again.");
            setIsSubmitting(false);
            return;
        }

        try {
            let imageUrl = product.image_url;

            // 1. Handle image update
            if (newImage) {
                // Delete old image if it exists
                if (product.image_url) {
                    try {
                        const fileId = product.image_url.split('/files/')[1].split('/view')[0];
                        await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
                    } catch (imageError) {
                        console.warn("Could not delete old image, proceeding with update:", imageError);
                    }
                }

                // Upload new image
                const uploadResponse = await storage.createFile(
                    APPWRITE_BUCKET_ID,
                    "unique()",
                    newImage,
                    ['read("any")']
                );
                imageUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploadResponse.$id}/view?project=${APPWRITE_PROJECT_ID}`;
            }

            // 2. Update product document
            const updatedData = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                image_url: imageUrl,
            };

            await databases.updateDocument(
                APPWRITE_DB_ID,
                APPWRITE_COLLECTION_ID,
                id,
                updatedData
            );

            setSuccess("Product updated successfully!");
            setTimeout(() => navigate("/products"), 2000);

        } catch (err) {
            setError("Error updating product. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-[#1e293b] text-white flex items-center justify-center">Loading product...</div>;
    }
    
    if (error && !product) {
        return <div className="min-h-screen bg-[#1e293b] text-white flex items-center justify-center">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-[#1e293b] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative">
                 <button 
                    onClick={() => navigate('/products')} 
                    className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"
                    title="Go Back"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
                        <PackagePlus className="w-8 h-8 text-indigo-600" />
                        Edit Product
                    </h2>

                    {error && (
                        <div className="my-4 flex items-center gap-3 text-center p-3 bg-red-100 text-red-700 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="my-4 flex items-center gap-3 text-center p-3 bg-green-100 text-green-700 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                           <span>{success}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><PackagePlus className="w-5 h-5" /> Product Name *</label>
                            <input
                                type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><Tag className="w-5 h-5" /> Category *</label>
                            <input
                                type="text" name="category" value={formData.category} onChange={handleChange} required
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><CircleDollarSign className="w-5 h-5" /> Price (₹) *</label>
                            <input
                                type="number" name="price" value={formData.price} onChange={handleChange} required
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><Warehouse className="w-5 h-5" /> Stock Quantity *</label>
                            <input
                                type="number" name="stock" value={formData.stock} onChange={handleChange} required
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2"><FileText className="w-5 h-5" /> Description</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            rows={4}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <ImageUp className="w-5 h-5" /> Current Product Image
                        </label>
                         <div className="flex items-center gap-4">
                            {product.image_url ? (
                                <img src={product.image_url} alt="Current product" className="w-24 h-24 object-cover rounded-lg"/>
                            ) : (
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No Image</div>
                            )}
                            <div className="flex-grow">
                               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        <ImageUp className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                <span>Upload new image</span>
                                                <input id="file-upload" name="image" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        {newImage ? (
                                            <p className="text-sm text-green-600 pt-2">{newImage.name}</p>
                                        ) : (
                                            <p className="text-xs text-gray-500">Replaces current image</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProduct; 