import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { loginAdmin } from "../services/authApi";
import { assets } from "../assets/assets"; // Pastikan path ini benar

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
    setErrors({});
    if (!email || !password) {
      toast.warn("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      setToken(data.token);
      setUser(data.user);
      toast.success(data.message || "Login berhasil!");
      navigate("/");
    } catch (error) {
      const errorMessage = error.message || "Terjadi kesalahan.";
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error("Data yang dimasukkan tidak valid.");
      } else {
        setErrors({ message: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <img
            src={assets.as_denim_logo}
            alt="Logo"
            className="mx-auto h-12 w-auto"
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Selamat datang kembali, silakan masuk.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.message && (
            <div className="rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700">
              {errors.message}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
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
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
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
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500 bg-slate-50"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading
                ? "cursor-not-allowed bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
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
