import {useState} from "react";
import API from "../services/api";
import {useNavigate} from "react-router-dom";

export default function CreatePost() {
    const [title, setTitle] = useState("");
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const addFiles = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const submit = async () => {
        setError("");

        if (!title.trim() && files.length === 0) {
            setError("Title or files required!");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("title", title);
        files.forEach((file) => formData.append("files", file));

        try {
            await API.post("/posts", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            navigate("/");
        } catch (err) {
            // SHOW SERVER ERRORS
            setError(err.response?.data?.error || "Upload failed!");
            console.error("Upload failed:", err.response?.data);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <input
                className="border p-3 w-full mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="What's happening?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className="mb-6">
                <label className="block mb-3 text-sm font-medium text-gray-700">Add files (300mb max)</label>
                <input
                    type="file"
                    multiple
                    accept="*/*"
                    onChange={addFiles}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
                />

                {/* File Preview */}
                {files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                        {files.map((file, index) => (
                            <div key={index} className="relative group bg-white rounded-lg p-2 shadow-sm">
                                {file.type.startsWith("image/") ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-20 object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="w-full h-20 bg-gray-100 rounded-md flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">
                                            {file.type.split("/")[1] || "file"}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                >
                                    ×
                                </button>
                                <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && !error.includes("Title") && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            <button
                className="w-full bg-blue-500 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                onClick={submit}
                disabled={uploading || (!title.trim() && files.length === 0)}
            >
                {uploading
                    ? "Uploading..."
                    : files.length === 0
                    ? "Post without files"
                    : `Post + ${files.length} file${files.length > 1 ? "s" : ""}`}
            </button>
        </div>
    );
}
