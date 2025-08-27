const TaskCard = ({ task, employees, openModal, completeTask, calculateRemainingTime, getStatusIcon }) => {
    const remaining = calculateRemainingTime(task.createdAt, task.duration);

    return (
        <div key={task.id} className="card">
            <div className="task-header">
                <div className="task-title">{task.title}</div>
                <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                    <i className={`fas ${getStatusIcon(task.status)}`}></i>
                    {task.status}
                </span>
            </div>

            <div className="task-body">
                <p><strong>Assigned to:</strong> {task.assignedTo || 'Unassigned'}</p>
                <p><strong>Due in:</strong> {remaining.days}d {remaining.hours}h {remaining.minutes}m</p>
                <p><strong>Description:</strong> {task.description}</p>
            </div>

            <div className="card-footer">
                <div className="action-buttons">
                    <button className="action-btn btn-primary" onClick={() => openModal('task', task)}>
                        <i className="fas fa-edit"></i>Edit
                    </button>
                    {task.status === 'Active' && (
                        <button className="action-btn btn-success" onClick={() => completeTask(task.id)}>
                            <i className="fas fa-check"></i>Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;