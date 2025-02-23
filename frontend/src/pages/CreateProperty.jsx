import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../utils/api";
import { saudiCities } from "../data/saudiCities";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Add this function at the top with other imports
async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar&addressdetails=1`
    );
    const data = await response.json();

    // Try to find the city from address components
    let city =
      data.address.city ||
      data.address.state ||
      data.address.county ||
      data.address.region;

    // Find closest matching city from our saudiCities list
    if (city) {
      city =
        saudiCities.find(
          (saudiCity) => city.includes(saudiCity) || saudiCity.includes(city)
        ) || city;
    }

    // Format detailed address - only take first 3 important components
    const addressComponents = [
      data.address.building,
      data.address.road,
      data.address.neighbourhood,
      data.address.suburb,
      data.address.district,
      data.address.quarter,
    ].filter(Boolean); // Remove undefined/null values

    // Take only first 3 components
    const formattedAddress = addressComponents.slice(0, 3).join("، ");

    return {
      address:
        formattedAddress || data.display_name.split("،").slice(0, 3).join("، "),
      city: city || "",
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

// Map marker component
function LocationMarker({ position, setPosition, updateAddress }) {
  useMapEvents({
    async click(e) {
      const newPosition = e.latlng;
      setPosition(newPosition);

      // Get address from coordinates
      const locationInfo = await reverseGeocode(
        newPosition.lat,
        newPosition.lng
      );
      if (locationInfo) {
        updateAddress(locationInfo);
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function CreateProperty() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    plot_number: "",
    property_type: "house",
    size: "",
    number_of_floors: "",
    number_of_rooms: "",
    condition: "GOOD",
    images: [],
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [position, setPosition] = useState(null);

  const createPropertyMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();

      // Add all text fields
      Object.keys(data).forEach((key) => {
        if (key !== "images") {
          formData.append(key, data[key]);
        }
      });

      // Add images
      data.images.forEach((image) => {
        formData.append("uploaded_images", image);
      });

      const response = await api.post("/properties/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["properties"]);
      navigate("/properties");
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Create preview URLs
    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Create preview URLs
    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate required fields
    if (
      !formData.title ||
      !formData.description ||
      !formData.address ||
      !formData.city ||
      !formData.plot_number ||
      !formData.size
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Submit the form data
    createPropertyMutation.mutate(formData);
  };

  const handlePositionChange = async (newPosition) => {
    setPosition(newPosition);
    setFormData((prev) => ({
      ...prev,
      latitude: newPosition.lat.toFixed(6),
      longitude: newPosition.lng.toFixed(6),
    }));
  };

  const updateAddressFromMap = (locationInfo) => {
    if (locationInfo) {
      setFormData((prev) => ({
        ...prev,
        address: locationInfo.address,
        // Only update city if we found a valid Saudi city
        ...(locationInfo.city && saudiCities.includes(locationInfo.city)
          ? { city: locationInfo.city }
          : {}),
      }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl w-full px-6 py-8 bg-white rounded-lg shadow-xl my-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          إضافة عقار جديد
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                عنوان العقار <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="أدخل عنوان العقار"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                وصف العقار <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="اكتب وصفاً تفصيلياً للعقار"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                المدينة
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#5454c7] focus:border-[#5454c7]"
              >
                <option value="">اختر المدينة</option>
                {saudiCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                العنوان التفصيلي
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                disabled
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-[#5454c7] focus:border-[#5454c7] 
                  bg-gray-50 cursor-not-allowed"
                placeholder="سيتم تعبئة العنوان تلقائياً عند اختيار الموقع على الخريطة"
              />
              <p className="mt-1 text-sm text-gray-500">
                يتم تحديد العنوان تلقائياً عند اختيار الموقع على الخريطة
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                الموقع على الخريطة <span className="text-red-500">*</span>
              </label>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[24.7136, 46.6753]}
                  zoom={13}
                  className="h-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker
                    position={position}
                    setPosition={handlePositionChange}
                    updateAddress={updateAddressFromMap}
                  />
                </MapContainer>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                انقر على الخريطة لتحديد موقع العقار
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                رقم قطعة الأرض <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.plot_number}
                onChange={(e) =>
                  setFormData({ ...formData, plot_number: e.target.value })
                }
                placeholder="رقم قطعة الأرض"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                نوع العقار <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.property_type}
                onChange={(e) =>
                  setFormData({ ...formData, property_type: e.target.value })
                }
              >
                <option value="house">منزل</option>
                <option value="apartment">شقة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                المساحة (متر مربع) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="مساحة العقار بالمتر المربع"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  عدد الطوابق
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.number_of_floors}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_floors: e.target.value,
                    })
                  }
                  placeholder="عدد الطوابق"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  عدد الغرف
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.number_of_rooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_rooms: e.target.value,
                    })
                  }
                  placeholder="عدد الغرف"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                حالة العقار <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
              >
                <option value="GOOD">جيدة</option>
                <option value="FAIR">مقبولة</option>
                <option value="POOR">سيئة</option>
                <option value="DILAPIDATED">متهالكة</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">صور العقار</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive
                  ? "border-[#5454c7] bg-[#5454c7]/5"
                  : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="images"
                onChange={handleImageChange}
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
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
                <span className="text-gray-600">
                  اسحب وأفلت الصور هنا، أو انقر لاختيار الملفات
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`معاينة ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#5454c7] text-white py-3 px-4 rounded-md hover:bg-[#4444b3] focus:outline-none focus:ring-2 focus:ring-[#5454c7] focus:ring-offset-2"
            disabled={createPropertyMutation.isPending}
          >
            {createPropertyMutation.isPending
              ? "جاري إضافة العقار..."
              : "إضافة العقار"}
          </button>

          {createPropertyMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              حدث خطأ أثناء إضافة العقار
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateProperty;
