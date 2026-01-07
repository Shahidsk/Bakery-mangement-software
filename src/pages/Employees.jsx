import { useEffect, useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import Modal from '../components/ui/Modal';
import { format } from 'date-fns';

export default function Employees() {
    const { employees, loading, fetchEmployees, addEmployee, toggleEmployeeStatus } = useEmployeeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        joiningDate: format(new Date(), 'yyyy-MM-dd'),
        basicSalary: '',
        dailyAllowance: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const result = await addEmployee({
            name: formData.name,
            joiningDate: new Date(formData.joiningDate),
            basicSalary: parseFloat(formData.basicSalary) || 0,
            dailyAllowance: parseFloat(formData.dailyAllowance) || 0
        });

        if (result.success) {
            setIsModalOpen(false);
            setFormData({
                name: '',
                joiningDate: format(new Date(), 'yyyy-MM-dd'),
                basicSalary: '',
                dailyAllowance: ''
            });
        }
        setSubmitting(false);
    };

    const handleToggleStatus = async (id) => {
        await toggleEmployeeStatus(id);
    };

    const activeEmployees = employees.filter(e => e.is_active);
    const inactiveEmployees = employees.filter(e => !e.is_active);

    return (
        <div className="page-wrapper fade-in">
            <div className="container">
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Employees</h1>
                        <p className="page-subtitle">{activeEmployees.length} active members</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                    </button>
                </div>

                {loading && employees.length === 0 ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading employees...</p>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="empty-state">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3>No Employees Yet</h3>
                        <p>Add your first employee to get started</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsModalOpen(true)}>
                            Add Employee
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Active Employees */}
                        {activeEmployees.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-gray-500)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Active ({activeEmployees.length})
                                </h2>
                                {activeEmployees.map(employee => (
                                    <div key={employee.id} className="employee-card">
                                        <div className="employee-info">
                                            <h3>{employee.name}</h3>
                                            <p>৳{employee.basic_salary?.toLocaleString()} / month • ৳{employee.daily_allowance} daily allowance</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span className="badge badge-success">Active</span>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleToggleStatus(employee.id)}
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Inactive Employees */}
                        {inactiveEmployees.length > 0 && (
                            <div>
                                <h2 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-gray-500)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Inactive ({inactiveEmployees.length})
                                </h2>
                                {inactiveEmployees.map(employee => (
                                    <div key={employee.id} className="employee-card" style={{ opacity: 0.7 }}>
                                        <div className="employee-info">
                                            <h3>{employee.name}</h3>
                                            <p>৳{employee.basic_salary?.toLocaleString()} / month</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span className="badge badge-danger">Inactive</span>
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleToggleStatus(employee.id)}
                                            >
                                                Activate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Add Employee Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Enter employee name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Joining Date</label>
                            <input
                                type="date"
                                name="joiningDate"
                                className="form-input"
                                value={formData.joiningDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Basic Salary (৳)</label>
                            <input
                                type="number"
                                name="basicSalary"
                                className="form-input"
                                placeholder="Monthly base salary"
                                value={formData.basicSalary}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Daily Food Allowance (৳)</label>
                            <input
                                type="number"
                                name="dailyAllowance"
                                className="form-input"
                                placeholder="Daily allowance amount"
                                value={formData.dailyAllowance}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
