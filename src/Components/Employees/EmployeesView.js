import React from 'react';

const EmployeesView = ({ employees, openModal, deleteEmployee }) => (
    <div id="employees-view" className="view active">
        <div className="view-header">
            <h2>Employee Management</h2>
            <button className="btn btn-primary" onClick={() => openModal('employee')}>
                <i className="fas fa-plus"></i> Add New Employee
            </button>
        </div>

        {employees.length === 0 ? (
            <div className="empty-state">
                <i className="fas fa-users"></i>
                <p>No employees found. Add a new employee to get started.</p>
            </div>
        ) : (
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Job Title</th>
                        <th>Email</th>
                        <th>Contact Officer</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.jobTitle}</td>
                            <td>{employee.email}</td>
                            <td>{employee.contactOfficer}</td>

                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn btn-primary" onClick={() => openModal('employee', employee)}>
                                        <i className="fas fa-edit"></i>Edit
                                    </button>
                                    <button className="action-btn btn-danger" onClick={() => deleteEmployee(employee.id)}>
                                        <i className="fas fa-trash"></i>Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

export default EmployeesView;
