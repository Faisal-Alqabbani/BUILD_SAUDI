import { useState } from "react";

function EvaluationModal({ property, onClose, onSubmit, isLoading }) {
  const [evaluation, setEvaluation] = useState({
    report: "",
    rating: 5,
    status: "approved"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!evaluation.report) {
      alert("يرجى إدخال تقرير التقييم");
      return;
    }
    
    onSubmit(evaluation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                تقييم العقار
              </h2>
              <p className="mt-1 text-gray-600">{property.title}</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                تقرير التقييم
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="6"
                placeholder="أدخل تقرير التقييم التفصيلي هنا..."
                value={evaluation.report}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, report: e.target.value })
                }
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                التقييم (1-10)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={evaluation.rating}
                  onChange={(e) =>
                    setEvaluation({
                      ...evaluation,
                      rating: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <span className="ml-2 text-gray-700 font-bold">
                  {evaluation.rating}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? "جاري الإرسال..." : "إرسال التقييم"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EvaluationModal; 