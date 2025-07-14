import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import EditProfileModal from "../components/Profile/EditProfileModal";
import { AppContext } from "../context/AppContext";
import { getOwnAdminProfile } from "../services/adminApi";

const DetailItem = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm text-slate-800 sm:col-span-2 sm:mt-0">
      {value ?? "-"}
    </dd>
  </div>
);
DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const Profile = () => {
  const {
    authFetch,
    user: contextUser,
    setUser: setContextUser,
  } = useContext(AppContext);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getOwnAdminProfile(authFetch);
      setAdminProfile(data);
      if (data && JSON.stringify(data) !== JSON.stringify(contextUser)) {
        setContextUser(data);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      const errorMessage = error.message || "Gagal mengambil data profil.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [authFetch, contextUser, setContextUser]);

  useEffect(() => {
    document.title = "Profil Admin";
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateSuccess = () => {
    toast.info("Memperbarui data profil...");
    fetchProfile();
  };

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  let content;
  if (loading) {
    content = (
      <div className="py-10 text-center text-slate-500">Memuat profil...</div>
    );
  } else if (fetchError) {
    content = (
      <div className="py-10 text-center text-red-600">
        Error: {fetchError}.
        <button
          onClick={fetchProfile}
          className="ml-2 text-sm text-blue-600 hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  } else if (adminProfile) {
    content = (
      <div className="overflow-hidden bg-white shadow-sm border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Informasi Akun Admin
          </h3>
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <FaEdit className="h-4 w-4" aria-hidden="true" />
            Edit Profil
          </button>
        </div>
        <div className="p-6">
          <dl className="divide-y divide-slate-100">
            <DetailItem label="ID Pengguna" value={adminProfile.id} />
            <DetailItem label="Nama Lengkap" value={adminProfile.name} />
            <DetailItem label="Alamat Email" value={adminProfile.email} />
            <DetailItem
              label="Tanggal Dibuat"
              value={formatDateTime(adminProfile.created_at)}
            />
            <DetailItem
              label="Pembaruan Terakhir"
              value={formatDateTime(adminProfile.updated_at)}
            />
          </dl>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="py-10 text-center text-slate-500">
        Data profil tidak tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      <h1 className="text-3xl font-bold text-slate-800">Profil Admin</h1>
      {content}

      {adminProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          admin={adminProfile}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default Profile;
