import { useEffect, useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { addTransaction, getRecentTransactions } from '../services/transactionService';
import { format } from 'date-fns';

export default function Transactions() {
    const { employees, fetchEmployees } = useEmployeeStore();
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: '',
        type: 'advance_salary',
        amount: '',
        description: ''
    });

    const activeEmployees = employees.filter(e => e.is_active);

    useEffect(() => {
        const loadData = async () => {
            await fetchEmployees();
            const transactions = await getRecentTransactions(15);
            setRecentTransactions(transactions);
            setLoading(false);
        };
        loadData();
    }, [fetchEmployees]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const result = await addTransaction({
            employeeId: formData.employeeId,
            type: formData.type,
            amount: parseFloat(formData.amount) || 0,
            description: formData.description,
            date: new Date()
        });

        if (result.success) {
            setSuccess(true);
            setFormData({
                employeeId: '',
                type: 'advance_salary',
                amount: '',
                description: ''
            });

            // Refresh transactions
            const transactions = await getRecentTransactions(15);
            setRecentTransactions(transactions);

            setTimeout(() => setSuccess(false), 3000);
        }

        setSubmitting(false);
    };

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.name : 'Unknown';
    };

    const formatTransactionDate = (date) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return format(d, 'MMM d, yyyy');
    };

    return (
        <div className="page-wrapper fade-in">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Expenses & Advances</h1>
                    <p className="page-subtitle">Record cash advances and bakery purchases</p>
                </div>

                {/* Form */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {success && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--color-success)',
                                    fontSize: '0.875rem',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Transaction recorded successfully!
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Select Employee</label>
                                <select
                                    name="employeeId"
                                    className="form-input"
                                    value={formData.employeeId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Choose an employee...</option>
                                    {activeEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Transaction Type</label>
                                <select
                                    name="type"
                                    className="form-input"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="advance_salary">💵 Cash Advance</option>
                                    <option value="bakery_purchase">🥐 Bakery Food Purchase</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Amount (৳)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="form-input"
                                    placeholder="Enter amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="form-input"
                                    placeholder="Add a note..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                                {submitting ? 'Recording...' : 'Record Transaction'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Transactions */}
                <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-gray-700)', marginBottom: '0.75rem' }}>
                    Recent Transactions
                </h2>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : recentTransactions.length === 0 ? (
                    <div className="empty-state">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                        </svg>
                        <h3>No Transactions Yet</h3>
                        <p>Record your first transaction above</p>
                    </div>
                ) : (
                    <div>
                        {recentTransactions.map(transaction => (
                            <div key={transaction.id} className="employee-card">
                                <div className="employee-info">
                                    <h3>{getEmployeeName(transaction.employeeId)}</h3>
                                    <p>
                                        {transaction.type === 'advance_salary' ? '💵 Cash Advance' : '🥐 Bakery Purchase'}
                                        {transaction.description && ` • ${transaction.description}`}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                        {formatTransactionDate(transaction.date || transaction.createdAt)}
                                    </p>
                                </div>
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '700',
                                    color: 'var(--color-danger)'
                                }}>
                                    -৳{transaction.amount?.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
