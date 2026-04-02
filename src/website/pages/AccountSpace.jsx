import { useState } from 'react';
import {
  User, Wallet, Plus, History, ShoppingBag,
  X, Check, ArrowDownLeft, ArrowUpRight, IndianRupee,
  Shield, Bell, Edit2, LogOut, ChevronRight, Package
} from 'lucide-react';

/* ── Mock transaction history ── */
const initialTransactions = [
  { id: 'TXN001', type: 'credit', label: 'Added to Wallet', amount: 5000, date: '31 Mar 2026', status: 'success' },
  { id: 'TXN002', type: 'debit', label: 'Order #NK-20420 – Ecocraft Bags', amount: 3240, date: '28 Mar 2026', status: 'success' },
  { id: 'TXN003', type: 'credit', label: 'Refund – Order #NK-20318', amount: 880, date: '22 Mar 2026', status: 'success' },
  { id: 'TXN004', type: 'debit', label: 'Order #NK-20310 – F&B Gourmet Bags', amount: 6800, date: '15 Mar 2026', status: 'success' },
  { id: 'TXN005', type: 'credit', label: 'Added to Wallet', amount: 10000, date: '10 Mar 2026', status: 'success' },
];

/* ── Quick add presets (₹) ── */
const presets = [500, 1000, 2000, 5000, 10000];

/* ── Payment methods (mock) ── */
const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: '🏦', sub: 'Pay via any UPI app' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', sub: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏛️', sub: 'All major Indian banks' },
];

/* ── Format INR ── */
const inr = (n) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccountSpace() {
  const [balance, setBalance] = useState(5840.00);
  const [transactions, setTransactions] = useState(initialTransactions);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1=enter amount, 2=choose payment, 3=processing, 4=success
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [activeTab, setActiveTab] = useState('wallet');

  /* ── Add money flow ── */
  const openModal = () => { setStep(1); setAmount(''); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleAddMoney = () => {
    if (!amount || Number(amount) <= 0) return;
    setStep(3);
    setTimeout(() => {
      setStep(4);
      const newTx = {
        id: `TXN${Date.now()}`,
        type: 'credit',
        label: 'Added to Wallet',
        amount: Number(amount),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'success',
      };
      setBalance(prev => prev + Number(amount));
      setTransactions(prev => [newTx, ...prev]);
    }, 2000);
  };

  const sidebarLinks = [
    { id: 'wallet', icon: Wallet, label: 'My Wallet' },
    { id: 'orders', icon: ShoppingBag, label: 'My Orders' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kraft-50)', paddingTop: 80 }}>

      {/* ── Page hero ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--kraft-950) 0%, var(--kraft-800) 100%)',
        padding: '64px 24px 48px',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--eco-600), var(--eco-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 0 0 4px rgba(74,222,128,0.2)',
            }}>
              👤
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Welcome back,</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 600,
                color: 'white',
              }}>
                Your Account Space
              </h1>
              <div style={{ fontSize: 12, color: 'var(--eco-400)', marginTop: 4 }}>Verified Partner • Since March 2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="container" style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--kraft-100)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 90,
        }}>
          {sidebarLinks.map(({ id, icon: Icon, label }) => (
            <button key={id}
              onClick={() => setActiveTab(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: activeTab === id ? 'rgba(22,163,74,0.06)' : 'transparent',
                border: 'none',
                borderLeft: activeTab === id ? '3px solid var(--eco-600)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.background = 'var(--kraft-50)'; }}
              onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={16} color={activeTab === id ? 'var(--eco-600)' : 'var(--kraft-500)'} />
                <span style={{ fontSize: 14, fontWeight: activeTab === id ? 600 : 400, color: activeTab === id ? 'var(--eco-700)' : 'var(--kraft-700)' }}>
                  {label}
                </span>
              </div>
              <ChevronRight size={14} color="var(--kraft-300)" />
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--kraft-100)', padding: '12px 8px' }}>
            <button style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={15} color="#ef4444" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main>

          {/* ── WALLET TAB ── */}
          {activeTab === 'wallet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Balance card */}
              <div style={{
                background: 'linear-gradient(135deg, var(--kraft-900) 0%, var(--kraft-700) 100%)',
                borderRadius: 'var(--radius-xl)',
                padding: '40px 44px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative rings */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'absolute', bottom: -20, right: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(74,222,128,0.08)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Wallet size={20} color="var(--eco-400)" />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      Nirmalyam Wallet Balance
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 28 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                      {inr(balance)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button className="btn-eco" onClick={openModal} style={{ fontSize: 14, padding: '12px 28px' }}>
                      <Plus size={16} />
                      Add Money
                    </button>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[500, 1000, 2000].map(amt => (
                        <button key={amt}
                          onClick={() => { setAmount(String(amt)); openModal(); }}
                          style={{
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 'var(--radius-full)',
                            color: 'white',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                          +₹{amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { label: 'Total Added', value: '₹15,880', icon: ArrowDownLeft, color: 'var(--eco-600)', bg: 'rgba(22,163,74,0.08)' },
                  { label: 'Total Spent', value: '₹10,040', icon: ArrowUpRight, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                  { label: 'Orders Placed', value: '6', icon: Package, color: 'var(--kraft-600)', bg: 'rgba(192,148,87,0.1)' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} style={{
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px 24px',
                    border: '1px solid var(--kraft-100)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}>
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: 12,
                      background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--kraft-900)' }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--kraft-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transactions */}
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--kraft-100)',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '22px 28px',
                  borderBottom: '1px solid var(--kraft-100)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <History size={18} color="var(--kraft-600)" />
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--kraft-900)' }}>Transaction History</h3>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--kraft-400)', background: 'var(--kraft-100)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                    {transactions.length} transactions
                  </span>
                </div>

                {transactions.map((tx, i) => (
                  <div key={tx.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 28px',
                    borderBottom: i < transactions.length - 1 ? '1px solid var(--kraft-50)' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--kraft-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40,
                        borderRadius: '50%',
                        background: tx.type === 'credit' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {tx.type === 'credit'
                          ? <ArrowDownLeft size={16} color="var(--eco-600)" />
                          : <ArrowUpRight size={16} color="#ef4444" />
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--kraft-900)' }}>{tx.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--kraft-400)', marginTop: 2 }}>{tx.date} • {tx.id}</div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: tx.type === 'credit' ? 'var(--eco-600)' : '#ef4444',
                    }}>
                      {tx.type === 'credit' ? '+' : '−'}{inr(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--kraft-100)',
              padding: '48px',
              textAlign: 'center',
            }}>
              <ShoppingBag size={48} color="var(--kraft-300)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 22, fontWeight: 600, color: 'var(--kraft-900)', marginBottom: 8 }}>Your Orders</h3>
              <p style={{ color: 'var(--kraft-400)', fontSize: 15 }}>Your placed orders will appear here once you submit a quote and it is approved.</p>
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--kraft-100)',
                padding: 36,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--kraft-900)' }}>Profile Details</h3>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--kraft-50)', border: '1px solid var(--kraft-200)', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--kraft-700)' }}>
                    <Edit2 size={13} /> Edit
                  </button>
                </div>
                {[
                  { label: 'Full Name', value: 'Brand Partner' },
                  { label: 'Email', value: 'partner@yourbrand.com' },
                  { label: 'Phone', value: '+91 98765 43210' },
                  { label: 'Company', value: 'My Brand Co.' },
                  { label: 'GST Number', value: 'Not set' },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--kraft-100)',
                    fontSize: 14,
                  }}>
                    <span style={{ color: 'var(--kraft-400)', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--kraft-800)', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {['notifications', 'security'].includes(activeTab) && (
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--kraft-100)',
              padding: '48px',
              textAlign: 'center',
            }}>
              {activeTab === 'notifications' ? <Bell size={48} color="var(--kraft-300)" style={{ margin: '0 auto 16px' }} /> : <Shield size={48} color="var(--kraft-300)" style={{ margin: '0 auto 16px' }} />}
              <h3 style={{ fontSize: 22, fontWeight: 600, color: 'var(--kraft-900)', marginBottom: 8, textTransform: 'capitalize' }}>{activeTab}</h3>
              <p style={{ color: 'var(--kraft-400)', fontSize: 15 }}>This section is coming soon. We're building a great experience for you!</p>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════ ADD MONEY MODAL ══════════════════ */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(14,9,4,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: 480,
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s ease',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 28px',
              background: 'linear-gradient(135deg, var(--kraft-900), var(--kraft-700))',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IndianRupee size={20} color="var(--eco-400)" />
                <span style={{ fontWeight: 700, fontSize: 17 }}>Add Money to Wallet</span>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '32px 28px' }}>
              {/* Step 1: Enter amount */}
              {step === 1 && (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--kraft-500)', marginBottom: 6 }}>Current Balance</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--kraft-900)' }}>{inr(balance)}</div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--kraft-600)', marginBottom: 8 }}>
                      Enter Amount (₹)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: 18, top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 22,
                        color: 'var(--kraft-400)',
                        fontWeight: 600,
                      }}>₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        className="input-field"
                        style={{ paddingLeft: 44, fontSize: 22, fontWeight: 700, color: 'var(--kraft-900)' }}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                    {presets.map(p => (
                      <button key={p}
                        onClick={() => setAmount(String(p))}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: `1.5px solid ${amount === String(p) ? 'var(--eco-600)' : 'var(--kraft-200)'}`,
                          background: amount === String(p) ? 'rgba(22,163,74,0.08)' : 'white',
                          color: amount === String(p) ? 'var(--eco-700)' : 'var(--kraft-700)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        ₹{p.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => Number(amount) > 0 && setStep(2)}
                    className="btn-eco"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: Number(amount) > 0 ? 1 : 0.5 }}
                    disabled={!(Number(amount) > 0)}
                  >
                    Continue to Payment
                  </button>
                </>
              )}

              {/* Step 2: Choose payment method */}
              {step === 2 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--kraft-600)' }}>←</button>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--kraft-400)' }}>Adding to wallet</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--eco-600)' }}>₹{Number(amount).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--kraft-600)', marginBottom: 12 }}>
                    Choose Payment Method
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {paymentMethods.map(pm => (
                      <button key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '16px 20px',
                          borderRadius: 'var(--radius-lg)',
                          border: `1.5px solid ${paymentMethod === pm.id ? 'var(--eco-600)' : 'var(--kraft-200)'}`,
                          background: paymentMethod === pm.id ? 'rgba(22,163,74,0.05)' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{pm.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--kraft-900)' }}>{pm.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--kraft-400)' }}>{pm.sub}</div>
                        </div>
                        <div style={{
                          width: 20, height: 20,
                          borderRadius: '50%',
                          border: `2px solid ${paymentMethod === pm.id ? 'var(--eco-600)' : 'var(--kraft-300)'}`,
                          background: paymentMethod === pm.id ? 'var(--eco-600)' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {paymentMethod === pm.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button onClick={handleAddMoney} className="btn-eco" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
                    Pay ₹{Number(amount).toLocaleString('en-IN')}
                  </button>
                  <p style={{ fontSize: 11, color: 'var(--kraft-400)', textAlign: 'center', marginTop: 10 }}>
                    🔒 Payments are 256-bit SSL encrypted. This is a demo environment.
                  </p>
                </>
              )}

              {/* Step 3: Processing */}
              {step === 3 && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: '50%',
                    background: 'rgba(22,163,74,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    animation: 'pulse-ring 1.5s ease infinite',
                  }}>
                    <IndianRupee size={28} color="var(--eco-600)" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--kraft-900)', marginBottom: 8 }}>Processing Payment…</div>
                  <div style={{ fontSize: 14, color: 'var(--kraft-400)' }}>Please wait, do not close this window</div>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: 'rgba(22,163,74,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <Check size={36} color="var(--eco-600)" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--kraft-900)', marginBottom: 8 }}>
                    ₹{Number(amount).toLocaleString('en-IN')} Added!
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--kraft-400)', marginBottom: 8 }}>
                    Your new balance is
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--eco-700)', marginBottom: 28 }}>
                    {inr(balance + Number(0))}
                  </div>
                  <button onClick={closeModal} className="btn-eco" style={{ padding: '12px 40px' }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .account-layout { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}
