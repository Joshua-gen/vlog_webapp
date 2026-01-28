import React, {useState, useEffect} from "react";
import {useAuth} from "../contexts/AuthContext";

export default function Profile() {
    const {user, loading} = useAuth();
    const [formData, setFormData] = useState({email: "", name: "", bio: "", image: ""});
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    // Load user data into form
    useEffect(() => {
        if (user && !loading) {
            setFormData({
                email: user.email || "",
                name: user.name || "",
                bio: user.bio || "",
                image: user.image || "",
            });
            setPreviewImage(""); // EMPTY - let DB image show
        }
    }, [user, loading]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result); // ← Preview only
            reader.readAsDataURL(file);
        }
    };

    const saveProfile = async () => {
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");
            let imagePath = formData.image; // Default to current image

            // Handle new file upload FIRST
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append("image", imageFile);

                console.log(" UPLOADING FILE:", imageFile.name, imageFile.size); // DEBUG

                const imageRes = await fetch("http://localhost:5000/upload-profile", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: imageFormData,
                });

                console.log("RESPONSE STATUS:", imageRes.status); // DEBUG

                if (!imageRes.ok) {
                    const errorText = await imageRes.text(); // RAW TEXT
                    console.log("SERVER ERROR:", errorText); // DEBUG
                    throw new Error(`Upload failed: ${imageRes.status}`);
                }

                const imageResult = await imageRes.json();
                console.log("UPLOAD SUCCESS:", imageResult); // DEBUG
                imagePath = imageResult.image;
            }

            // Update profile with final image path
            const res = await fetch("http://localhost:5000/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    bio: formData.bio,
                    image: imagePath,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update profile");
            }

            setSuccess("Profile updated successfully!");
            setTimeout(async () => {
                setSuccess("");
                // REFRESH user data from server
                const token = localStorage.getItem("token");
                const freshUserRes = await fetch("http://localhost:5000/profile", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const freshUser = await freshUserRes.json();
                // Update AuthContext (if it has refresh function)
                // useAuth().refreshUser?.(freshUser);
                window.location.reload();
            }, 3000);

            setIsEditing(false);
            setImageFile(null); // Reset file input
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-gray-900">Profile</h1>

            {/* Profile Preview */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-md mb-6 relative">
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="absolute top-4 right-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    {isEditing ? "Cancel" : "Edit"}
                </button>

                <div className="text-center pt-12 pb-6 space-y-3">
                    <div className="relative group mx-auto">
                        {previewImage || formData.image ? (
                            <img
                                src={previewImage || `http://localhost:5000${formData.image}`}
                                alt="Profile"
                                className="w-28 h-28 rounded-full mx-auto object-cover shadow-lg ring-4 ring-white/50 hover:ring-blue-200 transition-all duration-300 hover:scale-105"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextElementSibling.style.display = "flex";
                                }}
                            />
                        ) : (
                            <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto text-xl font-bold text-gray-600 shadow-lg ring-4 ring-white/50 group-hover:ring-blue-200 transition-all duration-300 hover:scale-105">
                                {formData.email[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {formData.name || formData.email || "User"}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium flex items-center justify-center space-x-1">
                            <span>{formData.email}</span>
                        </p>
                    </div>

                    {/* Bio */}
                    {formData.bio && (
                        <p className="text-gray-600 text-sm max-w-md mx-auto px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
                            Bio: {formData.bio}
                        </p>
                    )}
                </div>
            </div>

            {isEditing && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
                        onClick={() => setIsEditing(false)}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">email</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about yourself"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange} // ← CHANGED
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {imageFile && (
                                        <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                                            <img
                                                src={URL.createObjectURL(imageFile)}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={saveProfile}
                                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {error && (
                <div className="fixed top-4 right-4 z-50 w-80 p-4 bg-red-500 border border-red-400 rounded-xl shadow-lg transform translate-x-0 opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-white">{error}</p>
                        </div>
                        <button
                            onClick={() => setError("")}
                            className="text-white hover:text-gray-200 text-xl font-bold p-1 hover:bg-red-600 rounded-lg transition-colors"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            {success && (
                <div className="fixed top-4 right-4 z-50 w-80 p-4 bg-green-500 border border-green-400 rounded-xl shadow-lg transform translate-x-0 opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-white">{success}</p>
                        </div>
                        <button
                            onClick={() => setSuccess("")}
                            className="text-white hover:text-gray-200 text-xl font-bold p-1 hover:bg-green-600 rounded-lg transition-colors"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
