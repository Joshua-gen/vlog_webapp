import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {useState} from "react";

const Navbar = () => {
    const {isAuthenticated, logout, user} = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
        setShowDropdown(false);
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                        Home
                    </Link>
                    {isAuthenticated && (
                        <Link to="/create" className="text-gray-700 hover:text-gray-900 font-medium">
                            Create Post
                        </Link>
                    )}
                </div>

                <div className="flex items-center space-x-6">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                                Login
                            </Link>
                            <Link to="/register" className="text-gray-700 hover:text-gray-900 font-medium">
                                Register
                            </Link>
                        </>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium"
                            >
                                {user?.image ? (
                                    <img
                                        src={`http://localhost:5000${user.image}`}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextElementSibling.style.display = "flex";
                                        }}
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-white border-2 border-gray-200">
                                        {user?.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}

                                <span className="text-sm">{user?.email || "User"}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
