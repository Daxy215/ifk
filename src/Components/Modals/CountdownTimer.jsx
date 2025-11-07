import React, { useState, useEffect, useMemo } from 'react';
import TaskStatus from '@/Components/Common/Enums/TaskStatus';

import t from 'i18next'

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
                
                if (currentStatus && ![TaskStatus.DELAYED,TaskStatus.REVIEW,TaskStatus.COMPLETED].includes(currentStatus))
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
        if (interval >= 1) {
            const days = Math.floor(interval);
            return t(days === 1 ? 'timer.days.one' : 'timer.days.other', { count: days });
        }
        
        interval = seconds / 3600;
        if (interval >= 1) {
            const hours = Math.floor(interval);
            return t(hours === 1 ? 'timer.hours.one' : 'timer.hours.other', { count: hours });
        }
        
        const minutes = Math.floor(seconds / 60);
        return t(minutes === 1 ? 'timer.minutes.one' : 'timer.minutes.other', { count: minutes });
    };
    
    return <div className={`text-xs ${isLate ? 'text-red-500 font-bold' : 'text-gray-700'}`}>
        <div>{timeLeft}</div>
        <div className="text-gray-400">{timeSince(startDate)}</div>
    </div>;
};

export default CountdownTimer;
