import { supabase } from '../supabase';

// Add a new transaction
export const addTransaction = async (transactionData) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                employee_id: transactionData.employeeId,
                type: transactionData.type,
                amount: transactionData.amount,
                description: transactionData.description || null,
                date: transactionData.date || new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, id: data.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get monthly transactions for an employee
export const getMonthlyTransactions = async (employeeId, month, year) => {
    try {
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('employee_id', employeeId)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

        const advances = data
            ?.filter(t => t.type === 'advance_salary')
            .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        const bakeryPurchases = data
            ?.filter(t => t.type === 'bakery_purchase')
            .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        return { advances, bakeryPurchases, transactions: data || [] };
    } catch (error) {
        console.error('Error fetching monthly transactions:', error);
        return { advances: 0, bakeryPurchases: 0, transactions: [] };
    }
};

// Get recent transactions
export const getRecentTransactions = async (limit = 20) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data?.map(t => ({
            id: t.id,
            employeeId: t.employee_id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date,
            createdAt: t.created_at
        })) || [];
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        return [];
    }
};
