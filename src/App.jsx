import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PlusCircle,
  History,
  LayoutDashboard,
  ChevronRight,
  LogOut,
  FileText,
  Users
} from 'lucide-react';

// Firebase imports
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
  where
} from 'firebase/firestore';

import Dashboard from './components/Dashboard';
import DOForm from './components/DOForm';
import DOList from './components/DOList';
import Login from './components/Login';
import UserList from './components/UserList';
import AIAssistant from './components/AIAssistant';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dos, setDos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingDo, setEditingDo] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isAdmin = user?.email === 'bisnistsm4@gmail.com';

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    if (!user) {
      setDos([]); // Clear data if not logged in
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (dos.length === 0) {
          toast.warning("Koneksi cloud lambat atau tidak ada data.", { autoClose: 3000 });
        }
      }
    }, 10000);

    // Filter by user email
    const q = query(
      collection(db, "delivery_orders"),
      where("userEmail", "==", user.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const doData = [];
      querySnapshot.forEach((doc) => {
        doData.push({ id: doc.id, ...doc.data() });
      });
      setDos(doData);
      setLoading(false);
      clearTimeout(timeout);
    }, (error) => {
      console.error("Firestore error:", error);
      clearTimeout(timeout);

      const errorMsg = error.code === 'permission-denied'
        ? "Izin ditolak. Anda hanya bisa melihat data milik sendiri."
        : error.message;

      // If index is missing, firestore provides a link in the console
      if (error.code === 'failed-precondition') {
        console.warn("Firestore needs an index for this query. Check console for the link.");
      }

      toast.error(`Gagal sinkronisasi: ${errorMsg}`, { autoClose: 10000 });
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user]);

  const addOrUpdateDo = async (doData, base64Image) => {
    if (!user) {
      toast.error("Sesi berakhir. Silakan login kembali.");
      return;
    }

    const operation = async () => {
      const finalImage = base64Image || (editingDo ? editingDo.imageUrl : null);

      const payload = {
        ...doData,
        imageUrl: finalImage,
        updatedAt: serverTimestamp(),
        userEmail: user.email // Save creator email for privacy
      };

      if (editingDo) {
        await updateDoc(doc(db, "delivery_orders", editingDo.id), payload);
        setEditingDo(null);
      } else {
        await addDoc(collection(db, "delivery_orders"), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }
      setActiveTab('list');
    };

    if (isAdmin && activeTab === 'users') {
      return (
        <div style={{ padding: '1.5rem' }}>
          <UserList />
        </div>
      );
    }

    return toast.promise(
      operation(),
      {
        pending: editingDo ? 'Memperbarui data...' : 'Sedang menyimpan data ke Cloud...',
        success: editingDo ? 'Data berhasil diperbarui! ✨' : 'Berhasil disimpan ke Cloud! 👌',
        error: 'Gagal memproses data. Periksa koneksi atau ukuran foto.'
      }
    );
  };

  const handleEdit = (doItem) => {
    setEditingDo(doItem);
    setActiveTab('form'); // Switch to form tab for editing
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info('Berhasil keluar');
    } catch (error) {
      toast.error('Gagal keluar');
    }
  };

  const deleteDo = async (id) => {
    try {
      await deleteDoc(doc(db, "delivery_orders", id));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Gagal menghapus data");
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'form', label: 'Input DO Baru', icon: PlusCircle },
    { id: 'list', label: 'Riwayat DO', icon: History },
    ...(isAdmin ? [{ id: 'users', label: 'Daftar Users', icon: Users }] : [])
  ];

  // TopBar Component
  const TopBar = () => (
    <header className="mobile-only" style={{
      height: 'var(--top-bar-height)',
      padding: '0 1.25rem',
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=eff6ff&color=1e3a8a`}
          alt="Avatar"
          style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        />
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Welcome back,</p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{user.displayName || 'User'}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{ backgroundColor: 'var(--bg-main)', border: 'none', padding: '0.6rem', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <LayoutDashboard size={20} />
        </button>
      </div>
    </header>
  );

  // BottomNav Component
  const BottomNav = () => (
    <nav className="mobile-only" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--bottom-nav-height)',
      backgroundColor: 'white',
      borderTop: '1px solid var(--border)',
      padding: '0 0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
      boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
    }}>
      <button onClick={() => { setActiveTab('dashboard'); setEditingDo(null); }}
        style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', flex: 1 }}>
        <LayoutDashboard size={22} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Home</span>
      </button>

      <button onClick={() => { setActiveTab('form'); setEditingDo(null); }}
        style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'form' ? 'var(--primary)' : 'var(--text-muted)', flex: 1 }}>
        <PlusCircle size={22} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Input DO</span>
      </button>

      <button onClick={() => { setActiveTab('list'); setEditingDo(null); }}
        style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-muted)', flex: 1 }}>
        <History size={22} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Riwayat</span>
      </button>

      {isAdmin && (
        <button onClick={() => setActiveTab('users')}
          style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)', flex: 1 }}>
          <Users size={22} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Users</span>
        </button>
      )}

      <button onClick={handleLogout}
        style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--danger)', flex: 1 }}>
        <LogOut size={22} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Keluar</span>
      </button>
    </nav>
  );

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const activeLabel = menuItems.find(i => i.id === activeTab)?.label;

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar - Desktop Only */}
      <aside className="desktop-only" style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#0f172a', /* Dark Navy */
        color: 'white',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 10
      }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
            <FileText size={24} color="white" />
          </div>
          <div>
            <h2 style={{ color: 'white', fontSize: '1rem', margin: 0, lineHeight: '1.2' }}>Koperasi Karya Surya Asri</h2>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-on-sidebar)', margin: 0, fontWeight: 700, letterSpacing: '1px' }}>ADMIN PANEL</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {menuItems.map((item) => (
            <button key={item.id}
              onClick={() => { setActiveTab(item.id); if (item.id !== 'form') setEditingDo(null); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', border: 'none',
                backgroundColor: activeTab === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: activeTab === item.id ? '#fff' : '#94a3b8', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0.25rem'
              }}
            >
              <item.icon size={20} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=eff6ff&color=1e3a8a`}
              alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', margin: 0 }}>{user.displayName}</p>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444' }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <div className="main-wrapper" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin 0.3s' }}>
        <TopBar />

        <main style={{ padding: '1.5rem', width: '100%', margin: '0' }}>
          <div className="desktop-only" style={{
            marginBottom: '2rem',
            padding: '1.5rem 2rem',
            backgroundColor: 'white',
            borderRadius: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '5px solid var(--primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>{activeLabel}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, margin: '4px 0 0' }}>
                Admin Portal <span style={{ color: 'var(--primary)' }}>&bull; Koperasi Karya Surya Asri</span>
              </p>
            </div>
          </div>

          <div className="animate-fade-in">
            {activeTab === 'users' && isAdmin ? (
              <UserList />
            ) : activeTab === 'form' ? (
              <DOForm onAdd={addOrUpdateDo} initialData={editingDo} onCancel={() => { setEditingDo(null); setActiveTab('list'); }} />
            ) : (
              loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '40vh', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && <Dashboard dos={dos} onNavigate={setActiveTab} />}
                  {activeTab === 'list' && <DOList dos={dos} onDelete={deleteDo} onEdit={handleEdit} />}
                </>
              )
            )}
          </div>
        </main>
      </div>

      <AIAssistant dos={dos} user={user} />

      <BottomNav />
      <ToastContainer position="bottom-center" />
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
           main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
