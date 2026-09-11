import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(username, password);
            navigate("/");
        } catch (error) {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:px-6">

            <div className="w-full max-w-[430px]">

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-8 sm:px-9 sm:py-10">

                    {/* Header */}
                    <div className="text-center mb-8">

                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
                            <span className="material-icons text-2xl">
                                forum
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm sm:text-base text-gray-500">
                            Sign in to continue to Confession Room
                        </p>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700">

                            <span className="material-icons text-[20px] mt-[1px]">
                                error_outline
                            </span>

                            <p className="leading-5">
                                {error}
                            </p>

                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Username
                            </label>

                            <div className="relative">

                                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[21px]">
                                    person_outline
                                </span>

                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100 placeholder:text-gray-400"
                                    required
                                />

                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[21px]">
                                    lock_outline
                                </span>

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100 placeholder:text-gray-400"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-95"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <span className="material-icons text-[20px]">
                                        {showPassword
                                            ? "visibility_off"
                                            : "visibility"}
                                    </span>
                                </button>

                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading ? (
                                <>
                                    <span
                                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                                    />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in

                                    <span className="material-icons text-[19px]">
                                        arrow_forward
                                    </span>
                                </>
                            )}

                        </button>

                    </form>

                    {/* Register */}
                    <div className="mt-8 border-t border-gray-100 pt-6 text-center">

                        <p className="text-sm text-gray-500">
                            Don't have an account?
                        </p>

                        <Link
                            to="/register"
                            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-gray-900 transition hover:text-gray-600"
                        >
                            Create an account

                            <span className="material-icons text-[17px]">
                                arrow_forward
                            </span>
                        </Link>

                    </div>

                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-400">
                    Confession Room
                </p>

            </div>
        </div>
    );
}

export default Login;