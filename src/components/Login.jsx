import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const { token, setToken, setUser } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AS Denim | Admin Login";
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        toast.success(data.message || "Login berhasil");
        navigate("/admin/dashboard");
      } else {
        toast.error(data.message || "Login gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Panel</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="Masukkan email anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Kata Sandi
            </label>
            <input
              type="password"
              placeholder="Masukkan password anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full py-2 px-4 text-white rounded-md ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black hover:bg-gray-900"
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
