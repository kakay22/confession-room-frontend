import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatRelativeDate } from "../utils/date";

import ConfessionCard from "../components/confession/ConfessionCard";

// =====================================================
// AVATARS
// =====================================================

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
    return avatarIcons[avatar] || avatarIcons.avatar1;
};

// =====================================================
// DATE
// =====================================================

const formatDate = (date) => {
    if (!date) return "";

    try {
        return formatRelativeDate(date);
    } catch {
        return new Date(date).toLocaleString();
    }
};

// =====================================================
// MEDIA
// =====================================================

const getMediaUrl = (url) => {
    if (!url) return "";

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `http://127.0.0.1:8000${url}`;
};

// =====================================================
// POST TYPE HELPERS
// =====================================================

const getPostMedia = (confession) => {
    if (!confession) return [];

    if (Array.isArray(confession.media)) {
        return confession.media;
    }

    if (Array.isArray(confession.media_files)) {
        return confession.media_files;
    }

    if (Array.isArray(confession.attachments)) {
        return confession.attachments;
    }

    return [];
};

const getPostType = (confession) => {
    const media = getPostMedia(confession);

    const explicitType = String(
        confession?.post_type ||
        confession?.media_type ||
        confession?.content_type ||
        confession?.confession_type ||
        ""
    ).toLowerCase();

    if (
        explicitType.includes("voice") ||
        explicitType.includes("audio")
    ) {
        return "voice";
    }

    if (explicitType.includes("image")) {
        return "image";
    }

    if (media.length > 0) {
        const hasVoice = media.some((item) => {
            const type = String(
                item?.media_type ||
                item?.type ||
                item?.file_type ||
                item?.mime_type ||
                ""
            ).toLowerCase();

            const url = String(
                item?.url ||
                item?.file ||
                item?.media ||
                ""
            ).toLowerCase();

            return (
                type.includes("audio") ||
                type.includes("voice") ||
                url.endsWith(".mp3") ||
                url.endsWith(".wav") ||
                url.endsWith(".ogg") ||
                url.endsWith(".m4a") ||
                url.endsWith(".webm")
            );
        });

        if (hasVoice) {
            return "voice";
        }

        const hasImage = media.some((item) => {
            const type = String(
                item?.media_type ||
                item?.type ||
                item?.file_type ||
                item?.mime_type ||
                ""
            ).toLowerCase();

            const url = String(
                item?.url ||
                item?.file ||
                item?.media ||
                ""
            ).toLowerCase();

            return (
                type.includes("image") ||
                url.endsWith(".jpg") ||
                url.endsWith(".jpeg") ||
                url.endsWith(".png") ||
                url.endsWith(".gif") ||
                url.endsWith(".webp")
            );
        });

        if (hasImage) {
            return "image";
        }
    }

    return "text";
};

// =====================================================
// REPORT FORM
// =====================================================

function ReportForm({ confession, onClose }) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            alert("Please select a reason.");
            return;
        }

        try {
            setSubmitting(true);

            await api.post(
                `confessions/${confession.id}/report/`,
                {
                    reason,
                    description,
                }
            );

            alert(
                "Thank you. Your report has been submitted."
            );

            onClose();
        } catch (error) {
            console.error(
                "REPORT ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to submit report."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-2.5 sm:space-y-3">
                {[
                    ["HARASSMENT", "Harassment"],
                    ["BULLYING", "Bullying"],
                    ["SPAM", "Spam"],
                    [
                        "INAPPROPRIATE",
                        "Inappropriate content",
                    ],
                    ["THREAT", "Threat"],
                    ["OTHER", "Other"],
                ].map(([value, label]) => (
                    <label
                        key={value}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                            reason === value
                                ? "border-red-200 bg-red-50"
                                : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <input
                            type="radio"
                            name="report-reason"
                            value={value}
                            checked={reason === value}
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
                            className="h-4 w-4 shrink-0"
                        />

                        <span className="text-sm text-gray-700">
                            {label}
                        </span>
                    </label>
                ))}
            </div>

            <div className="relative">
                <textarea
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    maxLength={500}
                    rows={4}
                    placeholder="Tell us more (optional)..."
                    className="mt-4 min-h-24 w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm leading-6 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                />

                <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
                    {description.length}/500
                </span>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2.5 sm:mt-5 sm:flex-row sm:justify-end sm:gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="min-h-11 rounded-xl px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={submitting || !reason}
                    className="min-h-11 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting
                        ? "Submitting..."
                        : "Submit report"}
                </button>
            </div>
        </form>
    );
}

// =====================================================
// HOME
// =====================================================

function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // =================================================
    // SEARCH & FILTER
    // =================================================

    const [searchQuery, setSearchQuery] = useState("");
    const [postFilter, setPostFilter] = useState("all");

    // =================================================
    // FEED TAB
    // =================================================

    const [activeTab, setActiveTab] = useState("for-you");

    // =================================================
    // UI STATE
    // =================================================

    const [openMenu, setOpenMenu] = useState(null);

    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const [profileMenuOpen, setProfileMenuOpen] =
        useState(false);

    const [fullscreenImage, setFullscreenImage] =
        useState(null);

    const [reportConfession, setReportConfession] =
        useState(null);

    // =================================================
    // CONFESSIONS
    // =================================================

    const [confessions, setConfessions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // =================================================
    // REACTIONS
    // =================================================

    const [reactionPicker, setReactionPicker] =
        useState(null);

    const [reacting, setReacting] = useState({});

    // =================================================
    // COMMENTS
    // =================================================

    const [comments, setComments] = useState({});

    const [loadingComments, setLoadingComments] =
        useState({});

    const [commentVisible, setCommentVisible] =
        useState({});

    const [commentInputs, setCommentInputs] =
        useState({});

    const [submittingComment, setSubmittingComment] =
        useState({});

    // =================================================
    // NOTIFICATIONS
    // =================================================

    const [notifications, setNotifications] =
        useState([]);

    // =================================================
    // PROFILE
    // =================================================

    const [anonymousAvatar, setAnonymousAvatar] =
        useState("avatar1");

    // =================================================
    // SEND SECRETLY
    // =================================================

    const [secretModal, setSecretModal] =
        useState(null);

    const [secretSearch, setSecretSearch] =
        useState("");

    const [secretRecipients, setSecretRecipients] =
        useState([]);

    const [selectedSecretRecipient, setSelectedSecretRecipient] =
        useState(null);

    const [loadingSecretRecipients, setLoadingSecretRecipients] =
        useState(false);

    const [sendingSecret, setSendingSecret] =
        useState(false);

    const [secretError, setSecretError] =
        useState("");

    const [secretSuccess, setSecretSuccess] =
        useState("");

    // =================================================
    // FETCH ANONYMOUS PROFILE
    // =================================================

    const fetchAnonymousProfile = async () => {
        if (!user) {
            setAnonymousAvatar("avatar1");
            return;
        }

        try {
            const response = await api.get(
                "auth/profile/anonymous/"
            );

            setAnonymousAvatar(
                response.data?.anonymous_avatar ||
                "avatar1"
            );
        } catch (error) {
            console.error(
                "ANONYMOUS PROFILE ERROR:",
                error.response?.data || error
            );

            setAnonymousAvatar("avatar1");
        }
    };

    // =================================================
    // FETCH NOTIFICATIONS
    // =================================================

    const fetchNotifications = async () => {
        if (!user) {
            setNotifications([]);
            return;
        }

        try {
            const response = await api.get(
                "confessions/notifications/"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setNotifications(data);
        } catch (error) {
            console.error(
                "NOTIFICATION ERROR:",
                error.response?.data || error
            );
        }
    };

    // =================================================
    // NOTIFICATION CLICK
    // =================================================

    const handleNotificationClick = async (
        notification
    ) => {
        try {
            if (!notification.is_read) {
                await api.post(
                    `confessions/notifications/${notification.id}/read/`
                );

                setNotifications((previous) =>
                    previous.map((item) =>
                        item.id === notification.id
                            ? {
                                ...item,
                                is_read: true,
                            }
                            : item
                    )
                );
            }

            setNotificationOpen(false);

            if (notification.confession) {
                navigate(
                    `/confession/${notification.confession}`
                );
            }
        } catch (error) {
            console.error(
                "NOTIFICATION READ ERROR:",
                error
            );

            if (notification.confession) {
                navigate(
                    `/confession/${notification.confession}`
                );
            }
        }
    };

    // =================================================
    // FETCH CONFESSIONS
    // =================================================

    const fetchConfessions = async (
        showLoading = true
    ) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                "confessions/"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setConfessions(data);
        } catch (error) {
            console.error(
                "ERROR FETCHING CONFESSIONS:",
                error
            );

            setError(
                "Unable to load confessions."
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {
        fetchConfessions();
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchAnonymousProfile();
    }, [user]);

    // =================================================
    // UNREAD NOTIFICATIONS
    // =================================================

    const unreadNotifications =
        notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;

    // =================================================
    // SECRET RECIPIENT SEARCH
    // =================================================

    useEffect(() => {
        if (!secretModal || !user) {
            return;
        }

        let cancelled = false;

        const loadRecipients = async () => {
            try {
                setLoadingSecretRecipients(true);
                setSecretError("");

                const query =
                    secretSearch.trim();

                const response = await api.get(
                    `confessions/secret-recipients/?search=${encodeURIComponent(
                        query
                    )}`
                );

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || [];

                if (!cancelled) {
                    setSecretRecipients(data);
                }
            } catch (error) {
                console.error(
                    "SECRET RECIPIENT ERROR:",
                    error.response?.data || error
                );

                if (!cancelled) {
                    if (error.response?.status === 401) {
                        localStorage.removeItem("access");
                        localStorage.removeItem("refresh");
                        navigate("/login");
                        return;
                    }

                    setSecretError(
                        error.response?.data?.detail ||
                        "Unable to load recipients."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingSecretRecipients(false);
                }
            }
        };

        const timeout = setTimeout(
            loadRecipients,
            secretSearch.trim() ? 250 : 0
        );

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [
        secretModal,
        secretSearch,
        user,
        navigate,
    ]);

    // =================================================
    // OPEN SECRET MODAL
    // =================================================

    const handleOpenSecretModal = (confession) => {
        if (!user) {
            navigate("/login");
            return;
        }

        setSecretModal(confession);
        setSecretSearch("");
        setSecretRecipients([]);
        setSelectedSecretRecipient(null);
        setSecretError("");
        setSecretSuccess("");
        setSendingSecret(false);
    };

    // =================================================
    // CLOSE SECRET MODAL
    // =================================================

    const handleCloseSecretModal = () => {
        if (sendingSecret) {
            return;
        }

        setSecretModal(null);
        setSecretSearch("");
        setSecretRecipients([]);
        setSelectedSecretRecipient(null);
        setSecretError("");
        setSecretSuccess("");
        setSendingSecret(false);
    };

    // =================================================
    // SEND SECRET
    // =================================================

    const handleSendSecret = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (!secretModal) {
            return;
        }

        if (!selectedSecretRecipient) {
            setSecretError(
                "Please select someone first."
            );
            return;
        }

        if (sendingSecret) {
            return;
        }

        try {
            setSendingSecret(true);
            setSecretError("");
            setSecretSuccess("");

            const response = await api.post(
                `confessions/${secretModal.id}/send-secret/`,
                {
                    recipient:
                        selectedSecretRecipient.id,
                }
            );

            setSecretSuccess(
                response.data?.message ||
                "Secret confession sent successfully."
            );

            // Keep the success message visible briefly,
            // then close the modal.
            setTimeout(() => {
                setSecretModal(null);
                setSecretSearch("");
                setSecretRecipients([]);
                setSelectedSecretRecipient(null);
                setSecretError("");
                setSecretSuccess("");
                setSendingSecret(false);

                fetchNotifications();
            }, 900);
        } catch (error) {
            console.error(
                "SEND SECRET ERROR:",
                error.response?.data || error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                navigate("/login");
                return;
            }

            const detail =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to send this confession secretly.";

            setSecretError(detail);
            setSendingSecret(false);
        }
    };

    // =================================================
    // REACTION
    // =================================================

    const handleReaction = async (
        confessionId,
        reactionType
    ) => {
        if (!user) {
            navigate("/login");
            return;
        }

        setReacting((previous) => ({
            ...previous,
            [confessionId]: true,
        }));

        const scrollY = window.scrollY;

        try {
            await api.post(
                `confessions/${confessionId}/react/`,
                {
                    reaction_type: reactionType,
                }
            );

            setReactionPicker(null);

            await fetchConfessions(false);

            requestAnimationFrame(() => {
                window.scrollTo({
                    top: scrollY,
                    behavior: "instant",
                });
            });
        } catch (error) {
            console.error(
                "REACTION ERROR:",
                error.response?.data || error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                navigate("/login");
            }
        } finally {
            setReacting((previous) => ({
                ...previous,
                [confessionId]: false,
            }));
        }
    };

    // =================================================
    // REACTION BUTTON
    // =================================================

    const handleReactButton = (confessionId) => {
        if (!user) {
            navigate("/login");
            return;
        }

        setReactionPicker((current) =>
            current === confessionId
                ? null
                : confessionId
        );
    };

    // =================================================
    // COMMENT FETCH
    // =================================================

    const fetchComments = async (confessionId) => {
        try {
            setLoadingComments((previous) => ({
                ...previous,
                [confessionId]: true,
            }));

            const response = await api.get(
                `confessions/${confessionId}/comments/`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setComments((previous) => ({
                ...previous,
                [confessionId]: data,
            }));

            setCommentVisible((previous) => ({
                ...previous,
                [confessionId]: true,
            }));
        } catch (error) {
            console.error(
                "COMMENTS ERROR:",
                error.response?.data || error
            );
        } finally {
            setLoadingComments((previous) => ({
                ...previous,
                [confessionId]: false,
            }));
        }
    };

    // =================================================
    // TOGGLE COMMENTS
    // =================================================

    const toggleComments = (confessionId) => {
        const visible =
            commentVisible[confessionId];

        if (visible) {
            setCommentVisible((previous) => ({
                ...previous,
                [confessionId]: false,
            }));

            return;
        }

        fetchComments(confessionId);
    };

    // =================================================
    // COMMENT INPUT
    // =================================================

    const handleCommentInput = (
        confessionId,
        value
    ) => {
        setCommentInputs((previous) => ({
            ...previous,
            [confessionId]: value,
        }));
    };

    // =================================================
    // COMMENT SUBMIT
    // =================================================

    const handleComment = async (
        e,
        confessionId
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate("/login");
            return;
        }

        const content =
            commentInputs[confessionId]?.trim();

        if (!content) {
            return;
        }

        if (submittingComment[confessionId]) {
            return;
        }

        try {
            setSubmittingComment((previous) => ({
                ...previous,
                [confessionId]: true,
            }));

            const response = await api.post(
                `confessions/${confessionId}/comments/`,
                {
                    content,
                }
            );

            setComments((previous) => ({
                ...previous,
                [confessionId]: [
                    ...(previous[confessionId] || []),
                    response.data,
                ],
            }));

            setCommentInputs((previous) => ({
                ...previous,
                [confessionId]: "",
            }));

            setCommentVisible((previous) => ({
                ...previous,
                [confessionId]: true,
            }));

            setConfessions((previous) =>
                previous.map((confession) =>
                    confession.id === confessionId
                        ? {
                            ...confession,
                            comment_count:
                                (confession.comment_count ||
                                    0) + 1,
                        }
                        : confession
                )
            );
        } catch (error) {
            console.error(
                "COMMENT ERROR:",
                error.response?.data || error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                navigate("/login");
            }
        } finally {
            setSubmittingComment((previous) => ({
                ...previous,
                [confessionId]: false,
            }));
        }
    };

    // =================================================
    // OPEN CONFESSION
    // =================================================

    const openConfession = (confessionId) => {
        navigate(`/confession/${confessionId}`);
    };

    // =================================================
    // LOGOUT
    // =================================================

    const handleLogout = () => {
        setProfileMenuOpen(false);

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        window.location.href = "/";
    };

    // =================================================
    // CLOSE MENUS
    // =================================================

    const handlePageClick = () => {
        setReactionPicker(null);
        setOpenMenu(null);
        setProfileMenuOpen(false);
        setNotificationOpen(false);
    };

    // =================================================
    // FILTERED CONFESSIONS
    // =================================================

    const filteredConfessions = useMemo(() => {
        const query =
            searchQuery.trim().toLowerCase();

        let result = confessions.filter(
            (confession) => {
                const caption = String(
                    confession.content ||
                    confession.caption ||
                    confession.text ||
                    ""
                ).toLowerCase();

                const matchesSearch =
                    !query ||
                    caption.includes(query);

                const postType =
                    getPostType(confession);

                const matchesFilter =
                    postFilter === "all" ||
                    postType === postFilter;

                return (
                    matchesSearch &&
                    matchesFilter
                );
            }
        );

        // =================================================
        // FOR YOU
        // =================================================

        if (activeTab === "for-you") {
            return result;
        }

        // =================================================
        // LATEST
        // =================================================

        if (activeTab === "latest") {
            return [...result].sort(
                (a, b) =>
                    new Date(
                        b.created_at || 0
                    ) -
                    new Date(
                        a.created_at || 0
                    )
            );
        }

        // =================================================
        // TRENDING
        // =================================================

        if (activeTab === "trending") {
            return [...result].sort((a, b) => {
                const aReactions =
                    Number(
                        a.total_reactions || 0
                    );

                const bReactions =
                    Number(
                        b.total_reactions || 0
                    );

                const aComments =
                    Number(
                        a.comment_count || 0
                    );

                const bComments =
                    Number(
                        b.comment_count || 0
                    );

                const aScore =
                    aReactions * 3 +
                    aComments * 2;

                const bScore =
                    bReactions * 3 +
                    bComments * 2;

                return bScore - aScore;
            });
        }

        // =================================================
        // ROOMS
        // =================================================

        return result;
    }, [
        confessions,
        searchQuery,
        postFilter,
        activeTab,
    ]);

    // =================================================
    // FILTER OPTIONS
    // =================================================

    const filters = [
        {
            value: "all",
            label: "All",
            icon: "apps",
        },
        {
            value: "text",
            label: "Text",
            icon: "article",
        },
        {
            value: "image",
            label: "Image",
            icon: "image",
        },
        {
            value: "voice",
            label: "Voice",
            icon: "mic",
        },
    ];

    // =================================================
    // TOP TABS
    // =================================================

    const tabs = [
        {
            value: "for-you",
            label: "For You",
            icon: "auto_awesome",
        },
        {
            value: "trending",
            label: "Trending",
            icon: "local_fire_department",
        },
        {
            value: "latest",
            label: "Latest",
            icon: "schedule",
        },
        {
            value: "rooms",
            label: "Rooms",
            icon: "grid_view",
        },
    ];

    // =================================================
    // MOBILE NAVIGATION
    // =================================================

    const handleMobileNav = (item) => {
        if (item === "home") {
            setActiveTab("for-you");

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        if (item === "trending") {
            setActiveTab("trending");

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        if (item === "create") {
            if (!user) {
                navigate("/login");
                return;
            }

            navigate("/confess");
            return;
        }

        if (item === "notifications") {
            if (!user) {
                navigate("/login");
                return;
            }

            setNotificationOpen(true);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        if (item === "profile") {
            if (!user) {
                navigate("/login");
                return;
            }

            navigate("/profile");
        }
    };

    // =================================================
    // RENDER
    // =================================================

    return (
        <div
            className="min-h-screen overflow-x-hidden bg-[#f7f7f8] pb-20 sm:pb-0"
            onClick={handlePageClick}
        >
            {/* =================================================
                DESKTOP / MOBILE HEADER
            ================================================= */}

            <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">
                <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-4 lg:px-6">
                    {/* LOGO */}

                    <Link
                        to="/"
                        className="min-w-0 no-underline"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-base text-white shadow-sm sm:h-10 sm:w-10">
                                <i className="fas fa-user-secret"></i>
                            </div>

                            <div className="hidden min-w-0 sm:block">
                                <h1 className="m-0 truncate text-sm font-bold leading-tight tracking-tight text-gray-900 md:text-base">
                                    Confession Room
                                </h1>

                                <p className="m-0 mt-0.5 truncate text-[10px] leading-tight text-gray-400 md:text-[11px]">
                                    Say what you can't say
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* RIGHT SIDE */}

                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        {/* NOTIFICATIONS */}

                        {user && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        setNotificationOpen(
                                            (previous) =>
                                                !previous
                                        );

                                        setProfileMenuOpen(
                                            false
                                        );
                                    }}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 active:bg-gray-200"
                                    aria-label="Notifications"
                                >
                                    <span className="material-symbols-outlined text-[23px]">
                                        notifications
                                    </span>

                                    {unreadNotifications >
                                        0 && (
                                        <span className="absolute right-0.5 top-0.5 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                                            {unreadNotifications >
                                            9
                                                ? "9+"
                                                : unreadNotifications}
                                        </span>
                                    )}
                                </button>

                                {notificationOpen && (
                                    <div
                                        className="absolute right-0 top-11 z-50 w-[calc(100vw-1.5rem)] max-w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
                                            <h3 className="m-0 text-sm font-bold text-gray-900 sm:text-base">
                                                Notifications
                                            </h3>

                                            {unreadNotifications >
                                                0 && (
                                                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                                                    {
                                                        unreadNotifications
                                                    }{" "}
                                                    new
                                                </span>
                                            )}
                                        </div>

                                        <div className="max-h-[70vh] overflow-y-auto">
                                            {notifications.length ===
                                            0 ? (
                                                <div className="px-5 py-10 text-center">
                                                    <span className="material-symbols-outlined text-3xl text-gray-300">
                                                        notifications_none
                                                    </span>

                                                    <p className="mt-2 text-sm text-gray-500">
                                                        No
                                                        notifications
                                                        yet.
                                                    </p>
                                                </div>
                                            ) : (
                                                notifications.map(
                                                    (
                                                        notification
                                                    ) => {
                                                        const isSecret =
                                                            notification.notification_type ===
                                                            "SECRET";

                                                        return (
                                                            <button
                                                                key={
                                                                    notification.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    handleNotificationClick(
                                                                        notification
                                                                    )
                                                                }
                                                                className={`flex w-full gap-3 border-b border-gray-50 px-4 py-3.5 text-left transition last:border-0 hover:bg-gray-50 ${
                                                                    !notification.is_read
                                                                        ? "bg-blue-50/50"
                                                                        : "bg-white"
                                                                }`}
                                                            >
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-10 sm:w-10">
                                                                    <span className="material-symbols-outlined text-[20px]">
                                                                        {isSecret
                                                                            ? "mail"
                                                                            : notification.notification_type ===
                                                                              "COMMENT"
                                                                            ? "chat_bubble"
                                                                            : "thumb_up"}
                                                                    </span>
                                                                </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <p className="m-0 text-xs leading-5 text-gray-700 sm:text-sm">
                                                                        {isSecret ? (
                                                                            <>
                                                                                <span className="font-semibold text-gray-900">
                                                                                    Someone
                                                                                </span>{" "}
                                                                                sent
                                                                                you
                                                                                a
                                                                                secret
                                                                                confession.
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="font-semibold text-gray-900">
                                                                                    {notification.anonymous_username ||
                                                                                        "Someone"}
                                                                                </span>{" "}
                                                                                {notification.notification_type ===
                                                                                "COMMENT"
                                                                                    ? "commented on your confession."
                                                                                    : "reacted to your confession."}
                                                                            </>
                                                                        )}
                                                                    </p>

                                                                    <p className="m-0 mt-1 text-[10px] text-gray-400 sm:text-xs">
                                                                        {formatDate(
                                                                            notification.created_at
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                {!notification.is_read && (
                                                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                                )}
                                                            </button>
                                                        );
                                                    }
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PROFILE */}

                        {user ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        setProfileMenuOpen(
                                            (previous) =>
                                                !previous
                                        );

                                        setNotificationOpen(
                                            false
                                        );
                                    }}
                                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xl transition hover:bg-blue-100 active:bg-blue-100 sm:text-2xl"
                                    aria-label="Open profile menu"
                                >
                                    {getAvatarIcon(
                                        anonymousAvatar
                                    )}
                                </button>

                                {profileMenuOpen && (
                                    <div
                                        className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <Link
                                            to="/profile"
                                            onClick={() =>
                                                setProfileMenuOpen(
                                                    false
                                                )
                                            }
                                            className="flex min-h-12 items-center gap-3 px-4 text-sm font-medium text-gray-700 no-underline transition hover:bg-gray-50"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                person
                                            </span>

                                            Profile
                                        </Link>

                                        <div className="border-t border-gray-100" />

                                        <button
                                            type="button"
                                            onClick={
                                                handleLogout
                                            }
                                            className="flex min-h-12 w-full items-center gap-3 px-4 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                logout
                                            </span>

                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-600 no-underline transition hover:bg-gray-100 sm:px-4 sm:text-sm"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white no-underline transition hover:bg-blue-700 sm:px-4 sm:text-sm"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* =================================================
                TOP FEED TABS
            ================================================= */}

            <div className="sticky top-14 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-xl sm:top-16">
                <div className="mx-auto max-w-3xl">
                    <div className="flex overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-0">
                        {tabs.map((tab) => {
                            const active =
                                activeTab ===
                                tab.value;

                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(
                                            tab.value
                                        );

                                        if (
                                            tab.value ===
                                            "rooms"
                                        ) {
                                            setPostFilter(
                                                "all"
                                            );
                                        }

                                        window.scrollTo({
                                            top: 0,
                                            behavior:
                                                "smooth",
                                        });
                                    }}
                                    className={`relative flex min-h-12 shrink-0 items-center justify-center gap-1.5 px-4 text-xs font-semibold transition sm:min-h-14 sm:px-6 sm:text-sm ${
                                        active
                                            ? "text-gray-900"
                                            : "text-gray-400 hover:text-gray-700"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {tab.icon}
                                    </span>

                                    {tab.label}

                                    {active && (
                                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gray-900 sm:left-5 sm:right-5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="mx-auto w-full max-w-3xl">
                {/* PAGE HEADER */}

                <section className="px-4 pb-3 pt-5 sm:px-0 sm:pb-5 sm:pt-8">
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="m-0 text-[23px] font-bold tracking-tight text-gray-900 sm:text-3xl">
                                    {activeTab ===
                                    "trending"
                                        ? "Trending"
                                        : activeTab ===
                                          "latest"
                                        ? "Latest confessions"
                                        : activeTab ===
                                          "rooms"
                                        ? "Explore rooms"
                                        : "School confessions"}
                                </h2>

                                {activeTab ===
                                    "trending" && (
                                    <span className="material-symbols-outlined text-[22px] text-orange-500">
                                        local_fire_department
                                    </span>
                                )}
                            </div>

                            <p className="m-0 mt-1.5 text-xs leading-5 text-gray-500 sm:mt-2 sm:text-sm">
                                {activeTab ===
                                "trending"
                                    ? "See what your campus is talking about."
                                    : activeTab ===
                                      "latest"
                                    ? "Fresh confessions from your school."
                                    : activeTab ===
                                      "rooms"
                                    ? "Choose a space that matches your mood."
                                    : "A place to speak freely, anonymously."}
                            </p>
                        </div>

                        {user && (
                            <Link
                                to="/confess"
                                className="hidden shrink-0 items-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold no-underline shadow-sm transition hover:bg-gray-800 sm:flex"
                            >
                                <span className="material-symbols-outlined mr-1.5 text-[18px]">
                                    add
                                </span>

                                New confession
                            </Link>
                        )}
                    </div>
                </section>

                {/* =================================================
                    ROOMS
                ================================================= */}

                {activeTab === "rooms" && (
                    <section className="px-3 pb-4 sm:px-0">
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                            {[
                                {
                                    value: "all",
                                    label: "Everything",
                                    icon: "apps",
                                    description:
                                        "All confessions",
                                },
                                {
                                    value: "text",
                                    label: "Thoughts",
                                    icon: "chat",
                                    description:
                                        "Words & stories",
                                },
                                {
                                    value: "image",
                                    label: "Moments",
                                    icon: "image",
                                    description:
                                        "Photo confessions",
                                },
                                {
                                    value: "voice",
                                    label: "Voices",
                                    icon: "mic",
                                    description:
                                        "Voice confessions",
                                },
                            ].map((room) => (
                                <button
                                    key={room.value}
                                    type="button"
                                    onClick={() => {
                                        setPostFilter(
                                            room.value
                                        );

                                        setActiveTab(
                                            "for-you"
                                        );
                                    }}
                                    className={`group rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                                        postFilter ===
                                            room.value &&
                                        activeTab ===
                                            "for-you"
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[23px]">
                                        {room.icon}
                                    </span>

                                    <p className="m-0 mt-3 text-sm font-bold">
                                        {room.label}
                                    </p>

                                    <p
                                        className={`m-0 mt-1 text-[11px] ${
                                            postFilter ===
                                                room.value &&
                                            activeTab ===
                                                "for-you"
                                                ? "text-gray-300"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {
                                            room.description
                                        }
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* =================================================
                    SEARCH & FILTER
                ================================================= */}

                {activeTab !== "rooms" && (
                    <section className="px-3 pb-3 sm:px-0 sm:pb-5">
                        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                            <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[21px] text-gray-400">
                                    search
                                </span>

                                <input
                                    type="text"
                                    value={
                                        searchQuery
                                    }
                                    onChange={(e) =>
                                        setSearchQuery(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search confessions..."
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                />

                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearchQuery(
                                                ""
                                            )
                                        }
                                        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                                        aria-label="Clear search"
                                    >
                                        <span className="material-symbols-outlined text-[19px]">
                                            close
                                        </span>
                                    </button>
                                )}
                            </div>

                            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-3">
                                {filters.map(
                                    (filter) => {
                                        const active =
                                            postFilter ===
                                            filter.value;

                                        return (
                                            <button
                                                key={
                                                    filter.value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setPostFilter(
                                                        filter.value
                                                    )
                                                }
                                                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition active:scale-[0.98] sm:text-sm ${
                                                    active
                                                        ? "bg-gray-900 text-white shadow-sm"
                                                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[17px]">
                                                    {
                                                        filter.icon
                                                    }
                                                </span>

                                                {
                                                    filter.label
                                                }
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            {(searchQuery ||
                                postFilter !==
                                    "all") && (
                                <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                                    <p className="m-0 text-xs text-gray-500 sm:text-sm">
                                        <span className="font-semibold text-gray-800">
                                            {
                                                filteredConfessions.length
                                            }
                                        </span>{" "}
                                        {filteredConfessions.length ===
                                        1
                                            ? "post"
                                            : "posts"}{" "}
                                        found
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery(
                                                ""
                                            );

                                            setPostFilter(
                                                "all"
                                            );
                                        }}
                                        className="shrink-0 text-xs font-semibold text-blue-600 transition hover:text-blue-700 sm:text-sm"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div className="space-y-1.5 sm:space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse border-b border-gray-100 bg-white p-4 sm:rounded-2xl sm:border sm:p-5 sm:shadow-sm"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 sm:h-11 sm:w-11" />

                                    <div className="flex-1">
                                        <div className="h-4 w-32 rounded bg-gray-200" />

                                        <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
                                    </div>
                                </div>

                                <div className="h-4 w-full rounded bg-gray-100" />

                                <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />

                                <div className="mt-4 h-9 w-full rounded-xl bg-gray-100" />
                            </div>
                        ))}
                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (
                    <div className="mx-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center sm:mx-0 sm:p-8">
                        <div className="mb-3 text-3xl">
                            😕
                        </div>

                        <h3 className="m-0 text-base font-bold text-red-800 sm:text-lg">
                            Something went wrong
                        </h3>

                        <p className="m-0 mt-1.5 text-sm leading-6 text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                fetchConfessions()
                            }
                            className="mt-4 min-h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    confessions.length === 0 && (
                        <div className="border-b border-gray-100 bg-white px-5 py-12 text-center sm:rounded-2xl sm:border sm:px-8 sm:shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                                💭
                            </div>

                            <h3 className="m-0 text-lg font-bold text-gray-900">
                                No confessions yet
                            </h3>

                            <p className="mx-auto m-0 mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                Be the first person to
                                say something. Your
                                identity stays
                                anonymous.
                            </p>

                            {user && (
                                <Link
                                    to="/confess"
                                    className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white no-underline transition hover:bg-blue-700"
                                >
                                    <i className="fas fa-pen mr-2"></i>
                                    Share a confession
                                </Link>
                            )}
                        </div>
                    )}

                {/* =================================================
                    FEED
                ================================================= */}

                {!loading &&
                    !error &&
                    confessions.length > 0 && (
                        <>
                            {filteredConfessions.length >
                            0 ? (
                                <div className="space-y-1.5 sm:space-y-4">
                                    {filteredConfessions.map(
                                        (
                                            confession
                                        ) => (
                                            <ConfessionCard
                                                key={
                                                    confession.id
                                                }
                                                confession={
                                                    confession
                                                }
                                                onOpenConfession={
                                                    openConfession
                                                }
                                                onReaction={
                                                    handleReaction
                                                }
                                                onReactButton={
                                                    handleReactButton
                                                }
                                                reactionPicker={
                                                    reactionPicker
                                                }
                                                reacting={
                                                    reacting[
                                                        confession
                                                            .id
                                                    ]
                                                }
                                                comments={
                                                    comments[
                                                        confession
                                                            .id
                                                    ] || []
                                                }
                                                loadingComments={
                                                    loadingComments[
                                                        confession
                                                            .id
                                                    ] ||
                                                    false
                                                }
                                                commentVisible={
                                                    commentVisible[
                                                        confession
                                                            .id
                                                    ] ||
                                                    false
                                                }
                                                commentInput={
                                                    commentInputs[
                                                        confession
                                                            .id
                                                    ] ||
                                                    ""
                                                }
                                                submittingComment={
                                                    submittingComment[
                                                        confession
                                                            .id
                                                    ] ||
                                                    false
                                                }
                                                onToggleComments={
                                                    toggleComments
                                                }
                                                onCommentInput={
                                                    handleCommentInput
                                                }
                                                onComment={
                                                    handleComment
                                                }
                                                openMenu={
                                                    openMenu
                                                }
                                                setOpenMenu={
                                                    setOpenMenu
                                                }
                                                onReport={
                                                    setReportConfession
                                                }
                                                onImageClick={
                                                    setFullscreenImage
                                                }
                                                onSendSecret={
                                                    handleOpenSecretModal
                                                }
                                                user={
                                                    user
                                                }
                                                navigate={
                                                    navigate
                                                }
                                                getAvatarIcon={
                                                    getAvatarIcon
                                                }
                                                formatDate={
                                                    formatDate
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="mx-3 rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center shadow-sm sm:mx-0 sm:px-8 sm:py-12">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                        <span className="material-symbols-outlined text-[28px] text-gray-400">
                                            search_off
                                        </span>
                                    </div>

                                    <h3 className="m-0 mt-4 text-base font-bold text-gray-900 sm:text-lg">
                                        No matching
                                        confessions
                                    </h3>

                                    <p className="mx-auto m-0 mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                        We couldn't find
                                        any posts
                                        matching your
                                        search or
                                        selected
                                        filter.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery(
                                                ""
                                            );

                                            setPostFilter(
                                                "all"
                                            );
                                        }}
                                        className="mt-5 min-h-11 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </>
                    )}
            </main>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="mx-auto max-w-3xl px-4 pb-8 pt-7 text-center sm:pb-8 sm:pt-8">
                <p className="m-0 text-[11px] text-gray-400 sm:text-xs">
                    Confession Room · Your identity stays
                    private
                </p>
            </footer>

            {/* =================================================
                MOBILE BOTTOM NAV
            ================================================= */}

            <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200/90 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl sm:hidden">
                <div className="mx-auto flex h-[62px] max-w-md items-stretch justify-around">
                    {/* HOME */}

                    <button
                        type="button"
                        onClick={() =>
                            handleMobileNav("home")
                        }
                        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                            activeTab === "for-you"
                                ? "text-gray-900"
                                : "text-gray-400"
                        }`}
                    >
                        <span
                            className={`material-symbols-outlined text-[23px] ${
                                activeTab === "for-you"
                                    ? "font-semibold"
                                    : ""
                            }`}
                        >
                            home
                        </span>

                        <span className="text-[10px] font-semibold">
                            Home
                        </span>
                    </button>

                    {/* TRENDING */}

                    <button
                        type="button"
                        onClick={() =>
                            handleMobileNav(
                                "trending"
                            )
                        }
                        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                            activeTab === "trending"
                                ? "text-gray-900"
                                : "text-gray-400"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[23px]">
                            local_fire_department
                        </span>

                        <span className="text-[10px] font-semibold">
                            Trending
                        </span>
                    </button>

                    {/* CREATE */}

                    <button
                        type="button"
                        onClick={() =>
                            handleMobileNav("create")
                        }
                        className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg shadow-gray-900/20">
                            <span className="material-symbols-outlined text-[23px]">
                                add
                            </span>
                        </span>

                        <span className="text-[10px] font-semibold text-gray-500">
                            Create
                        </span>
                    </button>

                    {/* NOTIFICATIONS */}

                    <button
                        type="button"
                        onClick={() =>
                            handleMobileNav(
                                "notifications"
                            )
                        }
                        className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                            notificationOpen
                                ? "text-gray-900"
                                : "text-gray-400"
                        }`}
                    >
                        <span className="relative">
                            <span className="material-symbols-outlined text-[23px]">
                                notifications
                            </span>

                            {unreadNotifications >
                                0 && (
                                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                                    {unreadNotifications >
                                    9
                                        ? "9+"
                                        : unreadNotifications}
                                </span>
                            )}
                        </span>

                        <span className="text-[10px] font-semibold">
                            Alerts
                        </span>
                    </button>

                    {/* PROFILE */}

                    <button
                        type="button"
                        onClick={() =>
                            handleMobileNav(
                                "profile"
                            )
                        }
                        className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-gray-400 transition"
                    >
                        <span className="text-[23px] leading-none">
                            {user
                                ? getAvatarIcon(
                                      anonymousAvatar
                                  )
                                : "👤"}
                        </span>

                        <span className="text-[10px] font-semibold">
                            Profile
                        </span>
                    </button>
                </div>
            </div>

            {/* =================================================
                FULLSCREEN IMAGE
            ================================================= */}

            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-3 sm:p-5"
                    onClick={() =>
                        setFullscreenImage(null)
                    }
                >
                    <button
                        type="button"
                        onClick={() =>
                            setFullscreenImage(null)
                        }
                        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5 sm:top-5"
                        aria-label="Close image"
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            close
                        </span>
                    </button>

                    <img
                        src={getMediaUrl(
                            fullscreenImage
                        )}
                        alt="Fullscreen confession"
                        className="max-h-[94vh] max-w-[96vw] rounded-lg object-contain sm:max-h-[92vh] sm:max-w-[94vw] sm:rounded-xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    />
                </div>
            )}

            {/* =================================================
                REPORT MODAL
            ================================================= */}

            {reportConfession && (
                <div
                    className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
                    onClick={() =>
                        setReportConfession(null)
                    }
                >
                    <div
                        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h2 className="m-0 text-lg font-bold text-gray-900 sm:text-xl">
                                    Report confession
                                </h2>

                                <p className="m-0 mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                                    Help us keep the
                                    confession room
                                    safe.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setReportConfession(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100"
                                aria-label="Close report"
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>

                        <ReportForm
                            confession={
                                reportConfession
                            }
                            onClose={() =>
                                setReportConfession(
                                    null
                                )
                            }
                        />
                    </div>
                </div>
            )}

            {/* =================================================
                SEND SECRETLY MODAL
            ================================================= */}

            {secretModal && (
                <div
                    className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
                    onClick={handleCloseSecretModal}
                >
                    <div
                        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* MODAL HEADER */}

                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                                        <span className="material-symbols-outlined text-[21px]">
                                            mail
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="m-0 text-base font-bold text-gray-900 sm:text-lg">
                                            Send secretly
                                        </h2>

                                        <p className="m-0 mt-0.5 text-[11px] leading-4 text-gray-500 sm:text-xs">
                                            Send this confession to someone privately.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCloseSecretModal
                                }
                                disabled={sendingSecret}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                                aria-label="Close send secretly"
                            >
                                <span className="material-symbols-outlined text-[21px]">
                                    close
                                </span>
                            </button>
                        </div>

                        {/* MODAL CONTENT */}

                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                            {/* CONFESSION PREVIEW */}

                            <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-3.5 sm:mb-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                                        {getAvatarIcon(
                                            secretModal.anonymous_avatar ||
                                                "avatar1"
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="m-0 text-[11px] font-semibold text-gray-500">
                                            {secretModal.anonymous_username ||
                                                "Anonymous"}
                                        </p>

                                        <p className="m-0 mt-1 line-clamp-2 text-xs leading-5 text-gray-700">
                                            {secretModal.content ||
                                                secretModal.caption ||
                                                secretModal.text ||
                                                "This confession has media attached."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SEARCH */}

                            <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                                    search
                                </span>

                                <input
                                    type="text"
                                    value={
                                        secretSearch
                                    }
                                    onChange={(e) => {
                                        setSecretSearch(
                                            e.target
                                                .value
                                        );
                                        setSecretError(
                                            ""
                                        );
                                        setSelectedSecretRecipient(
                                            null
                                        );
                                    }}
                                    placeholder="Search anonymous usernames..."
                                    autoFocus
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                                />
                            </div>

                            {/* ERROR */}

                            {secretError && (
                                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700">
                                    <span className="material-symbols-outlined shrink-0 text-[18px]">
                                        error
                                    </span>

                                    <span>
                                        {secretError}
                                    </span>
                                </div>
                            )}

                            {/* SUCCESS */}

                            {secretSuccess && (
                                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 text-xs font-medium text-green-700">
                                    <span className="material-symbols-outlined text-[18px]">
                                        check_circle
                                    </span>

                                    {secretSuccess}
                                </div>
                            )}

                            {/* RECIPIENTS */}

                            <div className="mt-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="m-0 text-xs font-semibold text-gray-500">
                                        Choose recipient
                                    </p>

                                    {!loadingSecretRecipients &&
                                        secretRecipients.length >
                                            0 && (
                                            <span className="text-[10px] text-gray-400">
                                                {
                                                    secretRecipients.length
                                                }{" "}
                                                available
                                            </span>
                                        )}
                                </div>

                                {loadingSecretRecipients ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(
                                            (
                                                item
                                            ) => (
                                                <div
                                                    key={
                                                        item
                                                    }
                                                    className="flex h-[58px] animate-pulse items-center gap-3 rounded-xl border border-gray-100 px-3"
                                                >
                                                    <div className="h-9 w-9 rounded-full bg-gray-200" />

                                                    <div className="h-3 w-28 rounded bg-gray-100" />
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : secretRecipients.length >
                                  0 ? (
                                    <div className="space-y-2">
                                        {secretRecipients.map(
                                            (
                                                recipient
                                            ) => {
                                                const selected =
                                                    selectedSecretRecipient?.id ===
                                                    recipient.id;

                                                return (
                                                    <button
                                                        key={
                                                            recipient.id
                                                        }
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedSecretRecipient(
                                                                recipient
                                                            );
                                                            setSecretError(
                                                                ""
                                                            );
                                                        }}
                                                        className={`flex min-h-[58px] w-full items-center gap-3 rounded-xl border px-3 text-left transition ${
                                                            selected
                                                                ? "border-gray-900 bg-gray-900 text-white"
                                                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                                                                selected
                                                                    ? "bg-white/10"
                                                                    : "bg-gray-100"
                                                            }`}
                                                        >
                                                            {getAvatarIcon(
                                                                recipient.anonymous_avatar ||
                                                                    "avatar1"
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p
                                                                className={`m-0 truncate text-sm font-semibold ${
                                                                    selected
                                                                        ? "text-white"
                                                                        : "text-gray-800"
                                                                }`}
                                                            >
                                                                {recipient.anonymous_username ||
                                                                    "Anonymous"}
                                                            </p>

                                                            <p
                                                                className={`m-0 mt-0.5 text-[10px] ${
                                                                    selected
                                                                        ? "text-gray-300"
                                                                        : "text-gray-400"
                                                                }`}
                                                            >
                                                                Anonymous
                                                                identity
                                                            </p>
                                                        </div>

                                                        {selected && (
                                                            <span className="material-symbols-outlined shrink-0 text-[20px]">
                                                                check_circle
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center">
                                        <span className="material-symbols-outlined text-[30px] text-gray-300">
                                            person_search
                                        </span>

                                        <p className="m-0 mt-2 text-sm font-semibold text-gray-700">
                                            No recipients found
                                        </p>

                                        <p className="m-0 mt-1 text-xs leading-5 text-gray-400">
                                            Try another anonymous username.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MODAL ACTIONS */}

                        <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
                            <button
                                type="button"
                                onClick={
                                    handleCloseSecretModal
                                }
                                disabled={sendingSecret}
                                className="min-h-11 flex-1 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleSendSecret
                                }
                                disabled={
                                    sendingSecret ||
                                    !selectedSecretRecipient ||
                                    !!secretSuccess
                                }
                                className="flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {sendingSecret ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[19px]">
                                            mail
                                        </span>

                                        Send secretly
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;