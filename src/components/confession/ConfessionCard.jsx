import { useState } from "react";
import ConfessionMedia from "./ConfessionMedia";

/* =========================================================
   REACTION CONFIG
========================================================= */

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

/* =========================================================
   CONFESSION CARD
========================================================= */

function ConfessionCard({
    confession,

    /* Navigation */
    onOpenConfession,

    /* Reactions */
    onReaction,
    onReactButton,
    reactionPicker,
    reacting,

    /* Comments */
    comments = [],
    loadingComments = false,
    commentVisible = false,
    commentInput = "",
    submittingComment = false,
    onToggleComments,
    onCommentInput,
    onComment,

    /* Menus */
    openMenu,
    setOpenMenu,

    /* Report */
    onReport,

    /* Send Secretly */
    onSendSecret,

    /* Images */
    onImageClick,

    /* User */
    user,
    navigate,
    getAvatarIcon,
    formatDate,
}) {
    const [shareState, setShareState] = useState("idle");

    const counts = confession?.reaction_counts || {};
    const total = confession?.total_reactions || 0;
    const myReaction = confession?.my_reaction;
    const commentCount = confession?.comment_count || 0;

    const isPickerOpen = reactionPicker === confession?.id;

    /* =====================================================
       SAFETY
    ===================================================== */

    if (!confession) {
        return null;
    }

    /* =====================================================
       CONFESSION URL
    ===================================================== */

    const getConfessionUrl = () => {
        return `${window.location.origin}/confession/${confession.id}`;
    };

    /* =====================================================
       SHARE
    ===================================================== */

    const handleShare = async (event) => {
        event.stopPropagation();

        const url = getConfessionUrl();

        try {
            if (
                navigator.share &&
                typeof navigator.share === "function"
            ) {
                await navigator.share({
                    title: "Confession Room",
                    text:
                        confession.content?.slice(0, 120) ||
                        "Check out this confession.",
                    url,
                });

                setShareState("shared");

                setTimeout(() => {
                    setShareState("idle");
                }, 1500);

                return;
            }

            await navigator.clipboard.writeText(url);

            setShareState("copied");

            setTimeout(() => {
                setShareState("idle");
            }, 1800);
        } catch (error) {
            if (error?.name === "AbortError") {
                return;
            }

            try {
                await navigator.clipboard.writeText(url);

                setShareState("copied");

                setTimeout(() => {
                    setShareState("idle");
                }, 1800);
            } catch (clipboardError) {
                console.error(
                    "SHARE ERROR:",
                    clipboardError
                );
            }
        }
    };

    /* =====================================================
       COPY LINK
    ===================================================== */

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(
                getConfessionUrl()
            );

            setOpenMenu(null);
            setShareState("copied");

            setTimeout(() => {
                setShareState("idle");
            }, 1800);
        } catch (error) {
            console.error(
                "Failed to copy link:",
                error
            );
        }
    };

    /* =====================================================
       REPORT
    ===================================================== */

    const handleReport = () => {
        setOpenMenu(null);

        if (onReport) {
            onReport(confession);
        }
    };

    /* =====================================================
       SEND SECRETLY
    ===================================================== */

    const handleSendSecret = (event) => {
        event?.stopPropagation();

        setOpenMenu(null);

        if (!user) {
            if (navigate) {
                navigate("/login");
            }

            return;
        }

        if (onSendSecret) {
            onSendSecret(confession);
        }
    };

    /* =====================================================
       OPEN DETAILS
    ===================================================== */

    const handleToggleComments = (event) => {
        event?.stopPropagation();

        if (onOpenConfession) {
            onOpenConfession(confession.id);
        }
    };

    /* =====================================================
       REACTION BUTTON
    ===================================================== */

    const handleReact = (event) => {
        event.stopPropagation();

        if (onReactButton) {
            onReactButton(confession.id);
        }
    };

    /* =====================================================
       REACTION SELECTION
    ===================================================== */

    const handleReactionSelect = (type) => {
        if (!reactionIcons[type]) {
            console.error(
                "Invalid reaction type:",
                type
            );

            return;
        }

        if (onReaction) {
            onReaction(
                confession.id,
                type
            );
        }
    };

    /* =====================================================
       COMMENT SUBMIT
    ===================================================== */

    const handleCommentSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (onComment) {
            onComment(
                event,
                confession.id
            );
        }
    };

    /* =====================================================
       COMMENT INPUT
    ===================================================== */

    const handleCommentChange = (event) => {
        if (onCommentInput) {
            onCommentInput(
                confession.id,
                event.target.value
            );
        }
    };

    return (
        <article
            className="
                border-b border-gray-100
                bg-white
                px-4 py-4

                sm:rounded-2xl
                sm:border
                sm:p-5
                sm:shadow-sm

                sm:transition
                sm:duration-200
                sm:hover:border-gray-200
                sm:hover:shadow-md
            "
            onClick={(event) =>
                event.stopPropagation()
            }
        >
            {/* =================================================
                USER HEADER
            ================================================= */}

            <div className="relative mb-4 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() =>
                        onOpenConfession(
                            confession.id
                        )
                    }
                    className="flex min-w-0 items-center gap-3 text-left"
                >
                    {/* AVATAR */}

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl ring-1 ring-black/[0.03]">
                        {getAvatarIcon(
                            confession.anonymous_avatar
                        )}
                    </div>

                    {/* USER INFO */}

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                            {confession.anonymous_username ||
                                `Anonymous #${confession.id}`}
                        </p>

                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">
                                {formatDate(
                                    confession.created_at
                                )}
                            </span>

                            <span className="text-[10px] text-gray-300">
                                •
                            </span>

                            <span className="text-[10px] font-medium text-gray-400">
                                Anonymous
                            </span>
                        </div>
                    </div>
                </button>

                {/* =================================================
                    ELLIPSIS
                ================================================= */}

                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();

                        setOpenMenu(
                            openMenu === confession.id
                                ? null
                                : confession.id
                        );
                    }}
                    className="
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-full
                        text-gray-300
                        transition
                        hover:bg-gray-100
                        hover:text-gray-500
                    "
                    aria-label="More options"
                >
                    <span className="material-symbols-outlined text-[21px]">
                        more_horiz
                    </span>
                </button>

                {/* =================================================
                    OPTIONS MENU
                ================================================= */}

                {openMenu === confession.id && (
                    <div
                        className="
                            absolute
                            right-0
                            top-11
                            z-50
                            w-52
                            overflow-hidden
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            py-1
                            shadow-xl
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="
                                flex w-full
                                items-center gap-3
                                px-4 py-3
                                text-left text-sm
                                text-gray-700
                                transition
                                hover:bg-gray-50
                            "
                        >
                            <span className="material-symbols-outlined text-[19px]">
                                link
                            </span>

                            <span>
                                Copy link
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSendSecret}
                            className="
                                flex w-full
                                items-center gap-3
                                px-4 py-3
                                text-left text-sm
                                text-gray-700
                                transition
                                hover:bg-gray-50
                            "
                        >
                            <span className="material-symbols-outlined text-[19px]">
                                mail
                            </span>

                            <span>
                                Send secretly
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleReport}
                            className="
                                flex w-full
                                items-center gap-3
                                px-4 py-3
                                text-left text-sm
                                text-gray-700
                                transition
                                hover:bg-gray-50
                            "
                        >
                            <span className="material-symbols-outlined text-[19px]">
                                flag
                            </span>

                            <span>
                                Report
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="w-full text-left">
                {confession.content && (
                    <button
                        type="button"
                        onClick={() =>
                            onOpenConfession(
                                confession.id
                            )
                        }
                        className="block w-full text-left"
                    >
                        <p
                            className="
                                whitespace-pre-wrap
                                break-words
                                text-[15px]
                                leading-7
                                text-gray-700
                            "
                        >
                            {confession.content}
                        </p>
                    </button>
                )}

                {/* MEDIA */}

                <div className="mt-4">
                    <ConfessionMedia
                        confession={confession}
                        onImageClick={
                            onImageClick
                        }
                    />
                </div>
            </div>

            {/* =================================================
                REACTION SUMMARY
            ================================================= */}

            {total > 0 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex -space-x-1">
                            {Object.entries(
                                reactionIcons
                            )
                                .filter(
                                    ([type]) =>
                                        Number(
                                            counts[
                                            type
                                            ] || 0
                                        ) > 0
                                )
                                .sort(
                                    (a, b) =>
                                        Number(
                                            counts[
                                            b[0]
                                            ] || 0
                                        ) -
                                        Number(
                                            counts[
                                            a[0]
                                            ] || 0
                                        )
                                )
                                .slice(0, 3)
                                .map(
                                    ([
                                        type,
                                        icon,
                                    ]) => (
                                        <span
                                            key={
                                                type
                                            }
                                            className="
                                                flex h-6 w-6
                                                items-center
                                                justify-center
                                                rounded-full
                                                border-2
                                                border-white
                                                bg-gray-50
                                                text-sm
                                                shadow-sm
                                            "
                                            title={
                                                reactionLabels[
                                                type
                                                ]
                                            }
                                        >
                                            {icon}
                                        </span>
                                    )
                                )}
                        </div>

                        <span className="text-xs font-medium text-gray-500">
                            {total}{" "}
                            {total === 1
                                ? "reaction"
                                : "reactions"}
                        </span>
                    </div>

                    {commentCount > 0 && (
                        <button
                            type="button"
                            onClick={
                                handleToggleComments
                            }
                            className="
                                shrink-0
                                text-xs
                                font-medium
                                text-gray-400
                                transition
                                hover:text-gray-700
                            "
                        >
                            {commentCount}{" "}
                            {commentCount === 1
                                ? "comment"
                                : "comments"}
                        </button>
                    )}
                </div>
            )}

            {/* =================================================
                ACTION BAR
            ================================================= */}

            <div className="relative mt-4 border-t border-gray-100 pt-2">
                {/* =================================================
                    REACTION PICKER
                ================================================= */}

                {isPickerOpen && (
                    <div
                        className=" 
                        absolute 
                        bottom-14 
                        left-1/2 
                        z-40 
                        -translate-x-1/2 
                        origin-bottom 
                        animate-[reactionPickerIn_180ms_cubic-bezier(0.16,1,0.3,1)] 
                    "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div
                            className=" 
                                flex 
                                h-9 w-9 
                                shrink-0 
                                items-center 
                                justify-center 
                                rounded-full 
                                text-lg 
                                transition-all 
                                duration-150 
                                hover:scale-125 
                                hover:bg-gray-100 
                                active:scale-95 "
                        >
                            {Object.entries(
                                reactionIcons
                            ).map(
                                ([
                                    type,
                                    emoji,
                                ]) => {
                                    const selected =
                                        myReaction ===
                                        type;

                                    return (
                                        <button
                                            key={
                                                type
                                            }
                                            type="button"
                                            disabled={
                                                reacting
                                            }
                                            onClick={() =>
                                                handleReactionSelect(
                                                    type
                                                )
                                            }
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
                                            className={`
                                                flex
                                                h-9 w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                text-lg
                                                transition
                                                hover:scale-125
                                                hover:bg-gray-100

                                                sm:h-10
                                                sm:w-10
                                                sm:text-xl

                                                ${selected
                                                    ? "scale-110 bg-blue-50"
                                                    : ""
                                                }

                                                ${reacting
                                                    ? "cursor-not-allowed opacity-50"
                                                    : ""
                                                }
                                            `}
                                        >
                                            {emoji}
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>
                )}

                {/* =================================================
                    FOUR PRIMARY ACTIONS

                    MOBILE:
                    - Icons only
                    - Equal width
                    - Large touch targets
                    - No text/counts

                    DESKTOP:
                    - Icon + full label
                    - Equal width
                ================================================= */}

                <div
                    className="
                        flex
                        w-full
                        items-stretch
                        gap-1.5
                        px-0.5

                        sm:gap-2
                        sm:px-0
                    "
                >
                    {/* =================================================
                        REACT
                    ================================================= */}

                    <button
                        type="button"
                        onClick={handleReact}
                        disabled={reacting}
                        className={`
                            flex
                            min-h-12
                            min-w-0
                            flex-1
                            items-center
                            justify-center
                            rounded-xl
                            px-1.5
                            transition

                            active:scale-[0.97]

                            sm:min-h-11
                            sm:gap-2
                            sm:px-3
                            sm:text-sm

                            ${myReaction
                                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }

                            ${reacting
                                ? "cursor-not-allowed opacity-60"
                                : ""
                            }
                        `}
                        aria-label={
                            myReaction
                                ? reactionLabels[
                                myReaction
                                ] || "React"
                                : "React"
                        }
                        title={
                            myReaction
                                ? reactionLabels[
                                myReaction
                                ] || "React"
                                : "React"
                        }
                    >
                        <span className="material-symbols-outlined shrink-0 text-[21px] sm:text-[20px]">
                            {myReaction
                                ? reactionMaterialIcons[
                                myReaction
                                ] ||
                                defaultReactionIcon
                                : defaultReactionIcon}
                        </span>

                        {/* Desktop only */}
                        <span className="hidden sm:inline">
                            {myReaction
                                ? reactionLabels[
                                myReaction
                                ] || "React"
                                : "React"}
                        </span>
                    </button>

                    {/* =================================================
                        COMMENT
                    ================================================= */}

                    <button
                        type="button"
                        onClick={
                            handleToggleComments
                        }
                        className="
                            flex
                            min-h-12
                            min-w-0
                            flex-1
                            items-center
                            justify-center
                            rounded-xl
                            px-1.5
                            text-gray-500
                            transition

                            hover:bg-gray-50
                            hover:text-gray-800
                            active:scale-[0.97]

                            sm:min-h-11
                            sm:gap-2
                            sm:px-3
                            sm:text-sm
                        "
                        aria-label="Comment"
                        title="Comment"
                    >
                        <span className="material-symbols-outlined shrink-0 text-[21px] sm:text-[20px]">
                            chat_bubble_outline
                        </span>

                        {/* Desktop only */}
                        <span className="hidden sm:inline">
                            Comment
                        </span>

                        {/* Desktop count only */}
                        {commentCount > 0 && (
                            <span className="hidden shrink-0 text-gray-400 sm:inline">
                                {commentCount}
                            </span>
                        )}
                    </button>

                    {/* =================================================
                        SHARE
                    ================================================= */}

                    <button
                        type="button"
                        onClick={handleShare}
                        className={`
                            flex
                            min-h-12
                            min-w-0
                            flex-1
                            items-center
                            justify-center
                            rounded-xl
                            px-1.5
                            transition

                            active:scale-[0.97]

                            sm:min-h-11
                            sm:gap-2
                            sm:px-3
                            sm:text-sm

                            ${shareState !== "idle"
                                ? "bg-green-50 text-green-600"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }
                        `}
                        aria-label={
                            shareState === "copied"
                                ? "Link copied"
                                : shareState ===
                                    "shared"
                                    ? "Shared"
                                    : "Share"
                        }
                        title={
                            shareState === "copied"
                                ? "Link copied"
                                : shareState ===
                                    "shared"
                                    ? "Shared"
                                    : "Share"
                        }
                    >
                        <span className="material-symbols-outlined shrink-0 text-[21px] sm:text-[20px]">
                            {shareState ===
                                "copied"
                                ? "check"
                                : shareState ===
                                    "shared"
                                    ? "done"
                                    : "share"}
                        </span>

                        {/* Desktop only */}
                        <span className="hidden sm:inline">
                            {shareState ===
                                "copied"
                                ? "Copied"
                                : shareState ===
                                    "shared"
                                    ? "Shared"
                                    : "Share"}
                        </span>
                    </button>

                    {/* =================================================
                        SEND SECRETLY
                    ================================================= */}

                    <button
                        type="button"
                        onClick={handleSendSecret}
                        className="
                            flex
                            min-h-12
                            min-w-0
                            flex-1
                            items-center
                            justify-center
                            rounded-xl
                            px-1.5
                            text-gray-500
                            transition

                            hover:bg-gray-50
                            hover:text-gray-800
                            active:scale-[0.97]

                            sm:min-h-11
                            sm:gap-2
                            sm:px-3
                            sm:text-sm
                        "
                        aria-label="Send secretly"
                        title="Send secretly"
                    >
                        <span className="material-symbols-outlined shrink-0 text-[21px] sm:text-[20px]">
                            mail
                        </span>

                        {/* Desktop only */}
                        <span className="hidden sm:inline whitespace-nowrap">
                            Send secretly
                        </span>
                    </button>
                </div>
            </div>

            {/* =================================================
                COMMENTS
            ================================================= */}

            {commentVisible && (
                <div className="mt-3 border-t border-gray-100 pt-4">
                    {/* LOADING */}

                    {loadingComments && (
                        <div className="py-3 text-center text-sm text-gray-400">
                            Loading comments...
                        </div>
                    )}

                    {/* COMMENT CONTENT */}

                    {!loadingComments && (
                        <div className="space-y-3">
                            {comments.length === 0 && (
                                <p className="py-2 text-center text-sm text-gray-400">
                                    No comments yet.
                                    Be the first
                                    to say
                                    something.
                                </p>
                            )}

                            {comments.map(
                                (
                                    commentItem
                                ) => (
                                    <div
                                        key={
                                            commentItem.id
                                        }
                                        className="
                                            flex
                                            gap-3
                                            rounded-2xl
                                            bg-gray-50
                                            p-3
                                        "
                                    >
                                        {/* AVATAR */}

                                        <div
                                            className="
                                            flex
                                            h-9 w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-white
                                            text-xl
                                            shadow-sm
                                        "
                                        >
                                            {getAvatarIcon(
                                                commentItem.anonymous_avatar
                                            )}
                                        </div>

                                        {/* COMMENT */}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-gray-800">
                                                    {commentItem.anonymous_username ||
                                                        commentItem.anonymous_name ||
                                                        "Anonymous"}
                                                </span>

                                                <span className="text-xs text-gray-400">
                                                    {formatDate(
                                                        commentItem.created_at
                                                    )}
                                                </span>
                                            </div>

                                            <p
                                                className="
                                                mt-1
                                                whitespace-pre-wrap
                                                break-words
                                                text-sm
                                                leading-6
                                                text-gray-700
                                            "
                                            >
                                                {
                                                    commentItem.content
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* COMMENT INPUT */}

                    {user ? (
                        <form
                            onSubmit={
                                handleCommentSubmit
                            }
                            className="mt-4 flex gap-2"
                        >
                            <input
                                type="text"
                                value={
                                    commentInput ||
                                    ""
                                }
                                onChange={
                                    handleCommentChange
                                }
                                placeholder="Write a comment..."
                                maxLength={500}
                                disabled={
                                    submittingComment
                                }
                                className="
                                    min-w-0
                                    flex-1
                                    rounded-full
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4 py-2.5
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-blue-400
                                    focus:ring-2
                                    focus:ring-blue-50
                                "
                            />

                            <button
                                type="submit"
                                disabled={
                                    submittingComment ||
                                    !commentInput?.trim()
                                }
                                className="
                                    flex
                                    h-10 w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-blue-600
                                    text-white
                                    transition
                                    hover:bg-blue-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50

                                    sm:h-auto
                                    sm:w-auto
                                    sm:px-5
                                "
                                aria-label="Send comment"
                            >
                                {submittingComment ? (
                                    <span className="text-sm">
                                        ...
                                    </span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[19px] sm:hidden">
                                            send
                                        </span>

                                        <span className="hidden sm:inline">
                                            Send
                                        </span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                            className="
                                mt-4
                                w-full
                                rounded-xl
                                bg-gray-50
                                px-4 py-3
                                text-sm
                                font-medium
                                text-gray-500
                                transition
                                hover:bg-gray-100
                                hover:text-gray-700
                            "
                        >
                            🔒 Log in to comment
                        </button>
                    )}
                </div>
            )}

            {/* =================================================
                SHARE/COPY FEEDBACK
            ================================================= */}

            {shareState !== "idle" && (
                <div
                    className="
                    pointer-events-none
                    fixed
                    bottom-24
                    left-1/2
                    z-[200]
                    -translate-x-1/2

                    sm:bottom-6
                "
                >
                    <div
                        className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        bg-gray-900
                        px-4 py-2.5
                        text-xs
                        font-semibold
                        text-white
                        shadow-xl
                    "
                    >
                        <span className="material-symbols-outlined text-[17px]">
                            check_circle
                        </span>

                        {shareState ===
                            "copied"
                            ? "Link copied"
                            : "Ready to share"}
                    </div>
                </div>
            )}
        </article>
    );
}

export default ConfessionCard;
