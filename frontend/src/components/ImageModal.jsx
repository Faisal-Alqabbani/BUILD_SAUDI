import { HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";

function ImageModal({ images, currentIndex, onClose, onNext, onPrev }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <HiX className="w-8 h-8" />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <HiChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <HiChevronRight className="w-10 h-10" />
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]?.image}
          alt={`صورة ${currentIndex + 1}`}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

export default ImageModal; 