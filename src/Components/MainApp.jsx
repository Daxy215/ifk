import React, {useEffect, useMemo, useState} from 'react';
import {Briefcase, Building, Users} from 'lucide-react';

import {useTranslation} from "react-i18next";

// rename to Dashboard!
import ProjectDashboard from './Projects/ProjectDashboard';
import ProjectDetailsView from './Projects/ProjectDetailsView';
import EmployeesView from './Employees/EmployeesView';
import EmployeeDetailsView from './Employees/EmployeeDetailsView';
import ClientsView from './Clients/ClientsView';
import ClientDetailsView from './Clients/ClientDetailsView';

// modals
import AttachmentsModal from './Modals/AttachmentsModal';
import NewTaskModal from './Modals/NewTaskModal.jsx';
import NewProjectModal from './Modals/NewProjectModal';
import EditProjectModal from './Modals/EditProjectModal';
import NewEmployeeModal from './Modals/NewEmployeeModal';
import EditEmployeeModal from './Modals/EditEmployeeModal';
import NewClientModal from './Modals/NewClientModal';
import EditClientModal from './Modals/EditClientModal';
import ActivateCaseModal from './Modals/ActivateCaseModal';
import AddTaskAttachmentModal from './Modals/AddTaskAttachmentModal';

import {useAuth} from '../Context/AuthContext';

/*const initialProjects = [
    { id: 1, clientId: 1, type: 'قضية', number: '1234567', name: 'قضية تجارية هامة تتعلق بنزاع على علامة تجارية دولية.', assigneeId: 1, status: 'قيد النظر', tasks: [1, 2], closedAt: null, attachments: [{name: 'عقد التأسيس.pdf', type: 'document'}, {name: 'ملاحظات الاجتماع الأول', type: 'note'}] },
    { id: 2, clientId: 2, type: 'استشارة', number: '8765432', name: 'استشارة قانونية عاجلة حول قوانين العمل الجديدة.', assigneeId: 3, status: 'قيد النظر', tasks: [3], closedAt: null, attachments: [] },
    { id: 3, clientId: 1, type: 'مسودة قضية', number: '', name: 'مسودة قضية عقارية بخصوص نزاع على ملكية أرض.', assigneeId: 2, status: 'مسودة', tasks: [], closedAt: null, attachments: [] },
    { id: 4, type: 'احتياجات مكتب', number: '', name: 'تجهيز قاعة الاجتماعات الكبرى لاستقبال الوفود.', assigneeId: 4, status: 'مغلقة', tasks: [4], closedAt: new Date(), attachments: [{name: 'فاتورة الشراء', type: 'document'}] },
    { id: 5, clientId: 2, type: 'قضية', number: '1122334', name: 'قضية عمالية للموظف السابق.', assigneeId: 1, status: 'قيد النظر', tasks: [], closedAt: null, attachments: [] },
];

const initialTasks = [
    { id: 1, projectId: 1, description: 'تحضير مذكرة الدفاع الأولى وجمع كافة المستندات اللازمة من العميل.', assigneeId: 1, duration: 5, createdAt: new Date('2025-08-25T10:00:00'), attachments: [{name: 'مسودة المذكرة.docx', type: 'document'}], status: 'نشطة' },
    { id: 2, projectId: 1, description: 'مراجعة مستندات الخصم وتقديم تقرير بالنتائج.',                   assigneeId: 2, duration: 1, createdAt: new Date('2025-08-23T14:00:00'), attachments: [], status: 'نشطة' },
    { id: 3, projectId: 2, description: 'صياغة الرأي القانوني المبدئي بناءً على المعلومات المقدمة.',       assigneeId: 3, duration: 2, createdAt: new Date('2025-08-26T09:00:00'), attachments: [{name: 'ملخص الاستشارة.txt', type: 'note'}], status: 'مكتملة - للمراجعة' },
    { id: 4, projectId: 4, description: 'شراء شاشة عرض جديدة وتركيبها في القاعة.',                       assigneeId: 4, duration: 3, createdAt: new Date('2025-08-01T11:00:00'), attachments: [], status: 'منتهية' },
];

const initialEmployees = [
    { id: 1, name: 'أحمد محمود', jobTitle: 'محامي أول', email: 'ahmed.m@lawfirm.com', phone: '0501234567', contactOfficer: 'سكرتارية' },
    { id: 2, name: 'فاطمة علي', jobTitle: 'محامية متدربة', email: 'fatima.a@lawfirm.com', phone: '0502345678', contactOfficer: 'سكرتارية' },
    { id: 3, name: 'خالد سعيد', jobTitle: 'مستشار قانوني', email: 'khalid.s@lawfirm.com', phone: '0503456789', contactOfficer: 'سكرتارية' },
    { id: 4, name: 'قسم الدعم', jobTitle: 'دعم فني', email: 'support@lawfirm.com', phone: '0123456789', contactOfficer: 'سكرتارية' },
];

const initialClients = [
    { id: 1, name: 'شركة المقاولات الحديثة', email: 'info@mcc.com', phone: '0112345678', contactOfficer: 'مدير المشاريع' },
    { id: 2, name: 'مؤسسة التجارة الدولية', email: 'contact@iit.com', phone: '0113456789', contactOfficer: 'المدير التنفيذي' },
];*/

const MainApp = () => {
    const { t, i18n } = useTranslation();
    
    const { isAuthenticated, apiFetch, uploadAttachments } = useAuth();
    
    const [activeView, setActiveView] = useState('dashboard');
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    
    // Modals and UI states
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
    const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [showEditClientModal, setShowEditClientModal] = useState(false);
    const [showActivateCaseModal, setShowActivateCaseModal] = useState(false);
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
    const [showAddTaskAttachmentModal, setShowAddTaskAttachmentModal] = useState(false);
    
    // Data for editing
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [activatingProjectId, setActivatingProjectId] = useState(null);
    const [taskToAttachToId, setTaskToAttachToId] = useState(null);
    const [attachmentsToShow, setAttachmentsToShow] = useState({ title: '', items: [] });
    
    // Search and filter states
    const [projectSearch, setProjectSearch] = useState('');
    const [taskSearch, setTaskSearch] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [projectFilter, setProjectFilter] = useState('active');
    const [taskFilter, setTaskFilter] = useState({ assignee: 'all', status: 'all' });
    
    // TODO; Make this request from server (Maybe?)
    const selectedProject = useMemo(() => projects.find(p => p.project_id === selectedProjectId), [projects, selectedProjectId]);
    
    const selectedProjectTasks = useMemo(() => {
        return tasks.filter(t => t.project_id === selectedProjectId);
    }, [tasks, selectedProjectId]);
    
    const selectedEmployee = useMemo(() => employees.find(e => e.employee_id === selectedEmployeeId), [employees, selectedEmployeeId]);
    const selectedClient = useMemo(() => clients.find(c => c.client_id === selectedClientId), [clients, selectedClientId]);
    
    // TODO; Copy this for Tasks
    // TODO; Rename to 'projectsPage' or smth?
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState(null);
    
    // Sidebar
    const [isOpen, setIsOpen] = useState(false);
    
    // Handlers
    const handleTaskStatusChange = async (taskId, newStatus) => {
        console.log("Udpating task;", taskId, newStatus);
        
        const updated = await apiFetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify({
                status: newStatus
            }),
        });
        
        setTasks(prev =>
            prev.map(t => {
                if (t.task_id === taskId) {
                    //console.log("Found task before update:", t);
                    
                    return updated;
                }
                
                return t;
            })
        );
    };
    
    const handleAddNewTask = async (taskData, files) => {
        const created = await apiFetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify({ ...taskData }),
        });
        
        let attachments = [];
        if (files && files.length > 0) {
            attachments = await uploadAttachments(files, { taskId: created.task_id });
        }
        
        setTasks(prev => [{ ...created, attachments }, ...prev]);
        setShowNewTaskModal(false);
    };
    
    /*const handleAddNewTask = (taskData, files) => {
        const newAttachments = Array.from(files).map(file => ({ name: file.name, type: 'document' }));
        const projectNumber = parseInt(taskData.projectNumber, 10);
        delete taskData.projectNumber;

        const project = projects.find(p => p.number == projectNumber);
        const projectId = project ? project.id : null;

        setTasks([
            ...tasks,
            {
                id: Date.now(),
                projectId: projectId,
                ...taskData,
                createdAt: new Date(),
                attachments: newAttachments,
                status: 'نشطة'
            }
        ]);

        setShowNewTaskModal(false);
    };*/
    
    const handleAddNewProject = async (projectData, files) => {
        const created = await apiFetch("/api/projects", {
            method: "POST",
            body: JSON.stringify({
                clientId: projectData.clientId,
                type: projectData.type,
                number: projectData.number,
                name: projectData.name,
                assigneeId: projectData.assigneeId,
                status: projectData.status,
                closedAt: projectData.closedAt
            }),
        });
        
        let attachments = [];
        if (files && files.length > 0) {
            attachments = await uploadAttachments(files, { projectId: created.project_id });
        }
        
        setProjects(prev => [{ ...created, attachments }, ...prev]);
        setShowNewProjectModal(false);
    };
    
    const handleEditProject = (projectId) => {
        let project = projects.find(p => p.project_id === projectId);
        
        setProjectToEdit(project);
        setShowEditProjectModal(true);
    };
    
    const handleUpdateProject = async (updatedProjectData) => {
        const updated = await apiFetch(`/api/projects/${projectToEdit.project_id}`, {
            method: "PUT",
            body: JSON.stringify(updatedProjectData),
        });
        
        setProjects(prev => prev.map(p => p.project_id === updated.project_id ? updated : p));
        setShowEditProjectModal(false);
        setProjectToEdit(null);
    };
    
    const handleActivateCase = async (projectId, caseNumber) => {
        console.log("tranna update;", projectId);
        
        const updated = await apiFetch(`/api/projects/${projectId}`, {
            method: "PUT",
            body: JSON.stringify({ type: "قضية", number: caseNumber, status: "قيد النظر" }),
        });
        
        setProjects(prev => prev.map(p => p.project_id === projectId ? updated : p));
        setShowActivateCaseModal(false);
        setActivatingProjectId(null);
    };
    
    const handleCloseProject = async (projectId) => {
        const updated = await apiFetch(`/api/projects/${projectId}`, {
            method: "PUT",
            body: JSON.stringify({ status: "مغلقة", closedAt: new Date().toISOString() }),
        });
        
        setProjects(prev => prev.map(p => p.project_id === projectId ? updated : p));
        setActiveView("dashboard");
        setSelectedProjectId(null);
    };
    
    const handleAddNewEmployee = async (employeeData) => {
        console.log("adding new emplyoyy;", employeeData);
        
        const created = await apiFetch("/api/employees", {
            method: "POST",
            body: JSON.stringify(employeeData),
        });
        
        setEmployees(prev => [created, ...prev]);
        setShowNewEmployeeModal(false);
    };
    
    const handleUpdateEmployee = async (updatedEmployeeData) => {
        const updated = await apiFetch(`/api/employees/${employeeToEdit.employee_id}`, {
            method: "PUT",
            body: JSON.stringify(updatedEmployeeData),
        });
        
        setEmployees(prev => prev.map(e => e.employee_id === updated.employee_id ? updated : e));
        setShowEditEmployeeModal(false);
        setEmployeeToEdit(null);
    };
    
    const handleAddNewClient = async (clientData) => {
        const created = await apiFetch("/api/clients", {
            method: "POST",
            body: JSON.stringify(clientData),
        });
        
        setClients(prev => [created.data, ...prev]);
        setShowNewClientModal(false);
    };
    
    const handleUpdateClient = async (updatedClientData) => {
        const res = await apiFetch(`/api/clients/${clientToEdit.client_id}`, {
            method: "PUT",
            body: JSON.stringify(updatedClientData),
        });
        
        const updated = res.data;
        
        setClients(prev => prev.map(c => c.client_id === updated.client_id ? updated : c));
        setShowEditClientModal(false);
        setClientToEdit(null);
    };
    
    const handleAddTaskAttachment = async (files) => {
        if (!taskToAttachToId) return;
        
        const uploaded = await uploadAttachments(files, { taskId: taskToAttachToId });
        
        console.log("UPLOADED;", uploaded);
        
        setTasks(prev =>
            prev.map(t =>
                t.task_id === taskToAttachToId
                    ? { ...t, attachments: [...(t.attachments || []), ...uploaded] }
                    : t
            )
        );
        
        setShowAddTaskAttachmentModal(false);
        setTaskToAttachToId(null);
    };
    
    const openActivateModal = (projectId) => { setActivatingProjectId(projectId); setShowActivateCaseModal(true); };
    const handleOpenAddTaskAttachmentModal = (taskId) => { setTaskToAttachToId(taskId); setShowAddTaskAttachmentModal(true); };
    
    const viewAttachments = (items, title) => { setAttachmentsToShow({ items, title }); setShowAttachmentsModal(true); };
    
    const viewProjectTasks = (projectId) => {
        setSelectedProjectId(projectId);
        setActiveView('projectDetails');
    };
    
    const handleEditEmployee = (employeeId) => { setEmployeeToEdit(employees.find(e => e.employee_id === employeeId)); setShowEditEmployeeModal(true); };
    const viewEmployeeDetails = (employeeId) => { setSelectedEmployeeId(employeeId); setActiveView('employeeDetails'); };
    
    const handleEditClient = (clientId) => { setClientToEdit(clients.find(c => c.client_id === clientId)); setShowEditClientModal(true); };
    const viewClientDetails = (clientId) => { setSelectedClientId(clientId); setActiveView('clientDetails'); };
    
    const fetchProjects = async (pageNum = 1) => {
        //setLoading(true);
        
        try {
            const res =  await apiFetch(`/api/projects?page=${page}&limit=${limit}`, {
                method: "GET",
            });
            
            if(!res.ok) return;
            
            const projects = res.data;
            
            console.log("projects;", projects);
            
            if (pageNum === 1) {
                setProjects(projects);
            } else {
                setProjects((prev) => [...prev, ...projects.data]);
            }
            
            setPagination(projects.pagination);
        } catch (err) {
           console.error(err);
        }
        
        //setLoading(false);
    };
    
    const loadMore = () => {
        if (pagination && page < pagination.totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProjects(nextPage);
        }
    };
    
    /*const handleTaskStatusChange = (taskId, newStatus) => {
        setTasks(prevTasks => {
            const updated = prevTasks.map(t =>
                t.id === taskId ? { ...t, status: newStatus } : t
            );

            return updated;
        });
    };

    const handleAddNewTask = (taskData, files) => {
        const newAttachments = Array.from(files).map(file => ({ name: file.name, type: 'document' }));
        const projectNumber = parseInt(taskData.projectNumber, 10);
        delete taskData.projectNumber;

        const project = projects.find(p => p.number == projectNumber);
        const projectId = project ? project.id : null;

        setTasks([
            ...tasks,
            {
                id: Date.now(),
                projectId: projectId,
                ...taskData,
                createdAt: new Date(),
                attachments: newAttachments,
                status: 'نشطة'
            }
        ]);

        setShowNewTaskModal(false);
    };

    const handleAddNewProject = (projectData, files) => {
        const newAttachments = Array.from(files).map(file => ({ name: file.name, type: 'document' }));
        // projectData.type === 'مسودة قضية' ? 'مسودة' : 'قيد النظر'
        setProjects([...projects, { id: Date.now(), ...projectData, status: !projectData.number ?'مسودة' : 'مسودة قضية', tasks: [], closedAt: null, attachments: newAttachments }]);
        setShowNewProjectModal(false);
    };

    const handleEditProject = (projectId) => { setProjectToEdit(projects.find(p => p.id === projectId)); setShowEditProjectModal(true); };
    const handleUpdateProject = (updatedProjectData) => { setProjects(projects.map(p => p.id === projectToEdit.id ? { ...p, ...updatedProjectData } : p)); setShowEditProjectModal(false); setProjectToEdit(null); };
    const handleActivateCase = (projectId, caseNumber) => { setProjects(projects.map(p => p.id === projectId ? { ...p, type: 'قضية', number: caseNumber, status: 'قيد النظر' } : p)); setShowActivateCaseModal(false); setActivatingProjectId(null); };
    const handleCloseProject = (projectId) => { setProjects(projects.map(p => p.id === projectId ? { ...p, status: 'مغلقة', closedAt: new Date() } : p)); setActiveView('dashboard'); setSelectedProjectId(null); };
    const openActivateModal = (projectId) => { setActivatingProjectId(projectId); setShowActivateCaseModal(true); };
    const viewAttachments = (items, title) => { setAttachmentsToShow({ items, title }); setShowAttachmentsModal(true); };
    const viewProjectTasks = (projectId) => { setSelectedProjectId(projectId); setActiveView('projectDetails'); };
    const handleAddNewEmployee = (employeeData) => { setEmployees([...employees, { id: Date.now(), ...employeeData }]); setShowNewEmployeeModal(false); };
    const handleEditEmployee = (employeeId) => { setEmployeeToEdit(employees.find(e => e.id === employeeId)); setShowEditEmployeeModal(true); };
    const handleUpdateEmployee = (updatedEmployeeData) => { setEmployees(employees.map(e => e.id === employeeToEdit.id ? { ...e, ...updatedEmployeeData } : e)); setShowEditEmployeeModal(false); setEmployeeToEdit(null); };
    const viewEmployeeDetails = (employeeId) => { setSelectedEmployeeId(employeeId); setActiveView('employeeDetails'); };
    const handleAddNewClient = (clientData) => { setClients([...clients, { id: Date.now(), ...clientData }]); setShowNewClientModal(false); };
    const handleEditClient = (clientId) => { setClientToEdit(clients.find(c => c.id === clientId)); setShowEditClientModal(true); };
    const handleUpdateClient = (updatedClientData) => { setClients(clients.map(c => c.id === clientToEdit.id ? { ...c, ...updatedClientData } : c)); setShowEditClientModal(false); setClientToEdit(null); };
    const viewClientDetails = (clientId) => { setSelectedClientId(clientId); setActiveView('clientDetails'); };
    const handleOpenAddTaskAttachmentModal = (taskId) => { setTaskToAttachToId(taskId); setShowAddTaskAttachmentModal(true); };
    const handleAddTaskAttachment = (files) => { if (!taskToAttachToId) return; const newAttachments = Array.from(files).map(file => ({ name: file.name, type: 'document' })); setTasks(tasks.map(task => task.id === taskToAttachToId ? { ...task, attachments: [...task.attachments, ...newAttachments] } : task)); setShowAddTaskAttachmentModal(false); setTaskToAttachToId(null); };
*/
    
    const filteredProjects = useMemo(() => {
        return projects
            .map(p => {
                //const assignee = employees.find(e => e.employee_id === p.assignee_id);
                const projectTasks = tasks.filter(t => t.project_id === p.project_id);
                const hasActiveTask = projectTasks.some(
                    t => t.status === 'نشطة' || t.status === 'متأخرة'
                );
                
                return {
                    ...p,
                    taskCount: projectTasks.length,
                    activeTaskCount: projectTasks.filter(t => t.status === 'نشطة').length,
                    hasActiveTask,
                };
            })
            .filter(p =>
                p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                p.number.toString().includes(projectSearch) ||
                p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
            )
            .filter(p => {
                if (projectFilter === 'archived') return p.status === 'مغلقة';
                if (projectFilter === 'active') return p.status !== 'مغلقة';
                if (projectFilter === 'draft') return p.status === 'مسودة';
                if (projectFilter === 'active_yellow') return p.status === 'قيد النظر' && p.hasActiveTask;
                if (projectFilter === 'inactive_black') return p.status === 'قيد النظر' && !p.hasActiveTask;
                
                return true;
            });
    }, [projects, employees, tasks, projectSearch, projectFilter]);
    
    const allTasksWithProjectInfo = useMemo(() =>
            tasks.map(task => {
                const project = projects.find(p => p.project_id === task.project_id);
                /*const assignee = employees.find(e => {
                    return e.employee_id == task.assignee_id;
                });*/
                
                return {
                    ...task,
                    projectType: project?.type,
                    projectNumber: project?.number,
                    clientName: project?.client_name
                };
            }),
        [tasks, projects, employees]
    );
    
    const filteredTasks = useMemo(() => {
        return allTasksWithProjectInfo.filter(task => {
            const searchMatch = !taskSearch || task.projectName?.toLowerCase().includes(taskSearch.toLowerCase()) || task.projectNumber?.includes(taskSearch) || task.clientName.toLowerCase().includes(taskSearch.toLowerCase());
            const assigneeMatch = taskFilter.assignee === 'all' || task.assignee_id == taskFilter.assignee;
            const statusMatch = taskFilter.status === 'all' && task.status !== 'منتهية' || task.status === taskFilter.status;
            return searchMatch && assigneeMatch && statusMatch;
        });
    }, [allTasksWithProjectInfo, taskSearch, taskFilter]);
    
    const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(employeeSearch.toLowerCase()));
    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <ProjectDashboard
                tasks={tasks}
                employees={employees}
                projectSearch={projectSearch}
                setProjectSearch={setProjectSearch}
                projectFilter={projectFilter}
                setProjectFilter={setProjectFilter}
                filteredProjects={filteredProjects}
                openActivateModal={openActivateModal}
                viewProjectTasks={viewProjectTasks}
                handleEditProject={handleEditProject}
                setShowNewProjectModal={setShowNewProjectModal}
                setShowNewTaskModal={setShowNewTaskModal}
                taskSearch={taskSearch}
                setTaskSearch={setTaskSearch}
                taskFilter={taskFilter}
                setTaskFilter={setTaskFilter}
                filteredTasks={filteredTasks}
                handleTaskStatusChange={handleTaskStatusChange}
            />;
            
            case 'projectDetails': return <ProjectDetailsView
                selectedProject={selectedProject}
                selectedProjectTasks={selectedProjectTasks}
                setActiveView={setActiveView}
                setSelectedProjectId={setSelectedProjectId}
                handleCloseProject={handleCloseProject}
                setShowNewTaskModal={setShowNewTaskModal}
                viewAttachments={viewAttachments}
                handleTaskStatusChange={handleTaskStatusChange}
                handleOpenAddTaskAttachmentModal={handleOpenAddTaskAttachmentModal}
            />;
            
            case 'employees': return <EmployeesView
                employees={employees}
                employeeSearch={employeeSearch}
                setEmployeeSearch={setEmployeeSearch}
                filteredEmployees={filteredEmployees}
                handleEditEmployee={handleEditEmployee}
                viewEmployeeDetails={viewEmployeeDetails}
                setShowNewEmployeeModal={setShowNewEmployeeModal}
            />;
            
            case 'employeeDetails': return <EmployeeDetailsView
                selectedEmployee={selectedEmployee}
                setActiveView={setActiveView}
                setSelectedEmployeeId={setSelectedEmployeeId}
                allTasksWithProjectInfo={allTasksWithProjectInfo}
            />;
            
            case 'clients': return <ClientsView
                clients={clients}
                clientSearch={clientSearch}
                setClientSearch={setClientSearch}
                filteredClients={filteredClients}
                handleEditClient={handleEditClient}
                viewClientDetails={viewClientDetails}
                setShowNewClientModal={setShowNewClientModal}
            />;
            
            case 'clientDetails': return <ClientDetailsView
                selectedClient={selectedClient}
                setActiveView={setActiveView}
                setSelectedClientId={setSelectedClientId}
                projects={projects}
                tasks={tasks}
            />;
            
            default: return null;
        }
    };
    
    // Fetch projects
    useEffect(() => {
        fetchProjects(1);
    }, [isAuthenticated]);
    
    // Fetch tasks
    useEffect(() => {
        async function loadTasks() {
            if (!isAuthenticated) return;
            
            const res = await apiFetch(`/api/tasks?page=${page}&limit=${limit}`, {method: "GET"});
            
            if(!res.ok) return;
            
            const tasks = res.data;
            
            console.log("Tasks;", tasks);
            
            setTasks(tasks.data);
            //setPagination(res.pagination);
        }
        
        loadTasks();
    }, [isAuthenticated]);
    
    // Fetch employees
    useEffect(() => {
        async function loadEmployees() {
            if (!isAuthenticated) return;
            
            const res = await apiFetch("/api/employees", {method: "GET"});
            
            if(!res.ok) return;
            
            const employees = res.data;
            
            console.log("Employees;", employees);
            
            setEmployees(employees);
        }
        
        loadEmployees();
    }, [])
    
    // Fetch clients
    useEffect(() => {
        async function loadClients() {
            if(!isAuthenticated) return;
            
            const res = await apiFetch("/api/clients", {method: "GET"});
            
            if(!res.ok) return;
            
            const clients = res.data;
            
            setClients(clients);
        }
        
        loadClients();
    }, [])
    
    return (
        <div className="font-sans bg-gray-100 min-h-screen text-gray-900">
            <div className="layout">
                
                {/* Sidebar */}
                <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                    <div className="p-6 text-center"><h1 className="text-2xl font-bold text-blue-600">نظام الإدارة</h1></div>
                    
                    <nav className="flex-grow px-4">
                        <a href="#" onClick={() => { setActiveView('dashboard'); setIsOpen(false); }}
                           className={`flex items-center gap-3 px-4 py-3 my-2 rounded-lg transition-colors ${activeView.includes('dashboard') || activeView.includes('project') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}><Briefcase
                            size={20}/><span>لوحة التحكم</span></a>
                        <a href="#" onClick={() => { setActiveView('employees'); setIsOpen(false); }}
                           className={`flex items-center gap-3 px-4 py-3 my-2 rounded-lg transition-colors ${activeView.includes('employee') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}><Users
                            size={20}/><span>الموظفين</span></a>
                        <a href="#" onClick={() => { setActiveView('clients'); setIsOpen(false); }}
                           className={`flex items-center gap-3 px-4 py-3 my-2 rounded-lg transition-colors ${activeView.includes('client') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}><Building
                            size={20}/><span>العملاء</span></a>
                    </nav>
                </aside>
                
                {/* Main content */}
                <main className="content">
                    <main className="flex-1 h-screen overflow-y-auto">{renderView()}</main>
                </main>
                
                {/* Mobile toggle button */}
                <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
                    ☰
                </button>
            </div>
            
            {/* Modals */}
            {showAttachmentsModal &&
                <AttachmentsModal attachments={attachmentsToShow.items} title={attachmentsToShow.title}
                                  onClose={() => setShowAttachmentsModal(false)}/>}
            
            {showNewEmployeeModal &&
                <NewEmployeeModal setShowNewEmployeeModal={setShowNewEmployeeModal}
                                                       handleAddNewEmployee={handleAddNewEmployee}/>}
            
            {showEditEmployeeModal && employeeToEdit &&
                <EditEmployeeModal setShowEditEmployeeModal={setShowEditEmployeeModal}
                                   handleUpdateEmployee={handleUpdateEmployee} employeeToEdit={employeeToEdit}/>}
            
            {showNewClientModal &&
                <NewClientModal setShowNewClientModal={setShowNewClientModal} handleAddNewClient={handleAddNewClient}/>}
            
            {showEditClientModal && clientToEdit &&
                <EditClientModal setShowEditClientModal={setShowEditClientModal} handleUpdateClient={handleUpdateClient}
                                 clientToEdit={clientToEdit}/>}
            
            {showNewProjectModal &&
                <NewProjectModal setShowNewProjectModal={setShowNewProjectModal}
                                                     handleAddNewProject={handleAddNewProject} employees={employees}/>}
            
            {showEditProjectModal && projectToEdit &&
                <EditProjectModal setShowEditProjectModal={setShowEditProjectModal}
                                  handleUpdateProject={handleUpdateProject} projectToEdit={projectToEdit}
                                  employees={employees} handleAddNewClient={handleAddNewClient}/>}
            
            {showActivateCaseModal &&
                <ActivateCaseModal setShowActivateCaseModal={setShowActivateCaseModal}
                                                         handleActivateCase={handleActivateCase}
                                                         activatingProjectId={activatingProjectId}/>}
            
            {showNewTaskModal &&
                <NewTaskModal setShowNewTaskModal={setShowNewTaskModal} handleAddNewTask={handleAddNewTask}
                              projects={projects} employees={employees} selectedProjectId={selectedProjectId}/>}
            
            {showAddTaskAttachmentModal &&
                <AddTaskAttachmentModal setShowAddTaskAttachmentModal={setShowAddTaskAttachmentModal}
                                        handleAddTaskAttachment={handleAddTaskAttachment}/>}
        </div>
    );
};

export default MainApp;
