import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateConfession() {
    const navigate = useNavigate();

    const panoramaCameraInputRef = useRef(null);

    const [content, setContent] = useState("");
    const [postType, setPostType] = useState("TEXT");

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [panoramaFile, setPanoramaFile] = useState(null);
    const [panoramaPreview, setPanoramaPreview] = useState("");
    const [panoramaKind, setPanoramaKind] = useState("");

    const [audioBlob, setAudioBlob] = useState(null);
    const [audioPreview, setAudioPreview] = useState("");

    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);
    const panoramaInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);

    /*
    =========================================
    IMAGE
    =========================================
    */

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setError("");

        // 5 MB limit
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");

            e.target.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");

            e.target.value = "";
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImageFile(file);

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const handlePanoramaChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setError("");

        if (file.size > 20 * 1024 * 1024) {
            setError("Panorama must be smaller than 20 MB.");
            e.target.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid panorama image.");
            e.target.value = "";
            return;
        }

        const image = new Image();

        image.onload = () => {
            const width = image.width;
            const height = image.height;
            const ratio = width / height;

            /*
             * True 360° equirectangular panorama:
             * approximately 2:1
             *
             * Wide/partial panorama:
             * wider than a normal landscape image.
             */

            if (ratio < 1.5) {
                setError(
                    "Please upload a wide panorama image. " +
                    "True 360° photos should be close to a 2:1 ratio."
                );

                e.target.value = "";
                URL.revokeObjectURL(image.src);
                return;
            }

            const kind =
                ratio >= 1.7 && ratio <= 2.3
                    ? "360"
                    : "WIDE";

            if (panoramaPreview) {
                URL.revokeObjectURL(panoramaPreview);
            }

            const previewUrl = URL.createObjectURL(file);

            setPanoramaFile(file);
            setPanoramaPreview(previewUrl);
            setPanoramaKind(kind);

            URL.revokeObjectURL(image.src);
        };

        image.onerror = () => {
            setError("Unable to read this panorama image.");
            e.target.value = "";
            URL.revokeObjectURL(image.src);
        };

        image.src = URL.createObjectURL(file);
    };

    const handlePanoramaCameraChange = (e) => {
        handlePanoramaChange(e);

        // Allow the same camera file to be selected again
        e.target.value = "";
    };

    const removeImage = () => {
        setImageFile(null);

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removePanorama = () => {
        setPanoramaFile(null);

        if (panoramaPreview) {
            URL.revokeObjectURL(panoramaPreview);
        }

        setPanoramaPreview("");

        if (panoramaInputRef.current) {
            panoramaInputRef.current.value = "";
        }
    };

    /*
    =========================================
    VOICE RECORDING
    =========================================
    */

    const startRecording = async () => {
        setError("");

        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                setError(
                    "Voice recording is not supported by this browser."
                );
                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

            const recorder = new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(
                    audioChunksRef.current,
                    {
                        type:
                            recorder.mimeType ||
                            "audio/webm",
                    }
                );

                setAudioBlob(blob);

                const audioUrl = URL.createObjectURL(blob);

                setAudioPreview(audioUrl);

                stream
                    .getTracks()
                    .forEach((track) => track.stop());
            };

            recorder.start();

            setIsRecording(true);
            setRecordingSeconds(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingSeconds((prev) => {
                    if (prev >= 59) {
                        stopRecording();
                        return 60;
                    }

                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            console.error(
                "MICROPHONE ERROR:",
                err
            );

            setError(
                "Unable to access your microphone. Please allow microphone permission."
            );
        }
    };

    const stopRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);

        if (recordingTimerRef.current) {
            clearInterval(
                recordingTimerRef.current
            );

            recordingTimerRef.current = null;
        }
    };

    const removeAudio = () => {
        if (audioPreview) {
            URL.revokeObjectURL(audioPreview);
        }

        setAudioBlob(null);
        setAudioPreview("");
        setRecordingSeconds(0);

        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    };

    /*
    =========================================
    CHANGE POST TYPE
    =========================================
    */

    const handlePostTypeChange = (type) => {
        if (isRecording) {
            stopRecording();
        }

        setPostType(type);
        setError("");

        if (type !== "IMAGE") {
            removeImage();
        }

        if (type !== "PANORAMA") {
            removePanorama();
        }

        if (type !== "AUDIO") {
            removeAudio();
        }
    };

    /*
    =========================================
    SUBMIT
    =========================================
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!content.trim()) {
            setError("Please write something before posting.");
            return;
        }

        if (postType === "IMAGE" && !imageFile) {
            setError("Please select an image.");
            return;
        }

        if (postType === "PANORAMA" && !panoramaFile) {
            setError("Please select a panorama.");
            return;
        }

        if (postType === "AUDIO" && !audioBlob) {
            setError("Please record your voice first.");
            return;
        }

        if (postType === "AUDIO" && recordingSeconds < 1) {
            setError("Your recording is too short.");
            return;
        }

        setLoading(true);

        try {
            // IMPORTANT:
            // Create FormData BEFORE using formData.append()
            const formData = new FormData();

            formData.append("content", content.trim());
            formData.append("confession_type", postType);

            // IMAGE
            if (postType === "IMAGE" && imageFile) {
                formData.append("media", imageFile);
            }

            // PANORAMA
            if (postType === "PANORAMA" && panoramaFile) {
                formData.append("media", panoramaFile);

                if (panoramaKind) {
                    formData.append("panorama_kind", panoramaKind);
                }
            }

            // AUDIO
            if (postType === "AUDIO" && audioBlob) {
                const audioFile = new File(
                    [audioBlob],
                    "voice-confession.webm",
                    {
                        type: audioBlob.type || "audio/webm",
                    }
                );

                formData.append("media", audioFile);
                formData.append(
                    "media_duration",
                    recordingSeconds.toString()
                );
            }

            await api.post("confessions/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // success handling
            navigate("/");
        } catch (err) {
            console.error(
                "CREATE CONFESSION ERROR:",
                err.response?.data || err
            );

            console.error(
                "STATUS:",
                err.response?.status
            );

            console.error(
                "FULL RESPONSE:",
                err.response
            );

            const responseData = err?.response?.data;

            if (responseData) {
                if (typeof responseData === "string") {
                    setError(responseData);
                } else if (responseData.detail) {
                    setError(responseData.detail);
                } else if (responseData.content) {
                    setError(
                        Array.isArray(responseData.content)
                            ? responseData.content.join(" ")
                            : responseData.content
                    );
                } else if (responseData.media) {
                    setError(
                        Array.isArray(responseData.media)
                            ? responseData.media.join(" ")
                            : responseData.media
                    );
                } else {
                    setError(
                        "Unable to create your confession. Please check your post and try again."
                    );
                }
            } else {
                setError(
                    "Unable to connect to the server. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /*
    =========================================
    CLEANUP
    =========================================
    */

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            if (audioPreview) {
                URL.revokeObjectURL(audioPreview);
            }

            if (recordingTimerRef.current) {
                clearInterval(
                    recordingTimerRef.current
                );
            }

            if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current.state !==
                "inactive"
            ) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [imagePreview, panoramaPreview, audioPreview]);

    /*
    =========================================
    FORMAT TIME
    =========================================
    */

    const formatRecordingTime = (seconds) => {
        const minutes = Math.floor(
            seconds / 60
        );

        const remainingSeconds =
            seconds % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    /*
    =========================================
    POST TYPE DATA
    =========================================
    */

    const postTypes = [
        {
            value: "TEXT",
            label: "Text",
            description: "Write your thoughts",
            icon: "edit_note",
        },
        {
            value: "IMAGE",
            label: "Image",
            description: "Share a photo",
            icon: "image",
        },
        {
            value: "PANORAMA",
            label: "360°",
            description: "Share a 360° photo",
            icon: "360",
        },
        {
            value: "AUDIO",
            label: "Voice",
            description: "Record your voice",
            icon: "mic",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">

            {/* =========================================
                HEADER
            ========================================= */}

            <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">

                <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-3 sm:h-16 sm:px-4">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-outlined text-[22px]">
                            arrow_back
                        </span>
                    </button>

                    <div className="ml-2 min-w-0 sm:ml-3">
                        <h1 className="truncate text-base font-bold tracking-tight text-gray-900 sm:text-lg">
                            Create Confession
                        </h1>

                        <p className="hidden text-xs text-gray-400 sm:block">
                            Share something anonymously
                        </p>
                    </div>

                    <div className="ml-auto">
                        <span className="hidden items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 sm:flex">
                            <span className="material-symbols-outlined text-[16px]">
                                lock
                            </span>
                            Private
                        </span>
                    </div>

                </div>

            </nav>


            {/* =========================================
                MAIN
            ========================================= */}

            <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-4 sm:py-8">

                {/* =========================================
                    INTRO
                ========================================= */}

                <div className="mb-4 text-center sm:mb-6">

                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm sm:h-16 sm:w-16 sm:text-4xl">
                        🤫
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Say it anonymously
                    </h2>

                    <p className="mx-auto mt-1.5 max-w-md text-sm leading-5 text-gray-500 sm:mt-2 sm:text-[15px]">
                        Share what's on your mind.
                        Your account identity will
                        stay private.
                    </p>

                </div>


                {/* =========================================
                    FORM CARD
                ========================================= */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:rounded-3xl">

                    <div className="p-4 sm:p-6 md:p-7">

                        {/* =========================================
                            ERROR
                        ========================================= */}

                        {error && (
                            <div
                                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:p-4"
                                role="alert"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <span className="material-symbols-outlined text-[19px]">
                                        error
                                    </span>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-red-800">
                                        Unable to post
                                    </p>

                                    <p className="mt-0.5 text-sm leading-5 text-red-600">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* =========================================
                            POST TYPE
                        ========================================= */}

                        <div className="mb-5 sm:mb-6">

                            <div className="mb-2.5">
                                <label className="text-sm font-semibold text-gray-800">
                                    Choose a format
                                </label>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    How would you like to share it?
                                </p>
                            </div>


                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

                                {postTypes.map((type) => {
                                    const active =
                                        postType ===
                                        type.value;

                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() =>
                                                handlePostTypeChange(
                                                    type.value
                                                )
                                            }
                                            className={`group flex min-h-[88px] flex-col items-center justify-center rounded-xl border p-2.5 text-center transition active:scale-[0.98] sm:min-h-[100px] sm:rounded-2xl sm:p-3 ${active
                                                ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                                                }`}
                                        >
                                            <span
                                                className={`material-symbols-outlined mb-1.5 text-[24px] sm:text-[26px] ${active
                                                    ? "text-blue-600"
                                                    : "text-gray-400 group-hover:text-gray-600"
                                                    }`}
                                            >
                                                {type.icon}
                                            </span>

                                            <span className="text-xs font-bold sm:text-sm">
                                                {type.label}
                                            </span>

                                            <span className="mt-0.5 hidden text-[10px] leading-4 text-gray-400 sm:block">
                                                {type.description}
                                            </span>
                                        </button>
                                    );
                                })}

                            </div>

                        </div>


                        {/* =========================================
                            FORM
                        ========================================= */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 sm:space-y-6"
                        >

                            {/* =========================================
                                TEXT / CAPTION
                            ========================================= */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <label
                                        htmlFor="confession-content"
                                        className="text-sm font-semibold text-gray-800"
                                    >
                                        {postType === "TEXT"
                                            ? "Your confession"
                                            : "Caption"}
                                    </label>

                                    <span
                                        className={`text-xs ${content.length >=
                                            1900
                                            ? "font-semibold text-orange-500"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {content.length}/2000
                                    </span>

                                </div>

                                <div className="relative">

                                    <textarea
                                        id="confession-content"
                                        rows={postType === "TEXT" ? 7 : 5}
                                        placeholder={
                                            postType === "TEXT"
                                                ? "What's on your mind?"
                                                : "Write something about your confession..."
                                        }
                                        value={content}
                                        onChange={(e) =>
                                            setContent(
                                                e.target.value
                                            )
                                        }
                                        maxLength={2000}
                                        className="block min-h-[150px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3.5 text-[15px] leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:min-h-[170px] sm:rounded-2xl sm:px-4 sm:py-4"
                                    />

                                </div>

                                <p className="mt-1.5 text-xs text-gray-400">
                                    {postType === "TEXT"
                                        ? "Be honest. Be respectful. Your identity stays private."
                                        : "Add a short caption to give your confession some context."}
                                </p>

                            </div>


                            {/* =========================================
                                IMAGE
                            ========================================= */}

                            {postType === "IMAGE" && (
                                <div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            handleImageChange
                                        }
                                        className="hidden"
                                    />


                                    {!imagePreview ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.995] sm:min-h-[220px]"
                                        >

                                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                                                <span className="material-symbols-outlined text-[30px] text-gray-400">
                                                    add_photo_alternate
                                                </span>
                                            </div>

                                            <span className="text-sm font-bold text-gray-700 sm:text-base">
                                                Add an image
                                            </span>

                                            <span className="mt-1 text-xs text-gray-400">
                                                JPG, PNG or WEBP
                                            </span>

                                            <span className="mt-0.5 text-[11px] text-gray-400">
                                                Maximum file size: 5 MB
                                            </span>

                                            <span className="mt-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-100">
                                                Choose image
                                            </span>

                                        </button>
                                    ) : (
                                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">

                                            <div className="relative">

                                                <img
                                                    src={imagePreview}
                                                    alt="Selected confession"
                                                    className="max-h-[520px] w-full object-contain"
                                                />

                                                <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/50 to-transparent p-3">

                                                    <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                                        Selected image
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            removeImage
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 active:scale-95"
                                                        aria-label="Remove image"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            close
                                                        </span>
                                                    </button>

                                                </div>

                                            </div>

                                            <div className="flex items-center justify-between gap-3 bg-white px-3 py-2.5 sm:px-4">

                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold text-gray-700">
                                                        {imageFile?.name}
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-gray-400">
                                                        {imageFile
                                                            ? `${(
                                                                imageFile.size /
                                                                1024 /
                                                                1024
                                                            ).toFixed(
                                                                2
                                                            )} MB`
                                                            : ""}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        () =>
                                                            fileInputRef.current?.click()
                                                    }
                                                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    Change
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                </div>
                            )}


                            {/* =========================================
                                PANORAMA
                            ========================================= */}
                            {postType === "PANORAMA" && (
                                <div>
                                    {/* Regular panorama file upload */}
                                    <input
                                        ref={panoramaInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePanoramaChange}
                                        className="hidden"
                                    />

                                    {/* Camera capture */}
                                    <input
                                        ref={panoramaCameraInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handlePanoramaCameraChange}
                                        className="hidden"
                                    />

                                    {!panoramaPreview ? (
                                        <div className="space-y-3">

                                            {/* CAMERA BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    panoramaCameraInputRef.current?.click()
                                                }
                                                className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 px-4 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 active:scale-[0.995] sm:min-h-[220px]"
                                            >
                                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-indigo-100">
                                                    <span className="material-symbols-outlined text-[30px] text-indigo-500">
                                                        photo_camera
                                                    </span>
                                                </div>

                                                <span className="text-sm font-bold text-gray-800 sm:text-base">
                                                    Open camera
                                                </span>

                                                <span className="mt-1 text-xs text-gray-500">
                                                    Take a panorama with your device camera
                                                </span>

                                                <span className="mt-3 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm">
                                                    Open 360 Camera
                                                </span>
                                            </button>

                                            {/* OR */}
                                            <div className="flex items-center gap-3">
                                                <div className="h-px flex-1 bg-gray-200" />

                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                                    or
                                                </span>

                                                <div className="h-px flex-1 bg-gray-200" />
                                            </div>

                                            {/* FILE UPLOAD BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    panoramaInputRef.current?.click()
                                                }
                                                className="flex min-h-[100px] w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-5 text-center transition hover:border-gray-300 hover:bg-gray-50 active:scale-[0.995]"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                                                    <span className="material-symbols-outlined text-[24px] text-gray-500">
                                                        upload_file
                                                    </span>
                                                </div>

                                                <div className="text-left">
                                                    <span className="block text-sm font-bold text-gray-700">
                                                        Upload panorama file
                                                    </span>

                                                    <span className="mt-0.5 block text-xs text-gray-400">
                                                        JPG, PNG or WEBP · Maximum 20 MB
                                                    </span>
                                                </div>
                                            </button>

                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">

                                            <div className="relative">

                                                <img
                                                    src={panoramaPreview}
                                                    alt="Selected 360° panorama"
                                                    className="max-h-[360px] w-full object-contain"
                                                />

                                                <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/50 to-transparent p-3">

                                                    <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                                        360° panorama
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={removePanorama}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 active:scale-95"
                                                        aria-label="Remove panorama"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            close
                                                        </span>
                                                    </button>

                                                </div>

                                            </div>

                                            <div className="flex items-center justify-between gap-3 bg-white px-3 py-2.5 sm:px-4">

                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold text-gray-700">
                                                        {panoramaFile?.name}
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-gray-400">
                                                        {panoramaFile
                                                            ? `${(
                                                                panoramaFile.size /
                                                                1024 /
                                                                1024
                                                            ).toFixed(2)} MB`
                                                            : ""}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        panoramaInputRef.current?.click()
                                                    }
                                                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                                >
                                                    Change
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                                        <div className="flex items-start gap-2.5">

                                            <span className="material-symbols-outlined mt-0.5 text-[18px] text-indigo-500">
                                                swipe
                                            </span>

                                            <p className="text-xs leading-5 text-gray-500">
                                                Upload a true 360° photo or a wide/partial panorama.
                                                360° photos can be explored around the scene, while wide panoramas can be explored horizontally.
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* =========================================
                                AUDIO
                            ========================================= */}

                            {postType === "AUDIO" && (
                                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                                    <div className="border-b border-gray-200 px-4 py-4 text-center sm:px-5">

                                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                                            <span className="material-symbols-outlined text-[25px] text-red-500">
                                                mic
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                                            Voice confession
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Record up to 60 seconds
                                        </p>

                                    </div>


                                    <div className="p-4 sm:p-5">

                                        {!audioBlob &&
                                            !isRecording && (
                                                <div className="text-center">

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            startRecording
                                                        }
                                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 active:scale-[0.98]"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            mic
                                                        </span>

                                                        Start recording
                                                    </button>

                                                    <p className="mt-3 text-[11px] text-gray-400">
                                                        Your browser will ask for microphone permission.
                                                    </p>

                                                </div>
                                            )}


                                        {isRecording && (
                                            <div className="text-center">

                                                <div className="mb-5 flex items-center justify-center gap-3">

                                                    <span className="relative flex h-3 w-3">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>

                                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                                                    </span>

                                                    <span className="font-mono text-3xl font-bold tracking-tight text-gray-900">
                                                        {formatRecordingTime(
                                                            recordingSeconds
                                                        )}
                                                    </span>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        stopRecording
                                                    }
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98]"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        stop
                                                    </span>

                                                    Stop recording
                                                </button>

                                                <p className="mt-3 text-xs text-gray-400">
                                                    Recording in progress…
                                                </p>

                                            </div>
                                        )}


                                        {audioBlob &&
                                            !isRecording && (
                                                <div>

                                                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:rounded-2xl sm:p-4">

                                                        <div className="mb-3 flex items-center gap-3">

                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                                                                <span className="material-symbols-outlined text-[20px] text-red-500">
                                                                    graphic_eq
                                                                </span>
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    Voice recording
                                                                </p>

                                                                <p className="text-xs text-gray-400">
                                                                    {formatRecordingTime(
                                                                        recordingSeconds
                                                                    )}
                                                                </p>
                                                            </div>

                                                        </div>

                                                        <audio
                                                            controls
                                                            src={
                                                                audioPreview
                                                            }
                                                            className="w-full"
                                                        />

                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between">

                                                        <span className="text-xs text-gray-400">
                                                            Ready to post
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={
                                                                removeAudio
                                                            }
                                                            className="rounded-lg px-2.5 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            Remove recording
                                                        </button>

                                                    </div>

                                                </div>
                                            )}

                                    </div>

                                </div>
                            )}


                            {/* =========================================
                                PRIVACY
                            ========================================= */}

                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 sm:rounded-2xl sm:p-4">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                                        <span className="material-symbols-outlined text-[19px]">
                                            shield
                                        </span>
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-sm font-bold text-gray-900">
                                            Your identity stays private
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                                            Other students will only see your anonymous display name. Your account identity is not shown publicly.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =========================================
                                SUBMIT
                            ========================================= */}

                            <div className="border-t border-gray-100 pt-5 sm:pt-6">

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        isRecording
                                    }
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[50px] sm:rounded-2xl"
                                >

                                    {loading ? (
                                        <>
                                            <span
                                                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                                role="status"
                                                aria-label="Posting"
                                            />

                                            <span>
                                                Posting...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">
                                                send
                                            </span>

                                            <span>
                                                Post confession
                                            </span>
                                        </>
                                    )}

                                </button>

                                <p className="mt-2.5 text-center text-[11px] leading-4 text-gray-400">
                                    By posting, you agree to keep your confession respectful and appropriate for the school community.
                                </p>

                            </div>

                        </form>

                    </div>

                </div>


                {/* =========================================
                    BOTTOM NOTE
                ========================================= */}

                <div className="px-3 pb-4 pt-5 text-center sm:pb-8 sm:pt-6">

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span className="material-symbols-outlined text-[16px]">
                            lock
                        </span>

                        <span>
                            Your confession is submitted securely.
                        </span>
                    </div>

                </div>

            </main>

        </div>
    );
}

export default CreateConfession;