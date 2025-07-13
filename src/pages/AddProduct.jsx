import React, { useState } from "react";
import { databases, storage } from "../appwrite/client"; // import storage

const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const AddProduct = ({ user, setProducts }) => {
    const [product, setProduct] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        image: null,
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setProduct((prev) => ({ ...prev, image: files[0] }));
        } else {
            setProduct((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!user || !user.uid) {
            setError("User not authenticated. Please login again.");
            return;
        }

        if (!product.name || !product.category || !product.price || !product.stock) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            let imageUrl = "";
            // 1. Upload image if present
            if (product.image) {
                const file = product.image;
                const uploadResponse = await storage.createFile(
                    APPWRITE_BUCKET_ID, // from env
                    "unique()",
                    file
                );
                // 2. Get the file's public URL
                imageUrl = storage.getFileView(APPWRITE_BUCKET_ID, uploadResponse.$id).href;
            }

            // 3. Save product with image URL (empty string if no image)
            const response = await databases.createDocument(
                APPWRITE_DB_ID, // from env
                APPWRITE_COLLECTION_ID, // from env
                'unique()',
                {
                    name: product.name,
                    category: product.category,
                    price: Number(product.price),
                    stock: Number(product.stock),
                    description: product.description,
                    user_id: user.uid,
                    image_url: imageUrl // will be "" if no image
                }
            );
            setSuccess("Product added successfully!");
            setProduct({
                name: "",
                category: "",
                price: "",
                stock: "",
                description: "",
                image: null,
            });
        } catch (err) {
            setError("Error adding product. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-lg"
                encType="multipart/form-data"
            >
                <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
                {error && <div className="mb-4 text-red-600">{error}</div>}
                {success && <div className="mb-4 text-green-600">{success}</div>}

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Product Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Category *</label>
                    <input
                        type="text"
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Price (₹) *</label>
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Stock Quantity *</label>
                    <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        rows={3}
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Product Image</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Add Product
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
