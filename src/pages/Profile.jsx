import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import EditProfileModal from "../components/Profile/EditProfileModal";
import { AppContext } from "../context/AppContext";
import { getOwnAdminProfile } from "../services/adminApi";

const DetailItem = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
    <dt className="text-sm font-medium leading-6 text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0">
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
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "Tanggal tidak valid";
    }
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
      setAdminProfile(null);
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
      <div className="py-10 text-center text-gray-500">Memuat profil...</div>
    );
  } else if (fetchError) {
    content = (
      <div className="py-10 text-center text-red-600">
        Error: {fetchError}.
        <button
          onClick={fetchProfile}
          className="ml-2 text-sm text-indigo-600 hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  } else if (adminProfile) {
    content = (
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="flex items-center justify-between px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Informasi Akun Admin
          </h3>
          <button
            type="button"
            onClick={openEditModal}
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50"
          >
            <FaEdit className="inline-block mr-1 h-4 w-4" aria-hidden="true" />{" "}
            Edit Profil
          </button>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="divide-y divide-gray-100">
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
      <div className="py-10 text-center text-gray-500">
        Data profil tidak tersedia.
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl mb-6">
        Profil Admin
      </h1>
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
