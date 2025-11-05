import React from 'react';
import { Plus, Search, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ClientsView = ({
                         clients,
                         clientSearch,
                         setClientSearch,
                         filteredClients,
                         handleEditClient,
                         viewClientDetails,
                         setShowNewClientModal
                     }) => {
    const { t } = useTranslation();
    
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('clients.manageClients')}</h2>
                <button onClick={() => setShowNewClientModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus size={20} /><span>{t('clients.newClient')}</span>
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text"
                       placeholder={t('clients.searchClient')}
                       value={clientSearch}
                       onChange={(e) => setClientSearch(e.target.value)}
                       className="w-full pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <table className="w-full text-sm text-right text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-3">{t('clients.clientName')}</th>
                        <th className="px-4 py-3">{t('clients.email')}</th>
                        <th className="px-4 py-3">{t('clients.phone')}</th>
                        <th className="px-4 py-3">{t('clients.contactOfficer')}</th>
                        <th className="px-4 py-3">{t('clients.actions')}</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredClients.map(client => (
                        <tr key={client.client_id} className="border-b hover:bg-gray-50">
                            <td
                                className="px-4 py-3 font-semibold cursor-pointer hover:text-blue-600"
                                onClick={() => viewClientDetails(client.client_id)}
                            >
                                {client.name}
                            </td>
                            <td className="px-4 py-3">{client.email}</td>
                            <td className="px-4 py-3">{client.phone}</td>
                            <td className="px-4 py-3">{client.contact_officer}</td>
                            <td className="px-4 py-3 flex items-center gap-2">
                                <button
                                    onClick={() => handleEditClient(client.client_id)}
                                    className="p-2 text-gray-500 hover:text-blue-600"
                                    title={t('clients.edit')}
                                >
                                    <Edit size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default ClientsView;
