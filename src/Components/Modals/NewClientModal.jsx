import React from 'react';
import { X } from 'lucide-react';

const NewClientModal = ({ setShowNewClientModal, handleAddNewClient }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        handleAddNewClient(Object.fromEntries(new FormData(e.target)));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">إضافة عميل جديد</h3>
                    <button onClick={() => setShowNewClientModal(false)} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm">اسم العميل/الشركة</label>
                            <input name="name" required className="w-full p-2 border rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-sm">الإيميل</label>
                            <input type="email" name="email" required className="w-full p-2 border rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-sm">رقم الهاتف</label>
                            <input type="tel" name="phone" required className="w-full p-2 border rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-sm">ضابط الاتصال</label>
                            <input name="contactOfficer" required className="w-full p-2 border rounded-lg"/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => setShowNewClientModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewClientModal;