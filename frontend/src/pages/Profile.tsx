import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Camera, LoaderCircle, LogOut, Mail, Phone, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.firstName, user?.lastName, user?.phone]);

  const avatar = useMemo(
    () =>
      user?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName || "Safe"} ${lastName || "Spend"}`)}&background=10b981&color=fff`,
    [firstName, lastName, user?.avatar],
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        avatar,
      });
      setMessage("Profile saved to your account.");
    } catch {
      setError("Unable to save your profile right now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage the signed-in account stored for your user in the database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <img
              src={avatar}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-gray-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 p-2 bg-white border border-gray-100 rounded-full shadow-sm">
              <Camera className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.firstName} {user?.lastName}</h2>
          <p className="text-xs text-gray-400 font-medium mb-6">{user?.email}</p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Session</span>
              <span className="text-gray-900">Connected</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>User ID</span>
              <span className="text-gray-900 truncate max-w-[140px]">{user?.id}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 flex items-center justify-center gap-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Information</h2>
            <p className="text-sm text-gray-500 mb-8">Changes here are saved to the current user record in MongoDB.</p>

            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-rose-500">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 disabled:opacity-70 transition-all"
                >
                  {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
