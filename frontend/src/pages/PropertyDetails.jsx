import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import {
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineHome,
  HiOutlineScale,
  HiOutlineClock,
} from "react-icons/hi";
import { BiBuildingHouse } from "react-icons/bi";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlineSquareFoot, MdOutlineDirections } from "react-icons/md";
import { TbBath, TbStairs, TbParking, TbElevator } from "react-icons/tb";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FaWhatsapp, FaPhone } from 'react-icons/fa';
import api from "../utils/api";
import ImageModal from "../components/ImageModal";

function PropertyDetails() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const response = await api.get(`/properties/${id}/`);
      return response.data;
    },
  });

  const getConditionBadgeColor = (condition) => {
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

  const handleGetDirections = () => {
    const destination = `${property.latitude},${property.longitude}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const handleWhatsApp = (phone) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const currentYear = new Date().getFullYear();

  const handleImageClick = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const handleNextImage = () => {
    setModalImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setModalImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      
      switch (e.key) {
        case "ArrowRight":
          handlePrevImage();
          break;
        case "ArrowLeft":
          handleNextImage();
          break;
        case "Escape":
          setIsModalOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5454c7]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        حدث خطأ أثناء تحميل تفاصيل العقار
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        لم يتم العثور على العقار
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600">
                <HiOutlineLocationMarker className="w-5 h-5 ml-2" />
                <span>{property.city}، {property.address}</span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Main Selected Image */}
              <div 
                className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4 cursor-pointer"
                onClick={() => handleImageClick(selectedImage)}
              >
                <img
                  src={property.images[selectedImage]?.image}
                  alt={property.title}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-6 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden ${
                      selectedImage === index
                        ? "ring-2 ring-[#5454c7]"
                        : "ring-1 ring-gray-200 hover:ring-[#5454c7]/50"
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">تفاصيل العقار</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MdOutlineSquareFoot className="w-6 h-6 text-[#5454c7] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">المساحة</p>
                  <p className="font-medium">{property.size} م²</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <BiBuildingHouse className="w-6 h-6 text-[#5454c7] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">نوع العقار</p>
                  <p className="font-medium">
                    {property.property_type === "house" ? "منزل" : "شقة"}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <IoBedOutline className="w-6 h-6 text-[#5454c7] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">عدد الغرف</p>
                  <p className="font-medium">{property.number_of_rooms}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <HiOutlineHome className="w-6 h-6 text-[#5454c7] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">عدد الطوابق</p>
                  <p className="font-medium">{property.number_of_floors}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <span className={`px-3 py-1 rounded-full text-sm ${getConditionBadgeColor(property.condition)}`}>
                  {property.condition_display}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {property.status_display}
                </span>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm p-6 relative z-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">الموقع</h2>
                <button
                  onClick={handleGetDirections}
                  className="flex items-center text-[#5454c7] hover:text-[#4444b3]"
                >
                  <MdOutlineDirections className="w-6 h-6 ml-2" />
                  <span>الحصول على الاتجاهات</span>
                </button>
              </div>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[property.latitude, property.longitude]}
                  zoom={15}
                  className="h-full z-0"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[property.latitude, property.longitude]} />
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات التواصل</h2>
              
              {/* Owner Info */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#5454c7] rounded-full flex items-center justify-center text-white text-xl">
                      {property.homeowner.name[0]}
                    </div>
                    <div className="mr-3">
                      <p className="font-medium text-gray-900">{property.homeowner.name}</p>
                      <p className="text-sm text-gray-500">المالك</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWhatsApp(property.homeowner.phone)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCall(property.homeowner.phone)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                    >
                      <FaPhone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <HiOutlinePhone className="w-4 h-4 ml-2" />
                    <span>{property.homeowner.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <HiOutlineMail className="w-4 h-4 ml-2" />
                    <span>{property.homeowner.email}</span>
                  </div>
                </div>
              </div>

              {/* Contractor Info */}
              {property.assigned_contractor && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">المقاول المعتمد</h2>
                    <span className="text-sm bg-[#5454c7]/10 text-[#5454c7] px-3 py-1 rounded-full">
                      مقيّم معتمد
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6">
                    تم تقييم هذا العقار من قبل مقاول معتمد لدينا. المقاول مسؤول عن تقييم حالة العقار وتقديم تقرير مفصل عن جودته وصلاحيته.
                  </p>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#5454c7] rounded-full flex items-center justify-center text-white text-xl">
                          {property.assigned_contractor.name[0]}
                        </div>
                        <div className="mr-3">
                          <p className="font-medium text-gray-900">
                            {property.assigned_contractor.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {property.assigned_contractor.specialization}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleWhatsApp(property.assigned_contractor.phone)}
                          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                          title="تواصل عبر الواتساب"
                        >
                          <FaWhatsapp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCall(property.assigned_contractor.phone)}
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                          title="اتصل بالمقاول"
                        >
                          <FaPhone className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <HiOutlinePhone className="w-4 h-4 ml-2" />
                        <span>{property.assigned_contractor.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <HiOutlineMail className="w-4 h-4 ml-2" />
                        <span>{property.assigned_contractor.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <HiOutlineClock className="w-4 h-4 ml-2" />
                        <span>{property.assigned_contractor.experience_years} سنوات خبرة</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evaluation Report */}
            {property.evaluation_report && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">تقرير التقييم</h2>
                {property.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          className={`text-2xl ${
                            index < Math.floor(property.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="mr-2 text-gray-600">
                      {property.rating} من 5
                    </span>
                  </div>
                )}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {property.evaluation_report}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <ImageModal
          images={property.images}
          currentIndex={modalImageIndex}
          onClose={() => setIsModalOpen(false)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </div>
  );
}

export default PropertyDetails;
