import React from 'react';
import TaskCard from './TaskCard';

const TasksView = ({ tasks, filteredTasks, employees, openModal, completeTask, taskFilters, handleTaskFilterChange, calculateRemainingTime, getStatusIcon }) => {
    return (
        <div id="tasks-view" className={`view active`}>
            <div className="view-header">
                <h2>Task Management</h2>
                <button className="btn btn-primary" onClick={() => openModal('task')}>
                    <i className="fas fa-plus"></i> Add New Task
                </button>
            </div>

            <div className="filters">
                <div className="filter-item">
                    <label>Assigned To</label>
                    <select className="form-control" value={taskFilters.assigned} onChange={(e) => handleTaskFilterChange('assigned', e.target.value)}>
                        <option value="">All</option>
                        {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                    </select>
                </div>
                <div className="filter-item">
                    <label>Project Type</label>
                    <select className="form-control" value={taskFilters.type} onChange={(e) => handleTaskFilterChange('type', e.target.value)}>
                        <option value="">All</option>
                        <option value="Case">Case</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Claim">Claim</option>
                        <option value="Power of Attorney">Power of Attorney</option>
                        <option value="Office Needs">Office Needs</option>
                    </select>
                </div>
                <div className="filter-item">
                    <label>Status</label>
                    <select className="form-control" value={taskFilters.status} onChange={(e) => handleTaskFilterChange('status', e.target.value)}>
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Finished">Finished</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div className="filter-item">
                    <label>Date</label>
                    <input type="date" className="form-control" value={taskFilters.date} onChange={(e) => handleTaskFilterChange('date', e.target.value)} />
                </div>
            </div>

            <div id="tasks-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-tasks"></i>
                        <p>No tasks found. Create a new task to get started.</p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} calculateRemainingTime={calculateRemainingTime} getStatusIcon={getStatusIcon} openModal={openModal} completeTask={completeTask} />
                    ))
                )}
            </div>
        </div>
    );
};

export default TasksView;
