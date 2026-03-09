import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Save,
    ClipboardList,
    Calendar,
    MapPin,
    Truck,
    Type,
    Package,
    Camera,
    Loader2,
    RefreshCcw,
    Image as ImageIcon,
    Clock,
    X,
    ChevronLeft,
    Phone,
    Info,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { analyzeDOImage } from '../utils/aiUtils';

const DOForm = ({ onAdd, initialData, onCancel }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState(initialData?.imageUrl || null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Close pickers on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.picker-container')) {
                setShowDatePicker(false);
                setShowTimePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const generateDONumber = () => {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `DO/${yyyy}${mm}${dd}/${random}`;
    };

    const [formData, setFormData] = useState(initialData ? {
        ...initialData,
        items: initialData.items.map(item => ({ ...item, id: item.id || Math.random() }))
    } : {
        doNumber: generateDONumber(),
        date: new Date().toISOString().split('T')[0],
        arrivalTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        sender: 'Koperasi Karya Surya Asri',
        receiver: 'MBG SPPG NURUL CENDIKIA CIBEUREUM',
        notes: '',
        items: [{ id: Date.now(), name: '', quantity: '', unit: 'Pcs' }]
    });

    const [units, setUnits] = useState(['Pcs', 'Box', 'Kg', 'Dus', 'Roll', 'Unit', 'Krat']);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (id, field, value) => {
        const newItems = formData.items.map(item => {
            if (item.id === id) {
                // If it's the unit field and it's a new unit, add it to our list
                if (field === 'unit' && value && !units.includes(value)) {
                    // Logic to add to units list if needed, or just let datalist handle it
                }
                return { ...item, [field]: value };
            }
            return item;
        });
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), name: '', quantity: '', unit: 'Pcs' }]
        }));
    };

    const removeItem = (id) => {
        if (formData.items.length === 1) {
            toast.warning('Minimal harus ada 1 item');
            return;
        }
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const base64String = canvas.toDataURL('image/jpeg', 0.7);
                setPreviewImage(base64String);
                processWithAI(base64String);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const processWithAI = async (base64) => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        const interval = setInterval(() => setAnalysisProgress(p => p >= 90 ? p : p + 10), 600);

        try {
            const data = await analyzeDOImage(base64);
            clearInterval(interval);
            setAnalysisProgress(100);
            if (data) {
                setTimeout(() => {
                    setFormData(prev => ({
                        ...prev,
                        doNumber: data.doNumber || prev.doNumber,
                        date: data.date || prev.date,
                        sender: data.sender || prev.sender,
                        receiver: data.receiver || prev.receiver,
                        items: data.items?.length > 0 ? data.items.map(i => ({ ...i, id: Date.now() + Math.random() })) : prev.items
                    }));
                    setIsAnalyzing(false);
                    setAnalysisProgress(0);
                    toast.success('Analisa Selesai!');
                }, 500);
            }
        } catch (e) {
            clearInterval(interval);
            setIsAnalyzing(false);
            setAnalysisProgress(0);
            toast.error('Gagal menganalisa gambar');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (!formData.doNumber || !formData.doNumber.startsWith('DO/')) {
            toast.error('Nomor DO tidak valid! Harus berformat DO/YYYYMMDD/XXXX');
            return;
        }
        if (!formData.date) {
            toast.error('Silakan pilih tanggal masuk');
            return;
        }
        if (!formData.arrivalTime) {
            toast.error('Silakan pilih jam masuk');
            return;
        }
        if (!formData.sender) {
            toast.error('Nama pengirim wajib diisi');
            return;
        }
        if (!formData.receiver) {
            toast.error('Nama penerima wajib diisi');
            return;
        }

        // Item Validation
        if (formData.items.length === 0) {
            toast.error('Minimal harus ada 1 item barang');
            return;
        }
        for (const item of formData.items) {
            if (!item.name || !item.quantity || !item.unit) {
                toast.error('Semua kolom item barang wajib diisi');
                return;
            }
            if (parseFloat(item.quantity) <= 0) {
                toast.error('Quantity barang harus lebih dari 0');
                return;
            }
        }

        setIsSaving(true);
        try {
            await onAdd(formData, previewImage);
            if (!initialData) onCancel(); // Or reset
        } finally {
            setIsSaving(false);
        }
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return 'Select Date';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return 'Select Time';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const DatePickerModal = () => {
        const isValidDate = (d) => d instanceof Date && !isNaN(d);
        const initialDate = new Date(formData.date);
        const [viewDate, setViewDate] = useState(isValidDate(initialDate) ? initialDate : new Date());
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        const isSelected = (day) => {
            const d = new Date(formData.date);
            if (isNaN(d.getTime())) return false;
            return d.getDate() === day && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
        };

        const handleDateSelect = (day) => {
            const year = viewDate.getFullYear();
            const month = String(viewDate.getMonth() + 1).padStart(2, '0');
            const date = String(day).padStart(2, '0');
            const dateStr = `${year}-${month}-${date}`;
            setFormData(prev => ({ ...prev, date: dateStr }));
            setShowDatePicker(false);
        };

        const changeMonth = (offset) => {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
        };

        return (
            <div style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 1000, marginTop: '8px',
                backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                width: '320px', border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button type="button" onClick={() => changeMonth(-1)} style={{ border: 'none', background: '#f8fafc', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                    <button type="button" onClick={() => changeMonth(1)} style={{ border: 'none', background: '#f8fafc', padding: '6px', borderRadius: '50%', cursor: 'pointer', transform: 'rotate(180deg)' }}><ChevronLeft size={18} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {days.map((day, i) => (
                        <div key={i} onClick={() => day && handleDateSelect(day)} style={{
                            height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: day ? 'pointer' : 'default',
                            fontSize: '0.875rem', fontWeight: isSelected(day) ? 700 : 500,
                            backgroundColor: isSelected(day) ? 'var(--primary)' : 'transparent',
                            color: isSelected(day) ? 'white' : (day ? '#111' : 'transparent'),
                            transition: 'all 0.2s'
                        }}>
                            {day}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowDatePicker(false)} style={{ border: 'none', backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                </div>
            </div>
        );
    };

    const TimePickerModal = () => {
        const [h24, m] = (formData.arrivalTime || '08:00').split(':');
        const initialH24 = parseInt(h24);

        // Convert 24h to 12h
        const initialPeriod = initialH24 >= 12 ? 'PM' : 'AM';
        const initialH12 = initialH24 % 12 || 12;

        const [tempH, setTempH] = useState(String(initialH12).padStart(2, '0'));
        const [tempM, setTempM] = useState(m);
        const [period, setPeriod] = useState(initialPeriod);

        const handleSaveTime = () => {
            let h = parseInt(tempH);
            if (period === 'PM' && h < 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;

            const finalH = String(h).padStart(2, '0');
            const finalM = String(tempM).padStart(2, '0');
            setFormData(prev => ({ ...prev, arrivalTime: `${finalH}:${finalM}` }));
            setShowTimePicker(false);
        };

        const handleHourChange = (val) => {
            let num = parseInt(val);
            if (isNaN(num)) num = 1;
            if (num > 12) num = 12;
            if (num < 1) num = 1;
            setTempH(String(num).padStart(2, '0'));
        };

        const handleMinuteChange = (val) => {
            let num = parseInt(val);
            if (isNaN(num)) num = 0;
            if (num > 59) num = 59;
            if (num < 0) num = 0;
            setTempM(String(num).padStart(2, '0'));
        };

        return (
            <div style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 1000, marginTop: '8px',
                backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                width: '320px', border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>Set Arrival Time</span>
                    <button type="button" onClick={() => setShowTimePicker(false)} style={{ border: 'none', background: '#f8fafc', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Hour</span>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={tempH}
                            onChange={(e) => setTempH(e.target.value)}
                            onBlur={(e) => handleHourChange(e.target.value)}
                            style={{
                                padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                                fontSize: '1.5rem', fontWeight: 700, textAlign: 'center',
                                backgroundColor: 'white', width: '70px', outline: 'none',
                                color: 'var(--primary)'
                            }}
                        />
                    </div>

                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cbd5e1', marginTop: '1.2rem' }}>:</span>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Min</span>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={tempM}
                            onChange={(e) => setTempM(e.target.value)}
                            onBlur={(e) => handleMinuteChange(e.target.value)}
                            style={{
                                padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                                fontSize: '1.5rem', fontWeight: 700, textAlign: 'center',
                                backgroundColor: 'white', width: '70px', outline: 'none',
                                color: 'var(--primary)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '1.2rem' }}>
                        <button
                            type="button"
                            onClick={() => setPeriod('AM')}
                            style={{
                                padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800,
                                backgroundColor: period === 'AM' ? 'var(--primary)' : 'white',
                                color: period === 'AM' ? 'white' : '#94a3b8',
                                cursor: 'pointer', transition: 'all 0.2s', border: period === 'AM' ? 'none' : '1px solid #e2e8f0'
                            }}
                        >AM</button>
                        <button
                            type="button"
                            onClick={() => setPeriod('PM')}
                            style={{
                                padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800,
                                backgroundColor: period === 'PM' ? 'var(--primary)' : 'white',
                                color: period === 'PM' ? 'white' : '#94a3b8',
                                cursor: 'pointer', transition: 'all 0.2s', border: period === 'PM' ? 'none' : '1px solid #e2e8f0'
                            }}
                        >PM</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setShowTimePicker(false)} style={{ flex: 1, border: 'none', backgroundColor: '#f1f5f9', padding: '0.85rem', borderRadius: '0.85rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button type="button" onClick={handleSaveTime} style={{ flex: 1, border: 'none', backgroundColor: 'var(--primary)', color: 'white', padding: '0.85rem', borderRadius: '0.85rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
            {/* Header Mobile Style */}
            <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <button type="button" onClick={onCancel} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Input Delivery Order</h2>
            </div>

            {/* AI Scan Banner */}
            <div className="card glass animate-fade-in" style={{
                padding: '1.5rem',
                border: '2px dashed var(--primary)',
                backgroundColor: 'rgba(30, 58, 138, 0.03)',
                textAlign: 'center',
                borderRadius: '1.25rem'
            }}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: '1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                        <Camera size={24} />
                    </div>
                    <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 700 }}>AI Smart Scan</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto' }}>Ambil foto surat jalan & biarkan AI mengisi form secara otomatis.</p>
                </div>

                {isAnalyzing ? (
                    <div style={{ padding: '0.5rem' }}>
                        <Loader2 className="animate-spin" color="var(--primary)" size={32} style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ width: '100%', maxWidth: '200px', margin: '0 auto', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${analysisProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s' }}></div>
                        </div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.75rem' }}>Menganalisa... {analysisProgress}%</p>
                    </div>
                ) : (
                    <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '400px' }}>
                        <input type="file" accept="image/*" onChange={handleImageUpload}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }} />
                        <button type="button" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.3)' }}>
                            <ImageIcon size={20} /> Ambil dari Kamera / Galeri
                        </button>
                    </div>
                )}

                {previewImage && !isAnalyzing && (
                    <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid var(--border)', maxWidth: '400px', margin: '1.25rem auto 0' }}>
                        <img src={previewImage} style={{ width: '45px', height: '45px', borderRadius: '0.5rem', objectFit: 'cover' }} alt="Preview" />
                        <span style={{ fontSize: '0.8rem', flex: 1, textAlign: 'left', fontWeight: 600 }}>Dokumen Terlampir</span>
                        <button type="button" onClick={() => setPreviewImage(null)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                )}
            </div>

            {/* Section: Main Info */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '1.25rem', overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem' }}>
                        <ClipboardList size={20} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Informasi Utama</h3>
                </div>

                <div className="form-row-desktop" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontWeight: 600 }}>Nomor DO</label>
                        <div style={{ position: 'relative' }}>
                            <input type="text" name="doNumber" value={formData.doNumber} onChange={handleChange} className="input-field" style={{ paddingRight: '2.5rem', borderRadius: '0.75rem' }} required />
                            <button type="button" onClick={() => setFormData(p => ({ ...p, doNumber: generateDONumber() }))}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                                <RefreshCcw size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="input-group picker-container" style={{ marginBottom: 0, position: 'relative' }}>
                        <label className="input-label" style={{ fontWeight: 600 }}>Tanggal Masuk</label>
                        <div
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '0.75rem', border: showDatePicker ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s'
                            }}
                        >
                            <Calendar size={18} style={{ color: showDatePicker ? 'var(--primary)' : '#94a3b8' }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>Date</p>
                                <input
                                    type="text"
                                    value={formData.date}
                                    onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                                    onFocus={() => { setShowDatePicker(true); setShowTimePicker(false); }}
                                    placeholder="YYYY-MM-DD"
                                    style={{
                                        border: 'none', background: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111', width: '100%', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                        {showDatePicker && <DatePickerModal />}
                    </div>

                    <div className="input-group picker-container" style={{ marginBottom: 0, position: 'relative' }}>
                        <label className="input-label" style={{ fontWeight: 600 }}>Jam Masuk DO</label>
                        <div
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '0.75rem', border: showTimePicker ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s'
                            }}
                        >
                            <Clock size={18} style={{ color: showTimePicker ? 'var(--primary)' : '#94a3b8' }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>Time</p>
                                <input
                                    type="text"
                                    value={formData.arrivalTime}
                                    onChange={(e) => setFormData(p => ({ ...p, arrivalTime: e.target.value }))}
                                    onFocus={() => { setShowTimePicker(true); setShowDatePicker(false); }}
                                    placeholder="HH:mm"
                                    style={{
                                        border: 'none', background: 'none', padding: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111', width: '100%', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                        {showTimePicker && <TimePickerModal />}
                    </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <label className="input-label" style={{ fontWeight: 600 }}>Status Transaksi</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isClosed: false }))}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                border: !formData.isClosed ? '2px solid var(--primary)' : '1px solid var(--border)',
                                backgroundColor: !formData.isClosed ? 'var(--primary-light)' : 'white',
                                color: !formData.isClosed ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Clock size={18} /> Pending
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isClosed: true }))}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                border: formData.isClosed ? '2px solid #059669' : '1px solid var(--border)',
                                backgroundColor: formData.isClosed ? '#ecfdf5' : 'white',
                                color: formData.isClosed ? '#059669' : 'var(--text-muted)',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <CheckCircle2 size={18} /> Delivered
                        </button>
                    </div>
                </div>
            </div>

            {/* Section: Sender & Receiver (Side by Side on Desktop) */}
            <div className="sender-receiver-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Section: Sender Details */}
                <div className="card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#1e3a8a' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem' }}>
                            <Truck size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Sender Details</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Asal pengiriman paket</p>
                        </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontWeight: 600 }}>Nama Pengirim</label>
                        <input list="sender-list" type="text" name="sender" value={formData.sender} onChange={handleChange} className="input-field" style={{ borderRadius: '0.75rem' }} placeholder="Masukkan nama pengirim" />
                        <datalist id="sender-list">
                            <option value="Koperasi Karya Surya Asri" />
                            <option value="Unit Produksi A" />
                            <option value="Gudang B" />
                        </datalist>
                    </div>
                </div>

                {/* Section: Receiver Details */}
                <div className="card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#1e3a8a' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem' }}>
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Receiver Details</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tujuan pengiriman paket</p>
                        </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontWeight: 600 }}>Nama Penerima</label>
                        <input list="receiver-list" type="text" name="receiver" value={formData.receiver} onChange={handleChange} className="input-field" style={{ borderRadius: '0.75rem' }} placeholder="Masukkan nama penerima" />
                        <datalist id="receiver-list">
                            <option value="MBG SPPG NURUL CENDIKIA CIBEUREUM" />
                            <option value="PT. Surya Abadi" />
                            <option value="Gudang Pusat" />
                        </datalist>
                    </div>
                </div>
            </div>

            {/* Section: Item Details */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e3a8a' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem' }}>
                            <Package size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Item Details</h3>
                    </div>
                    <button type="button" onClick={addItem} className="btn-secondary" style={{ padding: '0.5rem 1rem', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                {/* Desktop Table View */}
                <div className="desktop-only" style={{ overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'var(--bg-main)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Nama Barang</th>
                                <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', width: '120px' }}>Quantity</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', width: '150px' }}>Satuan</th>
                                <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', width: '80px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items.map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: idx === formData.items.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <input type="text" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="input-field" style={{ borderRadius: '0.5rem', border: '1px solid transparent', padding: '0.5rem', backgroundColor: 'transparent' }} placeholder="Contoh: Beras Premium" required />
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="input-field" style={{ borderRadius: '0.5rem', border: '1px solid transparent', padding: '0.5rem', textAlign: 'center', backgroundColor: 'transparent' }} placeholder="0" required />
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <input list="unit-options" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="input-field" style={{ borderRadius: '0.5rem', border: '1px solid transparent', padding: '0.5rem', backgroundColor: 'transparent' }} placeholder="Unit" required />
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                        {formData.items.length > 1 && (
                                            <button type="button" onClick={() => removeItem(item.id)} style={{ padding: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {formData.items.map((item, idx) => (
                        <div key={item.id} style={{
                            padding: '1.25rem',
                            backgroundColor: 'rgba(241, 245, 249, 0.5)',
                            borderRadius: '1rem',
                            border: '1px solid var(--border)',
                            position: 'relative'
                        }}>
                            {formData.items.length > 1 && (
                                <button type="button" onClick={() => removeItem(item.id)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '0.75rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 2 }}>
                                    <X size={14} />
                                </button>
                            )}

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Nama Barang</label>
                                <input type="text" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="input-field" style={{ borderRadius: '0.6rem' }} placeholder="Contoh: Beras Premium" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Quantity</label>
                                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="input-field" style={{ borderRadius: '0.6rem' }} placeholder="0" required />
                                </div>

                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Satuan</label>
                                    <input list="unit-options" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="input-field" style={{ borderRadius: '0.6rem' }} placeholder="Unit" required />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <datalist id="unit-options">
                {units.map(u => <option key={u} value={u} />)}
            </datalist>

            {/* Note & Actions */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <label className="input-label" style={{ fontWeight: 600 }}>Catatan Tambahan</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field"
                        style={{ minHeight: '100px', fontSize: '0.875rem', borderRadius: '0.75rem', padding: '1rem' }} placeholder="Keterangan tambahan jika ada..."></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '1rem', borderRadius: '1rem', border: 'none', backgroundColor: '#f1f5f9', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }} disabled={isSaving || isAnalyzing}>
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? 'Menyimpan...' : (initialData ? 'Update Delivery Order' : 'Submit Delivery Order')}
                    </button>
                </div>
            </div>

            {/* Help Info */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', backgroundColor: '#f0f9ff', borderRadius: '1.25rem', border: '1px solid #bae6fd' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '0.75rem', color: '#0369a1' }}>
                    <Info size={24} />
                </div>
                <div>
                    <h4 style={{ margin: '0 0 4px', color: '#0369a1', fontSize: '0.9rem', fontWeight: 700 }}>Tips Input Efisien</h4>
                    <p style={{ fontSize: '0.8rem', color: '#0369a1', lineHeight: '1.6', margin: 0 }}>
                        Gunakan fitur <strong>Smart Scan AI</strong> untuk memproses data dari foto secara otomatis. Pastikan tulisan di surat jalan terlihat jelas agar akurasi maksimal.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .form-row-desktop, .sender-receiver-grid, .item-row {
                        grid-template-columns: 1fr !important;
                        gap: 1rem !important;
                    }
                    .item-row {
                        padding: 1rem !important;
                    }
                    .item-row > .input-group:last-of-type {
                        margin-bottom: 0.5rem;
                    }
                }
            `}</style>
        </form>
    );
};

export default DOForm;
