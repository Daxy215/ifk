import React from 'react';
import { X } from 'lucide-react';

const ActivateCaseModal = ({ setShowActivateCaseModal, handleActivateCase, activatingProjectId }) => {
    const handleSubmit = (e) => {
        e.preventDefault();

        const caseNumber = e.target.caseNumber.value;

        handleActivateCase(activatingProjectId, caseNumber);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">تفعيل القضية</h3>
                    <button onClick={() => setShowActivateCaseModal(false)} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm">رقم القضية (7 أرقام)</label>
                            <input name="caseNumber" required pattern="\d{7}" title="الرجاء إدخال 7 أرقام بالضبط" className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => setShowActivateCaseModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">تفعيل</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivateCaseModal;