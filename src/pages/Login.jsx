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
        <main className="min-h-screen bg-white sm:bg-gray-50">

            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8 sm:justify-center sm:px-6">

                {/* Header */}
                <div className="mb-8 pt-4 text-center sm:pt-0">

                    {/* App Icon */}
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gray-900 text-white shadow-sm">
                        <span className="material-symbols-outlined text-[30px]">
                            forum
                        </span>
                    </div>

                    <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h1>

                    <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-gray-500">
                        Sign in to continue to Confession Room
                    </p>

                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">

                        <span className="material-symbols-outlined mt-[1px] shrink-0 text-[20px] text-red-600">
                            error_outline
                        </span>

                        <p className="text-sm leading-5 text-red-700">
                            {error}
                        </p>

                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Username */}
                    <div>

                        <label
                            htmlFor="username"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Username
                        </label>

                        <div className="relative">

                            <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-gray-400">
                                person_outline
                            </span>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                placeholder="Enter your username"
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck="false"
                                className="h-[54px] w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-[16px] text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100 placeholder:text-gray-400"
                                required
                            />

                        </div>

                    </div>

                    {/* Password */}
                    <div>

                        <div className="mb-2 flex items-center justify-between">

                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-gray-800"
                            >
                                Password
                            </label>

                        </div>

                        <div className="relative">

                            <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-gray-400">
                                lock_outline
                            </span>

                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="h-[54px] w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-14 text-[16px] text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100 placeholder:text-gray-400"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition active:scale-95 active:bg-gray-100"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                <span className="material-symbols-outlined text-[21px]">
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
                        className="mt-2 flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-[15px] font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {loading ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                <span>
                                    Signing in...
                                </span>
                            </>
                        ) : (
                            <>
                                <span>
                                    Sign in
                                </span>

                                <span className="material-symbols-outlined text-[20px]">
                                    arrow_forward
                                </span>
                            </>
                        )}

                    </button>

                </form>

                {/* Register */}
                <div className="mt-8 text-center">

                    <p className="text-sm text-gray-500">
                        Don't have an account?
                    </p>

                    <Link
                        to="/register"
                        className="mt-2 inline-flex min-h-10 items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition active:bg-gray-100"
                    >
                        Create an account

                        <span className="material-symbols-outlined text-[18px]">
                            arrow_forward
                        </span>
                    </Link>

                </div>

                {/* Footer */}
                <div className="mt-auto pt-10 text-center sm:mt-8 sm:pt-0">

                    <p className="text-xs text-gray-400">
                        Confession Room
                    </p>

                </div>

            </div>

        </main>
    );
}

export default Login;