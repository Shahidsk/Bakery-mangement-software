import { useEffect, useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { saveAttendance, getAttendanceByDate } from '../services/attendanceService';
import Toggle from '../components/ui/Toggle';
import { format, addDays, subDays } from 'date-fns';

export default function Attendance() {
    const { employees, fetchEmployees } = useEmployeeStore();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const activeEmployees = employees.filter(e => e.is_active);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        const loadAttendance = async () => {
            setLoading(true);
            const records = await getAttendanceByDate(selectedDate);

            // Convert to object for easy lookup
            const recordsMap = {};
            records.forEach(r => {
                recordsMap[r.employeeId] = r.status === 'present';
            });

            setAttendanceRecords(recordsMap);
            setLoading(false);
        };

        loadAttendance();
    }, [selectedDate]);

    const handleToggle = (employeeId, isPresent) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [employeeId]: isPresent
        }));
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setSaving(true);

        const records = activeEmployees.map(emp => ({
            employeeId: emp.id,
            status: attendanceRecords[emp.id] ? 'present' : 'absent'
        }));

        const result = await saveAttendance(selectedDate, records);

        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }

        setSaving(false);
    };

    const changeDate = (days) => {
        const newDate = days > 0
            ? addDays(new Date(selectedDate), days)
            : subDays(new Date(selectedDate), Math.abs(days));
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    };

    const presentCount = Object.values(attendanceRecords).filter(v => v).length;
    const absentCount = activeEmployees.length - presentCount;

    return (
        <div className="page-wrapper fade-in">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Attendance</h1>
                    <p className="page-subtitle">Mark daily attendance for employees</p>
                </div>

                {/* Date Picker */}
                <div className="date-picker-header">
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => changeDate(-1)}
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="form-input"
                            style={{
                                width: 'auto',
                                padding: '0.5rem 1rem',
                                textAlign: 'center',
                                fontWeight: '600'
                            }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>
                            {format(new Date(selectedDate), 'EEEE')}
                        </p>
                    </div>

                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => changeDate(1)}
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Summary */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '0.75rem'
                }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-success)' }}>{presentCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Present</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--color-gray-200)' }}></div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-danger)' }}>{absentCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Absent</div>
                    </div>
                </div>

                {/* Employee List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading attendance...</p>
                    </div>
                ) : activeEmployees.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Active Employees</h3>
                        <p>Add employees first to mark attendance</p>
                    </div>
                ) : (
                    <div style={{ marginBottom: '1.5rem' }}>
                        {activeEmployees.map(employee => (
                            <div key={employee.id} className="employee-card">
                                <div className="employee-info">
                                    <h3>{employee.name}</h3>
                                    <p>
                                        {attendanceRecords[employee.id] ? (
                                            <span style={{ color: 'var(--color-success)' }}>Present</span>
                                        ) : (
                                            <span style={{ color: 'var(--color-danger)' }}>Absent</span>
                                        )}
                                    </p>
                                </div>
                                <Toggle
                                    checked={attendanceRecords[employee.id] || false}
                                    onChange={(value) => handleToggle(employee.id, value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Save Button */}
                {activeEmployees.length > 0 && (
                    <button
                        className={`btn btn-block btn-lg ${saveSuccess ? 'btn-success' : 'btn-primary'}`}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
                                Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Saved Successfully!
                            </>
                        ) : (
                            'Save Attendance'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
