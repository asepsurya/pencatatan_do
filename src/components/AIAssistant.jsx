import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import { chatWithAI } from '../utils/aiUtils';

const AIAssistant = ({ dos, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Halo! Saya asisten AI Koperasi Karya Surya Asri. Ada yang bisa saya bantu terkait laporan DO hari ini?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare context
            const context = {
                activeUser: user?.displayName || user?.email,
                totalDOs: dos?.length || 0,
                recentDOs: dos?.slice(0, 10).map(d => ({
                    number: d.doNumber,
                    date: d.date,
                    sender: d.sender,
                    receiver: d.receiver,
                    status: d.isClosed ? 'Delivered' : 'Pending',
                    items: d.items?.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')
                }))
            };

            const response = await chatWithAI(input, context);
            const aiMessage = { id: Date.now() + 1, text: response, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 2, text: "Maaf, terjadi gangguan koneksi.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const QuickAction = ({ text }) => (
        <button
            onClick={() => setInput(text)}
            style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '2rem',
                fontSize: '0.75rem',
                color: '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
        >
            {text}
        </button>
    );

    return (
        <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="animate-fade-in"
                    style={{
                        position: 'absolute',
                        bottom: '80px',
                        right: 0,
                        width: '350px',
                        height: '500px',
                        backgroundColor: 'white',
                        borderRadius: '1.5rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ backgroundColor: 'white', padding: '0.3rem', borderRadius: '0.5rem', display: 'flex', width: '32px', height: '32px', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700, color: 'white' }}>AI Assistant</h3>
                                <p style={{ fontSize: '0.7rem', margin: 0, opacity: 0.8 }}>Online | Ready to help</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc' }}>
                        {messages.map((m) => (
                            <div key={m.id} style={{
                                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                                    marginBottom: '2px',
                                    padding: '0 4px'
                                }}>
                                    {m.sender === 'ai' ? <Sparkles size={12} color="#1e3a8a" /> : <User size={12} color="#64748b" />}
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                        {m.sender === 'ai' ? 'Asisten Pintar' : 'Saya'}
                                    </span>
                                </div>
                                <div style={{
                                    padding: '0.85rem 1.1rem',
                                    borderRadius: m.sender === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                                    backgroundColor: m.sender === 'user' ? '#1e3a8a' : 'white',
                                    color: m.sender === 'user' ? 'white' : '#1e293b',
                                    fontSize: '0.875rem',
                                    boxShadow: m.sender === 'ai' ? '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' : 'none',
                                    border: m.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {m.text.split(/(\*\*.*?\*\*)/).map((part, i) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={i}>{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem' }}>
                                <Loader2 className="animate-spin" size={16} color="#1e3a8a" />
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Mengetik...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', overflowX: 'auto', backgroundColor: 'white' }}>
                        <QuickAction text="Total DO hari ini" />
                        <QuickAction text="Rekap Barang" />
                        <QuickAction text="Status Delivery" />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Tanya sesuatu..."
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.85rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                style={{
                                    backgroundColor: '#1e3a8a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.4)',
                    cursor: 'pointer',
                    border: '4px solid white',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                className="animate-float"
            >
                {isOpen ? <X size={28} /> : (
                    <div style={{ position: 'relative' }}>
                        <MessageSquare size={28} />
                        <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#fbbf24',
                            color: '#78350f',
                            borderRadius: '50%',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Sparkles size={12} />
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
};

export default AIAssistant;
