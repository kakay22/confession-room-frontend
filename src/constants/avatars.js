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
    return avatarIcons[avatar] || "👤";
};