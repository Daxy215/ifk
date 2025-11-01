const TaskStatus = Object.freeze({
    ALL      : 'ALL',       // كل الحالات
    ACTIVE   : 'ACTIVE',    // نشطة
    DELAYED  : 'DELAYED',   // متأخرة
    REVIEW   : 'REVIEW',    // مكتملة - للمراجعة
    COMPLETED: 'COMPLETED', // منتهية
});

export default TaskStatus;
