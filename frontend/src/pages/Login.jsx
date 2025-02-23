import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../utils/api";
import Logo from "../assets/Logo.png";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/login/", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      navigate("/");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-xl">
        <div className="flex justify-cente">
          <img src={Logo} alt="Logo" className="h-60 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          مرحباً بعودتك
        </h1>
        <p className="text-center text-gray-600 mb-8">
          ليس لديك حساب؟{" "}
          <Link to="/signup" className="text-[#5454c7] hover:text-[#4444b3]">
            سجل الآن
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="ادخل البريد الإلكتروني"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="ادخل كلمة المرور"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#5454c7] focus:ring-[#5454c7]"
                checked={formData.remember}
                onChange={(e) =>
                  setFormData({ ...formData, remember: e.target.checked })
                }
              />
              <label className="mr-2 block text-sm text-gray-900">تذكرني</label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-[#5454c7] hover:text-[#4444b3]"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#5454c7] text-white py-2 px-4 rounded-md hover:bg-[#4444b3] focus:outline-none focus:ring-2 focus:ring-[#5454c7] focus:ring-offset-2"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "جاري التسجيل..." : "تسجيل الدخول"}
          </button>

          {loginMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              خطأ في البريد الإلكتروني أو كلمة المرور
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
