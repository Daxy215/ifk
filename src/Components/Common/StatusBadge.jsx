import React from 'react';
import { useTranslation } from 'react-i18next';
import TaskStatus from "../../../Shared/Enums/TaskStatus";

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    
    switch (status) {
        case TaskStatus.ACTIVE:
            return (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {t('status.active')}
                </span>
            );
        case TaskStatus.DELAYED:
            return (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {t('status.delayed')}
                </span>
            );
        case TaskStatus.REVIEW:
            return (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {t('status.review')}
                </span>
            );
        case TaskStatus.COMPLETED:
            return (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {t('status.completed')}
                </span>
            );
        default:
            return null;
    }
};

export default StatusBadge;
