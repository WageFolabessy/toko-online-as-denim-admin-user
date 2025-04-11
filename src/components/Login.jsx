import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { loginAdmin } from "../services/authApi";

const Login = () => {
  const { token, setToken, setUser } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Login";
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (errors.email || errors.password || errors.message) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset errors

    if (!email || !password) {
      toast.warning("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginAdmin(email, password);

      setToken(data.token);
      setUser(data.user);
      toast.success(data.message || "Login berhasil");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setErrors(
          Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key][0];
            return acc;
          }, {})
        );
        toast.error("Data yang dimasukkan tidak valid.");
      } else if (error.status === 401) {
        setErrors({ message: errorMessage });
        toast.error(errorMessage);
      } else {
        setErrors({ message: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Admin Panel Login
        </h1>
        <form onSubmit={handleSubmit} noValidate>
          {errors.message && (
            <div className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
              {errors.message}
            </div>
          )}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Alamat Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="admin@example.com"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              className={`w-full rounded-md border px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Kata Sandi
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={handleInputChange(setPassword)}
              required
              className={`w-full rounded-md border px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading
                ? "cursor-not-allowed bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
