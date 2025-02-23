import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../utils/api";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "user",
    gender: "",
    date_of_birth: "",
    phone: "",
    national_id: "",
    contractor_details: {
      specialization: "",
      experience_years: "",
      license_number: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post("/signup/", userData);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      navigate("/");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth || null,
      phone: formData.phone,
      national_id: formData.national_id,
      role: formData.role,
    };

    if (formData.role === "contractor") {
      userData.contractor_details = {
        specialization: formData.contractor_details.specialization,
        experience_years: parseInt(
          formData.contractor_details.experience_years
        ),
        license_number: formData.contractor_details.license_number,
      };
    }

    signupMutation.mutate(userData);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          إنشاء حساب جديد
        </h1>
        <p className="text-center text-gray-600 mb-8">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-[#5454c7] hover:text-[#4444b3]">
            تسجيل الدخول
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                الاسم الأول <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="الاسم الأول"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                اسم العائلة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="اسم العائلة"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              نوع الحساب <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="user">مالك عقار</option>
              <option value="contractor">مقاول</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              الجنس <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              تاريخ الميلاد <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              رقم الجوال <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="05xxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              رقم الهوية <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.national_id}
              onChange={(e) =>
                setFormData({ ...formData, national_id: e.target.value })
              }
              placeholder="رقم الهوية الوطنية"
            />
          </div>

          {formData.role === "contractor" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                معلومات المقاول
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  التخصص <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.contractor_details.specialization}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractor_details: {
                        ...formData.contractor_details,
                        specialization: e.target.value,
                      },
                    })
                  }
                  placeholder="مجال التخصص"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  سنوات الخبرة <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.contractor_details.experience_years}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractor_details: {
                        ...formData.contractor_details,
                        experience_years: e.target.value,
                      },
                    })
                  }
                  placeholder="عدد سنوات الخبرة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  رقم الرخصة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.contractor_details.license_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractor_details: {
                        ...formData.contractor_details,
                        license_number: e.target.value,
                      },
                    })
                  }
                  placeholder="رقم رخصة المقاول"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#5454c7] text-white py-2 px-4 rounded-md hover:bg-[#4444b3] focus:outline-none focus:ring-2 focus:ring-[#5454c7] focus:ring-offset-2"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? "جاري التسجيل..." : "إنشاء حساب"}
          </button>

          {signupMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              حدث خطأ أثناء إنشاء الحساب
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Signup;
