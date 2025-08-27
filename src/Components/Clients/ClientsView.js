import React from 'react';

import '../../App.css';

const ClientsView = ({ clients, openModal, deleteClient }) => (
    <div id="clients-view" className="view active">
        <div className="view-header">
            <h2>Client Management</h2>
            <button className="btn btn-primary" onClick={() => openModal('client')}>
                <i className="fas fa-plus"></i> Add New Client
            </button>
        </div>

        {clients.length === 0 ? (
            <div className="empty-state">
                <i className="fas fa-address-card"></i>
                <p>No clients found. Add a new client to get started.</p>
            </div>
        ) : (
            <table>
                <thead>
                    <tr>
                        <th>Client/Company Name</th>
                        <th>Email</th>
                        <th>Contact Officer</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td>{client.clientCompanyName}</td>
                            <td>{client.email}</td>
                            <td>{client.contactOfficer}</td>

                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn btn-primary" onClick={() => openModal('client', client)}>
                                        <i className="fas fa-edit"></i>Edit
                                    </button>
                                    <button className="action-btn btn-danger" onClick={() => deleteClient(client.id)}>
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

export default ClientsView;
