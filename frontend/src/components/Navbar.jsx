import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <nav className="glass fixed w-full top-0 z-50 p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-white">LeaveMS</Link>
      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <Link to="/login" className="text-white">Login</Link>
            <Link to="/signup" className="bg-blue-500 text-white px-4 py-2 rounded">Signup</Link>
          </>
        ) : (
          <>
            <span className="text-white">{user.name}</span>
            <Link to={user.role === "employee" ? "/employee" : "/manager"} className="bg-green-500 text-white px-4 py-2 rounded">Dashboard</Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
          </>
        )}
        <button onClick={() => setDarkMode(!darkMode)} className="text-2xl">
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}