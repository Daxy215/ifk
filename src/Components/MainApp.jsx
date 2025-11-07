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
import TaskStatus from '@/Components/Common/enums/TaskStatus';
import ProjectStatus from '@/Components/Common/enums/ProjectStatus';

const MainApp = () => {
    const { t, i18n } = useTranslation();
    
    const { isAuthenticated, apiFetch, uploadAttachments, permissions } = useAuth();
    
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
    const [taskFilter, setTaskFilter] = useState({ assignee: 'all', status: TaskStatus.ALL });
    
    // TODO; Make this request from server (Maybe?)
    const selectedProject = useMemo(() => projects.find(p => {
        //console.log("P;", p, selectedProjectId);
        return p.project_id === selectedProjectId;
    }), [projects, selectedProjectId]);
    
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
    const handleTaskStatusChange = async (task_id, newStatus) => {
        console.log("Udpating task;", task_id, newStatus);
        
        const res = await apiFetch(`/api/tasks/${task_id}`, {
            method: "PATCH",
            body: JSON.stringify({
                status: newStatus
            }),
        });
        
        const updated = res.data;
        
        setTasks(prev =>
            prev.map(t => {
                if (t.task_id === task_id) {
                    //console.log("Found task before update:", t);
                    
                    return updated;
                }
                
                return t;
            })
        );
    };
    
    const handleAddNewTask = async (taskData, files) => {
        const res = await apiFetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify({ ...taskData }),
        });
        
        const created = res.data;
        
        created.assignee_name = taskData.assignee_name;
        created.client_name   = taskData.client_name;
        
        let attachments = [];
        if (files && files.length > 0) {
            attachments = await uploadAttachments(files, { task_id: created.task_id });
        }
        
        setTasks(prev => [{ ...created, attachments }, ...prev]);
        setShowNewTaskModal(false);
    };
    
    const handleAddNewProject = async (projectData, files) => {
        const res = await apiFetch("/api/projects", {
            method: "POST",
            body: JSON.stringify({
                client_id: projectData.client_id,
                type: projectData.type,
                number: projectData.number,
                name: projectData.name,
                assignee_id: projectData.assignee_id,
                /*assignee_name: projectData.assignee_name,*/
                status: projectData.status,
                closed_at: projectData.closed_at
            }),
        });
        
        const created = res.data;
        
        created.client_name = projectData.client_name;
        created.assignee_name = projectData.assignee_name;
        
        let attachments = [];
        if (files && files.length > 0) {
            attachments = await uploadAttachments(files, { project_id: created.project_id });
        }
        
        setProjects(prev => [{ ...created, attachments }, ...prev]);
        setShowNewProjectModal(false);
    };
    
    const handleEditProject = (project_id) => {
        let project = projects.find(p => p.project_id === project_id);
        
        setProjectToEdit(project);
        setShowEditProjectModal(true);
    };
    
    const handleUpdateProject = async (updatedProjectData, clientName, employeeName) => {
        const res = await apiFetch(`/api/projects/${projectToEdit.project_id}`, {
            method: "PUT",
            body: JSON.stringify(updatedProjectData),
        });
        
        const updated = res.data;
        
        updated.client_name   = clientName;
        updated.assignee_name = employeeName;
        
        setProjects(prev => prev.map(p => p.project_id === updated.project_id ? updated : p));
        setShowEditProjectModal(false);
        setProjectToEdit(null);
    };
    
    const handleActivateCase = async (project_id, caseNumber) => {
        console.log("tranna update;", project_id);
        
        const res = await apiFetch(`/api/projects/${project_id}`, {
            method: "PUT",
            body: JSON.stringify({ type: ProjectStatus.CASE, number: caseNumber, status: ProjectStatus.UNDER_REVIEW }),
        });
        
        const updated = res.data;
        
        setProjects(prev => prev.map(p => p.project_id === project_id ? updated : p));
        setShowActivateCaseModal(false);
        setActivatingProjectId(null);
    };
    
    const handleCloseProject = async (project_id) => {
        const res = await apiFetch(`/api/projects/${project_id}`, {
            method: "PUT",
            body: JSON.stringify({ status: ProjectStatus.CLOSED, closedAt: new Date().toISOString() }),
        });
        
        const updated = await res.data;
        
        setProjects(prev => prev.map(p => p.project_id === project_id ? updated : p));
        setActiveView("dashboard");
        setSelectedProjectId(null);
    };
    
    const handleAddNewEmployee = async (employeeData) => {
        const res = await apiFetch("/api/employees", {
            method: "POST",
            body: JSON.stringify(employeeData),
        });
        
        const created = res.data;
        
        setEmployees(prev => [created, ...prev]);
        setShowNewEmployeeModal(false);
    };
    
    const handleUpdateEmployee = async (updatedEmployeeData) => {
        const res = await apiFetch(`/api/employees/${employeeToEdit.employee_id}`, {
            method: "PUT",
            body: JSON.stringify(updatedEmployeeData),
        });
        
        const updated = res.data;
        
        setEmployees(prev => prev.map(e => e.employee_id === updated.employee_id ? updated : e));
        setShowEditEmployeeModal(false);
        setEmployeeToEdit(null);
    };
    
    const handleAddNewClient = async (clientData) => {
        const res = await apiFetch("/api/clients", {
            method: "POST",
            body: JSON.stringify(clientData),
        });
        
        const created = res.data;
        
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
        
        const uploaded = await uploadAttachments(files, { task_id: taskToAttachToId });
        
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
    
    const openActivateModal = (project_id) => { setActivatingProjectId(project_id); setShowActivateCaseModal(true); };
    const handleOpenAddTaskAttachmentModal = (task_id) => { setTaskToAttachToId(task_id); setShowAddTaskAttachmentModal(true); };
    
    const viewAttachments = (items, title) => { setAttachmentsToShow({ items, title }); setShowAttachmentsModal(true); };
    
    const viewProjectTasks = (project_id) => {
        console.log("Viewing; ", project_id);
        
        setSelectedProjectId(project_id);
        setActiveView('projectDetails');
    };
    
    const handleEditEmployee = (employee_id) => { setEmployeeToEdit(employees.find(e => e.employee_id === employee_id)); setShowEditEmployeeModal(true); };
    const viewEmployeeDetails = (employee_id) => { setSelectedEmployeeId(employee_id); setActiveView('employeeDetails'); };
    
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
                setProjects(projects.data);
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
    
    const filteredProjects = useMemo(() => {
        return projects
            .map(p => {
                //const assignee = employees.find(e => e.employee_id === p.assignee_id);
                const projectTasks = tasks.filter(t => t.project_id === p.project_id);
                const hasActiveTask = projectTasks.some(
                    t => t.status === TaskStatus.ACTIVE || t.status === TaskStatus.DELAYED
                );
                
                return {
                    ...p,
                    taskCount: projectTasks.length,
                    activeTaskCount: projectTasks.filter(t => t.status === TaskStatus.ACTIVE).length,
                    hasActiveTask,
                };
            })
            .filter(p =>
                p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                p.number.toString().includes(projectSearch) ||
                p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
            )
            .filter(p => {
                if (projectFilter === 'archived') return p.status === ProjectStatus.CLOSED;
                if (projectFilter === 'active') return p.status !== ProjectStatus.CLOSED;
                if (projectFilter === 'draft') return p.status === ProjectStatus.DRAFT;
                if (projectFilter === 'active_yellow') return p.status === ProjectStatus.UNDER_REVIEW && p.hasActiveTask;
                if (projectFilter === 'inactive_black') return p.status === ProjectStatus.UNDER_REVIEW && !p.hasActiveTask;
                
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
            const statusMatch = taskFilter.status === TaskStatus.ALL && task.status !== TaskStatus.COMPLETED || task.status === taskFilter.status;
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
        <div className="bg-gray-100 min-h-screen text-gray-900">
            <div className="layout">
                
                {/* Sidebar */}
                {permissions.includes('manage_users') &&
                    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                        <div className="p-6 text-center"><h1 className="text-2xl font-bold text-blue-600">{t('sidebar.title')}</h1></div>
                        
                        <nav className="flex-grow px-4">
                            <a href="#" onClick={() => { setActiveView('dashboard'); setIsOpen(false); }}
                               className={`flex items-center gap-3 px-4 py-3 my-2 rounded-lg transition-colors ${activeView.includes('dashboard') || activeView.includes('project') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}><Briefcase
                                size={20}/><span>{t('sidebar.dashboard')}</span></a>
                            <a href="#" onClick={() => { setActiveView('employees'); setIsOpen(false); }}
                               className={`flex items-center gap-3 px-4 py-3 my-2 rounded-lg transition-colors ${activeView.includes('employee') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}><Users
                                size={20}/><span>{t('sidebar.employees')}</span></a>
                            <a href="#" onClick={() => { setActiveView('clients'); setIsOpen(false); }}
                               className={`flex items-center gap-3 px-4 py-3 my-2 rounded-lg transition-colors ${activeView.includes('client') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}><Building
                                size={20}/><span>{t('sidebar.clients')}</span></a>
                        </nav>
                    </aside>
                }
                
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
