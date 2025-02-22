import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../utils/api";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function PropertyModal({ property, onClose, onReject, contractors, onAssignAndApprove }) {
  const [selectedContractor, setSelectedContractor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get the selected contractor's full details
  const selectedContractorDetails = contractors.find(c => c.id.toString() === selectedContractor);

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

  const position = [parseFloat(property.latitude), parseFloat(property.longitude)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
              <span className="inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                Pending Review
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                      currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.address}, {property.city}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{property.property_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.size} m²</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rooms</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.number_of_rooms}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Floors</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.number_of_floors}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Condition</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.condition}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plot Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.plot_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.latitude}, {property.longitude}
                  </dd>
                </div>
              </dl>

              {/* Add Map */}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.first_name} {property.homeowner?.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.homeowner?.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.homeowner?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.homeowner?.phone || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{property.homeowner?.gender || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">National ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.homeowner?.national_id || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.homeowner?.registration_date ? 
                      new Date(property.homeowner.registration_date).toLocaleDateString() : 
                      'Not available'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mobile Verification</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.homeowner?.mobile_verified ? 
                      'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {property.homeowner?.mobile_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{property.description}</p>
          </div>

          {/* Contractor Assignment */}
          {property.status === 'pending' && (
            <>
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Contractor</h3>
                <div className="flex gap-4">
                  <select
                    value={selectedContractor}
                    onChange={(e) => setSelectedContractor(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a contractor</option>
                    {contractors.map((contractor) => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.user.first_name} {contractor.user.last_name} - {contractor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Contractor Details */}
              {selectedContractorDetails && (
                <div className="mt-4 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contractor Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Professional Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Professional Information</h4>
                        <dl className="mt-2 space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                            <dd className="text-sm text-gray-900">{selectedContractorDetails.specialization}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Experience</dt>
                            <dd className="text-sm text-gray-900">{selectedContractorDetails.experience_years} years</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">License Number</dt>
                            <dd className="text-sm text-gray-900">{selectedContractorDetails.license_number}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                        <dl className="mt-2 space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="text-sm text-gray-900">
                              {selectedContractorDetails.user.first_name} {selectedContractorDetails.user.last_name}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-sm text-gray-900">{selectedContractorDetails.user.email}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="text-sm text-gray-900">{selectedContractorDetails.user.phone || 'Not provided'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Gender</dt>
                            <dd className="text-sm text-gray-900 capitalize">
                              {selectedContractorDetails.user.gender || 'Not specified'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Mobile Verification</dt>
                            <dd className="mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                selectedContractorDetails.user.mobile_verified ? 
                                'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {selectedContractorDetails.user.mobile_verified ? 'Verified' : 'Not Verified'}
                              </span>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
            {property.status === 'pending' && (
              <>
                <button
                  onClick={() => onReject(property.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => onAssignAndApprove(property.id, selectedContractor)}
                  disabled={!selectedContractor}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                  Assign & Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRequests() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const queryClient = useQueryClient();

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const response = await api.get('/properties/');
      return response.data;
    }
  });

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const response = await api.get('/contractors/');
      return response.data;
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (propertyId) => 
      api.post(`/properties/${propertyId}/admin_review/`, { action: 'reject' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-properties']);
      setSelectedProperty(null);
    }
  });

  const assignAndApproveMutation = useMutation({
    mutationFn: async ({ propertyId, contractorId }) => {
      // First assign the contractor
      await api.post(`/properties/${propertyId}/assign_contractor/`, { 
        contractor_id: contractorId 
      });
      // Then approve the property
      await api.post(`/properties/${propertyId}/admin_review/`, { 
        action: 'approve' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-properties']);
      setSelectedProperty(null);
    }
  });

  if (propertiesLoading || contractorsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const pendingProperties = properties.filter(p => p.status === 'pending');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Property Requests</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProperty(property)}
          >
            <div className="relative h-48">
              {property.images && property.images[0] ? (
                <img
                  src={property.images[0].image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                Pending Review
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
              <p className="text-sm text-gray-600 mt-1 truncate">{property.address}, {property.city}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500 capitalize">{property.property_type}</span>
                <span className="text-sm font-medium">{property.size} m²</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onReject={(id) => rejectMutation.mutate(id)}
          contractors={contractors}
          onAssignAndApprove={(propertyId, contractorId) => 
            assignAndApproveMutation.mutate({ propertyId, contractorId })}
        />
      )}
    </div>
  );
}

export default AdminRequests; 