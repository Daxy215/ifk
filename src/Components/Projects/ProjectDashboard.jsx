import React from 'react';
import { Plus, Search, Info, Star, Eye, Edit } from 'lucide-react';

import CountdownTimer from '../Modals/CountdownTimer';
import StatusBadge from '../Common/StatusBadge';
import TaskStatus from '@/Components/Common/TaskStatus';

const ProjectDashboard = ({
                              tasks,
                              employees,
                              projectSearch,
                              setProjectSearch,
                              projectFilter,
                              setProjectFilter,
                              filteredProjects,
                              openActivateModal,
                              viewProjectTasks,
                              handleEditProject,
                              setShowNewProjectModal,
                              setShowNewTaskModal,
                              taskSearch,
                              setTaskSearch,
                              taskFilter,
                              setTaskFilter,
                              filteredTasks,
                              handleTaskStatusChange
                          }) => {
    
    const getProjectStatus = (project) => {
        if (project.status === 'مسودة') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-400 text-gray-800">مسودة 📝</span>;
        if (project.status === 'مغلقة') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">مغلقة ✅</span>;
        const hasActiveTask = tasks.some(t => t.project_id === project.project_id && (t.status === TaskStatus.ACTIVE || t.status === TaskStatus.DELAYED));
        if (hasActiveTask) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-yellow-800">نشط 🟡</span>;
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-800 text-white">خامل ⚫</span>;
    };
    
    const getProjectProgress = (project) => {
        const projectTasks = tasks.filter(t => t.project_id === project.project_id);
        if (projectTasks.length === 0) return 0;
        const completedTasks = projectTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
        return (completedTasks / projectTasks.length) * 100;
    };
    
    return (
        <div className="p-6 space-y-8">
            { /* Projects */ }
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">قائمة المشاريع</h2>
                    <button onClick={() => setShowNewProjectModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus size={20} /><span>مشروع جديد</span>
                    </button>
                </div>
                
                { /* Filtering */ }
                <div className="flex gap-4 mb-4">
                    { /* Search bar */ }
                    <div className="relative flex-grow">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text"
                               placeholder="ابحث عن مشروع..."
                               value={projectSearch}
                               onChange={(e) => setProjectSearch(e.target.value)}
                               className="w-full pr-10 border rounded-lg" />
                    </div>
                    
                    { /* Sort by */ }
                    <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="p-2 border rounded-lg">
                        <option value="active">كل المشاريع النشطة</option>
                        <option value="active_yellow">نشط 🟡</option>
                        <option value="inactive_black">خامل ⚫</option>
                        <option value="draft">مسودة 📝</option>
                        <option value="archived">المؤرشفة</option>
                    </select>
                </div>
                
                { /* Projects rendering */ }
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-right text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">نوع المشروع</th>
                                <th className="px-4 py-3">رقم المشروع</th>
                                <th className="px-4 py-3">العميل</th>
                                <th className="px-4 py-3">وصف المشروع</th>
                                <th className="px-4 py-3">المكلف</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3">التقدم</th>
                                <th className="px-4 py-3">وقت البدء</th>
                                <th className="px-4 py-3">وقت الانتهاء</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                        {filteredProjects.map(project => {
                            const progress = getProjectProgress(project);
                            
                            return (
                                <tr key={project.project_id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{project.type}</td>
                                    <td className="px-4 py-3">{project.number || 'N/A'}</td>
                                    <td className="px-4 py-3">{project.client_name || 'N/A'}</td>
                                    <td className="px-2.5 py-3 flex items-center gap-2">
                                        <div className="tooltip-container">
                                            <Info size={18} className="cursor-pointer text-gray-500"/>
                                            <div className="tooltip">
                                                {project.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{project.assignee_name || 'غير محدد'}</td>
                                    <td className="px-4 py-3">{getProjectStatus(project)}</td>
                                    <td className="px-4 py-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full"
                                                 style={{width: `${progress}%`}}></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <CountdownTimer
                                            startDate={project.start_at}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        {project.closed_at ? <CountdownTimer
                                            startDate={project.closed_at}
                                        /> : 'غير متاح'}
                                    </td>
                                    
                                    { /* Buttons */ }
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        {!project.number && (
                                            <button onClick={() => openActivateModal(project.project_id)}
                                                    className="p-2 text-gray-500 hover:text-yellow-500"
                                                    title="تفعيل القضية">
                                                <Star size={18}/>
                                            </button>
                                        ) && (
                                            <button onClick={() => viewProjectTasks(project.project_id)}
                                                    className="p-2 text-gray-500 hover:text-green-600" title="عرض المهام">
                                                <Eye size={18}/>
                                            </button>
                                        )}
                                        
                                        <button onClick={() => handleEditProject(project.project_id)}
                                                className="p-2 text-gray-500 hover:text-blue-600" title="تعديل المشروع">
                                            <Edit size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            { /* Tasks */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">جميع المهام</h2>
                    <button onClick={() => setShowNewTaskModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus size={20} /><span>مهمة جديدة</span>
                    </button>
                </div>
                
                { /* Filtering */ }
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text"
                               placeholder="ابحث عن مهمة..."
                               value={taskSearch}
                               onChange={(e) => setTaskSearch(e.target.value)}
                               className="w-full pr-10 border rounded-lg" />
                    </div>
                    
                    <select value={taskFilter.assignee} onChange={e => setTaskFilter({...taskFilter, assignee: e.target.value})} className="p-2 border rounded-lg">
                        <option value="all">كل المكلفين</option> { /* TODO; EVERYTHING? */ }
                        {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
                    </select>
                    
                    <select value={taskFilter.status} onChange={e => setTaskFilter({...taskFilter, status: e.target.value})} className="p-2 border rounded-lg">
                        <option value={TaskStatus.ALL}>{TaskStatus.ALL}</option>
                        <option value={TaskStatus.ACTIVE}>{TaskStatus.ACTIVE}</option>
                        <option value={TaskStatus.DELAYED}>{TaskStatus.DELAYED}</option>
                        <option value={TaskStatus.REVIEW}>{TaskStatus.REVIEW}</option>
                        <option value={TaskStatus.COMPLETED}>{TaskStatus.COMPLETED}</option>
                    </select>
                </div>
                
                { /* Tasks rendering */ }
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-right text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">نوع المشروع</th>
                                <th className="px-4 py-3">رقم المشروع</th>
                                <th className="px-4 py-3">العميل</th>
                                <th className="px-4 py-3">وصف المهمة</th>
                                <th className="px-4 py-3">المكلف</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3">الوقت المتبقي</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {filteredTasks.map(task => (
                                <tr key={task.task_id} className="border-b hover:bg-gray-50 cursor-pointer"
                                    onClick={() => viewProjectTasks(task.project_id)}>
                                    {/*{ (() => { console.log(task); return null; })() }*/}
                                    <td className="px-4 py-3 font-semibold">{task.projectType}</td>
                                    <td className="px-4 py-3">{task.projectNumber || 'N/A'}</td>
                                    <td className="px-4 py-3">{task.clientName}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="tooltip-container">
                                            <Info size={18} className="cursor-pointer text-gray-500"/>
                                            <div className="tooltip">{task.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{task.assignee_name}</td>
                                    <td className="px-4 py-3"><StatusBadge status={task.status}/></td>
                                    <td className="px-4 py-3">
                                    <CountdownTimer
                                            startDate={task.created_at}
                                            durationDays={task.duration}
                                            currentStatus={task.status}
                                            onTaskLate={() => handleTaskStatusChange(task.task_id, TaskStatus.DELAYED)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;