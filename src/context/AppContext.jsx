import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext(null);

const AppProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("admin_token") || null
  );
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("admin_user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      sessionStorage.removeItem("admin_user");
      return null;
    }
  });

  const navigate = useNavigate();
  const inactivityTimerRef = useRef(null);
  const hasLoggedOutRef = useRef(false);

  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  const updateToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      sessionStorage.setItem("admin_token", newToken);
    } else {
      sessionStorage.removeItem("admin_token");
    }
  }, []);

  const updateUser = useCallback((newUser) => {
    setUser(newUser);
    if (newUser) {
      sessionStorage.setItem("admin_user", JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem("admin_user");
    }
  }, []);

  const handleLogout = useCallback(
    async (logoutMessage = "Anda berhasil keluar", infoMessage = null) => {
      if (hasLoggedOutRef.current && !infoMessage) return;
      hasLoggedOutRef.current = true;

      const currentToken = sessionStorage.getItem("admin_token");

      if (currentToken) {
        try {
          const response = await fetch("/api/admin/logout", {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Logout API error:", response.status, errorText);
          }
        } catch (error) {
          console.error("Error calling logout API:", error);
        }
      }

      updateToken(null);
      updateUser(null);
      clearTimeout(inactivityTimerRef.current);
      navigate("/login");
      if (infoMessage) {
        toast.info(infoMessage);
      } else {
        toast.success(logoutMessage);
      }
      setTimeout(() => {
        hasLoggedOutRef.current = false;
      }, 500);
    },
    [navigate, updateToken, updateUser]
  );

  const authFetch = useCallback(
    async (url, options = {}) => {
      const currentToken = token;
      if (!currentToken) {
        if (!hasLoggedOutRef.current) {
          handleLogout("Sesi tidak valid. Silakan login kembali.");
        }
        throw new Error("Tidak ada token otentikasi.");
      }

      const defaultHeaders = {
        Accept: "application/json",
        Authorization: `Bearer ${currentToken}`,
      };

      if (options.body && !(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      const mergedOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      try {
        const response = await fetch(url, mergedOptions);

        if (response.status === 401) {
          if (!hasLoggedOutRef.current) {
            handleLogout("Sesi Anda telah berakhir. Silakan login kembali.");
          }
          const error = new Error("Unauthorized");
          error.status = 401;
          throw error;
        }

        return response;
      } catch (error) {
        if (error.status !== 401) {
          console.error("Fetch error:", error);
          toast.error("Terjadi kesalahan jaringan atau server.");
        }
        throw error;
      }
    },
    [token, handleLogout]
  );

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (sessionStorage.getItem("admin_token")) {
        handleLogout(
          null,
          "Sesi Anda telah berakhir karena tidak ada aktivitas."
        );
      }
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  useEffect(() => {
    if (token) {
      hasLoggedOutRef.current = false;
      const activityEvents = [
        "click",
        "mousemove",
        "keydown",
        "scroll",
        "touchstart",
      ];
      activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, resetInactivityTimer, {
          capture: true,
          passive: true,
        });
      });
      resetInactivityTimer();

      return () => {
        activityEvents.forEach((eventName) => {
          window.removeEventListener(eventName, resetInactivityTimer, {
            capture: true,
          });
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    } else {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    }
  }, [token, resetInactivityTimer]);

  const value = {
    token,
    user,
    setToken: updateToken,
    setUser: updateUser,
    handleLogout,
    authFetch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validasi prop children
};

export default AppProvider;
