import React from 'react';
import { X } from 'lucide-react';

import { useAuth } from '../../Context/AuthContext';

import EmployeeSelect from '../Common/EmployeeSelect'
import ProjectSelect from '../Common/ProjectSelect'

const NewTaskModal = ({setShowNewTaskModal, handleAddNewTask}) => {
    const { apiFetch } = useAuth();
    
    const projectInputRef  = React.useRef(null);
    const [projectNumber, setProjectNumber] = React.useState("");
    const [selectedProjectId, setSelectedProjectId] = React.useState(0);
    
    const employeeInputRef = React.useRef(null);
    const [assigneeId, setAssigneeId] = React.useState("");
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const resP = await apiFetch(`/api/projects/${encodeURIComponent(selectedProjectId)}`, {method: "GET"});
        const project = await resP.data;
        
        const projectExists = project && project.project_id === selectedProjectId;
        
        if (!projectExists) {
            projectInputRef.current.setCustomValidity("الرجاء اختيار مشروع صحيح");
            projectInputRef.current.reportValidity();
            
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
        
        data.duration = parseInt(data.duration);
        data.assignee_id = parseInt(assigneeId);
        data.assignee_name = employee.name;
        data.project_id = parseInt(selectedProjectId);
        
        const attachments = formData.getAll("attachments");
        
        console.log("Adding new task; ", data);
        
        handleAddNewTask(data, attachments);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">إضافة مهمة جديدة</h3>
                    <button onClick={() => setShowNewTaskModal(false)} className="text-gray-500 hover:text-gray-800">
                        <X size={24}/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <ProjectSelect
                                projectRef={projectInputRef}
                                employeeRef={employeeInputRef}
                                value={projectNumber}
                                onChange={(id) => setSelectedProjectId(id)}
                                />
                        </div>
                        <div>
                            <label className="block text-sm">وصف المهمة</label>
                            <textarea
                                name="description"
                                required
                                className="w-full p-2 border rounded-lg resize-none"
                                onInvalid={(e) => {
                                    if (e.target.validity.valueMissing) {
                                        e.target.setCustomValidity("الرجاء إدخال وصف المهمة");
                                    }
                                }}
                                onInput={(e) => e.target.setCustomValidity("")}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm">المكلف بالمهمة</label>
                            <EmployeeSelect
                                ref={employeeInputRef}
                                value={assigneeId}
                                onChange={(id) => setAssigneeId(id)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm">مدة المهمة (بالأيام)</label>
                            <input
                                type="number"
                                name="duration"
                                required
                                min="1"
                                className="w-full p-2 border rounded-lg"
                                onInvalid={(e) => {
                                    if (e.target.validity.valueMissing) {
                                        e.target.setCustomValidity("الرجاء إدخال رقم المشروع");
                                    } else if (e.target.validity.patternMismatch) {
                                        e.target.setCustomValidity("الرجاء إدخال رقم مشروع صالح");
                                    } else {
                                        e.target.setCustomValidity("الرجاء إدخال قيمة صحيحة");
                                    }
                                }}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm">مستندات مرفقة</label>
                            <input
                                type="file"
                                name="attachments"
                                multiple
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onInvalid={(e) => {
                                    if (e.target.validity.valueMissing) {
                                        e.target.setCustomValidity("الرجاء إرفاق مستند واحد على الأقل");
                                    } else {
                                        e.target.setCustomValidity("صيغة الملف غير مدعومة");
                                    }
                                }}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => setShowNewTaskModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg">
                            إلغاء
                        </button>

                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                            حفظ المهمة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTaskModal;