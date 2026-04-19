import { useState } from 'react';
import { Package, Palette, Layers, Eye, RotateCcw, Download, Share2, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const bagTypes = [
  { id: 'ecocraft', label: 'Ecocraft Standard', desc: 'Tall, robust bags perfect for retail and daily carry.', color: 'var(--eco-600)' },
  { id: 'fnb', label: 'F&B Takeaway', desc: 'Wider base designs for food boxes and secure transport.', color: '#f59e0b' },
  { id: 'luxury', label: 'Luxury Boutique', desc: 'Premium horizontal orientation for high-end gifting.', color: 'var(--gold-500)' },
];

const colorOptions = [
  { label: 'Natural Kraft', hex: '#c09457' },
  { label: 'Eco White', hex: '#f5f0e8' },
  { label: 'Charcoal', hex: '#3a3530' },
  { label: 'Forest Green', hex: '#2d6a4f' },
  { label: 'Ivory', hex: '#f7f4ec' },
  { label: 'Navy', hex: '#1e3a5f' },
];

const handleTypes = [
  'Twisted Paper Cord',
  'Flat Tape Handle',
  'Die-Cut Hole',
  'Ribbon Handle',
  'Cotton Rope',
];

export default function DesignYourProduct() {
  const [selectedBag, setSelectedBag] = useState('ecocraft');
  const [color, setColor] = useState('#c09457');
  const [handle, setHandle] = useState('Twisted Paper Cord');
  const [brandText, setBrandText] = useState('YOUR BRAND');

  const bag = bagTypes.find(b => b.id === selectedBag);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kraft-50)', paddingTop: 80 }}>

      {/* Hero */}
      <div className="page-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ color: 'var(--eco-400)' }}>3D Configurator</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 68px)',
            color: 'white',
            fontWeight: 600,
            marginBottom: 18,
          }}>
            Design Your Product
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', maxWidth: 560, lineHeight: 1.65 }}>
            Fully interactive configurator. Customize your bag design and view in real-time before placing your order.
          </p>
        </div>
      </div>

      {/* Configurator layout */}
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, alignItems: 'start' }}>

          {/* ── Controls Panel ── */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--kraft-100)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 90,
          }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--kraft-100)', background: 'var(--kraft-50)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--eco-600)', fontWeight: 700, marginBottom: 4 }}>
                Bag Design
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--kraft-900)' }}>Real-time 3D Rendering</div>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Bag Type */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--kraft-600)', marginBottom: 12 }}>Bag Type</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {bagTypes.map(b => (
                    <button key={b.id}
                      onClick={() => setSelectedBag(b.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${selectedBag === b.id ? b.color : 'var(--kraft-200)'}`,
                        background: selectedBag === b.id ? `${b.color}10` : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Package size={16} color={selectedBag === b.id ? b.color : 'var(--kraft-400)'} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: selectedBag === b.id ? b.color : 'var(--kraft-800)' }}>{b.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--kraft-400)', lineHeight: 1.4 }}>{b.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Scale */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--kraft-600)', marginBottom: 8 }}>Size Scale</div>
                <input type="range" min={70} max={130} defaultValue={100}
                  style={{ width: '100%', accentColor: 'var(--eco-600)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--kraft-400)' }}>
                  <span>Small</span><span>Standard</span><span>Large</span>
                </div>
              </div>

              {/* Material Color */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--kraft-600)', marginBottom: 10 }}>Material Color</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {colorOptions.map(c => (
                    <button key={c.hex}
                      onClick={() => setColor(c.hex)}
                      title={c.label}
                      style={{
                        width: 32, height: 32,
                        borderRadius: '50%',
                        background: c.hex,
                        border: `3px solid ${color === c.hex ? 'var(--eco-600)' : 'transparent'}`,
                        outline: color === c.hex ? '2px solid var(--eco-500)' : 'none',
                        outlineOffset: 2,
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--kraft-400)', marginTop: 6 }}>
                  Selected: {colorOptions.find(c => c.hex === color)?.label}
                </div>
              </div>

              {/* Handle Type */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--kraft-600)', marginBottom: 8 }}>Handle Type</div>
                <select
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className="input-field"
                  style={{ cursor: 'pointer', fontSize: 13 }}
                >
                  {handleTypes.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>

              {/* Branding */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--kraft-600)', marginBottom: 8 }}>
                  Branding Text
                </div>
                <input
                  type="text"
                  className="input-field"
                  value={brandText}
                  onChange={e => setBrandText(e.target.value)}
                  maxLength={20}
                  placeholder="YOUR BRAND"
                  style={{ fontSize: 13, textTransform: 'uppercase' }}
                />
              </div>

            </div>

            {/* Actions */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid var(--kraft-100)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--kraft-50)', border: '1px solid var(--kraft-200)', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--kraft-700)' }}>
                <RotateCcw size={12} /> Reset
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--kraft-50)', border: '1px solid var(--kraft-200)', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--kraft-700)' }}>
                <Share2 size={12} /> Share
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--kraft-50)', border: '1px solid var(--kraft-200)', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--kraft-700)' }}>
                <Download size={12} /> Export
              </button>
            </div>
          </div>

          {/* ── Preview Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 3D View Area */}
            <div style={{
              background: `linear-gradient(135deg, ${color}18, ${color}08)`,
              borderRadius: 'var(--radius-xl)',
              border: `2px dashed ${color}44`,
              minHeight: 480,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Fake 3D bag illustration */}
              <div style={{ position: 'relative', animation: 'float 4s ease-in-out infinite' }}>
                <svg width={selectedBag === 'luxury' ? 280 : 220} height={selectedBag === 'luxury' ? 200 : 300} viewBox="0 0 220 300">
                  {/* Bag body */}
                  <rect x="20" y="80" width="180" height="200" rx="8" fill={color} opacity="0.9" />
                  {/* Bag gusset shadow */}
                  <rect x="20" y="80" width="30" height="200" rx="4" fill="black" opacity="0.06" />
                  {/* Bag top fold */}
                  <rect x="20" y="76" width="180" height="16" rx="4" fill={color} />
                  <rect x="20" y="76" width="180" height="16" rx="4" fill="black" opacity="0.04" />
                  {/* Handle holes */}
                  <rect x="72" y="56" width="30" height="28" rx="14" fill="white" opacity="0.6" />
                  <rect x="118" y="56" width="30" height="28" rx="14" fill="white" opacity="0.6" />
                  {/* Brand text */}
                  <text x="110" y="190" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="700" fill="white" opacity="0.8" letterSpacing="3">
                    {brandText.slice(0, 14)}
                  </text>
                  {/* Leaf watermark */}
                  <text x="110" y="230" textAnchor="middle" fontSize="22" opacity="0.3">🌿</text>
                  {/* Shine highlight */}
                  <rect x="25" y="85" width="40" height="180" rx="4" fill="white" opacity="0.04" />
                </svg>
              </div>

              {/* Labels */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--kraft-700)' }}>{bag?.label}</div>
                <div style={{ fontSize: 12, color: 'var(--kraft-400)', marginTop: 4 }}>Handle: {handle}</div>
              </div>

              {/* Eye badge */}
              <div style={{
                position: 'absolute',
                top: 20, right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.85)',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--kraft-700)',
                backdropFilter: 'blur(8px)',
              }}>
                <Eye size={13} /> Live Preview
              </div>
            </div>

            {/* Info callout */}
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--kraft-100)',
              padding: '24px 28px',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: 'rgba(22,163,74,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Leaf size={20} color="var(--eco-600)" />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: 15, color: 'var(--kraft-900)', marginBottom: 4 }}>View in Real Environment</h4>
                <p style={{ fontSize: 13, color: 'var(--kraft-500)', lineHeight: 1.6 }}>
                  Our full 3D configurator with realistic lighting is coming soon. For now, design your bag above and submit a quote request — our team will send you physical sample renders within 48 hours.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 14 }}>
              <Link to="/contact#contact-form" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '15px' }}>
                <span>Request Sample with This Design</span>
              </Link>
              <Link to="/contact#contact-form" className="btn-secondary" style={{ padding: '15px 24px' }}>
                <Palette size={16} /> Custom Colors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
