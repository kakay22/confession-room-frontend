import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const avatars = [
    { id: "avatar1", icon: "🐱" },
    { id: "avatar2", icon: "🦊" },
    { id: "avatar3", icon: "🐼" },
    { id: "avatar4", icon: "🐸" },
    { id: "avatar5", icon: "👻" },
    { id: "avatar6", icon: "🦉" },
    { id: "avatar7", icon: "🐙" },
    { id: "avatar8", icon: "🦄" },
    { id: "avatar9", icon: "🐨" },
    { id: "avatar10", icon: "🐯" },
    { id: "avatar11", icon: "🐵" },
    { id: "avatar12", icon: "🤖" },
];

function AnonymousProfile() {
    const navigate = useNavigate();

    const [account, setAccount] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
    });

    const [anonymousUsername, setAnonymousUsername] = useState("");
    const [anonymousAvatar, setAnonymousAvatar] = useState("avatar1");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const [accountResponse, anonymousResponse] = await Promise.all([
                api.get("auth/profile/"),
                api.get("auth/profile/anonymous/"),
            ]);

            const accountData = accountResponse.data;
            const anonymousData = anonymousResponse.data;

            setAccount({
                username: accountData.username || "",
                email: accountData.email || "",
                first_name: accountData.first_name || "",
                last_name: accountData.last_name || "",
            });

            setAnonymousUsername(
                anonymousData.anonymous_username || ""
            );

            setAnonymousAvatar(
                anonymousData.anonymous_avatar || "avatar1"
            );

        } catch (error) {
            console.error("PROFILE ERROR:", error);
            console.error("STATUS:", error.response?.status);
            console.error("DATA:", error.response?.data);

            setError(
                "Unable to load your profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const username = anonymousUsername.trim();

        if (!username) {
            setError("Please choose an anonymous username.");
            return;
        }

        if (username.length < 3) {
            setError("Your anonymous username must be at least 3 characters.");
            return;
        }

        if (username.length > 30) {
            setError("Your anonymous username cannot exceed 30 characters.");
            return;
        }

        setSaving(true);

        try {
            const response = await api.put(
                "auth/profile/anonymous/",
                {
                    anonymous_username: username,
                    anonymous_avatar: anonymousAvatar,
                }
            );

            setAnonymousUsername(
                response.data.anonymous_username
            );

            setAnonymousAvatar(
                response.data.anonymous_avatar
            );

            setSuccess("Your anonymous identity has been saved!");

        } catch (error) {
            console.error("SAVE PROFILE ERROR:", error);
            console.error("STATUS:", error.response?.status);
            console.error("DATA:", error.response?.data);

            const data = error.response?.data;

            if (data?.anonymous_username) {
                setError(
                    Array.isArray(data.anonymous_username)
                        ? data.anonymous_username[0]
                        : data.anonymous_username
                );
            } else {
                setError(
                    "We couldn't save your anonymous identity. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const selectedAvatar =
        avatars.find((avatar) => avatar.id === anonymousAvatar)
        || avatars[0];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500">
                    Loading your profile...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="mx-auto max-w-2xl">

                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mb-6 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to confessions
                </button>

                {/* Real Account Information */}
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">

                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-gray-900">
                            Account Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Your real account details are private and are never shown
                            publicly on your confessions.
                        </p>
                    </div>

                    <div className="space-y-4">

                        {/* Username */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Account Username
                            </label>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {account.username || "Not provided"}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Email Address
                            </label>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {account.email || "Not provided"}
                                </p>
                            </div>
                        </div>

                        {/* Name */}
                        {(account.first_name || account.last_name) && (
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Name
                                </label>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {[account.first_name, account.last_name]
                                            .filter(Boolean)
                                            .join(" ") || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="mt-5 flex gap-3 rounded-xl bg-blue-50 p-4">

                        <span className="material-symbols-outlined shrink-0 text-blue-600">
                            lock
                        </span>

                        <div>
                            <p className="text-sm font-semibold text-blue-900">
                                Private account information
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-700">
                                These details are only visible to you. Other students
                                will only see your anonymous identity when you post,
                                react, or comment.
                            </p>
                        </div>

                    </div>

                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

                    {/* Header */}
                    <div className="mb-8 text-center">

                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl">
                            {selectedAvatar.icon}
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Your Anonymous Identity
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            This is the identity other students will see.
                        </p>

                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Username */}
                        <div className="mb-7">

                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                Anonymous Username
                            </label>

                            <input
                                type="text"
                                value={anonymousUsername}
                                onChange={(e) =>
                                    setAnonymousUsername(e.target.value)
                                }
                                placeholder="e.g. MidnightWriter"
                                maxLength={30}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="mt-2 flex justify-between text-xs text-gray-400">
                                <span>
                                    This will be visible on your confessions.
                                </span>

                                <span>
                                    {anonymousUsername.length}/30
                                </span>
                            </div>

                        </div>

                        {/* Avatar */}
                        <div className="mb-8">

                            <label className="mb-3 block text-sm font-semibold text-gray-800">
                                Choose Your Avatar
                            </label>

                            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">

                                {avatars.map((avatar) => {
                                    const selected =
                                        anonymousAvatar === avatar.id;

                                    return (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() =>
                                                setAnonymousAvatar(
                                                    avatar.id
                                                )
                                            }
                                            className={`flex aspect-square items-center justify-center rounded-2xl border text-3xl transition ${selected
                                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                                                }`}
                                        >
                                            {avatar.icon}
                                        </button>
                                    );
                                })}

                            </div>

                        </div>

                        {/* Privacy notice */}
                        <div className="mb-6 rounded-xl bg-gray-50 p-4">

                            <div className="flex gap-3">

                                <div className="text-lg">
                                    🔒
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Your real identity stays private
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Other students will only see your
                                        anonymous username and avatar.
                                        Your actual account username is never
                                        displayed publicly.
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* Save */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Anonymous Identity"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default AnonymousProfile;