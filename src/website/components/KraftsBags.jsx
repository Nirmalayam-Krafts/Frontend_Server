import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bags = [
  {
    id: 1,
    image: '/images/bag_vibrant.png',
    title: 'Artisan Collection',
    color: '#eab308'
  },
  {
    id: 2,
    image: '/images/bag_luxury.png',
    title: 'Elite Series',
    color: '#c09457'
  },
  {
    id: 3,
    image: '/images/bag_eco.png',
    title: 'Eco Signature',
    color: '#16a34a'
  }
];

export function KraftBagSVG() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % bags.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getPosition = (i) => {
    const diff = (i - index + bags.length) % bags.length;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    return 'left';
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'clamp(350px, 50vh, 550px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      perspective: '1200px',
      overflow: 'visible'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        width: '60%',
        height: '60%',
        background: `radial-gradient(circle, ${bags[index].color}22 0%, transparent 70%)`,
        filter: 'blur(40px)',
        zIndex: 0,
        transition: 'background 1s ease'
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformStyle: 'preserve-3d'
      }}>
        <AnimatePresence mode="popLayout">
          {bags.map((bag, i) => {
            const pos = getPosition(i);
            const isActive = pos === 'center';
            
            return (
              <motion.div
                key={bag.id}
                initial={{ opacity: 0, scale: 0.8, x: pos === 'right' ? 200 : -200 }}
                animate={{
                  opacity: isActive ? 1 : 0.4,
                  scale: isActive ? 1 : 0.7,
                  x: pos === 'center' ? 0 : pos === 'right' ? 220 : -220,
                  z: isActive ? 100 : 0,
                  rotateY: pos === 'center' ? 0 : pos === 'right' ? -25 : 25,
                  filter: isActive ? 'blur(0px) drop-shadow(0 25px 50px rgba(0,0,0,0.15))' : 'blur(4px)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 25,
                }}
                style={{
                  position: 'absolute',
                  width: 'clamp(240px, 30vw, 380px)',
                  height: 'auto',
                  zIndex: isActive ? 10 : 5,
                  cursor: 'pointer',
                  transformOrigin: 'bottom center'
                }}
                onClick={() => setIndex(i)}
              >
                <img 
                  src={bag.image} 
                  alt={bag.title} 
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '20px',
                  }}
                />
                
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 24,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 20px',
                      background: 'white',
                      borderRadius: '100px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                      border: '1px solid var(--kraft-100)',
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--kraft-950)'
                    }}>
                      {bag.title}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Decorative dots */}
      <div style={{
        position: 'absolute',
        bottom: -20,
        display: 'flex',
        gap: 12,
        zIndex: 20
      }}>
        {bags.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 32 : 12,
              height: 12,
              borderRadius: 6,
              border: 'none',
              background: i === index ? 'var(--eco-600)' : 'var(--kraft-200)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}