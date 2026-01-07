import { supabase } from '../supabase';
import { format } from 'date-fns';

// Save attendance for a specific date
export const saveAttendance = async (date, records) => {
    try {
        const dateStr = format(new Date(date), 'yyyy-MM-dd');

        // Delete existing records for this date
        await supabase
            .from('attendance')
            .delete()
            .eq('date', dateStr);

        // Insert new records
        const { error } = await supabase
            .from('attendance')
            .insert(records.map(record => ({
                employee_id: record.employeeId,
                date: dateStr,
                status: record.status
            })));

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get attendance for a specific date
export const getAttendanceByDate = async (date) => {
    try {
        const dateStr = format(new Date(date), 'yyyy-MM-dd');
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('date', dateStr);

        if (error) throw error;

        return data?.map(r => ({
            id: r.id,
            employeeId: r.employee_id,
            date: r.date,
            status: r.status
        })) || [];
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return [];
    }
};

// Get monthly attendance for an employee
export const getMonthlyAttendance = async (employeeId, month, year) => {
    try {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endMonth = month === 12 ? 1 : month + 1;
        const endYear = month === 12 ? year + 1 : year;
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('employee_id', employeeId)
            .gte('date', startDate)
            .lt('date', endDate);

        if (error) throw error;

        const presentDays = data?.filter(r => r.status === 'present').length || 0;
        const absentDays = data?.filter(r => r.status === 'absent').length || 0;

        return { presentDays, absentDays, totalRecords: data?.length || 0 };
    } catch (error) {
        console.error('Error fetching monthly attendance:', error);
        return { presentDays: 0, absentDays: 0, totalRecords: 0 };
    }
};

// Get today's attendance summary
export const getTodayAttendanceSummary = async () => {
    try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const attendance = await getAttendanceByDate(today);

        const presentCount = attendance.filter(a => a.status === 'present').length;
        const absentCount = attendance.filter(a => a.status === 'absent').length;

        return { presentCount, absentCount, totalMarked: attendance.length };
    } catch (error) {
        console.error('Error fetching today attendance:', error);
        return { presentCount: 0, absentCount: 0, totalMarked: 0 };
    }
};
