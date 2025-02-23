import { Link } from "react-router-dom";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { BiBuildingHouse } from "react-icons/bi";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlineSquareFoot } from "react-icons/md";

function PropertyCard({ property }) {
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "eval_pending":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "GOOD":
        return "bg-green-100 text-green-800";
      case "FAIR":
        return "bg-blue-100 text-blue-800";
      case "POOR":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getConditionText = (condition) => {
    switch (condition) {
      case "GOOD":
        return "حالة ممتازة";
      case "FAIR":
        return "حالة جيدة";
      case "POOR":
        return "حالة متوسطة";
      default:
        return "حالة سيئة";
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
      {/* Image and Status Badge */}
      <div className="relative">
        <img
          src={property.images?.[0]?.image || "/placeholder-house.jpg"}
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        <span className="absolute top-4 left-4 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
          متاح
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <HiOutlineLocationMarker className="w-5 h-5 ml-2" />
          <span>{property.address}، {property.city}</span>
        </div>

        {/* Property Details in One Row */}
        <div className="flex justify-between items-center mb-6">
          {/* Size */}
          <div className="flex items-center">
            <MdOutlineSquareFoot className="w-5 h-5 text-[#5454c7] ml-2" />
            <div>
              <span className="text-sm text-gray-500">المساحة</span>
              <p className="font-medium">{property.size} م²</p>
            </div>
          </div>

          {/* Property Type */}
          <div className="flex items-center">
            <BiBuildingHouse className="w-5 h-5 text-[#5454c7] ml-2" />
            <div>
              <span className="text-sm text-gray-500">نوع العقار</span>
              <p className="font-medium">
                {property.property_type === "house" ? "منزل" : "شقة"}
              </p>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex items-center">
            <IoBedOutline className="w-5 h-5 text-[#5454c7] ml-2" />
            <div>
              <span className="text-sm text-gray-500">الغرف</span>
              <p className="font-medium">{property.number_of_rooms}</p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <Link
          to={`/properties/${property.id}`}
          className="block w-full text-center bg-[#5454c7] text-white px-4 py-3 rounded-lg hover:bg-[#4444b3] transition-colors duration-300"
        >
          عرض التفاصيل
        </Link>
      </div>
    </div>
  );
}

export default PropertyCard; 