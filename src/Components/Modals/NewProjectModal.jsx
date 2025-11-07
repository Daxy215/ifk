import React from 'react';
import { X } from 'lucide-react';

import { useAuth } from "@/Context/AuthContext";
import EmployeeSelect from "@/Components/Common/EmployeeSelect";
import ClientSelect from "@/Components/Common/ClientSelect";

import { ProjectTypes } from '@/Components/Common/Enums/ProjectTypes';
import {t} from "i18next";

const NewProjectModal = ({ setShowNewProjectModal, handleAddNewProject }) => {
    const { apiFetch } = useAuth();
    
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
        const employee = await resE.data;
        
        const employeeExists = employee && employee.employee_id === assigneeId;
        
        if (!employeeExists) {
            employeeInputRef.current.setCustomValidity("الرجاء اختيار موظف صحيح");
            employeeInputRef.current.reportValidity();
            
            return;
        }
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        data.client_id = parseInt(clientId);
        data.client_name = client.name;
        data.assignee_id = parseInt(assigneeId);
        data.assignee_name = employee.name;
        
        console.log("project Data;", data);
        
        handleAddNewProject(data, e.target.attachments.files);
    };
    
    const handleAddNewClient = async (name) => {
        try {
            const res = await apiFetch(`/api/clients`, {
                method: "POST",
                body: JSON.stringify({ name }),
            });
            
            const newClient = await res.data;
            
            setClientId(newClient.client_id);
        } catch (err) {
            console.error("Failed to add client:", err);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">إضافة مشروع جديد</h3>
                    <button onClick={() => setShowNewProjectModal(false)} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm">وصف المشروع</label>
                            <textarea name="name" required className="w-full p-2 border rounded-lg"></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm">{t("projectType")}</label>
                            <select name="type" required className="w-full p-2 border rounded-lg">
                                <option value={ProjectTypes.CASE}>{ProjectTypes.CASE}</option>
                                <option value={ProjectTypes.CONSULTATION}>{ProjectTypes.CONSULTATION}</option>
                                <option value={ProjectTypes.CLAIM}>{ProjectTypes.CLAIM}</option>
                                <option value={ProjectTypes.AGENCY}>{ProjectTypes.AGENCY}</option>
                                <option value={ProjectTypes.OFFICE_NEEDS}>{ProjectTypes.OFFICE_NEEDS}</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm">رقم المشروع (إن وجد)</label>
                            <input type="text" name="number" className="w-full p-2 border rounded-lg"/>
                        </div>
                        
                        <div>
                            <label className="block text-sm">العميل</label>
                            <ClientSelect
                                ref={clientInputRef}
                                value={clientId}
                                onChange={(id) => setClientId(id)}
                                onAddNewClient={handleAddNewClient}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm">المكلف بالمشروع</label>
                            <EmployeeSelect
                                ref={employeeInputRef}
                                value={assigneeId}
                                onChange={(id) => setAssigneeId(id)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm">مستندات مرفقة</label>
                            <input type="file" name="attachments" multiple
                                   className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => setShowNewProjectModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                            إلغاء
                        </button>
                        
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                            حفظ المشروع
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProjectModal;