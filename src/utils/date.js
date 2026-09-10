export function formatRelativeDate(date) {
    if (!date) return "";

    const confessionDate = new Date(date);
    const now = new Date();

    const diff = Math.floor(
        (now - confessionDate) / 1000
    );

    if (diff < 60) return "Just now";

    if (diff < 3600) {
        return `${Math.floor(diff / 60)}m ago`;
    }

    if (diff < 86400) {
        return `${Math.floor(diff / 3600)}h ago`;
    }

    if (diff < 604800) {
        return `${Math.floor(diff / 86400)}d ago`;
    }

    return confessionDate.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}