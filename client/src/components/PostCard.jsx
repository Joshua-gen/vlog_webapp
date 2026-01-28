import {useState, useEffect, useRef} from "react";
import {useAuth} from "../contexts/AuthContext";
import API from "../services/api";
import Comment from "./Comment";

export default function PostCard({post, fetchPosts}) {
    const {user: currentUser} = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [currentModalIndex, setCurrentModalIndex] = useState(0);

    const [userLiked, setUserLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes || 0);
    const [showLikesDropdown, setShowLikesDropdown] = useState(false);
    const [likers, setLiker] = useState([]);
    const [loadingLikers, setLoadingLikers] = useState(false);

    // comment:
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

    const files = post.files ? JSON.parse(post.files) : [];

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const res = await API.get(`/posts/${post.id}/comments`);

            const map = {};
            const roots = [];

            // init map
            res.data.forEach((c) => {
                c.replies = [];
                map[c.id] = c;
            });

            // build tree
            res.data.forEach((c) => {
                if (c.parent_id) {
                    map[c.parent_id]?.replies.push(c);
                } else {
                    roots.push(c);
                }
            });

            setComments(roots);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [post.id]);

    const addComment = async () => {
        if (!comment.trim() || !currentUser) return;

        try {
            await API.post(`/posts/${post.id}/comments`, {
                text: comment,
            });
            setComment("");
            fetchComments();
        } catch (err) {
            console.error("Comment failed:", err);
        }
    };

    useEffect(() => {
        if (post.liked_by) {
            const likedBy = JSON.parse(post.liked_by);
            setUserLiked(likedBy.includes(currentUser?.id?.toString()));
        }
        setLikesCount(post.likes || 0);
    }, [post, currentUser]);

    // users who like the post
    const fetchLikers = async () => {
        if (likesCount === 0) return;
        setLoadingLikers(true);
        try {
            const res = await API.get(`/posts/${post.id}/likers`);
            setLiker(res.data);
        } catch (err) {
            console.error("Failed to fetch likers:", err);
        } finally {
            setLoadingLikers(false);
        }
    };

    // Like handler
    const toggleLike = async () => {
        try {
            const res = await API.post(`/posts/${post.id}/like`);
            setUserLiked(res.data.liked);
            setLikesCount(res.data.likes);
        } catch (err) {
            console.error("Like failed:", err);
        }
    };

    const openModal = (index) => {
        setCurrentModalIndex(index);
        setShowModal(true);
    };
    const closeModal = () => setShowModal(false);
    const nextImage = () => setCurrentModalIndex((prev) => (prev + 1) % files.length);
    const prevImage = () => setCurrentModalIndex((prev) => (prev - 1 + files.length) % files.length);

    const currentModalFilePath = files[currentModalIndex];

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffMs = now - postTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 24) {
            if (diffHours === 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return diffMins === 1 ? "1min ago" : `${diffMins}mins ago`;
            }
            return diffHours === 1 ? "1hr ago" : `${diffHours}hrs ago`;
        }
        return postTime.toLocaleDateString();
    };

    return (
        <div className="border p-6 rounded-2xl mb-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200">
            {/* Post Header */}
            <div className="flex items-start mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 mr-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {post.image ? (
                        <img
                            src={`http://localhost:5000${post.image}`}
                            alt={post.name}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <span className="text-white font-bold text-sm">
                            {post.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{post.name || "Unknown"}</h3>
                    <span className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</span>
                </div>
            </div>

            <h2 className="font-bold text-xl mb-6 text-gray-900">{post.title}</h2>

            {files.length > 0 && (
                <div className="mb-6">
                    <div className="grid gap-4">
                        {files.length > 0 && (
                            <div onClick={() => openModal(0)}>
                                {files[0].endsWith(".mp4") ? (
                                    <video
                                        src={`http://localhost:5000${files[0]}`}
                                        className="w-full h-80 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-all"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={`http://localhost:5000${files[0]}`}
                                        alt="Post"
                                        className="w-full h-80 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-all"
                                    />
                                )}
                            </div>
                        )}
                        {files.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {files.slice(1, 6).map((filePath, index) => (
                                    <div
                                        key={index}
                                        className="cursor-pointer hover:opacity-90 transition-all"
                                        onClick={() => openModal(index + 1)}
                                    >
                                        {filePath.endsWith(".mp4") ? (
                                            <video
                                                src={`http://localhost:5000${filePath}`}
                                                className="w-full h-20 object-cover rounded-lg cursor-pointer"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={`http://localhost:5000${filePath}`}
                                                alt="Post"
                                                className="w-full h-20 object-cover rounded-lg cursor-pointer"
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* +MORE OVERLAY */}
                                {files.length > 6 && (
                                    <div className="col-span-5 h-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:opacity-90 group">
                                        <span>+{files.length - 6} more</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showModal && files.length > 0 && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 z-10"
                            onClick={closeModal}
                        >
                            ×
                        </button>

                        {/* IMAGE/VIDEO - FIXED TYPE CHECK */}
                        <div className="w-full h-full flex items-center justify-center">
                            {currentModalFilePath?.endsWith(".mp4") ||
                            currentModalFilePath?.endsWith(".mov") ||
                            currentModalFilePath?.endsWith(".avi") ? (
                                <video
                                    src={`http://localhost:5000${currentModalFilePath}`}
                                    controls
                                    className="max-w-full max-h-[80vh] rounded-2xl object-contain"
                                    autoPlay
                                />
                            ) : (
                                <img
                                    src={`http://localhost:5000${currentModalFilePath}`}
                                    alt="Full view"
                                    className="max-w-full max-h-[80vh] rounded-2xl object-contain"
                                />
                            )}
                        </div>

                        {/* NAVIGATION */}
                        {files.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full text-2xl transition-all"
                                    onClick={prevImage}
                                >
                                    ‹
                                </button>
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full text-2xl transition-all"
                                    onClick={nextImage}
                                >
                                    ›
                                </button>
                            </>
                        )}

                        {/* FILE COUNTER */}
                        {files.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                                {currentModalIndex + 1} / {files.length}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mb-6 p-3 relative group">
                {/* LIKE BUTTON */}
                <button
                    onClick={toggleLike}
                    className={`p-2 rounded-full transition-all flex-shrink-0 ${
                        userLiked
                            ? "bg-red-500 text-white shadow-lg hover:bg-red-600"
                            : "hover:bg-red-100 text-gray-600 hover:text-red-500"
                    }`}
                    title="Like post"
                >
                    {userLiked ? "❤️" : "🤍"}
                </button>

                {/* LIKES COUNT - CLICK TO DROPDOWN */}
                <span
                    className="flex items-center gap-1 cursor-pointer hover:underline hover:decoration-2 hover:underline-offset-4 transition-all"
                    onClick={() => {
                        if (likesCount > 0 && likers.length === 0) {
                            fetchLikers(); // Fetch on first click
                        }
                        setShowLikesDropdown(!showLikesDropdown);
                    }}
                >
                    <span className="font-semibold text-gray-800">{likesCount}</span>
                    <span className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        {likesCount === 1 ? "like" : "likes"}
                    </span>
                </span>

                {/*DROPDOWN */}
                {showLikesDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                        <div className="py-3 px-4 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-900">
                                {likesCount} {likesCount === 1 ? "like" : "likes"}
                            </h4>
                        </div>
                        <div className="py-2 max-h-64 overflow-y-auto">
                            {loadingLikers ? (
                                <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
                            ) : likers.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">No likers yet</div>
                            ) : (
                                likers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                            {user.image ? (
                                                <img
                                                    src={`http://localhost:5000${user.image}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">
                                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm text-gray-900 truncate">
                                                {user.name || user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <div className="flex items-end gap-3 p-4 bg-gray-50 rounded-2xl mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {currentUser?.image ? (
                            <img
                                src={`http://localhost:5000${currentUser.image}`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center rounded-full text-white font-bold">
                                {currentUser?.email?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                addComment();
                            }
                        }}
                        placeholder="Write a comment..."
                        className="flex-1 p-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={addComment}
                        disabled={!comment.trim()}
                        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                        Post
                    </button>
                </div>

                <div className="space-y-4">
                    {loadingComments ? (
                        <div className="text-center text-gray-500">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center text-gray-400">Be the first to comment</div>
                    ) : (
                        <>
                            {comments
                            .filter((c) => !c.parent_id)
                            .slice(0, showAllComments ? undefined : 2) // show only 2 initially
                            .map((c) => (
                                <Comment
                                    key={c.id}
                                    comment={c}
                                    postId={post.id}
                                    fetchComments={fetchComments}
                                    currentUser={currentUser}
                                    showAllComments={showAllComments}
                                />
                            ))}

                            {comments.filter((c) => !c.parent_id).length > 2 && !showAllComments && (
                                <button
                                    onClick={() => setShowAllComments(true)}
                                    className="text-blue-500 text-sm hover:underline mt-2"
                                >
                                    Show {comments.filter((c) => !c.parent_id).length - 2} more comment
                                    {comments.filter((c) => !c.parent_id).length - 2 > 1 ? "s" : ""}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
