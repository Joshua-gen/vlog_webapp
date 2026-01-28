import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const {isAuthenticated} = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate("/");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        const registerData = {
            name: formData.name,
            email: formData.username,
            password: formData.password,
        };

        try {
            const res = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(registerData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            setSuccess(`Account ${formData.username} created! Please login.`);
            setFormData({name: "", username: "", password: ""});
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Full name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                required
                                minLength="2"
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Enter email"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                required
                                minLength="6"
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>

                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
