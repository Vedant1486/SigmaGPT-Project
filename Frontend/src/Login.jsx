import { useState } from "react";
import "./Login.css";

function Login({ onAuth }) {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isRegister ? "register" : "login";
        try {
            const res = await fetch(`http://localhost:8080/api/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                onAuth(data.token, data.username);
            }
        } catch (err) {
            setError("Cannot connect to server");
        }
        setLoading(false);
    };

    return (
        <div className="loginPage">
            <div className="loginCard">
                <div className="loginLogo">
                    <img src="src/assets/blacklogo.png" alt="logo" />
                </div>
                <h2>SigmaGPT</h2>
                <p className="loginSubtitle">{isRegister ? "Create an account" : "Welcome back"}</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="loginError">{error}</p>}
                    <button type="submit" className="loginBtn" disabled={loading}>
                        {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
                    </button>
                </form>

                <p className="loginToggle">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}
                    <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>
                        {isRegister ? " Login" : " Register"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;
