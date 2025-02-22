import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../utils/api";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function PropertyModal({ property, onClose, onSubmitEvaluation }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [evaluation, setEvaluation] = useState({
    report: "",
    rating: 0,
    status: "",
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
    if (!evaluation.report || !evaluation.rating || !evaluation.status) {
      alert("Please fill in all evaluation fields");
      return;
    }
    onSubmitEvaluation(property.id, evaluation);
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
              <span className="inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                Pending Evaluation
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
                  alt={`Property ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No images available</span>
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
                      alt={`Thumbnail ${index + 1}`}
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
                Property Details
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.address}, {property.city}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Property Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {property.property_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.size} m²
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rooms</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.number_of_rooms}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Floors</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.number_of_floors}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Condition
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.condition}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Plot Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.plot_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Coordinates
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.latitude}, {property.longitude}
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={position} />
                </MapContainer>
              </div>
            </div>

            {/* Owner Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Owner Details
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.first_name}{" "}
                    {property.homeowner?.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.phone || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {property.homeowner?.gender || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    National ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.national_id || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Mobile Verification
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
                        ? "Verified"
                        : "Not Verified"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Contact & Visit Section */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Contact & Visit
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
                  WhatsApp
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
                  Call
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
                  Get Directions
                </a>
              </div>

              {/* Contact Info */}
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Contact Number:</span>{" "}
                  {property.homeowner?.phone || "Not provided"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Location:</span>{" "}
                  {property.address}, {property.city}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-600">{property.description}</p>
          </div>

          {/* Evaluation Form */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Property Evaluation
            </h3>
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Rating (1-5)
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setEvaluation({ ...evaluation, rating: star })
                      }
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Report
                </label>
                <textarea
                  value={evaluation.report}
                  onChange={(e) =>
                    setEvaluation({ ...evaluation, report: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Write your detailed evaluation here..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="p-6 border-t sticky bottom-0 bg-white z-10 rounded-b-lg">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                setEvaluation({ ...evaluation, status: "rejected" });
                handleSubmit();
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={() => {
                setEvaluation({ ...evaluation, status: "approved" });
                handleSubmit();
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractorProperties() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["contractor-properties"],
    queryFn: async () => {
      const response = await api.get("/properties/?status=eval_pending");
      return response.data;
    },
  });

  const evaluationMutation = useMutation({
    mutationFn: async ({ propertyId, evaluation }) => {
      return api.post(`/contractors/submit_evaluation/`, {
        property_id: propertyId,
        evaluation_report: evaluation.report,
        rating: evaluation.rating,
        status: evaluation.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contractor-properties"]);
      setSelectedProperty(null);
    },
  });

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Properties for Evaluation
      </h1>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-24 h-24 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Properties Assigned
            </h3>
            <p className="text-gray-500 max-w-md">
              You currently don't have any properties assigned for evaluation.
              New requests will appear here when administrators assign
              properties to you.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProperty(property)}
            >
              {/* Property Card - Similar to AdminRequests but with evaluation status */}
              <div className="relative h-48">
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
                <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Needs Evaluation
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {property.address}, {property.city}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500 capitalize">
                    {property.property_type}
                  </span>
                  <span className="text-sm font-medium">
                    {property.size} m²
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSubmitEvaluation={(propertyId, evaluation) =>
            evaluationMutation.mutate({ propertyId, evaluation })
          }
        />
      )}
    </div>
  );
}

export default ContractorProperties;
