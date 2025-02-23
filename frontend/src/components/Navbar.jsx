import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../utils/api";
import Logo from "../assets/Logo.png";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/logout/");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      navigate("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="h-20 w-auto" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
            >
              الرئيسية
            </Link>

            {token && userRole === "user" && (
              <>
                <Link
                  to="/properties"
                  className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
                >
                  عقاراتي
                </Link>
                <Link
                  to="/properties/create"
                  className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
                >
                  إضافة عقار
                </Link>
              </>
            )}

            {token && userRole === "admin" && (
              <Link
                to="/admin/requests"
                className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
              >
                طلبات العقارات
              </Link>
            )}

            {token && userRole === "contractor" && (
              <Link
                to="/contractor/properties"
                className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
              >
                العقارات المسندة
              </Link>
            )}

            {token ? (
              <button
                onClick={handleLogout}
                className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
              >
                تسجيل الخروج
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#5454c7] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#4444b3]"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
