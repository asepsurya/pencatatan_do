import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import {
    LogIn,
    FileText,
    Loader2,
    Mail,
    Lock,
    CheckCircle2,
    Chrome,
    UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Login = () => {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const saveUserProfile = async (user) => {
        try {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await saveUserProfile(result.user);
            toast.success('Berhasil masuk dengan Google!');
        } catch (error) {
            console.error('Login error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error('Gagal masuk: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.warning('Mohon isi email dan password');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'signup') {
                if (!fullName) {
                    toast.warning('Mohon isi nama lengkap');
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: fullName });
                await saveUserProfile(userCredential.user);
                toast.success('Akun berhasil dibuat!');
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await saveUserProfile(userCredential.user);
                toast.success('Berhasil masuk!');
            }
        } catch (error) {
            console.error('Auth error:', error);
            let msg = 'Gagal memproses. ';
            if (error.code === 'auth/user-not-found') msg += 'Email tidak terdaftar.';
            else if (error.code === 'auth/wrong-password') msg += 'Password salah.';
            else if (error.code === 'auth/email-already-in-use') msg += 'Email sudah digunakan.';
            else msg += error.message;
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: 'white',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Left Side: Form */}
            <div
                className="login-form-container"
                style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2rem 4rem',
                    justifyContent: 'center',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4rem' }}>
                    <div style={{ backgroundColor: '#000', padding: '0.5rem', borderRadius: '0.5rem' }}>
                        <FileText color="white" size={24} />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Koperasi Karya Surya Asri</span>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#111' }}>
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
                        {mode === 'signin' ? 'Welcome Back, Please enter Your details' : 'Join us to start managing your Delivery Orders'}
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f4f4f5',
                    padding: '4px',
                    borderRadius: '0.75rem',
                    marginBottom: '2rem',
                }}>
                    <button
                        onClick={() => setMode('signin')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: '0.6rem',
                            backgroundColor: mode === 'signin' ? 'white' : 'transparent',
                            color: mode === 'signin' ? '#111' : '#666',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: mode === 'signin' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: '0.6rem',
                            backgroundColor: mode === 'signup' ? 'white' : 'transparent',
                            color: mode === 'signup' ? '#111' : '#666',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: mode === 'signup' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        Signup
                    </button>
                </div>

                <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {mode === 'signup' && (
                        <div className="input-group" style={{ margin: 0 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                                    <UserPlus size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="input-field"
                                    style={{
                                        padding: '1rem 1rem 1rem 3rem',
                                        borderRadius: '0.9rem',
                                        fontSize: '1rem',
                                        border: '1px solid #e2e8f0',
                                        width: '100%',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group" style={{ margin: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                style={{
                                    padding: '1rem 1rem 1rem 3rem',
                                    borderRadius: '0.9rem',
                                    fontSize: '1rem',
                                    border: '1px solid #e2e8f0',
                                    width: '100%',
                                    backgroundColor: 'white'
                                }}
                            />
                            {email.includes('@') && email.includes('.') && (
                                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e' }}>
                                    <CheckCircle2 size={20} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="input-group" style={{ margin: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                style={{
                                    padding: '1rem 1rem 1rem 3rem',
                                    borderRadius: '0.9rem',
                                    fontSize: '1rem',
                                    border: '1px solid #e2e8f0',
                                    width: '100%',
                                    backgroundColor: 'white'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            padding: '1.15rem',
                            borderRadius: '0.9rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            justifyContent: 'center',
                            marginTop: '0.5rem',
                            backgroundColor: '#2563eb',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Continue'}
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '2rem 0',
                    color: '#999',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <span style={{ padding: '0 1rem' }}>Or Continue With</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            borderRadius: '0.9rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: '600',
                            color: '#111',
                            fontSize: '0.95rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <img src="/image.png" alt="Google" style={{ width: '20px', height: '20px' }} />
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Side: Illustration */}
            <div
                className="login-illustration"
                style={{
                    flex: '1.2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <img
                    src="/flowers-cosmetics-containers-high-angle.jpg"
                    alt="Background"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1
                    }}
                />

                {/* Overlay for better text readability or branding if needed */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
                    zIndex: 2
                }}></div>

                {/* <div className="animate-float" style={{ zIndex: 3, textAlign: 'center', padding: '2rem' }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '2.5rem',
                        borderRadius: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', margin: '0 0 0.5rem 0' }}>Sistem Pencatatan DO</h2>
                        <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Kelola pengiriman barang dengan mudah dan profesional.</p>
                    </div>
                </div> */}
            </div>

            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                        100% { transform: translateY(0px); }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    .input-field:focus {
                        border-color: #2563eb !important;
                        outline: none;
                        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                    }
                    @media (max-width: 1024px) {
                        .login-illustration {
                            display: none !important;
                        }
                        .login-form-container {
                            padding: 2rem !important;
                            max-width: 100% !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Login;
