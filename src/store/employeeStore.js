import { create } from 'zustand';
import { supabase } from '../supabase';

export const useEmployeeStore = create((set, get) => ({
    employees: [],
    loading: false,
    error: null,

    // Fetch all employees
    fetchEmployees: async () => {
        try {
            set({ loading: true, error: null });
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('name');

            if (error) throw error;

            set({ employees: data || [], loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Get active employees only
    getActiveEmployees: () => {
        return get().employees.filter(emp => emp.is_active);
    },

    // Add new employee (with optimistic update)
    addEmployee: async (employeeData) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticEmployee = {
            id: tempId,
            ...employeeData,
            is_active: true,
            created_at: new Date().toISOString()
        };

        // Optimistic update
        set(state => ({
            employees: [...state.employees, optimisticEmployee].sort((a, b) => a.name.localeCompare(b.name))
        }));

        try {
            const { data, error } = await supabase
                .from('employees')
                .insert({
                    name: employeeData.name,
                    joining_date: employeeData.joiningDate,
                    basic_salary: employeeData.basicSalary,
                    daily_allowance: employeeData.dailyAllowance,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            // Replace temp with real data
            set(state => ({
                employees: state.employees
                    .map(emp => emp.id === tempId ? data : emp)
                    .sort((a, b) => a.name.localeCompare(b.name))
            }));

            return { success: true, id: data.id };
        } catch (error) {
            // Rollback on error
            set(state => ({
                employees: state.employees.filter(emp => emp.id !== tempId),
                error: error.message
            }));
            return { success: false, error: error.message };
        }
    },

    // Update employee
    updateEmployee: async (id, updateData) => {
        try {
            set({ loading: true, error: null });
            const { error } = await supabase
                .from('employees')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            await get().fetchEmployees();
            return { success: true };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    // Toggle employee status (optimistic)
    toggleEmployeeStatus: async (id) => {
        const employee = get().employees.find(emp => emp.id === id);
        if (!employee) return;

        const newStatus = !employee.is_active;

        // Optimistic update
        set(state => ({
            employees: state.employees.map(emp =>
                emp.id === id ? { ...emp, is_active: newStatus } : emp
            )
        }));

        try {
            const { error } = await supabase
                .from('employees')
                .update({ is_active: newStatus })
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            // Rollback
            set(state => ({
                employees: state.employees.map(emp =>
                    emp.id === id ? { ...emp, is_active: !newStatus } : emp
                ),
                error: error.message
            }));
            return { success: false, error: error.message };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
