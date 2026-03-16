import { useNavigate } from "react-router-dom";
import PageLayout from "../../../shared/components/PageLayout";

export default function Home() {
  const navigate = useNavigate();

  // temporary logout for debug
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAdminOTP = () => {
    navigate("/generate-otp");
  };

  const handleAdminUpgrade = () => {
    navigate("/admin-upgrade");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center space-y-6 mt-10">
        <h1 className="text-3xl font-bold">Welcome to PeerPrep!</h1>

        <button className="button" onClick={handleProfile}>
          Your Profile
        </button>

        <button
          className="button"
          onClick={handleAdminOTP}
          style={{ backgroundColor: "#edde10" }}
        >
          Generate Admin OTP (use only if admin)
        </button>

        <button
          className="button"
          onClick={handleAdminUpgrade}
          style={{ backgroundColor: "#2a10ed" }}
        >
          Enter admin upgrade OTP (use if user)
        </button>

        <button
          className="button"
          onClick={handleLogout}
          style={{ backgroundColor: "#ec0a0a" }}
        >
          Log Out
        </button>
      </div>
    </PageLayout>
  );
}
