import React from 'react';
import { X } from 'lucide-react';

const AddTaskAttachmentModal = ({ setShowAddTaskAttachmentModal, handleAddTaskAttachment }) => {
    const handleSubmit = (e) => {
        e.preventDefault();

        handleAddTaskAttachment(e.target.attachments.files);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">إضافة مرفقات للمهمة</h3>
                    <button onClick={() => setShowAddTaskAttachmentModal(false)} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اختر ملفات</label>
                            <input type="file" name="attachments" multiple required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => setShowAddTaskAttachmentModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">إضافة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskAttachmentModal;