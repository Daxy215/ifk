import React from 'react';
import { Plus, Search, Edit } from 'lucide-react';

const EmployeesView = ({
                           employees,
                           employeeSearch,
                           setEmployeeSearch,
                           filteredEmployees,
                           handleEditEmployee,
                           viewEmployeeDetails,
                           setShowNewEmployeeModal
                       }) => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h2>
                <button onClick={() => setShowNewEmployeeModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus size={20} /><span>موظف جديد</span>
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text"
                       placeholder="ابحث عن موظف..."
                       value={employeeSearch}
                       onChange={(e) => setEmployeeSearch(e.target.value)}
                       className="w-full pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <table className="w-full text-sm text-right text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">الاسم</th>
                            <th className="px-4 py-3">الوظيفة</th>
                            <th className="px-4 py-3">الإيميل</th>
                            <th className="px-4 py-3">رقم الهاتف</th>
                            <th className="px-4 py-3">مسؤول الاتصال</th>
                            <th className="px-4 py-3">الإجراءات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredEmployees.map(emp => (
                            <tr key={emp.employee_id} className="border-b hover:bg-gray-50">
                                <td
                                    className="px-4 py-3 font-semibold cursor-pointer hover:text-blue-600"
                                    onClick={() => viewEmployeeDetails(emp.employee_id)}
                                >
                                    {emp.name}
                                </td>
                                <td className="px-4 py-3">{emp.job_title}</td>
                                <td className="px-4 py-3">{emp.email}</td>
                                <td className="px-4 py-3">{emp.phone}</td>
                                <td className="px-4 py-3">{emp.contact_officer}</td>
                                <td className="px-4 py-3 flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditEmployee(emp.employee_id)}
                                        className="p-2 text-gray-500 hover:text-blue-600"
                                        title="تعديل"
                                    >
                                        <Edit size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default EmployeesView;