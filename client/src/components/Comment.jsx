import {useState, useEffect} from "react";
import API from "../services/api";

export default function Comment({comment, postId, fetchComments, currentUser, level = 0, showAllComments = false}) {
    const [userLiked, setUserLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likes || 0);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showAllReplies, setShowAllReplies] = useState(false);

    useEffect(() => {
        if (comment.liked_by) {
            setUserLiked(JSON.parse(comment.liked_by).includes(currentUser?.id?.toString()));
        }
        setLikesCount(comment.likes || 0);
    }, [comment, currentUser]);

    const toggleLike = async () => {
        const res = await API.post(`/comments/${comment.id}/like`);
        setUserLiked(res.data.liked);
        setLikesCount(res.data.likes);
    };

    const addReply = async () => {
        if (!replyText.trim()) return;

        await API.post(`/posts/${postId}/comments`, {
            text: replyText,
            parent_id: comment.id,
        });

        setReplyText("");
        setReplying(false);
        fetchComments();
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return "";

        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffMs = now - commentTime;

        if (diffMs < 1000) return "1ms ago";

        const diffSeconds = Math.floor(diffMs / 1000);
        if (diffSeconds < 60) return `${diffSeconds}s ago`;

        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}min${diffMinutes > 1 ? "s" : ""} ago`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}hr${diffHours > 1 ? "s" : ""} ago`;

        return commentTime.toLocaleString();
    };

    // Slice replies: only show 2 unless showAllReplies or showAllComments is true
    const visibleReplies = comment.replies?.slice(0, showAllReplies || showAllComments ? undefined : 2) || [];

    return (
        <div className={`mt-4 ${level > 0 ? "ml-10 border-l pl-4" : ""}`}>
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    {comment.user_image ? (
                        <img
                            src={`http://localhost:5000${comment.user_image}`}
                            alt={comment.name || comment.email}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {comment.email?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="bg-gray-100 p-3 rounded-xl flex-1">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm">{comment.name || comment.email}</p>
                        <span className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                    </div>

                    <p className="text-sm mt-1">{comment.text}</p>

                    <div className="flex gap-4 text-xs text-gray-600 mt-2">
                        <button onClick={toggleLike}>
                            {userLiked ? "❤️" : "🤍"} {likesCount}
                        </button>
                        <button onClick={() => setReplying(!replying)}>Reply</button>
                    </div>
                </div>
            </div>

            {replying && (
                <div className="ml-10 mt-2 flex gap-2">
                    <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") addReply();
                        }}
                        className="flex-1 border rounded-lg p-2 text-sm"
                        placeholder="Write a reply..."
                    />
                    <button
                        onClick={addReply}
                        disabled={!replyText.trim()}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                        Post
                    </button>
                </div>
            )}

            {/* Replies */}
            {visibleReplies.length > 0 && (
                <div className="ml-10 mt-3">
                    {visibleReplies.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            fetchComments={fetchComments}
                            currentUser={currentUser}
                            level={level + 1}
                            showAllComments={showAllComments}
                        />
                    ))}

                    {comment.replies.length > 1 && !showAllReplies && !showAllComments && (
                        <button
                            onClick={() => setShowAllReplies(true)}
                            className="w-full py-2 px-4 text-xs text-blue-600 hover:bg-blue-50 rounded-lg mt-2 font-medium"
                        >
                            +{comment.replies.length - 1} more repl{comment.replies.length - 1 > 1 ? "ies" : "y"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
