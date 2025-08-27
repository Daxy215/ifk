import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectsView = ({ projects, filteredProjects,  clients, openModal, closeProject, assignCaseNumber, calculateRemainingTime, getStatusIcon, projectFilters, handleProjectFilterChange }) => {
    return (
        <div id="projects-view" className="view active">
            <div className="view-header">
                <h2>Project Management</h2>
                <button className="btn btn-primary" onClick={() => openModal('project')}>
                    <i className="fas fa-plus"></i> Add New Project
                </button>
            </div>

            <div className="filters">
                <div className="filter-item">
                    <label>Assigned To</label>
                    <select className="form-control" value={projectFilters.assigned} onChange={(e) => handleProjectFilterChange('assigned', e.target.value)}>
                        <option value="">All</option>
                        {clients.map(client => <option key={client.id} value={client.clientCompanyName}>{client.clientCompanyName}</option>)}
                    </select>
                </div>

                <div className="filter-item">
                    <label>Project Type</label>
                    <select className="form-control" value={projectFilters.type} onChange={(e) => handleProjectFilterChange('type', e.target.value)}>
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
                    <select className="form-control" value={projectFilters.status} onChange={(e) => handleProjectFilterChange('status', e.target.value)}>
                        <option value="">All</option>
                        <option value="Draft">Draft</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Closed">Closed/Finished</option>
                    </select>
                </div>
            </div>

            <div id="projects-list">
                {filteredProjects.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-briefcase"></i>
                        <p>No projects found. Create a new project to get started.</p>
                    </div>
                ) : (
                    filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} calculateRemainingTime={calculateRemainingTime} getStatusIcon={getStatusIcon} openModal={openModal} closeProject={closeProject} assignCaseNumber={assignCaseNumber} />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectsView;
