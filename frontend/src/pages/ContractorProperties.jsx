import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import api from "../utils/api";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PropertyCard from "../components/PropertyCard";
import EvaluationModal from "../components/EvaluationModal";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";

function PropertyModal({ property, onClose, onSubmitEvaluation }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [evaluation, setEvaluation] = useState({
    report: "",
    rating: 5,
  });

  const position = [
    parseFloat(property.latitude),
    parseFloat(property.longitude),
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleSubmit = () => {
    if (!evaluation.report || !evaluation.rating) {
      alert("يرجى ملء تقرير التقييم والتقييم");
      return;
    }
    onSubmitEvaluation(property.id, { ...evaluation, status: "approved" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {property.title}
              </h2>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                  property.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : property.status === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : property.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {property.status_display}
              </span>
            </div>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden h-[400px]">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[currentImageIndex].image}
                  alt={`الصورة ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">لا توجد صور متاحة</span>
                </div>
              )}
            </div>

            {/* Image Navigation */}
            {property.images && property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image Thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={`الصورة المصغرة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property and Owner Details Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                تفاصيل العقار
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">العنوان</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.address}، {property.city}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    نوع العقار
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {property.property_type === "house" ? "منزل" : "شقة"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">المساحة</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.size} م²
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">الغرف</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.number_of_rooms}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">الطوابق</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.number_of_floors}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">الحالة</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.condition === "GOOD"
                      ? "جيد"
                      : property.condition === "FAIR"
                      ? "متوسط"
                      : property.condition === "POOR"
                      ? "ضعيف"
                      : "متدهور"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    رقم القطعة
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.plot_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    الإحداثيات
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.latitude}، {property.longitude}
                  </dd>
                </div>
              </dl>

              {/* Map */}
              <div className="mt-4 h-[200px] rounded-lg overflow-hidden">
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={position} />
                </MapContainer>
              </div>
            </div>

            {/* Owner Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                تفاصيل المالك
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    الاسم الكامل
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.first_name}{" "}
                    {property.homeowner?.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    البريد الإلكتروني
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">الهاتف</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.phone || "غير متوفر"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">الجنس</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {property.homeowner?.gender === "male"
                      ? "ذكر"
                      : property.homeowner?.gender === "female"
                      ? "أنثى"
                      : "غير محدد"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    الهوية الوطنية
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.national_id || "غير متوفر"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    التحقق من الهاتف
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        property.homeowner?.mobile_verified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.homeowner?.mobile_verified
                        ? "تم التحقق"
                        : "غير متحقق"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Contact & Visit Section */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              التواصل والزيارة
            </h3>
            <div className="space-y-4">
              {/* Contact Buttons */}
              <div className="flex gap-4">
                <a
                  href={`https://wa.me/${property.homeowner?.phone?.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  واتساب
                </a>
                <a
                  href={`tel:${property.homeowner?.phone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  اتصال
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  الحصول على الاتجاهات
                </a>
              </div>

              {/* Contact Info */}
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">رقم الاتصال:</span>{" "}
                  {property.homeowner?.phone || "غير متوفر"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">الموقع:</span>{" "}
                  {property.address}، {property.city}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">الوصف</h3>
            <p className="text-sm text-gray-600">{property.description}</p>
          </div>

          {/* Add Rating Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التقييم
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEvaluation({ ...evaluation, rating: star })}
                  className={`text-2xl ${
                    star <= evaluation.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Evaluation Report */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تقرير التقييم
            </label>
            <textarea
              value={evaluation.report}
              onChange={(e) =>
                setEvaluation({ ...evaluation, report: e.target.value })
              }
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              placeholder="اكتب تقرير التقييم هنا..."
            />
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="p-6 border-t sticky bottom-0 bg-white z-10 rounded-b-lg">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                if (!evaluation.report || !evaluation.rating) {
                  alert("يرجى ملء تقرير التقييم والتقييم");
                  return;
                }
                onSubmitEvaluation(property.id, {
                  ...evaluation,
                  status: "rejected",
                });
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              رفض العقار
            </button>
            <button
              onClick={() => {
                if (!evaluation.report || !evaluation.rating) {
                  alert("يرجى ملء تقرير التقييم والتقييم");
                  return;
                }
                onSubmitEvaluation(property.id, {
                  ...evaluation,
                  status: "approved",
                });
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              قبول العقار
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletionModal({ property, onClose, onSubmit }) {
  const [images, setImages] = useState([]);
  const [note, setNote] = useState("");
  const [descriptions, setDescriptions] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setImages((prevImages) => [
      ...prevImages,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
    setDescriptions((prev) => [
      ...prev,
      ...new Array(acceptedFiles.length).fill(""),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setDescriptions((prevDesc) => prevDesc.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("يرجى إضافة صور العمل المنجز");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("completion_note", note);
    images.forEach((image) => {
      formData.append("images", image);
    });
    descriptions.forEach((desc) => {
      formData.append("image_descriptions", desc);
    });

    // Debug log
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error response:", error.response?.data);
      setError(error.response?.data?.detail || "حدث خطأ أثناء إكمال العمل");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => images.forEach((image) => URL.revokeObjectURL(image.preview));
  }, [images]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">
              إكمال العمل - {property.title}
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

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">ملاحظات الإنجاز</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              rows="4"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">صور العمل المنجز</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>اضغط لرفع الصور</span>
                  </label>
                  <p className="pl-1">أو اسحب وأفلت الصور هنا</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG حتى 10 ميجابايت
                </p>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">الصور المرفقة</h3>
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={descriptions[index]}
                      onChange={(e) => {
                        const newDescriptions = [...descriptions];
                        newDescriptions[index] = e.target.value;
                        setDescriptions(newDescriptions);
                      }}
                      placeholder="وصف الصورة"
                      className="mt-2 w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "جاري الإرسال..." : "إكمال العمل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContractorProperties() {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: properties,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["contractor-properties"],
    queryFn: async () => {
      // Get properties assigned to this contractor
      const response = await api.get("/properties/");
      // Filter to only include properties assigned to this contractor
      // (in_progress or price_proposed status)
      return response.data.filter(
        (prop) =>
          prop.assigned_contractor &&
          (prop.status === "in_progress" || prop.status === "price_proposed")
      );
    },
  });

  const evaluationMutation = useMutation({
    mutationFn: async ({ propertyId, evaluation }) => {
      return api.post(`/properties/${propertyId}/contractor_review/`, {
        evaluation_report: evaluation.report,
        rating: parseInt(evaluation.rating),
        status: evaluation.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contractor-properties"]);
      setSelectedProperty(null);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || "حدث خطأ أثناء تقديم التقييم";
      alert(errorMessage);
      console.error("Evaluation error:", error);
    },
  });

  const markAsCompleted = async (propertyId) => {
    if (window.confirm("هل أنت متأكد من إكمال العمل على هذا العقار؟")) {
      try {
        await api.post(`/properties/${propertyId}/complete/`);
        // Refresh the properties list
        refetch();
      } catch (error) {
        console.error("Error marking property as completed:", error);
      }
    }
  };

  const handleCompleteWork = async (formData) => {
    try {
      await api.post(
        `/properties/${selectedProperty.id}/mark_completed/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      refetch();
    } catch (error) {
      throw error;
    }
  };

  // Add a helper function to translate status to Arabic
  const getStatusInArabic = (status) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة";
      case "approved":
        return "تمت الموافقة";
      case "rejected":
        return "مرفوض";
      case "in_progress":
        return "قيد التنفيذ";
      case "completed":
        return "مكتمل";
      default:
        return status;
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">عقاراتي المسندة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate(`/properties/${property.id}`)}
          >
            <div className="h-48 overflow-hidden relative">
              {property.images && property.images[0] ? (
                <img
                  src={property.images[0].image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">لا توجد صورة</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    property.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : property.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : property.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {getStatusInArabic(property.status)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {property.title}
              </h3>
              <p className="text-gray-600 mb-4">{property.address}</p>

              {property.status === "in_progress" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProperty(property);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                >
                  إكمال العمل
                </button>
              )}
            </div>
          </div>
        ))}

        {properties?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">
              لا يوجد عقارات مسندة
            </h3>
          </div>
        )}
      </div>

      {selectedProperty && (
        <CompletionModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSubmit={handleCompleteWork}
        />
      )}
    </div>
  );
}

export default ContractorProperties;
