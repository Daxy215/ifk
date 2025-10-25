import React from 'react';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    
    switch (status) {
        case 'نشطة':
            return (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {t('status.active')}
                </span>
            );
        case 'متأخرة':
            return (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {t('status.delayed')}
                </span>
            );
        case 'مكتملة - للمراجعة':
            return (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {t('status.review')}
                </span>
            );
        case 'منتهية':
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
