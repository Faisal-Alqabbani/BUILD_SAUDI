import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import { useState } from "react";

function OfferModal({ offer, onClose, onAccept, onReject }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">
              تفاصيل العرض - {offer.property_title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contractor Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              معلومات المقاول
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  اسم المقاول
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {offer.contractor_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">التخصص</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {offer.contractor_specialization}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  سنوات الخبرة
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {offer.contractor_experience_years} سنوات
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  رقم الجوال
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {offer.contractor_phone}
                </dd>
              </div>
            </dl>
          </div>

          {/* Offer Details */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تفاصيل العرض
            </h3>
            <dl className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  قيمة العرض
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {offer.amount} ريال
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  تاريخ التقديم
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(offer.proposed_at).toLocaleDateString("ar-SA")}
                </dd>
              </div>
            </dl>
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-2">
                تفاصيل إضافية
              </dt>
              <dd className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md">
                {offer.description}
              </dd>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t sticky bottom-0 bg-white">
          <div className="flex justify-end gap-3">
            {offer.status === "pending" && (
              <>
                <button
                  onClick={() => onReject(offer.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  رفض العرض
                </button>
                <button
                  onClick={() => onAccept(offer.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  قبول العرض
                </button>
              </>
            )}
            {offer.status === "accepted" && (
              <span className="text-green-600 font-medium">تم قبول العرض</span>
            )}
            {offer.status === "rejected" && (
              <span className="text-red-600 font-medium">تم رفض العرض</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeownerPendingOffers() {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [error, setError] = useState("");

  const {
    data: offers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pending-offers"],
    queryFn: async () => {
      const response = await api.get("/price-offers/");
      return response.data;
    },
  });

  const handleAcceptOffer = async (offerId) => {
    try {
      await api.post(`/price-offers/${offerId}/accept/`);
      setSelectedOffer(null);
      refetch();
    } catch (error) {
      setError(error.response?.data?.detail || "حدث خطأ أثناء قبول العرض");
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      await api.post(`/price-offers/${offerId}/reject/`);
      setSelectedOffer(null);
      refetch();
    } catch (error) {
      setError(error.response?.data?.detail || "حدث خطأ أثناء رفض العرض");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5454c7]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">العروض المقدمة</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {offers?.map((offer) => (
          <div
            key={offer.id}
            onClick={() => setSelectedOffer(offer)}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {offer.property_title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {offer.property_address}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  offer.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : offer.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {offer.status === "accepted"
                  ? "تم القبول"
                  : offer.status === "rejected"
                  ? "مرفوض"
                  : "قيد الانتظار"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  قيمة العرض
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {offer.amount} ريال
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  اسم المقاول
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {offer.contractor_name}
                </dd>
              </div>
            </div>
          </div>
        ))}

        {offers?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">لا توجد عروض مقدمة</p>
          </div>
        )}
      </div>

      {selectedOffer && (
        <OfferModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onAccept={handleAcceptOffer}
          onReject={handleRejectOffer}
        />
      )}
    </div>
  );
}

export default HomeownerPendingOffers;
