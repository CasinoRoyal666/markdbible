import React, { useState, useEffect } from "react";
import api from '../api.js'
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            //request token
            const res = await api.post("token/", {username, password});

            //save ACCESS/REFRESH tokens
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            localStorage.setItem("username", username);

            //main
            navigate("/");
        } catch (error) {
            alert("Auth error, recheck login and passport");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Login Page</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px'}}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '10px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '10px' }}
                />
                <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p style={{ marginTop: '20px' }}>
                No account? <a href="/register" style={{ color: '#78a9ff' }}>Registration</a>
            </p>
        </div>
    )
}

export default Login;