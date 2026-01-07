import { useEffect, useState, useMemo } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { getMonthlyAttendance } from '../services/attendanceService';
import { getMonthlyTransactions } from '../services/transactionService';

export default function SalaryReport() {
    const { employees, fetchEmployees } = useEmployeeStore();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [salaryData, setSalaryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Memoize active employees to prevent infinite loop
    const activeEmployees = useMemo(() =>
        employees.filter(e => e.is_active),
        [employees]
    );

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        const calculateSalaries = async () => {
            if (activeEmployees.length === 0) {
                setSalaryData([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const salaryPromises = activeEmployees.map(async (employee) => {
                    // Get attendance data
                    const attendance = await getMonthlyAttendance(employee.id, selectedMonth, selectedYear);

                    // Get transactions data
                    const transactions = await getMonthlyTransactions(employee.id, selectedMonth, selectedYear);

                    // Calculate salary
                    const foodAllowance = (employee.daily_allowance || 0) * attendance.presentDays;
                    const totalAdvances = transactions.advances || 0;
                    const bakeryDeductions = transactions.bakeryPurchases || 0;

                    const finalSalary = (employee.basic_salary || 0)
                        + foodAllowance
                        - totalAdvances
                        - bakeryDeductions;

                    return {
                        id: employee.id,
                        name: employee.name,
                        basicSalary: employee.basic_salary || 0,
                        dailyAllowance: employee.daily_allowance || 0,
                        daysPresent: attendance.presentDays,
                        daysAbsent: attendance.absentDays,
                        foodAllowance,
                        totalAdvances,
                        bakeryDeductions,
                        finalSalary
                    };
                });

                const data = await Promise.all(salaryPromises);
                setSalaryData(data);
            } catch (error) {
                console.error('Error calculating salaries:', error);
            }
            setLoading(false);
        };

        calculateSalaries();
    }, [activeEmployees, selectedMonth, selectedYear]);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const years = [];
    for (let y = 2024; y <= 2030; y++) {
        years.push(y);
    }

    const totalPayable = salaryData.reduce((sum, emp) => sum + emp.finalSalary, 0);

    return (
        <div className="page-wrapper fade-in">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Salary Report</h1>
                    <p className="page-subtitle">Monthly salary calculations</p>
                </div>

                {/* Month/Year Selector */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-body" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Month</label>
                                <select
                                    className="form-input"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    style={{ padding: '0.5rem' }}
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Year</label>
                                <select
                                    className="form-input"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    style={{ padding: '0.5rem' }}
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Summary */}
                {!loading && salaryData.length > 0 && (
                    <div className="stat-card" style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: 'white' }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Payable</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>৳{totalPayable.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                            {months.find(m => m.value === selectedMonth)?.label} {selectedYear} • {salaryData.length} employees
                        </div>
                    </div>
                )}

                {/* Salary Table */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Calculating salaries...</p>
                    </div>
                ) : salaryData.length === 0 ? (
                    <div className="empty-state">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3>No Employees to Calculate</h3>
                        <p>Add active employees to generate salary reports</p>
                    </div>
                ) : (
                    <div>
                        {salaryData.map(emp => (
                            <div key={emp.id} className="card" style={{ marginBottom: '0.75rem' }}>
                                <div className="card-body" style={{ padding: '1rem' }}>
                                    {/* Employee Name */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.75rem',
                                        paddingBottom: '0.75rem',
                                        borderBottom: '1px solid var(--color-gray-100)'
                                    }}>
                                        <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>{emp.name}</h3>
                                        <span style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '700',
                                            color: emp.finalSalary >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                        }}>
                                            ৳{emp.finalSalary.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Salary Breakdown */}
                                    <div style={{ fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--color-gray-500)' }}>Basic Salary</span>
                                            <span>৳{emp.basicSalary.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--color-gray-500)' }}>
                                                Food Allowance ({emp.daysPresent} days × ৳{emp.dailyAllowance})
                                            </span>
                                            <span style={{ color: 'var(--color-success)' }}>+৳{emp.foodAllowance.toLocaleString()}</span>
                                        </div>
                                        {emp.totalAdvances > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ color: 'var(--color-gray-500)' }}>Cash Advances</span>
                                                <span style={{ color: 'var(--color-danger)' }}>-৳{emp.totalAdvances.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {emp.bakeryDeductions > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ color: 'var(--color-gray-500)' }}>Bakery Purchases</span>
                                                <span style={{ color: 'var(--color-danger)' }}>-৳{emp.bakeryDeductions.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Attendance Info */}
                                    <div style={{
                                        marginTop: '0.75rem',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid var(--color-gray-100)',
                                        display: 'flex',
                                        gap: '1rem',
                                        fontSize: '0.75rem'
                                    }}>
                                        <span className="badge badge-success">Present: {emp.daysPresent}</span>
                                        <span className="badge badge-danger">Absent: {emp.daysAbsent}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
