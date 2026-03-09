import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Users, Mail, Calendar, UserCheck } from 'lucide-react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userData = [];
            snapshot.forEach((doc) => {
                userData.push({ id: doc.id, ...doc.data() });
            });
            setUsers(userData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #eff6ff', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{ padding: '0.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>Daftar Pengguna Sistem</h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Daftar seluruh user yang telah terdaftar dan aktif di aplikasi.</p>
            </div>

            <div className="desktop-only" style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>User</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Email</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Terakhir Login</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=eff6ff&color=1e3a8a`}
                                            alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        <span style={{ fontWeight: 600 }}>{user.displayName || 'No Name'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: '#64748b' }}>{user.email}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    {user.lastLogin?.toDate().toLocaleString('id-ID') || '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#166534' }}>
                                        Aktif
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((user) => (
                    <div key={user.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=eff6ff&color=1e3a8a`}
                                alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            <div>
                                <p style={{ fontWeight: 700, margin: 0 }}>{user.displayName || 'No Name'}</p>
                                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{user.email}</p>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Login: {user.lastLogin?.toDate().toLocaleDateString('id-ID')}</span>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534' }}>Aktif</span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UserList;
