import React, { useEffect, useState } from "react";
import { databases, storage } from "../appwrite/client";

const Products = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("date");
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) return;
            try {
                const res = await databases.listDocuments(
                    '687294e6001a4e2eaf06',
                    '6872952f002d0755db7c'
                );
                const userProducts = res.documents.filter(doc => doc.user_id === user.uid);
                setProducts(userProducts);
            } catch (err) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [user, updating]);

    // Stock update handler
    const updateStock = async (product, delta) => {
        setUpdating(product.$id);
        try {
            await databases.updateDocument(
                '687294e6001a4e2eaf06',
                '6872952f002d0755db7c',
                product.$id,
                { stock: product.stock + delta }
            );
        } catch (err) {
            alert("Failed to update stock");
        } finally {
            setUpdating(null);
        }
    };

    // Search, filter, sort logic
    let filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "low") filtered = filtered.filter(p => p.stock < 5);
    if (filter === "out") filtered = filtered.filter(p => p.stock === 0);

    if (sort === "price") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "stock") filtered = [...filtered].sort((a, b) => a.stock - b.stock);
    if (sort === "date") filtered = [...filtered].sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    if (!user) return <div className="p-8 text-center text-gray-500">Please login to view your products.</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Your Products</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Search by name or category"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border p-2 rounded w-64"
                />
                <select value={filter} onChange={e => setFilter(e.target.value)} className="border p-2 rounded">
                    <option value="all">All</option>
                    <option value="low">Low Stock (&lt;5)</option>
                    <option value="out">Out of Stock</option>
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} className="border p-2 rounded">
                    <option value="date">Newest</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                </select>
            </div>
            {filtered.length === 0 ? (
                <div>No products found.</div>
            ) : (
                <ul>
                    {filtered.map(product => (
                        <li key={product.$id} className="mb-4 border-b pb-2">
                            <div className="flex items-center gap-4">
                                <div>
                                    <div><strong>Name:</strong> {product.name}</div>
                                    <div><strong>Category:</strong> {product.category}</div>
                                    <div>
                                        <strong>Price:</strong> ₹{product.price}
                                    </div>
                                    <div>
                                        <strong>Stock:</strong> {product.stock}
                                        {product.stock < 5 && (
                                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                                Low Stock
                                            </span>
                                        )}
                                        {product.stock === 0 && (
                                            <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>
                                    <div><strong>Description:</strong> {product.description}</div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            disabled={updating === product.$id}
                                            onClick={() => updateStock(product, 1)}
                                            className="px-2 py-1 bg-green-500 text-white rounded"
                                        >+</button>
                                        <button
                                            disabled={updating === product.$id || product.stock === 0}
                                            onClick={() => updateStock(product, -1)}
                                            className="px-2 py-1 bg-red-500 text-white rounded"
                                        >-</button>
                                    </div>
                                </div>
                                {product.image_url && (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-32 h-32 object-cover mt-2"
                                        style={{ maxWidth: 128, maxHeight: 128 }}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Products;