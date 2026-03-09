import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    FileSpreadsheet,
    FileText,
    Download,
    Search,
    Trash2,
    ExternalLink,
    Filter,
    Package,
    Edit3,
    Clock,
    X,
    ChevronRight,
    Printer,
    CheckCircle2
} from 'lucide-react';
import { exportToExcel, exportToPDF, exportToWord } from '../utils/exportUtils';
import { toast } from 'react-toastify';

const DOList = ({ dos, onDelete, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedDo, setSelectedDo] = useState(null);

    const filters = ['All', 'Pending', 'Delivered'];

    const filteredDos = dos.filter(item => {
        const matchesSearch = item.doNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sender.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeFilter === 'All') return matchesSearch;
        if (activeFilter === 'Pending') return matchesSearch ? !item.isClosed : false;
        if (activeFilter === 'Delivered') return matchesSearch ? item.isClosed : false;
        return matchesSearch;
    });

    const handleExport = (type, data) => {
        try {
            if (type === 'excel') exportToExcel(data);
            else if (type === 'pdf') exportToPDF(data);
            else if (type === 'word') exportToWord(data);
            toast.info(`Generating ${type.toUpperCase()} report...`);
        } catch (error) {
            console.error('Export Error:', error);
            toast.error('Gagal mengekspor data');
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Hapus data ini?')) {
            onDelete(id);
            toast.success('Dihapus');
            if (selectedDo?.id === id) setSelectedDo(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Desktop & Mobile Shared Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '2rem', border: '1px solid var(--border)', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => handleExport('excel', dos)} className="btn btn-secondary desktop-only">
                        <FileSpreadsheet size={18} /> Export Excel
                    </button>
                    <button onClick={() => handleExport('pdf', dos)} className="btn btn-primary">
                        <Printer size={18} /> <span className="desktop-only">Print All Reports</span>
                    </button>
                </div>
            </div>

            {/* Filter Tags */}
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '2rem',
                            border: 'none',
                            backgroundColor: activeFilter === f ? 'var(--primary)' : 'white',
                            color: activeFilter === f ? 'white' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Layout Switching: Desktop (Table + Sidebar) vs Mobile (Card List) */}
            <div className="layout-switcher">
                {/* DESKTOP VIEW (TABLE) */}
                <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: selectedDo ? '0.6fr 1.4fr' : '1fr', gap: '1.5rem', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', width: '100%' }}>
                    <div className="card" style={{ overflow: 'hidden', width: '100%' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'var(--bg-main)' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>Tanggal</th>
                                    <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>Jam Masuk</th>
                                    <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>No. DO</th>
                                    <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>Pengirim</th>
                                    <th style={{ textAlign: 'center', padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>Status</th>
                                    <th style={{ textAlign: 'right', padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDos.map(item => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedDo(item)}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            backgroundColor: selectedDo?.id === item.id ? 'var(--primary-light)' : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.date}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>{item.arrivalTime || '--:--'}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{item.doNumber.split('/').pop()}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.sender}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{
                                                backgroundColor: item.isClosed ? '#ecfdf5' : '#eff6ff',
                                                color: item.isClosed ? '#059669' : '#1e3a8a',
                                                padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 800, display: 'inline-block'
                                            }}>
                                                {item.isClosed ? 'Delivered' : 'Pending'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}><Edit3 size={18} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Desktop Detail Sidebar */}
                    {selectedDo && (
                        <div className="card animate-fade-in" style={{ padding: '2.5rem', height: 'fit-content', position: 'sticky', top: '1.5rem', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ backgroundColor: 'white', padding: '0.3rem', borderRadius: '0.75rem', display: 'flex', width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Detail Pengiriman</h3>
                                </div>
                                <button onClick={() => setSelectedDo(null)} style={{ border: 'none', background: '#f8fafc', padding: '8px', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} tabIndex={0}><X size={20} /></button>
                            </div>

                            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <FileText size={14} color="var(--primary)" />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nomor DO</p>
                                </div>
                                <p style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', margin: 0 }}>{selectedDo.doNumber}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <Filter size={12} color="var(--text-muted)" />
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>TANGGAL</p>
                                        </div>
                                        <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{selectedDo.date}</p>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <Clock size={12} color="var(--text-muted)" />
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>WAKTU</p>
                                        </div>
                                        <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{selectedDo.arrivalTime || '--:--'}</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                        <Package size={12} color="var(--text-muted)" />
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>PENGIRIM</p>
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{selectedDo.sender}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daftar Barang ({selectedDo.items.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {selectedDo.items.map((it, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.875rem 1.25rem',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '0.75rem',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{it.name}</span>
                                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>{it.quantity} {it.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={() => handleExport('word', [selectedDo])} className="btn btn-secondary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}>
                                        <Download size={16} /> Word
                                    </button>
                                    <button onClick={() => handleExport('pdf', [selectedDo])} className="btn btn-secondary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}>
                                        <Printer size={16} /> PDF
                                    </button>
                                </div>
                                <button onClick={() => { onEdit(selectedDo); setSelectedDo(null); }} className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}>
                                    <Edit3 size={16} /> Edit Transaction
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MOBILE VIEW (CARDS) */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    {filteredDos.length === 0 ? (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Package size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p>No results found</p>
                        </div>
                    ) : (
                        filteredDos.map(item => (
                            <div key={item.id} className="card animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${item.isClosed ? 'var(--success)' : 'var(--primary)'}` }} onClick={() => setSelectedDo(item)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '1rem',
                                        backgroundColor: item.isClosed ? '#ecfdf5' : '#eff6ff',
                                        color: item.isClosed ? '#059669' : '#1e3a8a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {item.isClosed ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                #{item.doNumber.split('/').pop()}
                                            </h4>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{item.items.length} Item</p>
                                            </div>
                                        </div>
                                        <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sender}</p>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                <Filter size={12} /> {item.date}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                                                <Clock size={12} /> {item.arrivalTime || '--:--'}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} color="#cbd5e1" style={{ flexShrink: 0 }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile Detail Modal Overlay */}
            {selectedDo && createPortal(
                <div className="mobile-only" style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999, // Super high z-index
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="animate-fade-in" style={{
                        width: '100%',
                        maxWidth: '450px',
                        backgroundColor: 'white',
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Delivery Transaction</p>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>#{selectedDo.doNumber.split('/').pop()}</h2>
                            </div>
                            <button onClick={() => setSelectedDo(null)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', padding: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedDo.date}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Time</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedDo.arrivalTime || '--:--'}</p>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>From Sender</p>
                                <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedDo.sender}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEM LIST ({selectedDo.items.length})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {selectedDo.items.map((it, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem 1.25rem',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '0.85rem',
                                        border: '1px solid #f1f5f9'
                                    }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{it.name}</span>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{it.quantity} {it.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedDo.imageUrl && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>EVIDENCE IMAGE</h4>
                                <img src={selectedDo.imageUrl} style={{ width: '100%', borderRadius: '1rem', border: '1px solid #e2e8f0' }} alt="DO" />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={() => { onEdit(selectedDo); setSelectedDo(null); }} className="btn btn-secondary" style={{ padding: '0.875rem', borderRadius: '0.75rem' }}>
                                <Edit3 size={18} /> Edit
                            </button>
                            <button onClick={() => handleDelete(selectedDo.id)} className="btn btn-secondary" style={{ padding: '0.875rem', borderRadius: '0.75rem', color: '#ef4444', backgroundColor: '#fee2e2' }}>
                                <Trash2 size={18} /> Delete
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                            <button onClick={() => handleExport('word', [selectedDo])} className="btn btn-primary" style={{ padding: '0.875rem', borderRadius: '0.75rem', fontSize: '0.9rem' }}>
                                <Download size={18} /> Word
                            </button>
                            <button onClick={() => handleExport('pdf', [selectedDo])} className="btn btn-primary" style={{ padding: '0.875rem', borderRadius: '0.75rem', fontSize: '0.9rem', backgroundColor: '#0f172a' }}>
                                <Printer size={18} /> PDF
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DOList;
