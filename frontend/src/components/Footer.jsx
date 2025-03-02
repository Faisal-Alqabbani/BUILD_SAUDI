import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Make sure to import your logo

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="احياء السعودية" className="h-10" />
              <span className="text-xl font-bold text-gray-900 mr-2">
                احياء السعودية
              </span>
            </Link>
          </div>
          <div className="text-gray-600 text-sm text-center">
            <p>جميع الحقوق محفوظة © {currentYear} احياء السعودية</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
