import React from 'react';
import { ArrowRight, CheckCircle, Plus, FileText, Info, Paperclip } from 'lucide-react';
import CountdownTimer from '../Modals/CountdownTimer';
import StatusBadge from '../Common/StatusBadge';
import TaskStatus from '@/Components/Common/TaskStatus';

const ProjectDetailsView = ({
                                selectedProject,
                                selectedProjectTasks,
                                setActiveView,
                                setSelectedProjectId,
                                handleCloseProject,
                                setShowNewTaskModal,
                                viewAttachments,
                                handleTaskStatusChange,
                                handleOpenAddTaskAttachmentModal
                            }) => {
    const isProjectClosable = selectedProject && selectedProjectTasks.length > 0 && selectedProjectTasks.every(t => t.status === TaskStatus.COMPLETED);
    
    return (
        <div className="p-6">
            {selectedProject ? (
                <>
                    <button onClick={() => { setActiveView('dashboard'); setSelectedProjectId(null); }} className="flex items-center gap-2 mb-6 text-sm text-blue-600 hover:underline">
                        <ArrowRight size={16} /><span>العودة إلى المشاريع</span>
                    </button>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedProject.name}</h2>
                                <p className="text-gray-500">{selectedProject.type} {selectedProject.number && `- ${selectedProject.number}`}</p>
                            </div>
                            
                            <div className="flex gap-2">
                                {isProjectClosable && (
                                    <button onClick={() => handleCloseProject(selectedProject.project_id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        <CheckCircle size={20} /><span>إغلاق المشروع</span>
                                    </button>
                                )}
                                
                                {selectedProject.status !== 'مغلقة' && (
                                    <button onClick={() => setShowNewTaskModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        <Plus size={20} /><span>مهمة جديدة</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/*<div className="border-t my-4"></div>*/}
                        <div>
                            <h4 className="font-semibold mb-2">مرفقات المشروع</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedProject.attachments && selectedProject.attachments.length > 0 ? (
                                    selectedProject.attachments.map((att, i) => (
                                        <button
                                            key={i}
                                            onClick={() => viewAttachments(selectedProject.attachments, `مرفقات: ${selectedProject.name}`)}
                                            className="flex items-center gap-2 text-xs bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
                                        >
                                            {att.type === 'document' ? <FileText size={14} /> : <Info size={14} />}
                                            {att.name}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500">لا توجد مرفقات.</p>
                                )}
                                
                                {/* Task attachments */}
                                {selectedProjectTasks.map(task =>
                                    task.attachments && task.attachments.length > 0
                                        ? task.attachments.map((att, i) => (
                                            <button
                                                key={`task-${task.task_id}-${i}`}
                                                onClick={() => viewAttachments(task.attachments, `مرفقات المهمة: ${task.description}`)}
                                                className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
                                            >
                                                {att.type === 'document' ? <FileText size={14} /> : <Info size={14} />}
                                                {att.name}
                                            </button>
                                        ))
                                        : null
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-right text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">وصف المهمة</th>
                                    <th className="px-4 py-3">المكلف</th>
                                    <th className="px-4 py-3">الحالة</th>
                                    <th className="px-4 py-3">الوقت المتبقي</th>
                                    <th className="px-4 py-3">الإجراءات</th>
                                </tr>
                            </thead>
                            
                            <tbody>
                                {selectedProjectTasks.map(task => (
                                    <tr key={task.task_id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{task.description}</td>
                                        <td className="px-4 py-3">{task.assignee_name}</td>
                                        <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                                        <td className="px-4 py-3">
                                            <CountdownTimer
                                                startDate={task.created_at}
                                                durationDays={task.duration}
                                                onTaskLate={() => handleTaskStatusChange(task.task_id, TaskStatus.DELAYED)}
                                            />
                                        </td>
                                        
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            {task.status === TaskStatus.ACTIVE || task.status === TaskStatus.DELAYED ? (
                                                <button onClick={() => handleTaskStatusChange(task.task_id, TaskStatus.REVIEW)} className="text-xs bg-green-500 text-white px-3 py-1 rounded-md">إنهاء المهمة</button>
                                            ) : task.status === TaskStatus.REVIEW ? (
                                                <button onClick={() => handleTaskStatusChange(task.task_id, TaskStatus.COMPLETED)} className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-md">تأكيد الإنهاء</button>
                                            ) : null}
                                            <button onClick={() => handleOpenAddTaskAttachmentModal(task.task_id)} className="p-2 text-gray-500 hover:text-blue-600" title="إضافة مرفق">
                                                <Paperclip size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                
                                {selectedProjectTasks.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">لا توجد مهام لهذا المشروع.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default ProjectDetailsView;