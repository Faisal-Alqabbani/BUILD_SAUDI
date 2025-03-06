import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function ContractorOffers() {
  const navigate = useNavigate();

  const { data: offers, isLoading } = useQuery({
    queryKey: ["contractor-offers"],
    queryFn: async () => {
      const response = await api.get("/price-offers/");
      return response.data;
    },
  });

  const handleOfferClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">عروضي</h1>

      <div className="grid grid-cols-1 gap-4">
        {offers?.map((offer) => (
          <div
            key={offer.id}
            onClick={() => handleOfferClick(offer.property)}
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
                  تاريخ التقديم
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(offer.proposed_at).toLocaleDateString("ar-SA")}
                </dd>
              </div>
            </div>

            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500">
                تفاصيل العرض
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {offer.description}
              </dd>
            </div>
          </div>
        ))}

        {offers?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">لا توجد عروض مقدمة</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractorOffers;
