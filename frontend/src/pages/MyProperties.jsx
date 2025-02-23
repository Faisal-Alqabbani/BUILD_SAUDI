import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../utils/api";

function StatusStepper({ status }) {
  const steps = [
    {
      id: "admin",
      label: "مراجعة إدارية",
      description: "قيد المراجعة الإدارية",
    },
    {
      id: "evaluation",
      label: "تقييم المقاول",
      description: "تقييم العقار",
    },
    {
      id: "final",
      label: "الحالة النهائية",
      description: "القرار النهائي",
    },
  ];

  const getStepStatus = (stepId) => {
    switch (status) {
      case "pending":
        return stepId === "admin" ? "current" : "upcoming";
      case "rejected":
        return stepId === "admin" ? "rejected" : "upcoming";
      case "eval_pending":
        return stepId === "admin"
          ? "completed"
          : stepId === "evaluation"
          ? "current"
          : "upcoming";
      case "approved":
        return "completed";
      default:
        return "upcoming";
    }
  };

  const getStepStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "current":
        return "bg-blue-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "approved":
        return "bg-green-500 text-white";
      default:
        return "bg-white border-2 border-gray-300 text-gray-500";
    }
  };

  const getStepIcon = (step, stepStatus) => {
    if (stepStatus === "completed" || stepStatus === "approved") {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (stepStatus === "rejected") {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }
    return <span>{steps.indexOf(step) + 1}</span>;
  };

  return (
    <div className="w-full py-4">
      <div className="flex justify-between">
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStyle(
                  stepStatus
                )}`}
              >
                {getStepIcon(step, stepStatus)}
              </div>
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-medium ${
                    stepStatus === "completed" || stepStatus === "approved"
                      ? "text-green-600"
                      : stepStatus === "current"
                      ? "text-blue-600"
                      : stepStatus === "rejected"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Property Image with Status Badge (singular) */}
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
        {/* Single Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeStyle(
              property.status
            )}`}
          >
            {property.status === "pending"
              ? "قيد المراجعة"
              : property.status === "approved"
              ? "تمت الموافقة"
              : property.status === "rejected"
              ? "مرفوض"
              : property.status}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {property.title}
        </h3>
        <div className="flex items-center mt-2 text-gray-600">
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">
            {property.address}، {property.city}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {property.number_of_rooms}
              </p>
              <p className="text-xs text-gray-500">الغرف</p>
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {property.condition_display}
              </p>
              <p className="text-xs text-gray-500">الحالة</p>
            </div>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="mt-6 border-t pt-4">
          <StatusStepper status={property.status} />
        </div>
      </div>
    </div>
  );
}

function MyProperties() {
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["properties"],
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          حدث خطأ أثناء تحميل العقارات
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

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            لا يوجد لديك عقارات
          </h3>
          <p className="text-gray-500 mt-2">
            ابدأ بإضافة عقارك الأول للحصول على تقييم له
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;
