import React from 'react';
import {
    LayoutDashboard,
    Package,
    CheckCircle2,
    Clock,
    Plus,
    Truck,
    ChevronRight,
    Search,
    Bell
} from 'lucide-react';

const StatCardLarge = ({ label, value, subtext, icon: Icon }) => (
    <div className="card" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.75rem' }}>{label}</p>
                <h2 style={{ fontSize: '3rem', margin: 0, color: 'white' }}>{value}</h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem' }}>{subtext}</p>
            </div>
            <div style={{ opacity: 0.3 }}>
                <Icon size={48} strokeWidth={1.5} />
            </div>
        </div>
    </div>
);

const StatCardSmall = ({ label, value, icon: Icon, color, iconColor }) => (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{value}</h3>
        </div>
        <div style={{ color: iconColor }}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = ({ dos, onNavigate }) => {
    const pendingCount = dos.filter(d => !d.isClosed).length;
    const deliveredCount = dos.length - pendingCount;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Action/Heading Grid */}
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr',
                gap: '1.5rem'
            }}>
                {/* Main Highlight Card */}
                <StatCardLarge
                    label="Active Orders"
                    value={dos.length}
                    subtext="Overall system performance"
                    icon={Truck}
                />

                {/* Small Stats Vertical Column for Desktop / Grid for Mobile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <StatCardSmall
                        label="Pending"
                        value={pendingCount}
                        icon={Clock}
                        iconColor="#1e3a8a"
                    />
                    <StatCardSmall
                        label="Delivered"
                        value={deliveredCount}
                        icon={CheckCircle2}
                        iconColor="#10b981"
                    />
                </div>
            </div>

            {/* Content Row: Recent Orders & Banner */}
            <div className="dashboard-content-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                {/* Recent Orders Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Recent Orders</h3>
                        <button
                            onClick={() => onNavigate('list')}
                            style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                        >
                            View all
                        </button>
                    </div>

                    {dos.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderStyle: 'dashed' }}>
                            <Package size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Belum ada riwayat pesanan.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {dos.slice(0, 4).map((item) => (
                                <div key={item.id} className="card animate-fade-in" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '0.75rem',
                                        backgroundColor: '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1e3a8a'
                                    }}>
                                        <Package size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>#{item.doNumber.split('/').pop() || item.id.slice(-5)}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sender}</p>
                                    </div>
                                    <div className="desktop-only" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {item.date}
                                    </div>
                                    <div>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            backgroundColor: item.isClosed ? '#ecfdf5' : '#eff6ff',
                                            color: item.isClosed ? '#059669' : '#1e3a8a',
                                            textTransform: 'uppercase'
                                        }}>
                                            {item.isClosed ? 'Delivered' : 'Pending'}
                                        </span>
                                    </div>
                                    <ChevronRight size={16} color="var(--border)" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Banner/Tracking Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card" style={{
                        flex: 1,
                        position: 'relative',
                        backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '1.25rem',
                        minHeight: '200px'
                    }}>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'
                        }}></div>
                        <div className="glass" style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                        }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase' }}>Live Tracking</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>System connected to GPS</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .dashboard-grid, .dashboard-content-row {
                        grid-template-columns: 1fr !important;
                    }
                    .dashboard-grid { gap: 1rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
