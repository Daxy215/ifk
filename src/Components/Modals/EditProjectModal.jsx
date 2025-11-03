import React from 'react';
import { X } from 'lucide-react';

import { useAuth } from "@/Context/AuthContext";

import EmployeeSelect from '../Common/EmployeeSelect';
import ClientSelect from "@/Components/Common/ClientSelect";

const EditProjectModal = ({ setShowEditProjectModal, handleUpdateProject, projectToEdit, handleAddNewClient }) => {
    const {apiFetch} = useAuth();
    
    const clientInputRef = React.useRef(null);
    const [clientId, setClientId] = React.useState("");
    
    const employeeInputRef = React.useRef(null);
    const [assigneeId, setAssigneeId] = React.useState("");
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const resC = await apiFetch(`/api/clients/${encodeURIComponent(clientId)}`);
        const client = await resC.data;
        
        if (!client || client.client_id !== clientId) {
            clientInputRef.current.setCustomValidity("الرجاء اختيار عميل صحيح");
            clientInputRef.current.reportValidity();
            
            return;
        }
        
        const resE = await apiFetch(`/api/employees/${encodeURIComponent(assigneeId)}`, {method: "GET"});
        const employee = resE.data;
        
        const employeeExists = employee && employee.employee_id === assigneeId;
        
        if (!employeeExists) {
            employeeInputRef.current.setCustomValidity("الرجاء اختيار موظف صحيح");
            employeeInputRef.current.reportValidity();
            
            return;
        }
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        data.client_id = parseInt(clientId);
        data.assignee_id = parseInt(assigneeId);
        
        handleUpdateProject(data, client.name, employee.name);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">تعديل المشروع</h3>
                    <button onClick={() => setShowEditProjectModal(false)} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm">وصف المشروع</label>
                            <textarea
                                name="name"
                                required
                                defaultValue={projectToEdit.name}
                                className="w-full p-2 border rounded-lg"
                                onInvalid={(e) => e.target.setCustomValidity("الرجاء إدخال وصف المشروع")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm">نوع المشروع</label>
                            <select
                                name="type"
                                required
                                defaultValue={projectToEdit.type}
                                className="w-full p-2 border rounded-lg"
                                onInvalid={(e) => e.target.setCustomValidity("الرجاء اختيار نوع المشروع")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            >
                                <option value="قضية">قضية</option>
                                <option value="استشارة">استشارة</option>
                                <option value="مطالبة">مطالبة</option>
                                <option value="وكالة">وكالة</option>
                                <option value="احتياجات مكتب">احتياجات مكتب</option>
                                <option value="مسودة قضية">مسودة قضية</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm">رقم المشروع (إن وجد)</label>
                            <input
                                type="text"
                                name="number"
                                defaultValue={projectToEdit.number}
                                className="w-full p-2 border rounded-lg"
                                pattern="^[0-9]{7}$"
                                onInvalid={(e) => e.target.setCustomValidity("الرجاء إدخال رقم المشروع إن وجد")}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm">العميل</label>
                            <ClientSelect
                                ref={clientInputRef}
                                value={projectToEdit.client_id}
                                onChange={(id) => setClientId(id)}
                                onAddNewClient={handleAddNewClient}
                            />
                        </div>

                        <div>
                            <label className="block text-sm">المكلف بالمشروع</label>
                            <EmployeeSelect
                                ref={employeeInputRef}
                                defaultVal={projectToEdit.assignee_id}
                                value={assigneeId}
                                onChange={(id) => setAssigneeId(id)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setShowEditProjectModal(false)}
                            className="px-4 py-2 bg-gray-200 rounded-lg"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            حفظ التعديلات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProjectModal;