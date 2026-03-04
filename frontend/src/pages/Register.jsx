import React, {useState} from "react";
import api from "../api.js";
import {useNavigate} from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            //registering user
            await api.post("register/", {username, password});
            alert("You are now registered! Login to use application");
            navigate("/login");
        } catch (error) {
            alert("Error while registering");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
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
                    {loading ? "Creating..." : "Register"}
                </button>
            </form>
            <p style={{ marginTop: '20px' }}>
                Already have an account? <a href="/login" style={{ color: '#78a9ff' }}>Login</a>
            </p>
        </div>
    );
}

export default Register;