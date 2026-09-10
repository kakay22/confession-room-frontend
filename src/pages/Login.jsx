import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await login(
                username,
                password
            );

            navigate("/");

        } catch (error) {

            setError(
                "Invalid username or password."
            );

        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

            <div className="bg-white shadow-lg rounded-4 p-5 w-full max-w-md">

                <h1 className="text-3xl font-bold text-center">
                    Welcome Back
                </h1>

                <p className="text-gray-500 text-center mb-4">
                    Sign in to Confess
                </p>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">

                        <label className="form-label">
                            Username
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                        />

                    </div>

                    <div className="mb-4">

                        <label className="form-label">
                            Password
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                    >
                        Login
                    </button>

                </form>

                <p className="text-center mt-4 mb-0">

                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Login;