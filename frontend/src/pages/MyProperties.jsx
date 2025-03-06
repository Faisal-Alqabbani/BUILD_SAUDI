import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../utils/api";

function StatusStepper({ status }) {
  const steps = [
    { key: "pending", label: "قيد المراجعة" },
    { key: "approved", label: "تمت الموافقة" },
    { key: "price_proposed", label: "تم تقديم عرض" },
    { key: "in_progress", label: "قيد التنفيذ" },
    { key: "completed", label: "مكتمل" },
  ];

  const getStepIndex = (currentStatus) => {
    if (currentStatus === "rejected") return -1;
    return steps.findIndex((step) => step.key === currentStatus);
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      {status === "rejected" ? (
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
            مرفوض
          </span>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200"></div>
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`flex flex-col items-center relative ${
                  index <= currentIndex ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index <= currentIndex
                      ? "border-green-600 bg-green-100"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {index <= currentIndex ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  )}
                </div>
                <span
                  className={`absolute mt-10 text-xs text-center w-20 -left-6 ${
                    index <= currentIndex ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }) {
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "price_proposed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة";
      case "approved":
        return "تمت الموافقة";
      case "rejected":
        return "مرفوض";
      case "price_proposed":
        return "تم تقديم عرض";
      case "in_progress":
        return "قيد التنفيذ";
      case "completed":
        return "مكتمل";
      default:
        return status;
    }
  };

  return (
    <Link to={`/properties/${property.id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-48 overflow-hidden relative">
          {property.images && property.images[0] ? (
            <img
              src={property.images[0].image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeStyle(
                property.status
              )}`}
            >
              {getStatusText(property.status)}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {property.title}
          </h3>
          <p className="text-gray-600 mb-4">{property.address}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {property.property_type === "house" ? "منزل" : "شقة"}
                </p>
                <p className="text-xs text-gray-500">نوع العقار</p>
              </div>
            </div>
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {property.size} م²
                </p>
                <p className="text-xs text-gray-500">المساحة</p>
              </div>
            </div>
          </div>

          <StatusStepper status={property.status} />
        </div>
      </div>
    </Link>
  );
}

function MyProperties() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: async () => {
      const response = await api.get("/properties/");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5454c7]"></div>
          <span className="mr-2">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">عقاراتي</h1>
        <Link
          to="/properties/create"
          className="bg-[#5454c7] text-white px-4 py-2 rounded-md hover:bg-[#4444b3]"
        >
          إضافة عقار جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {properties?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            لا يوجد لديك عقارات
          </h3>
          <p className="text-gray-500 mt-2">
            ابدأ بإضافة عقارك الأول للحصول على تقييم له
          </p>
        </div>
      )}
    </div>
  );
}

export default MyProperties;
