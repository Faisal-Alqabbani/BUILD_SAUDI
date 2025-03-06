import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import Hero from "../components/Hero";
import PropertyCard from "../components/PropertyCard";

function Home() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["completed-properties"],
    queryFn: async () => {
      const response = await api.get("/properties/completed-list/");
      return response.data;
    },
  });

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Completed Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            المشاريع المنجزة
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            استعرض المشاريع التي تم إنجازها بنجاح من قبل مقاولينا المعتمدين
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5454c7]"></div>
          </div>
        ) : properties?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">
              لا توجد مشاريع منجزة حالياً
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
