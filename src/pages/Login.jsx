import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
    const { user, login, loading, error, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo/Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '5rem',
                        height: '5rem',
                        borderRadius: '1.5rem',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 10px 40px rgba(37, 99, 235, 0.3)'
                    }}>
                        <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                        Bakery Manager
                    </h1>
                    <p style={{ color: 'var(--color-gray-500)', marginTop: '0.5rem' }}>
                        Sign in to manage your team
                    </p>
                </div>

                {/* Login Form */}
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--color-danger)',
                                    fontSize: '0.875rem',
                                    marginBottom: '1rem'
                                }}>
                                    {error}
                                    <button
                                        type="button"
                                        onClick={clearError}
                                        style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="admin@bakery.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg"
                                disabled={loading}
                                style={{ marginTop: '0.5rem' }}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '0.75rem', marginTop: '2rem' }}>
                    © 2026 Bakery Employee Management
                </p>
            </div>
        </div>
    );
}
