import React from 'react';
import { X } from 'lucide-react';

const EditClientModal = ({ setShowEditClientModal, handleUpdateClient, clientToEdit }) => {
    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("CLEINT TO EDIT", clientToEdit);

        handleUpdateClient(Object.fromEntries(new FormData(e.target)));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">تعديل معلومات العميل</h3>
                    <button
                        onClick={() => setShowEditClientModal(false)}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        <X size={24}/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm">اسم العميل أو الشركة</label>
                            <input
                                name="name"
                                required
                                defaultValue={clientToEdit.name}
                                className="w-full p-2 border rounded-lg"
                                onInvalid={(e) => e.target.setCustomValidity("الرجاء إدخال اسم العميل أو الشركة")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm">البريد الإلكتروني</label>
                            <input
                                type="email"
                                name="email"
                                required
                                defaultValue={clientToEdit.email}
                                className="w-full p-2 border rounded-lg"
                                onInvalid={(e) => e.target.setCustomValidity("الرجاء إدخال البريد الإلكتروني بشكل صحيح")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm">رقم الهاتف</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                defaultValue={clientToEdit.phone}
                                className="w-full p-2 border rounded-lg"
                                onInvalid={(e) => e.target.setCustomValidity("الرجاء إدخال رقم الهاتف")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm">مسؤول الاتصال</label>
                            <input
                                name="contact_officer"
                                required
                                defaultValue={clientToEdit.contact_officer}
                                className="w-full p-2 border rounded-lg"
                                onInvalid={(e) => e.target.setCustomValidity("الرجاء إدخال اسم مسؤول الاتصال")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setShowEditClientModal(false)}
                            className="px-4 py-2 bg-gray-200 rounded-lg"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            حفظ التغييرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;
