function ConfessionMedia({ confession, onImageClick }) {
    /*
     * Convert the media URL returned by Django into a URL
     * that the browser can actually load.
     */
    const getMediaUrl = (url) => {
        if (!url) {
            return null;
        }

        // Already an absolute URL
        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        // Django backend
        const backendUrl = "http://127.0.0.1:8000";

        // Make sure there is exactly one slash
        if (url.startsWith("/")) {
            return `${backendUrl}${url}`;
        }

        return `${backendUrl}/${url}`;
    };


    /*
     * No media
     */
    if (
        !confession?.media ||
        !Array.isArray(confession.media) ||
        confession.media.length === 0
    ) {
        return null;
    }


    return (
        <div className="mt-4 space-y-3">

            {confession.media.map((media) => {

                const mediaUrl = getMediaUrl(media.url);

                if (!mediaUrl) {
                    return null;
                }


                {/* =================================================
                    IMAGE
                ================================================= */}

                if (media.media_type === "IMAGE") {
                    return (
                        <div
                            key={media.id}
                            className="
                                overflow-hidden
                                rounded-2xl
                                bg-gray-100
                            "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    onImageClick?.(mediaUrl)
                                }
                                className="
                                    block
                                    w-full
                                    cursor-zoom-in
                                "
                            >
                                <img
                                    src={mediaUrl}
                                    alt="Anonymous confession"
                                    loading="lazy"
                                    className="
                                        block
                                        max-h-[600px]
                                        w-full
                                        object-contain
                                    "
                                    onError={(event) => {
                                        console.error(
                                            "IMAGE LOAD ERROR:",
                                            mediaUrl
                                        );

                                        event.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            </button>
                        </div>
                    );
                }


                {/* =================================================
                    AUDIO
                ================================================= */}

                if (media.media_type === "AUDIO") {

                    const duration = Number(
                        media.duration || 0
                    );

                    const minutes = Math.floor(
                        duration / 60
                    )
                        .toString()
                        .padStart(2, "0");

                    const seconds = Math.floor(
                        duration % 60
                    )
                        .toString()
                        .padStart(2, "0");


                    return (
                        <div
                            key={media.id}
                            className="
                                rounded-2xl
                                border
                                border-gray-200
                                bg-gray-50
                                p-4
                            "
                        >

                            {/* AUDIO HEADER */}

                            <div
                                className="
                                    mb-3
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-blue-100
                                        text-blue-600
                                    "
                                >
                                    <span className="material-symbols-outlined">
                                        mic
                                    </span>
                                </div>


                                <div className="min-w-0">

                                    <p className="text-sm font-semibold text-gray-900">
                                        Voice confession
                                    </p>

                                    {duration > 0 && (
                                        <p className="text-xs text-gray-400">
                                            {minutes}:{seconds}
                                        </p>
                                    )}

                                </div>

                            </div>


                            {/* AUDIO PLAYER */}

                            <audio
                                controls
                                preload="metadata"
                                src={mediaUrl}
                                className="w-full"
                                onLoadedMetadata={() => {
                                    console.log(
                                        "AUDIO LOADED:",
                                        mediaUrl
                                    );
                                }}
                                onError={(event) => {
                                    console.error(
                                        "AUDIO FAILED:",
                                        mediaUrl,
                                        event
                                    );
                                }}
                            />

                        </div>
                    );
                }


                return null;
            })}

        </div>
    );
}


export default ConfessionMedia;