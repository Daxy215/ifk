import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ClientDetailsView = ({
                               selectedClient,
                               setActiveView,
                               setSelectedClientId,
                               projects,
                               tasks
                           }) => {
    const { t } = useTranslation();
    
    // TODO; HANDLE CLIENT
    const clientProjects = projects.filter(p => p.client_id === selectedClient?.client_id);
    
    const getProjectStartDate = (project) => {
        const projectTasks = tasks.filter(t => t.project_id === project.project_id);
        if (projectTasks.length === 0) return t('clients.na');
        const earliestTask = projectTasks.reduce((earliest, current) => new Date(current.created_at) < new Date(earliest.createdAt) ? current : earliest);
        return new Date(earliestTask.created_at).toLocaleDateString('ar-EG');
    };

    return (
        <div className="p-6">
            {selectedClient ? (
                <>
                    <button onClick={() => { setActiveView('clients'); setSelectedClientId(null); }} className="flex items-center gap-2 mb-6 text-sm text-blue-600 hover:underline">
                        <ArrowRight size={16} /><span>{t('clients.backToClients')}</span>
                    </button>
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedClient.name}</h2>
                            <p className="text-gray-500">{selectedClient.email}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold mb-4">{t('clients.clientProjects')}</h3>
                        <table className="w-full text-sm text-right text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">{t('clients.projectName')}</th>
                                <th className="px-4 py-3">{t('clients.projectType')}</th>
                                <th className="px-4 py-3">{t('clients.startDate')}</th>
                                <th className="px-4 py-3">{t('clients.endDate')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {clientProjects.map(project => (
                                <tr key={project.project_id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold">{project.name}</td>
                                    <td className="px-4 py-3">{project.type}</td>
                                    <td className="px-4 py-3">{getProjectStartDate(project)}</td>
                                    <td className="px-4 py-3">{project.closedAt ? new Date(project.closedAt).toLocaleDateString('ar-EG') : t('clients.pending')}</td>
                                </tr>
                            ))}
                            {clientProjects.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-10 text-gray-500">{t('clients.noProjects')}</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default ClientDetailsView;
