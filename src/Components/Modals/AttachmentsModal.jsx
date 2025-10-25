import React from 'react';
import { X, FileText, Info } from 'lucide-react';

const AttachmentsModal = ({ attachments, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{title}</h3>

                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {attachments.length > 0 ? attachments.map((att, index) => (
                    <a  key={index}
                        href={`/api/attachments/${att.attachment_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                            {att.type === 'document' ? <FileText className="text-blue-500" /> : <Info className="text-yellow-500" />}
                        <span className="text-sm text-gray-800">{att.name}</span>
                    </a>

                )) : <p className="text-sm text-gray-500">لا توجد مرفقات.</p>}
            </div>
        </div>
    </div>
);

export default AttachmentsModal;