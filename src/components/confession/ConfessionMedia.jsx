import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";


function PanoramaViewer({ src, mediaId }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !src) {
            return;
        }

        /*
         * Create the 360° viewer.
         */
        viewerRef.current = new Viewer({
            container: containerRef.current,

            panorama: src,

            navbar: [
                "zoom",
                "fullscreen",
            ],

            defaultZoomLvl: 50,

            touchmoveTwoFingers: false,

            mousewheelCtrlKey: false,

            loadingImg: undefined,

            lang: {
                zoom: "Zoom",
                fullscreen: "Fullscreen",
            },
        });

        /*
         * Log successful panorama loading.
         */
        viewerRef.current.addEventListener(
            "ready",
            () => {
                console.log(
                    "PANORAMA LOADED:",
                    src
                );
            }
        );

        /*
         * Log panorama loading errors.
         */
        viewerRef.current.addEventListener(
            "error",
            (event) => {
                console.error(
                    "PANORAMA LOAD ERROR:",
                    src,
                    event
                );
            }
        );

        /*
         * Cleanup viewer when component disappears.
         */
        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [src, mediaId]);

    return (
        <div
            className="
                relative
                overflow-hidden
                rounded-2xl
                bg-black
            "
        >
            {/* 360° viewer */}
            <div
                ref={containerRef}
                className="
                    h-[420px]
                    w-full
                    sm:h-[500px]
                    md:h-[560px]
                "
            />

            {/* Panorama label */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-3
                    top-3
                    z-10
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-black/60
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-white
                    backdrop-blur-sm
                "
            >
                <span className="material-symbols-outlined text-[16px]">
                    360
                </span>

                <span>
                    360° Photo
                </span>
            </div>

            {/* Drag instruction */}
            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-3
                    left-1/2
                    z-10
                    -translate-x-1/2
                    rounded-full
                    bg-black/60
                    px-3
                    py-1.5
                    text-xs
                    text-white
                    backdrop-blur-sm
                "
            >
                Drag to look around
            </div>
        </div>
    );
}


function ConfessionMedia({
    confession,
    onImageClick,
}) {

    /*
     * Convert the media URL returned by Django
     * into a URL that the browser can load.
     */
    const getMediaUrl = (url) => {
        if (!url) {
            return null;
        }

        /*
         * Already an absolute URL.
         *
         * Your production API currently returns:
         *
         * https://confessionroom.pythonanywhere.com/media/...
         *
         * so we return it exactly as-is.
         */
        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        /*
         * Only use localhost for relative URLs.
         *
         * Example:
         * /media/confessions/image.jpg
         */
        const backendUrl =
            "http://127.0.0.1:8000";

        if (url.startsWith("/")) {
            return `${backendUrl}${url}`;
        }

        return `${backendUrl}/${url}`;
    };


    /*
     * No media.
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

                const mediaUrl =
                    getMediaUrl(media.url);

                if (!mediaUrl) {
                    return null;
                }


                /*
                 * =================================================
                 * NORMAL IMAGE
                 * =================================================
                 */
                if (
                    media.media_type === "IMAGE"
                ) {
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
                                    onImageClick?.(
                                        mediaUrl
                                    )
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


                /*
                 * =================================================
                 * 360° PANORAMA
                 * =================================================
                 */
                if (
                    media.media_type === "PANORAMA"
                ) {
                    return (
                        <div
                            key={media.id}
                            className="
                                overflow-hidden
                                rounded-2xl
                                bg-black
                            "
                        >
                            <PanoramaViewer
                                src={mediaUrl}
                                mediaId={media.id}
                            />
                        </div>
                    );
                }


                /*
                 * =================================================
                 * AUDIO
                 * =================================================
                 */
                if (
                    media.media_type === "AUDIO"
                ) {

                    const duration =
                        Number(
                            media.duration || 0
                        );

                    const minutes =
                        Math.floor(
                            duration / 60
                        )
                            .toString()
                            .padStart(2, "0");

                    const seconds =
                        Math.floor(
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

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        Voice confession
                                    </p>


                                    {duration > 0 && (
                                        <p
                                            className="
                                                text-xs
                                                text-gray-400
                                            "
                                        >
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


                /*
                 * Unknown media type.
                 */
                console.warn(
                    "UNKNOWN MEDIA TYPE:",
                    media.media_type,
                    media
                );

                return null;
            })}

        </div>
    );
}


export default ConfessionMedia;