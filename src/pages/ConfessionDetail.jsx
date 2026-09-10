import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const reactionIcons = {
    RELATABLE: "❤️",
    FUNNY: "😂",
    LIKE: "👍",
    LOVE: "🥰",
    WOW: "😮",
    SAD: "😢",
    ANGRY: "😡",
};

const reactionLabels = {
    RELATABLE: "Relatable",
    FUNNY: "Funny",
    LIKE: "Like",
    LOVE: "Love",
    WOW: "Wow",
    SAD: "Sad",
    ANGRY: "Angry",
};

const avatarIcons = {
    avatar1: "🐱",
    avatar2: "🦊",
    avatar3: "🐼",
    avatar4: "🐸",
    avatar5: "👻",
    avatar6: "🦉",
    avatar7: "🐙",
    avatar8: "🦄",
    avatar9: "🐨",
    avatar10: "🐯",
    avatar11: "🐵",
    avatar12: "🤖",
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(days / 365);
    return `${years}y ago`;
};

function ConfessionDetail() {
    const { id } = useParams();
    const { user } = useAuth();

    const [confession, setConfession] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");

    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [error, setError] = useState("");

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    const handleReply = async (commentId) => {
        if (!replyText.trim()) return;

        if (!user) {
            navigate("/login");
            return;
        }

        try {
            const response = await api.post(
                `confessions/${id}/comments/`,
                {
                    content: replyText.trim(),
                    parent: commentId,
                }
            );

            setComments((prev) =>
                prev.map((comment) => {
                    if (comment.id !== commentId) {
                        return comment;
                    }

                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []),
                            response.data,
                        ],
                    };
                })
            );

            setReplyText("");
            setReplyingTo(null);

        } catch (error) {
            console.error(
                "REPLY ERROR:",
                error.response?.data || error
            );
        }
    };

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                `confessions/${id}/`
            );

            setConfession(response.data);

        } catch (error) {
            console.error("FETCH POST ERROR:", error);
            setError("Unable to load this confession.");
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(
                `confessions/${id}/comments/`
            );

            setComments(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || []
            );

        } catch (error) {
            console.error("FETCH COMMENTS ERROR:", error);
        }
    };

    const handleReaction = async (reactionType) => {
        if (!user) {
            alert("Please login to react.");
            return;
        }

        try {
            await api.post(
                `confessions/${id}/react/`,
                {
                    reaction_type: reactionType,
                }
            );

            fetchPost();

        } catch (error) {
            console.error("REACTION ERROR:", error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please login to comment.");
            return;
        }

        if (!commentText.trim()) {
            return;
        }

        try {
            setCommentLoading(true);

            await api.post(
                `confessions/${id}/comments/`,
                {
                    content: commentText.trim(),
                }
            );

            setCommentText("");

            await fetchComments();
            await fetchPost();

        } catch (error) {
            console.error(
                "COMMENT ERROR:",
                error.response?.data || error
            );
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">
                    Loading confession...
                </p>
            </div>
        );
    }

    if (error || !confession) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">
                        {error || "Confession not found."}
                    </p>

                    <Link
                        to="/"
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-4 py-4">

                    <Link
                        to="/"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back
                    </Link>

                </div>
            </header>

            <main className="w-full max-w-3xl mx-auto px-0 py-0 sm:px-4 sm:py-6">

                {/* POST */}
                <div className="bg-white rounded-none border-0 shadow-none sm:rounded-2xl sm:border sm:border-gray-100 sm:shadow-sm">
                    {/* Author */}
                    <div className="flex items-center gap-3 p-4 sm:p-5">

                        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                            {avatarIcons[confession.anonymous_avatar] ||
                                "🐱"}
                        </div>

                        <div>
                            <p className="font-semibold text-gray-900">
                                {confession.anonymous_username}
                            </p>

                            <p className="text-xs text-gray-500">
                                {formatTimeAgo(confession.created_at)}
                            </p>
                        </div>

                    </div>

                    {/* Content */}
                    <div className="px-4 pb-5 sm:px-5">
                        <p className="text-gray-800 text-lg whitespace-pre-wrap">
                            {confession.content}
                        </p>
                    </div>

                    {/* Reaction summary */}
                    <div className="px-4 py-3 border-t border-b sm:px-5">

                        <div className="flex items-center gap-2">

                            {Object.entries(
                                confession.reaction_counts || {}
                            )
                                .filter(([, count]) => count > 0)
                                .map(([type]) => (
                                    <span
                                        key={type}
                                        title={reactionLabels[type]}
                                        className="text-xl"
                                    >
                                        {reactionIcons[type]}
                                    </span>
                                ))}

                            <span className="text-sm text-gray-500">
                                {confession.total_reactions || 0} reactions
                            </span>

                        </div>

                    </div>

                    {/* Reaction buttons */}
                    <div className="px-4 py-3 border-b sm:px-5">

                        <div className="flex flex-wrap gap-2">

                            {Object.entries(reactionIcons).map(
                                ([type, icon]) => (
                                    <button
                                        key={type}
                                        onClick={() =>
                                            handleReaction(type)
                                        }
                                        className={`px-3 py-2 rounded-full text-sm transition ${confession.my_reaction === type
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                    >
                                        {icon} {reactionLabels[type]}
                                    </button>
                                )
                            )}

                        </div>

                    </div>

                    {/* Comments */}
                    <div className="p-4 sm:p-5">

                        <h2 className="font-semibold text-lg mb-4">
                            Comments
                            <span className="text-gray-400 font-normal ml-2">
                                {comments.length}
                            </span>
                        </h2>

                        {/* Comment list */}
                        <div className="space-y-4">

                            {comments.length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="flex gap-3"
                                    >

                                        <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                                            {avatarIcons[
                                                comment.anonymous_avatar
                                            ] || "🐱"}
                                        </div>

                                        <div className="bg-gray-100 rounded-2xl px-4 py-3">

                                            <p className="font-semibold text-sm text-gray-900">
                                                {comment.anonymous_username}
                                            </p>

                                            <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                                                {comment.content}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatTimeAgo(comment.created_at)}
                                            </p>

                                        </div>

                                    </div>
                                ))
                            )}

                        </div>

                        {/* Comment box */}
                        <form
                            onSubmit={handleComment}
                            className="mt-6"
                        >

                            {user ? (
                                <div className="flex gap-3">

                                    <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                                        🐱
                                    </div>

                                    <div className="flex-1 flex gap-2">

                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) =>
                                                setCommentText(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Write a comment..."
                                            className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        <button
                                            type="submit"
                                            disabled={
                                                commentLoading ||
                                                !commentText.trim()
                                            }
                                            className="px-5 py-2 bg-blue-600 text-white rounded-full disabled:opacity-50 hover:bg-blue-700"
                                        >
                                            {commentLoading
                                                ? "..."
                                                : "Post"}
                                        </button>

                                    </div>

                                </div>
                            ) : (
                                <div className="text-center bg-gray-50 rounded-xl p-4">

                                    <p className="text-gray-600 text-sm mb-2">
                                        Login to join the conversation.
                                    </p>

                                    <Link
                                        to="/login"
                                        className="text-blue-600 font-medium hover:underline"
                                    >
                                        Login
                                    </Link>

                                </div>
                            )}

                        </form>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default ConfessionDetail;