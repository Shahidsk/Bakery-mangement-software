import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import { getTodayAttendanceSummary } from '../services/attendanceService';
import { format } from 'date-fns';

export default function Dashboard() {
    const { employees, fetchEmployees } = useEmployeeStore();
    const { logout } = useAuthStore();
    const [attendanceSummary, setAttendanceSummary] = useState({ presentCount: 0, absentCount: 0, totalMarked: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await fetchEmployees();
            const summary = await getTodayAttendanceSummary();
            setAttendanceSummary(summary);
            setLoading(false);
        };
        loadData();
    }, [fetchEmployees]);

    const activeEmployees = employees.filter(e => e.is_active);

    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="page-wrapper fade-in">
            <div className="container">
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                        <h1 className="page-title">Dashboard</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-sm btn-secondary"
                        style={{ marginTop: '0.25rem' }}
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{activeEmployees.length}</div>
                        <div className="stat-label">Active Employees</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                            {attendanceSummary.presentCount}
                        </div>
                        <div className="stat-label">Present Today</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
                            {attendanceSummary.absentCount}
                        </div>
                        <div className="stat-label">Absent Today</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                            {activeEmployees.length - attendanceSummary.totalMarked}
                        </div>
                        <div className="stat-label">Not Marked</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-gray-700)', marginBottom: '0.75rem' }}>
                    Quick Actions
                </h2>
                <div className="quick-actions">
                    <Link to="/attendance" className="quick-action-btn">
                        <div className="quick-action-icon">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div className="quick-action-text">
                            <h4>Mark Attendance</h4>
                            <p>Record today's attendance</p>
                        </div>
                    </Link>

                    <Link to="/transactions" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="quick-action-text">
                            <h4>Add Expense / Advance</h4>
                            <p>Record advance or bakery purchase</p>
                        </div>
                    </Link>

                    <Link to="/employees" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%)' }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div className="quick-action-text">
                            <h4>Add Employee</h4>
                            <p>Register a new team member</p>
                        </div>
                    </Link>

                    <Link to="/salary-report" className="quick-action-btn">
                        <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="quick-action-text">
                            <h4>Salary Report</h4>
                            <p>View monthly salary calculations</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
