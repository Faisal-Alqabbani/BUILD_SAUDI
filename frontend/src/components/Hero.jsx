import { Link } from "react-router-dom";
import heroImage from "../assets/hero-image.jpg"; // Add a placeholder image to assets

function Hero() {
  return (
    <div className="relative h-[600px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-16">
        <div className="flex flex-col justify-center h-full text-right">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            رمم منزلك المثالي
            <br />
            <span className="text-2xl md:text-4xl block mt-2">
              لتجعله موطنك الدائم
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl">
            اكتشف العقارات المميزة في أفضل المواقع. منزل أحلامك على بعد نقرة
            واحدة.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-8 max-w-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">+500</div>
              <div className="text-sm text-gray-300">عقار</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">+100</div>
              <div className="text-sm text-gray-300">مدينة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">+1000</div>
              <div className="text-sm text-gray-300">عميل سعيد</div>
            </div>
          </div>

          {/* CTA Button */}
          <div>
            <Link
              to="/signup"
              className="inline-block bg-[#5454c7] text-white px-6 py-2 rounded-full text-base font-medium hover:bg-[#4444b3] transition-colors duration-300"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
