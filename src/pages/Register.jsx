import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Register() {

    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        password2: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const getRegisterError = (data) => {
        if (!data) {
            return "Something went wrong. Please try again.";
        }

        if (data.username) {
            if (data.username.includes("already exists")) {
                return "That username is already taken. Please choose another one.";
            }

            return "Please enter a valid username.";
        }

        if (data.password) {
            return "Your password is not strong enough. Use at least 8 characters with a mix of letters, numbers, and symbols.";
        }

        if (data.password2) {
            return "Please make sure both passwords match.";
        }

        return "We couldn't create your account. Please check your information and try again.";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(
                form.username,
                form.password,
                form.password2
            );

            // Registration + login successful
            navigate("/");

        } catch (error) {
            console.error(
                "REGISTER ERROR:",
                error.response?.data
            );

            const data = error.response?.data;

            if (data?.username) {
                setError(
                    "That username is already taken. Please choose another one."
                );
            } else if (data?.password) {
                setError(
                    "Your password is not strong enough. Use at least 8 characters with a mix of letters, numbers, and symbols."
                );
            } else if (data?.password2) {
                setError(
                    "Your passwords do not match."
                );
            } else {
                setError(
                    "We couldn't create your account. Please check your information and try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

            <div className="bg-white shadow-lg rounded-4 p-5 w-full max-w-md">

                <h1 className="text-3xl font-bold text-center">
                    Join Confess
                </h1>

                <p className="text-gray-500 text-center mb-4">
                    Create your school account
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
                            name="username"
                            className="form-control"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="mb-4">

                        <label className="form-label">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="password2"
                            className="form-control"
                            value={form.password2}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                    >
                        Create Account
                    </button>

                </form>

                <p className="text-center mt-4 mb-0">

                    Already have an account?{" "}

                    <Link to="/login">
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Register;