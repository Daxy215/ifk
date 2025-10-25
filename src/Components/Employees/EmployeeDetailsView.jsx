import React from 'react';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';

const EmployeeDetailsView = ({
                                 selectedEmployee,
                                 setActiveView,
                                 setSelectedEmployeeId,
                                 allTasksWithProjectInfo
                             }) => {

    const employeeTasks = allTasksWithProjectInfo.filter(task => task.assignee_id === selectedEmployee?.employee_id);

    const getTaskEndDate = (task) => new Date(new Date(task.created_at).getTime() + task.duration * 24 * 60 * 60 * 1000).toLocaleDateString('ar-EG');

    return (
        <div className="p-6">
            {selectedEmployee ? (
                <>
                    <button onClick={() => { setActiveView('employees'); setSelectedEmployeeId(null); }} className="flex items-center gap-2 mb-6 text-sm text-blue-600 hover:underline">
                        <ArrowRight size={16} /><span>العودة إلى الموظفين</span>
                    </button>
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedEmployee.name}</h2>
                            <p className="text-gray-500">{selectedEmployee.job_title}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold mb-4">المهام المعينة</h3>
                        <table className="w-full text-sm text-right text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">المشروع</th>
                                <th className="px-4 py-3">وصف المهمة</th>
                                <th className="px-4 py-3">تاريخ البدء</th>
                                <th className="px-4 py-3">تاريخ الانتهاء</th>
                                <th className="px-4 py-3">الحالة</th>
                            </tr>
                            </thead>

                            <tbody>
                                {employeeTasks.map(task => (
                                    <tr key={task.task_id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold">{task.project_name}</td>
                                        <td className="px-4 py-3">{task.description}</td>
                                        <td className="px-4 py-3">{new Date(task.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-4 py-3">{getTaskEndDate(task)}</td>
                                        <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                                    </tr>
                                ))}

                                {employeeTasks.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">لا توجد مهام معينة لهذا الموظف.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default EmployeeDetailsView;