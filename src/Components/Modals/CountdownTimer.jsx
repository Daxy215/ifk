import React, { useState, useEffect, useMemo } from 'react';
import TaskStatus from '@/Components/Common/TaskStatus';

const CountdownTimer = ({ startDate, durationDays, currentStatus, onTaskLate }) => {
    const calculateDueDate = useMemo(() => {
        if (!startDate || !durationDays) return null;
        const start = new Date(startDate);
        return new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    }, [startDate, durationDays]);
    
    const [timeLeft, setTimeLeft] = useState('');
    const [isLate, setIsLate] = useState(false);
    
    const updateTimeLeft = () => {
        if (!calculateDueDate) return;
        
        const now = new Date();
        const total = calculateDueDate.getTime() - now.getTime();
        
        if (total <= 0) {
            if (!isLate) {
                setIsLate(true);
                setTimeLeft(TaskStatus.DELAYED);
                        
                if (currentStatus && ![TaskStatus.DELAYED,'مكتملة - للمراجعة','منتهية'].includes(currentStatus))
                    onTaskLate();
            }
            
            return;
        }
        
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        
        setTimeLeft(`${days}ي ${hours}س ${minutes}د ${seconds}ث`);
    };
    
    useEffect(() => {
        updateTimeLeft();
        
        if (!calculateDueDate) return;
        
        const interval = setInterval(updateTimeLeft, 1000);
        
        return () => clearInterval(interval);
    }, [calculateDueDate, onTaskLate, isLate]);
    
    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 86400;
        
        if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
        
        interval = seconds / 3600;
        
        if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
            
        return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    }
        
    return <div className={`text-xs ${isLate ? 'text-red-500 font-bold' : 'text-gray-700'}`}>
        <div>{timeLeft}</div>
        <div className="text-gray-400">{timeSince(startDate)}</div>
    </div>;
};

export default CountdownTimer;
