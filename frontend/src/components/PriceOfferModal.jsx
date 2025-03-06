import { useState } from "react";

function PriceOfferModal({ property, onClose, onSubmit, error: backendError }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("الرجاء إدخال مبلغ صحيح");
      return;
    }
    
    onSubmit({ amount: parseFloat(amount), description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">تقديم عرض سعر</h2>
        <p className="mb-4 text-gray-600">
          العقار: {property.title}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">المبلغ (ريال سعودي)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="أدخل المبلغ"
              min="1"
              step="0.01"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">تفاصيل العرض</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="أدخل تفاصيل العرض والخدمات المقدمة"
              rows="4"
            />
          </div>
          
          {(error || backendError) && (
            <p className="text-red-500 mb-4">{error || backendError}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              تقديم العرض
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PriceOfferModal; 