const ProjectCard = ({ project, openModal, closeProject, assignCaseNumber, calculateRemainingTime, getStatusIcon }) => {
    const remaining = calculateRemainingTime(project.startDate, project.duration);
    const timeElapsed = Math.floor((new Date() - project.startDate) / (1000 * 60 * 60 * 24));

    return (
        <div key={project.id} className="card">
            <div className="card-header">
                <div className="card-title">{project.caseNumber || 'DRAFT'} - {project.description}</div>
                <span className={`badge badge-${project.status.toLowerCase().replace(' ', '-')}`}>
                    <i className={`fas ${getStatusIcon(project.status)}`}></i>
                    {project.status}
                </span>
            </div>
            <div className="card-body">
                <p><strong>Project Type:</strong> {project.projectType}</p>
                <p><strong>Client:</strong> {project.client}</p>
                {/*<p><strong>Progress:</strong> {project.progress}%</p>
                <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${project.progress}%`}}></div>
                </div>*/}
                <p><strong>Tasks: </strong> {project.completedTasks}/{project.tasks.length} completed</p>
                <p><strong>Time elapsed:</strong> {timeElapsed} days</p>
                <div className="timer">
                    Time remaining: {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
                </div>
            </div>
            <div className="card-footer">
                <div className="action-buttons">
                    <button className="action-btn btn-primary" onClick={() => openModal('project', project)}>
                        <i className="fas fa-edit"></i>Edit
                    </button>

                    {project.status === 'Draft' ? (
                        <button className="action-btn btn-success" onClick={() => openModal('project', project)}>
                            <i className="fas fa-plus"></i>Assign Case Number
                        </button>
                    ) : (
                        <button className="action-btn btn-warning" onClick={() => closeProject(project.id)}>
                            <i className="fas fa-times"></i>Close Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
