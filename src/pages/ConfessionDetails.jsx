import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

const getAvatarIcon = (avatar) => {
    return avatarIcons[avatar] || "👤";
};

/*
|--------------------------------------------------------------------------
| Reactions
|--------------------------------------------------------------------------
| Keep this exactly the same as the Home / ConfessionCard reaction system.
*/

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

const reactionMaterialIcons = {
    RELATABLE: "favorite",
    FUNNY: "sentiment_very_satisfied",
    LIKE: "thumb_up",
    LOVE: "favorite",
    WOW: "sentiment_satisfied",
    SAD: "sentiment_sad",
    ANGRY: "sentiment_dissatisfied",
};

const defaultReactionIcon = "thumb_up_off_alt";

/*
|--------------------------------------------------------------------------
| Time formatter
|--------------------------------------------------------------------------
*/

const formatTimeAgo = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();
    const diff = Math.max(0, now - date);

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 5) return `${weeks}w`;
    if (months < 12) return `${months}mo`;
    return `${years}y`;
};

/*
|--------------------------------------------------------------------------
| Media URL
|--------------------------------------------------------------------------
*/

const getMediaUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `http://127.0.0.1:8000${url.startsWith("/") ? "" : "/"}${url}`;
};

/*
|--------------------------------------------------------------------------
| Confession Media
|--------------------------------------------------------------------------
*/

function ConfessionMedia({ confession, onImageClick }) {
    if (!confession?.media || !Array.isArray(confession.media)) {
        return null;
    }

    if (confession.media.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 space-y-3">
            {confession.media.map((media, index) => {
                const mediaUrl = getMediaUrl(media.url);
                const mediaType = String(media.media_type || "").toUpperCase();

                if (!mediaUrl) {
                    return null;
                }

                if (mediaType === "IMAGE") {
                    return (
                        <button
                            key={media.id || index}
                            type="button"
                            onClick={() => onImageClick(mediaUrl)}
                            className="group block w-full overflow-hidden rounded-xl bg-gray-100 text-left sm:rounded-2xl"
                        >
                            <img
                                src={mediaUrl}
                                alt="Confession attachment"
                                loading="lazy"
                                className="block max-h-[420px] w-full object-contain transition duration-200 group-hover:scale-[1.01] sm:max-h-[600px]"
                            />
                        </button>
                    );
                }

                if (mediaType === "AUDIO") {
                    return (
                        <div
                            key={media.id || index}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:rounded-2xl sm:p-4"
                        >
                            <div className="mb-2.5 flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                                    <span className="material-symbols-outlined text-[22px] text-gray-700">
                                        mic
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-800">
                                        Voice confession
                                    </p>

                                    {media.duration && (
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {Math.floor(media.duration / 60)
                                                .toString()
                                                .padStart(2, "0")}
                                            :
                                            {Math.floor(media.duration % 60)
                                                .toString()
                                                .padStart(2, "0")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <audio
                                controls
                                preload="metadata"
                                src={mediaUrl}
                                className="h-10 w-full"
                            >
                                Your browser does not support audio playback.
                            </audio>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main component
|--------------------------------------------------------------------------
*/

export default function ConfessionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [confession, setConfession] = useState(null);
    const [comments, setComments] = useState([]);

    const [commentText, setCommentText] = useState("");

    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [reacting, setReacting] = useState(false);

    const [showReactions, setShowReactions] = useState(false);

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    const [visibleReplies, setVisibleReplies] = useState({});

    const [fullscreenImage, setFullscreenImage] = useState(null);

    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Toggle replies
    |--------------------------------------------------------------------------
    */

    const toggleReplies = (commentId) => {
        setVisibleReplies((previous) => ({
            ...previous,
            [commentId]: !previous[commentId],
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Reply
    |--------------------------------------------------------------------------
    */

    const handleReply = async (commentId) => {
        const content = replyText.trim();

        if (!content) {
            return;
        }

        if (!user) {
            navigate("/login");
            return;
        }

        try {
            const response = await api.post(
                `confessions/${id}/comments/`,
                {
                    content,
                    parent: commentId,
                }
            );

            const newReply = response.data;

            setComments((previousComments) =>
                previousComments.map((comment) => {
                    if (comment.id !== commentId) {
                        return comment;
                    }

                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []),
                            newReply,
                        ],
                    };
                })
            );

            setReplyText("");
            setReplyingTo(null);

            setVisibleReplies((previous) => ({
                ...previous,
                [commentId]: true,
            }));
        } catch (err) {
            console.error("REPLY ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            alert(
                err.response?.data?.detail ||
                    "Unable to post your reply. Please try again."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Fetch confession
    |--------------------------------------------------------------------------
    */

    const fetchConfession = async () => {
        try {
            const response = await api.get(`confessions/${id}/`);
            setConfession(response.data);
            setError("");
        } catch (err) {
            console.error("CONFESSION ERROR:", err);

            if (err.response?.status === 404) {
                setError("This confession could not be found.");
            } else if (err.response?.status === 401) {
                setError("Your session has expired. Please log in again.");
            } else {
                setError(
                    err.response?.data?.detail ||
                        "Unable to load this confession."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Fetch comments
    |--------------------------------------------------------------------------
    */

    const fetchComments = async () => {
        setCommentsLoading(true);

        try {
            const response = await api.get(
                `confessions/${id}/comments/`
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setComments(data);
            } else if (Array.isArray(data?.results)) {
                setComments(data.results);
            } else {
                setComments([]);
            }
        } catch (err) {
            console.error("COMMENTS ERROR:", err);

            if (err.response?.status === 401) {
                setComments([]);
            }
        } finally {
            setCommentsLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Initial loading
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setLoading(true);
        setError("");

        fetchConfession();
        fetchComments();
    }, [id]);

    /*
    |--------------------------------------------------------------------------
    | Reaction
    |--------------------------------------------------------------------------
    */

    const handleReaction = async (reactionType) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (reacting) {
            return;
        }

        try {
            setReacting(true);

            await api.post(`confessions/${id}/react/`, {
                reaction_type: reactionType,
            });

            setShowReactions(false);

            await fetchConfession();
        } catch (err) {
            console.error("REACTION ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            alert(
                err.response?.data?.detail ||
                    "Unable to save your reaction. Please try again."
            );
        } finally {
            setReacting(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Main reaction button
    |--------------------------------------------------------------------------
    */

    const handleMainReactionClick = () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (reacting) {
            return;
        }

        setShowReactions((previous) => !previous);
    };

    /*
    |--------------------------------------------------------------------------
    | Select reaction
    |--------------------------------------------------------------------------
    */

    const handleSelectReaction = (reactionType) => {
        setShowReactions(false);
        handleReaction(reactionType);
    };

    /*
    |--------------------------------------------------------------------------
    | Main comment
    |--------------------------------------------------------------------------
    */

    const handleComment = async (event) => {
        event.preventDefault();

        const content = commentText.trim();

        if (!content) {
            return;
        }

        if (!user) {
            navigate("/login");
            return;
        }

        try {
            setCommentSubmitting(true);

            await api.post(`confessions/${id}/comments/`, {
                content,
            });

            setCommentText("");

            await Promise.all([
                fetchComments(),
                fetchConfession(),
            ]);
        } catch (err) {
            console.error("COMMENT ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            alert(
                err.response?.data?.detail ||
                    "Unable to post your comment. Please try again."
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div
                        className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-700"
                        aria-label="Loading"
                    />
                    <p className="text-sm text-gray-500">
                        Loading confession...
                    </p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error || !confession) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:h-16">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                arrow_back
                            </span>
                            <span>Back</span>
                        </button>
                    </div>
                </nav>

                <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-8 sm:min-h-[calc(100vh-64px)]">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 sm:rounded-3xl sm:p-8">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                            😔
                        </div>

                        <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                            Confession unavailable
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {error ||
                                "This confession could not be loaded."}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Back to Confessions
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Derived data
    |--------------------------------------------------------------------------
    */

    const reactionCounts = confession.reaction_counts || {};

    const commentCount =
        confession.comment_count ?? comments.length;

    const topLevelComments = comments.filter(
        (comment) => !comment.parent
    );

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --------------------------------------------------------------
                Navbar
            -------------------------------------------------------------- */}

            <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-3xl items-center px-3 sm:h-16 sm:px-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex min-h-10 items-center gap-1 rounded-full px-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:px-3"
                    >
                        <span className="material-symbols-outlined text-[21px]">
                            arrow_back
                        </span>

                        <span>Back</span>
                    </button>

                    <div className="min-w-0 flex-1 px-2 text-center">
                        <span className="block truncate text-sm font-semibold text-gray-900 sm:text-base">
                            Confession
                        </span>
                    </div>

                    <div className="w-[58px] sm:w-[68px]" />
                </div>
            </nav>

            {/* --------------------------------------------------------------
                Main
            -------------------------------------------------------------- */}

            <main className="mx-auto w-full max-w-3xl pb-8 sm:px-4 sm:py-6">
                {/* ----------------------------------------------------------
                    Confession Card
                ---------------------------------------------------------- */}

                <article className="overflow-visible bg-white shadow-sm sm:overflow-hidden sm:rounded-2xl sm:ring-1 sm:ring-gray-100">
                    {/* ------------------------------------------------------
                        Author
                    ------------------------------------------------------ */}

                    <div className="flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl ring-1 ring-gray-200 sm:h-12 sm:w-12">
                            {getAvatarIcon(
                                confession.anonymous_avatar
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-sm font-semibold text-gray-900 sm:text-[15px]">
                                    {confession.anonymous_username ||
                                        "Anonymous"}
                                </p>

                                {confession.is_edited && (
                                    <span className="shrink-0 text-[11px] text-gray-400">
                                        edited
                                    </span>
                                )}
                            </div>

                            <p className="mt-0.5 text-xs text-gray-500 sm:text-[13px]">
                                {formatTimeAgo(
                                    confession.created_at
                                )}
                            </p>
                        </div>
                    </div>

                    {/* ------------------------------------------------------
                        Content
                    ------------------------------------------------------ */}

                    <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-gray-800 sm:text-lg sm:leading-8">
                            {confession.content}
                        </p>

                        <ConfessionMedia
                            confession={confession}
                            onImageClick={setFullscreenImage}
                        />
                    </div>

                    {/* ------------------------------------------------------
                        Reaction Summary
                    ------------------------------------------------------ */}

                    <div className="border-y border-gray-100 px-4 py-2.5 sm:px-5 sm:py-3">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                {Object.entries(reactionIcons).map(
                                    ([type, icon]) => {
                                        const count =
                                            Number(
                                                reactionCounts[type]
                                            ) || 0;

                                        if (count === 0) {
                                            return null;
                                        }

                                        return (
                                            <div
                                                key={type}
                                                className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm"
                                                title={
                                                    reactionLabels[type]
                                                }
                                            >
                                                <span className="text-base leading-none sm:text-lg">
                                                    {icon}
                                                </span>

                                                <span>
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    }
                                )}

                                {Object.values(reactionCounts).every(
                                    (count) =>
                                        Number(count) === 0
                                ) && (
                                    <span className="text-xs text-gray-400 sm:text-sm">
                                        No reactions yet
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "comments-section"
                                        )
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        })
                                }
                                className="shrink-0 text-xs font-medium text-gray-500 transition hover:text-gray-800 sm:text-sm"
                            >
                                {commentCount}{" "}
                                {commentCount === 1
                                    ? "comment"
                                    : "comments"}
                            </button>
                        </div>
                    </div>

                    {/* ------------------------------------------------------
                        Actions
                    ------------------------------------------------------ */}

                    <div className="relative flex border-b border-gray-100">
                        <div className="relative flex-1">
                            {/* Reaction Picker */}

                            {showReactions && (
                                <div className="absolute bottom-full left-2 right-2 z-30 mb-2 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2">
                                    <div className="mx-auto flex max-w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl sm:rounded-full">
                                        {Object.entries(
                                            reactionIcons
                                        ).map(
                                            ([type, icon]) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectReaction(
                                                            type
                                                        )
                                                    }
                                                    disabled={reacting}
                                                    title={
                                                        reactionLabels[
                                                            type
                                                        ]
                                                    }
                                                    aria-label={
                                                        reactionLabels[
                                                            type
                                                        ]
                                                    }
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:scale-110 hover:bg-gray-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11 sm:text-[22px]"
                                                >
                                                    {icon}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={
                                    handleMainReactionClick
                                }
                                disabled={reacting}
                                className="flex min-h-12 w-full items-center justify-center gap-1.5 px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-13 sm:gap-2"
                            >
                                <span className="material-symbols-outlined text-[21px] sm:text-[22px]">
                                    {confession.my_reaction
                                        ? reactionMaterialIcons[
                                              confession.my_reaction
                                          ] ||
                                          defaultReactionIcon
                                        : defaultReactionIcon}
                                </span>

                                <span className="truncate">
                                    {confession.my_reaction
                                        ? reactionLabels[
                                              confession.my_reaction
                                          ] ||
                                          "React"
                                        : "React"}
                                </span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById(
                                        "comments-section"
                                    )
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                    })
                            }
                            className="flex min-h-12 flex-1 items-center justify-center gap-1.5 px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:bg-gray-100 sm:min-h-13 sm:gap-2"
                        >
                            <span className="material-symbols-outlined text-[21px] sm:text-[22px]">
                                chat_bubble_outline
                            </span>

                            <span>Comments</span>

                            {commentCount > 0 && (
                                <span className="text-gray-400">
                                    {commentCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ------------------------------------------------------
                        Comments
                    ------------------------------------------------------ */}

                    <section
                        id="comments-section"
                        className="scroll-mt-16 px-4 py-4 sm:px-5 sm:py-5"
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                                    Comments
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                    Join the conversation
                                </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                                {commentCount}
                            </span>
                        </div>

                        {/* Comments loading */}

                        {commentsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div
                                    className="h-7 w-7 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-700"
                                    aria-label="Loading comments"
                                />
                            </div>
                        ) : topLevelComments.length === 0 ? (
                            <div className="rounded-2xl bg-gray-50 px-5 py-8 text-center">
                                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-gray-100">
                                    💬
                                </div>

                                <p className="text-sm font-semibold text-gray-700">
                                    No comments yet
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Be the first to share your
                                    thoughts.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {topLevelComments.map(
                                    (comment) => {
                                        const replies =
                                            comment.replies ||
                                            [];

                                        const hasReplies =
                                            replies.length > 0;

                                        const isReplying =
                                            replyingTo ===
                                            comment.id;

                                        const areRepliesVisible =
                                            Boolean(
                                                visibleReplies[
                                                    comment.id
                                                ]
                                            );

                                        return (
                                            <div
                                                key={comment.id}
                                                className="min-w-0"
                                            >
                                                {/* Main comment */}

                                                <div className="flex min-w-0 gap-2.5 sm:gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base ring-1 ring-gray-200 sm:h-10 sm:w-10 sm:text-lg">
                                                        {getAvatarIcon(
                                                            comment.anonymous_avatar
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="rounded-2xl bg-gray-50 px-3.5 py-2.5 sm:px-4 sm:py-3">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span className="truncate text-sm font-semibold text-gray-800">
                                                                    {comment.anonymous_username ||
                                                                        "Anonymous"}
                                                                </span>

                                                                <span className="shrink-0 text-[11px] text-gray-400">
                                                                    {formatTimeAgo(
                                                                        comment.created_at
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                                                                {
                                                                    comment.content
                                                                }
                                                            </p>
                                                        </div>

                                                        {/* Comment actions */}

                                                        <div className="mt-1.5 flex flex-wrap items-center gap-1 px-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setReplyingTo(
                                                                        isReplying
                                                                            ? null
                                                                            : comment.id
                                                                    )
                                                                }
                                                                className="min-h-9 rounded-lg px-2.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                                            >
                                                                Reply
                                                            </button>

                                                            {hasReplies && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleReplies(
                                                                            comment.id
                                                                        )
                                                                    }
                                                                    className="min-h-9 rounded-lg px-2.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                                                >
                                                                    {areRepliesVisible
                                                                        ? "Hide replies"
                                                                        : `View ${replies.length} ${
                                                                              replies.length ===
                                                                              1
                                                                                  ? "reply"
                                                                                  : "replies"
                                                                          }`}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Reply form */}

                                                        {isReplying && (
                                                            <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-2.5 sm:p-3">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            replyText
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) =>
                                                                            setReplyText(
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        onKeyDown={(
                                                                            event
                                                                        ) => {
                                                                            if (
                                                                                event.key ===
                                                                                "Enter"
                                                                            ) {
                                                                                event.preventDefault();
                                                                                handleReply(
                                                                                    comment.id
                                                                                );
                                                                            }
                                                                        }}
                                                                        placeholder="Write a reply..."
                                                                        className="min-h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleReply(
                                                                                comment.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !replyText.trim()
                                                                        }
                                                                        className="min-h-10 shrink-0 rounded-xl bg-gray-900 px-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                                                    >
                                                                        Reply
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setReplyingTo(
                                                                            null
                                                                        );
                                                                        setReplyText(
                                                                            ""
                                                                        );
                                                                    }}
                                                                    className="mt-1.5 min-h-8 px-1 text-xs font-medium text-gray-400 hover:text-gray-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Replies */}

                                                        {hasReplies &&
                                                            areRepliesVisible && (
                                                                <div className="mt-3 ml-5 space-y-3 border-l-2 border-gray-100 pl-3 sm:ml-8 sm:pl-4">
                                                                    {replies.map(
                                                                        (
                                                                            reply
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    reply.id
                                                                                }
                                                                                className="flex min-w-0 gap-2.5"
                                                                            >
                                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm ring-1 ring-gray-200">
                                                                                    {getAvatarIcon(
                                                                                        reply.anonymous_avatar
                                                                                    )}
                                                                                </div>

                                                                                <div className="min-w-0 flex-1 rounded-2xl bg-gray-50 px-3 py-2.5">
                                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                                        <span className="truncate text-xs font-semibold text-gray-800 sm:text-sm">
                                                                                            {reply.anonymous_username ||
                                                                                                "Anonymous"}
                                                                                        </span>

                                                                                        <span className="shrink-0 text-[10px] text-gray-400 sm:text-[11px]">
                                                                                            {formatTimeAgo(
                                                                                                reply.created_at
                                                                                            )}
                                                                                        </span>
                                                                                    </div>

                                                                                    <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">
                                                                                        {
                                                                                            reply.content
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}

                        {/* --------------------------------------------------
                            Comment input
                        -------------------------------------------------- */}

                        <div className="mt-6 border-t border-gray-100 pt-4">
                            {user ? (
                                <form
                                    onSubmit={handleComment}
                                    className="flex items-end gap-2.5"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg ring-1 ring-gray-200">
                                        {getAvatarIcon(
                                            user.anonymous_avatar ||
                                                user.avatar
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm transition focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100">
                                            <textarea
                                                value={commentText}
                                                onChange={(event) =>
                                                    setCommentText(
                                                        event.target
                                                            .value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                            "Enter" &&
                                                        !event.shiftKey
                                                    ) {
                                                        event.preventDefault();

                                                        if (
                                                            commentText.trim()
                                                        ) {
                                                            handleComment(
                                                                event
                                                            );
                                                        }
                                                    }
                                                }}
                                                rows={1}
                                                placeholder="Write a comment..."
                                                className="max-h-28 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-5 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0"
                                            />

                                            <button
                                                type="submit"
                                                disabled={
                                                    commentSubmitting ||
                                                    !commentText.trim()
                                                }
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-4"
                                                aria-label="Post comment"
                                            >
                                                {commentSubmitting ? (
                                                    <span
                                                        className="material-symbols-outlined animate-spin text-[20px]"
                                                        aria-hidden="true"
                                                    >
                                                        progress_activity
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[20px] sm:hidden">
                                                            send
                                                        </span>

                                                        <span className="hidden text-sm font-semibold sm:block">
                                                            Post
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <p className="mt-1.5 px-2 text-[10px] text-gray-400 sm:text-xs">
                                            Press Enter to post · Shift +
                                            Enter for a new line
                                        </p>
                                    </div>
                                </form>
                            ) : (
                                <div className="rounded-2xl bg-gray-50 p-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        Want to join the conversation?
                                    </p>

                                    <Link
                                        to="/login"
                                        className="mt-2 inline-flex min-h-10 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white no-underline transition hover:bg-gray-800"
                                    >
                                        Log in to comment
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </article>
            </main>

            {/* --------------------------------------------------------------
                Fullscreen Image
            -------------------------------------------------------------- */}

            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setFullscreenImage(null)}
                        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5 sm:top-5"
                        aria-label="Close image"
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            close
                        </span>
                    </button>

                    <img
                        src={fullscreenImage}
                        alt="Fullscreen confession attachment"
                        className="max-h-[92vh] max-w-full rounded-xl object-contain sm:max-h-[90vh] sm:rounded-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    />
                </div>
            )}
        </div>
    );
}