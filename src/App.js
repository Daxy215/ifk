import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import TasksView from './Components/Tasks/TasksView';
import ProjectsView from './Components/Projects/ProjectsView';
import EmployeesView from './Components/Employees/EmployeesView';
import ClientsView from './Components/Clients/ClientsView';

import { UserProvider } from './Context/UserContext';
import Login from './Registration/Login';
import Dashboard from './Dashboard';
import TwoFASetup from './Registration/TwoFASetup';
import AdminPanel from './AdminPanel';
import ProtectedRoute from './Registration/ProtectedRoute';

import { useNotification } from "./Context/NotificationContext";

import './App.css';

function Forbidden() { return <h2>Forbidden</h2> }

const App = () => {
  return (
      <UserProvider>
        <Router>
          <nav>
            <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/2fa">2FA</Link> | <Link to="/admin">Admin</Link>
          </nav>

          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/2fa" element={<TwoFASetup/>} />
            <Route path="/admin" element={<ProtectedRoute required="manage_users"><AdminPanel/></ProtectedRoute>} />
            <Route path="/forbidden" element={<Forbidden/>} />
          </Routes>
        </Router>
      </UserProvider>
  );
}

const ProjectManagementSystem = () => {
  // TESTS TODO; REMOVE ME!
  const initialEmployees = [
    { id: 1, name: 'Gay', jobTitle: 'Gay job', email: 'alsoGay@bigGay.com', contactOfficer: 'Gay Department' },
  ];

  const initialClients = [
    { id: 1, clientCompanyName: 'Gay Corporation', email: 'gay@gay.com', contactOfficer: 'Gay Smith' },
  ];

  const initialTasks = [
    {
      id: 1,
      projectType: 'Case',
      projectNumber: '1234567',
      taskDescription: 'Review client documents',
      assignedTo: 'Gay',
      duration: 5,
      status: 'Active',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      attachments: [
        { name: 'client_docs.pdf', path: '/files/client_docs.pdf' },
        { name: 'evidence.jpg', path: '/files/evidence.jpg' }
      ],
      notes: 'Urgent review needed'
    },
  ];

  const initialProjects = [
    {
      id: 1,
      projectType: 'Case',
      caseNumber: '1234567',
      description: 'Corporate litigation case',
      status: 'Under Review',
      //progress: 65,
      duration: 30,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      tasks: [ 1, 5, 3],
      completedTasks: 3,
      client: 'ABC Corporation'
    },
  ];

  // State management
  const [activeView, setActiveView] = useState('tasks');
  const [tasks, setTasks] = useState(initialTasks);
  const [projects, setProjects] = useState(initialProjects);
  const [employees, setEmployees] = useState(initialEmployees);
  const [clients, setClients] = useState(initialClients);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Filters
  const [taskFilters, setTaskFilters] = useState({assigned: '', type: '', status: '', date: ''});
  const [projectFilters, setProjectFilters] = useState({assigned: '', type: '', status: ''});

  let inputRef;
  const [filteredTaskProjects, setFilteredProjects] = React.useState([]);

  const { showNotification } = useNotification();

  // Calculate the remaining time for a task
  const calculateRemainingTime = (startDate, duration) => {
    const dueDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    const now = new Date();
    const timeDiff = dueDate - now;

    if (timeDiff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Update timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(t => [...t]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (taskFilters.assigned && task.assignedTo !== taskFilters.assigned) return false;

    if (taskFilters.type && task.projectType !== taskFilters.type) return false;

    if (taskFilters.status && task.status !== taskFilters.status) return false;

    if (taskFilters.date) {
      const taskDate = new Date(task.createdAt).toISOString().split('T')[0];

      if (taskDate !== taskFilters.date) return false;
    }

    return true;
  });

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (projectFilters.assigned && project.client !== projectFilters.assigned) {
      return false;
    }

    if (projectFilters.type && project.projectType !== projectFilters.type) {
      return false;
    }

    if (projectFilters.status && project.status !== projectFilters.status) {
      return false;
    }

    return true;
  });

  // Handle filter change
  const handleTaskFilterChange = (filterType, value) => {
    setTaskFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleProjectFilterChange = (filterType, value) => {
    setProjectFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Add a new task
  const addTask = (newTask) => {
    const id = Math.max(...tasks.map(t => t.id), 0) + 1;
    setTasks([...tasks, { id, ...newTask, createdAt: new Date() }]);
    showNotification('Task created successfully!');
  };

  // Update a task
  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    showNotification('Task updated successfully!');
  };

  // Add a new project
  const addProject = (newProject) => {
    const id = Math.max(...projects.map(p => p.id), 0) + 1;
    setProjects([...projects, { id, ...newProject, startDate: new Date() }]);
    showNotification('Project created successfully!');
  };

  // Update a project
  const updateProject = (updatedProject) => {
    setProjects(projects.map(project => project.id === updatedProject.id ? updatedProject : project));
    showNotification('Project updated successfully!');
  };

  // Add a new employee
  const addEmployee = (newEmployee) => {
    const id = Math.max(...employees.map(e => e.id), 0) + 1;
    setEmployees([...employees, { id, ...newEmployee }]);
    showNotification('Employee added successfully!');
  };

  // Update an employee
  const updateEmployee = (updatedEmployee) => {
    setEmployees(employees.map(employee => employee.id === updatedEmployee.id ? updatedEmployee : employee));
    showNotification('Employee updated successfully!');
  };

  // Add a new client
  const addClient = (newClient) => {
    const id = Math.max(...clients.map(c => c.id), 0) + 1;
    setClients([...clients, { id, ...newClient }]);
    showNotification('Client added successfully!');
  };

  // Update a client
  const updateClient = (updatedClient) => {
    setClients(clients.map(client => client.id === updatedClient.id ? updatedClient : client));
    showNotification('Client updated successfully!');
  };

  // Complete a task
  const completeTask = (taskId) => {
    let updatedTask = null;

    setTasks(tasks.map(task => {
      if(task.id === taskId) {
        updatedTask = { ...task, status: "Completed"};
        return updatedTask;
      }

      return task;
    }));

    // TODO; THIS SHOULD CALL 'UPDATEPROJECT(MATCHED);'!
    const projectNumber = updatedTask.projectNumber;
    const matched = projects.find(p => p.caseNumber === projectNumber);

    if (matched) {
      setProjects(projects.map(p => p.caseNumber === projectNumber ? {...p, completedTasks: p.completedTasks + 1} : p));
    }

    showNotification('Task marked as completed!');
  };

  // Delete an employee
  const deleteEmployee = (employeeId) => {
    setEmployees(employees.filter(employee => employee.id !== employeeId));
    showNotification('Employee deleted successfully!');
  };

  // Delete a client
  const deleteClient = (clientId) => {
    setClients(clients.filter(client => client.id !== clientId));
    showNotification('Client deleted successfully!');
  };

  // Assign case number to a project
  const assignCaseNumber = (projectId, caseNumber) => {
    if (caseNumber.length !== 7) {
      showNotification('Case number must be exactly 7 digits!');

      return;
    }

    setProjects(projects.map(project =>
        project.id === projectId ? { ...project, caseNumber, status: 'Under Review' } : project
    ));

    showNotification('Case number assigned successfully!');
  };

  // Close a project
  const closeProject = (projectId) => {
    setProjects(projects.map(project =>
        project.id === projectId ? { ...project, status: 'Closed' } : project
    ));

    // TODO; For all tasks 'TASK.STATUS = "PROJECT CLOSED!'
    //setTasks(tasks.map(t => t.projectNumber === project.caseNumber ? {...t, status: 'Project Closed!'} : t));

    showNotification('Project closed successfully!');
  };

  // Get icon for status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Active': return 'fa-check-circle';
      case 'Completed': return 'fa-file-alt';
      case 'Finished': return 'fa-archive';
      case 'Overdue': return 'fa-clock';
      case 'Draft': return 'fa-edit';
      case 'Under Review': return 'fa-search';
      case 'Closed': return 'fa-lock';
      default: return 'fa-circle';
    }
  };

  // Open modal for add or edit
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // Handle form submission
  const handleSubmit = (e, type) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    /*for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }*/

    switch(type) {
      case 'task':
        const projectNumber = e.target.projectNumber.value;
        const matched = projects.find(
            p => p.caseNumber === projectNumber
        );

        if (!matched) {
          showNotification('Project was not found!', true);

          return;
        }

        const files = formData.getAll('attachments');

        const uploadData = new FormData();
        files.forEach((file, index) => {
          uploadData.append('attachments', file);
        });

        /*attachments: [
          { name: 'client_docs.pdf', path: '/files/client_docs.pdf' },
          { name: 'evidence.jpg', path: '/files/evidence.jpg' }
        ],*/

        let attachments = (editingItem && editingItem.attachments) || [];

        files.forEach((file, index) => {
          attachments.push({name: file.name, path: "somepath"});
        });

        //tasks.map(task => task.id === updatedTask.id ? updatedTask : task)

        //import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
        //import { storage } from './firebase';

        /*for (const file of files) {
          const storageRef = ref(storage, `attachments/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);

          const url = await getDownloadURL(snapshot.ref);
          console.log('Uploaded file URL:', url);
        }*/

        //console.log(uploadData);

        // TODO; Temp until using database!
        if (typeof handleSubmit.counter === 'undefined') {
          handleSubmit.counter = 0;
        }

        const taskData = {
          id: handleSubmit.counter++,
          projectType: formData.get('projectType'),
          projectNumber: formData.get('projectNumber'),
          taskDescription: formData.get('taskDescription'),
          assignedTo: formData.get('assignedTo'),
          duration: parseInt(formData.get('duration')),
          attachments: attachments,
          notes: formData.get('notes'),
          status: formData.get('status') || 'Active'
        };

        if (editingItem) {
          updateTask({ ...editingItem, ...taskData });
        } else {
          addTask(taskData);

          matched.tasks.push(taskData.id);
        }

        break;

      case 'project':
        const projectData = {
          projectType: formData.get('projectType'),
          caseNumber: formData.get('caseNumber'),
          description: formData.get('projectDescription'),
          duration: parseInt(formData.get('duration')),
          client: formData.get('client'),
          //progress: editingItem ? editingItem.progress : 0,
          tasks: editingItem ? editingItem.tasks : [],
          completedTasks: editingItem ? editingItem.completedTasks : 0,
          status: formData.get('caseNumber') ? 'Under Review' : 'Draft'
        };

        if (editingItem) {
          updateProject({ ...editingItem, ...projectData });
        } else {
          addProject(projectData);
        }

        break;

      case 'employee':
        const employeeData = {
          name: formData.get('name'),
          jobTitle: formData.get('jobTitle'),
          email: formData.get('email'),
          contactOfficer: formData.get('contactOfficer')
        };

        if (editingItem) {
          updateEmployee({ ...editingItem, ...employeeData });
        } else {
          addEmployee(employeeData);
        }

        break;

      case 'client':
        const clientData = {
          clientCompanyName: formData.get('clientCompanyName'),
          email: formData.get('email'),
          contactOfficer: formData.get('contactOfficer')
        };

        if (editingItem) {
          updateClient({ ...editingItem, ...clientData });
        } else {
          addClient(clientData);
        }

        break;

      default:
        return;
    }

    closeModal();
  };

  // Render modal
  const renderModal = () => {
    if (!showModal) return null;

    let title = '';
    let content = null;

    switch(modalType) {
      case 'task':
        title = editingItem ? 'Edit Task' : 'Add New Task';
        content = (
            <form onSubmit={(e) => handleSubmit(e, 'task')}>
              <div className="form-group">
                <label>Project Type</label>
                <select className="form-control" name="projectType" defaultValue={editingItem?.projectType || ''}
                        required>
                  <option value="">Select Project Type</option>
                  <option value="Case">Case</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Claim">Claim</option>
                  <option value="Power of Attorney">Power of Attorney</option>
                  <option value="Office Needs">Office Needs</option>
                </select>
              </div>

              {/*<div className="form-group">
                <label>Project Number</label>
                <input type="text" className="form-control" name="projectNumber" defaultValue={editingItem?.projectNumber || ''} required />
              </div>*/}

              <div className="form-group relative">
                <label>Project Number</label>
                <input
                    type="text"
                    className="form-control"
                    name="projectNumber"
                    defaultValue={editingItem?.projectNumber || ""}
                    autoComplete="off"
                    ref={input => inputRef = input}

                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return setFilteredProjects([]);
                      const q = val.toLowerCase();

                      setFilteredProjects(
                          projects.filter(
                              p => (p.caseNumber || "").toLowerCase().includes(q) ||
                                  (p.client || "").toLowerCase().includes(q)
                          )
                      );
                    }}

                    required
                />

                {filteredTaskProjects.length > 0 && (
                    <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
                      {filteredTaskProjects.map(p => (
                          <li
                              key={p.id}
                              className="p-2 hover:bg-gray-200 cursor-pointer"
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => {
                                inputRef.value = p.caseNumber || "";
                                setFilteredProjects([]);
                              }}
                          >
                            {(p.caseNumber || "—")} – {(p.client || "—")}
                          </li>
                      ))}
                    </ul>
                )}
              </div>

              <div className="form-group">
                <label>Task Description</label>
                <textarea className="form-control" name="taskDescription" rows="3"
                          defaultValue={editingItem?.taskDescription || ''} required></textarea>
              </div>

              <div className="form-group">
                <label>Assigned To</label>
                <select className="form-control" name="assignedTo" defaultValue={editingItem?.assignedTo || ''}
                        required>
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                      <option key={employee.id} value={employee.name}>{employee.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Duration (days)</label>
                <input type="number" className="form-control" name="duration" min="1"
                       defaultValue={editingItem?.duration || ''} required/>
              </div>

              <div className="form-group">
                <label>Attachments</label>
                <input type="file" className="form-control" name="attachments" multiple/>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" name="notes" rows="3"
                          defaultValue={editingItem?.notes || ''}></textarea>
              </div>

              {/*{editingItem && (
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" name="status" defaultValue={editingItem?.status || 'Active'}>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
              )}*/}

              <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'} Task</button>
            </form>
        );
        break;

      case 'project':
        title = editingItem ? 'Edit Project' : 'Add New Project';
        content = (
            <form onSubmit={(e) => handleSubmit(e, 'project')}>
              <div className="form-group">
                <label>Project Type</label>
                <select className="form-control" name="projectType" defaultValue={editingItem?.projectType || ''}
                        required>
                  <option value="">Select Project Type</option>
                  <option value="Case">Case</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Claim">Claim</option>
                  <option value="Power of Attorney">Power of Attorney</option>
                  <option value="Office Needs">Office Needs</option>
                </select>
              </div>

              <div className="form-group">
                <label>Case Number (7 digits)</label>
                <input
                    type="text"
                    className="form-control"
                    name="caseNumber"
                    pattern="\d{7}"
                    placeholder="Enter 7-digit case number"
                    defaultValue={editingItem?.caseNumber || ''}
                />
              </div>

              <div className="form-group">
                <label>Project Description</label>
                <textarea className="form-control" name="projectDescription" rows="3" defaultValue={editingItem?.description || ''} required></textarea>
              </div>

              <div className="form-group">
                <label>Duration (days)</label>
                <input type="number" className="form-control" name="duration" min="1" defaultValue={editingItem?.duration || ''} required />
              </div>

              <div className="form-group">
                <label>Related Documents</label>
                <input type="file" className="form-control" name="documents" multiple />
              </div>

              <div className="form-group">
                <label>Client</label>
                <select className="form-control" name="client" defaultValue={editingItem?.client || ''}>
                  <option value="">Select Client</option>
                  {clients.map(client => (
                      <option key={client.id} value={client.clientCompanyName}>{client.clientCompanyName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" name="notes" rows="3"></textarea>
              </div>

              <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'} Project</button>
            </form>
        );

        break;

      case 'employee':
        title = editingItem ? 'Edit Employee' : 'Add New Employee';
        content = (
            <form onSubmit={(e) => handleSubmit(e, 'employee')}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" name="name" defaultValue={editingItem?.name || ''} required />
              </div>

              <div className="form-group">
                <label>Job Title</label>
                <input type="text" className="form-control" name="jobTitle" defaultValue={editingItem?.jobTitle || ''} required />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" name="email" defaultValue={editingItem?.email || ''} required />
              </div>

              <div className="form-group">
                <label>Contact Officer</label>
                <input type="text" className="form-control" name="contactOfficer" defaultValue={editingItem?.contactOfficer || ''} />
              </div>

              <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'} Employee</button>
            </form>
        );

        break;

      case 'client':
        title = editingItem ? 'Edit Client' : 'Add New Client';
        content = (
            <form onSubmit={(e) => handleSubmit(e, 'client')}>
              <div className="form-group">
                <label>Client/Company Name</label>
                <input type="text" className="form-control" name="clientCompanyName" defaultValue={editingItem?.clientCompanyName || ''} required />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" name="email" defaultValue={editingItem?.email || ''} required />
              </div>

              <div className="form-group">
                <label>Contact Officer</label>
                <input type="text" className="form-control" name="contactOfficer" defaultValue={editingItem?.contactOfficer || ''} />
              </div>

              <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'} Client</button>
            </form>
        );

        break;

      default:
        return null;
    }

    { /* 'X' button to close current opened model */ }
    return (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{title}</h3>
              <span className="close" onClick={closeModal}>&times;</span>
            </div>
            {content}
          </div>
        </div>
    );
  };

  // Main body
  return (
      <div className="project-management-system">
        <header>
          <div className="header-content">
            <div className="logo">
              Moyo is gay
            </div>
          </div>
        </header>

        { /* Main container */ }
        <div className="container">
          { /* Navigation bar */ }
          <div className="nav-tabs">
            <div
                className={`nav-tab ${activeView === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveView('tasks')}
            >
              <i className="fas fa-tasks"></i>
              Tasks
            </div>
            <div
                className={`nav-tab ${activeView === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveView('projects')}
            >
              <i className="fas fa-briefcase"></i>
              Projects
            </div>
            <div
                className={`nav-tab ${activeView === 'employees' ? 'active' : ''}`}
                onClick={() => setActiveView('employees')}
            >
              <i className="fas fa-users"></i>
              Employees
            </div>
            <div
                className={`nav-tab ${activeView === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveView('clients')}
            >
              <i className="fas fa-address-card"></i>
              Clients
            </div>
          </div>

          {activeView === 'tasks' && (
              <TasksView
                  {... {
                    tasks,
                    filteredTasks,
                    employees,
                    openModal,
                    completeTask,
                    taskFilters,
                    handleTaskFilterChange,
                    calculateRemainingTime,
                    getStatusIcon
                  }}
              />
          )}

          {activeView === 'projects' && (
              <ProjectsView
                  {...{
                    projects,
                    filteredProjects,
                    clients,
                    openModal,
                    closeProject,
                    assignCaseNumber,
                    calculateRemainingTime,
                    getStatusIcon,
                    projectFilters,
                    handleProjectFilterChange
                  }}
              />
          )}

          {activeView === 'employees' && (
              <EmployeesView
                  {...{
                    employees,
                    openModal,
                    deleteEmployee
                  }}
              />
          )}

          {activeView === 'clients' && (
              <ClientsView
                  {...{
                    clients,
                    openModal,
                    deleteClient
                  }}
              />
          )}
        </div>

        {renderModal()}
      </div>
  );
};

export default ProjectManagementSystem;
//export default App;
