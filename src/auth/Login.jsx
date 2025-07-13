import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            if (isRegister) {
                await createUserWithEmailAndPassword(auth, email, password);
                setSuccess("Signup successful! You can now log in.");
                setIsRegister(false);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                setSuccess("Login successful!");
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Google login handler
    const handleGoogleLogin = async () => {
        setError("");
        setSuccess("");
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setSuccess("Google login successful!");
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6">{isRegister ? "Register" : "Login"}</h2>
                {error && <div className="mb-4 text-red-600">{error}</div>}
                {success && <div className="mb-4 text-green-600">{success}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 p-2 border rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-4 p-2 border rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
                    {isRegister ? "Register" : "Login"}
                </button>
                <button
                    type="button"
                    className="mt-4 w-full text-blue-600"
                    onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
                >
                    {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                </button>
                <div className="mt-6">
                    <button
                        type="button"
                        className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                        onClick={handleGoogleLogin}
                    >
                        Login with Google
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;