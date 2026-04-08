import { useEffect, useMemo, useState } from "react";

const bagConfigs = [
  {
    id: "left",
    label: "Small",
    size: { w: 100, h: 150, d: 28 }, // Reduced from 118, 178, 34
    colors: {
      front: "linear-gradient(180deg, #caa56f 0%, #b48852 55%, #92663d 100%)",
      side: "linear-gradient(180deg, #9a6c43 0%, #744c2e 100%)",
      top: "linear-gradient(180deg, #d6b27d 0%, #b1824c 100%)",
      fold: "rgba(88,57,31,0.18)",
      edge: "rgba(255,255,255,0.12)",
      handle: "#8f6b45",
      handleDark: "#5b4028",
    },
    rotateY: 18,
    rotateZ: -4,
    floatY: 0,
    scale: 0.9, // Reduced from 0.95
    delay: 0,
    z: 2,
  },
  {
    id: "center",
    label: "Premium",
    size: { w: 145, h: 215, d: 40 }, // Reduced from 172, 250, 48
    colors: {
      front: "linear-gradient(180deg, #d8b17a 0%, #c4945d 55%, #9d6a40 100%)",
      side: "linear-gradient(180deg, #aa7648 0%, #7c512f 100%)",
      top: "linear-gradient(180deg, #e3bf8c 0%, #bf8d57 100%)",
      fold: "rgba(88,57,31,0.16)",
      edge: "rgba(255,255,255,0.14)",
      handle: "#9b744a",
      handleDark: "#65462b",
    },
    rotateY: -6,
    rotateZ: 1,
    floatY: -12,
    scale: 1.0, // Reduced from 1.08
    delay: 140,
    featured: true,
    z: 4,
  },
  {
    id: "right",
    label: "Large",
    size: { w: 110, h: 165, d: 32 }, // Reduced from 128, 192, 38
    colors: {
      front: "linear-gradient(180deg, #cfaa73 0%, #b98954 55%, #93633c 100%)",
      side: "linear-gradient(180deg, #9b6f44 0%, #71492c 100%)",
      top: "linear-gradient(180deg, #dbb886 0%, #b6844e 100%)",
      fold: "rgba(88,57,31,0.18)",
      edge: "rgba(255,255,255,0.11)",
      handle: "#8f6b45",
      handleDark: "#5b4028",
    },
    rotateY: -20,
    rotateZ: 5,
    floatY: 2,
    scale: 0.92, // Reduced from 0.97
    delay: 280,
    z: 3,
  },
];

function RopeHandle({ w, h, colors, index }) {
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`rope-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.handle} />
          <stop offset="50%" stopColor={colors.handleDark} />
          <stop offset="100%" stopColor={colors.handle} />
        </linearGradient>
      </defs>

      <path
        d={`M ${w * 0.24} ${h * 0.96}
            C ${w * 0.22} ${h * 0.5}, ${w * 0.24} ${h * 0.1}, ${w * 0.37} ${h * 0.08}
            C ${w * 0.48} ${h * 0.08}, ${w * 0.49} ${h * 0.52}, ${w * 0.48} ${h * 0.96}`}
        fill="none"
        stroke={`url(#rope-${index})`}
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d={`M ${w * 0.52} ${h * 0.96}
            C ${w * 0.51} ${h * 0.52}, ${w * 0.52} ${h * 0.08}, ${w * 0.63} ${h * 0.08}
            C ${w * 0.76} ${h * 0.1}, ${w * 0.78} ${h * 0.5}, ${w * 0.76} ${h * 0.96}`}
        fill="none"
        stroke={`url(#rope-${index})`}
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d={`M ${w * 0.24} ${h * 0.96}
            C ${w * 0.22} ${h * 0.5}, ${w * 0.24} ${h * 0.1}, ${w * 0.37} ${h * 0.08}`}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <path
        d={`M ${w * 0.52} ${h * 0.96}
            C ${w * 0.51} ${h * 0.52}, ${w * 0.52} ${h * 0.08}, ${w * 0.63} ${h * 0.08}`}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Bag({ bag, index, show, brandName, isMobile }) {
  const {
    size: { w, h, d },
    colors,
    rotateY,
    rotateZ,
    floatY,
    scale,
    delay,
    featured,
    label,
    z,
  } = bag;

  const finalBrand = brandName?.trim() || "NIRMALYAM";

  return (
    <div
      style={{
        position: "relative",
        zIndex: z,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transformStyle: "preserve-3d",
        animation: show
          ? `bagIn${index} 1s cubic-bezier(.22,1,.36,1) ${delay}ms both, bagFloat${index} 7s ease-in-out ${delay + 1000}ms infinite`
          : "none",
      }}
    >
      <style>{`
        @keyframes bagIn${index} {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.88) rotateY(${rotateY * 1.8}deg) rotateZ(${rotateZ * 1.5}deg);
          }
          to {
            opacity: 1;
            transform: translateY(${floatY}px) scale(${scale}) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg);
          }
        }

        @keyframes bagFloat${index} {
          0%,100% {
            transform: translateY(${floatY}px) scale(${scale}) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg);
          }
          50% {
            transform: translateY(${floatY - 14}px) scale(${scale}) rotateY(${rotateY * 0.8}deg) rotateZ(${rotateZ * 0.6}deg);
          }
        }

        @keyframes shine${index} {
          0% { left: -35%; opacity: 0; }
          16% { opacity: .75; }
          48% { left: 125%; opacity: 0; }
          100% { left: 125%; opacity: 0; }
        }

        @keyframes shadow${index} {
          0%,100% { transform: scale(1); opacity: 0.28; }
          50% { transform: scale(0.92); opacity: 0.16; }
        }
      `}</style>

      <div
        style={{
          width: w,
          height: h * 0.34,
          marginBottom: -6,
          zIndex: 10,
          transform: "translateZ(12px)",
        }}
      >
        <RopeHandle w={w} h={h * 0.34} colors={colors} index={index} />
      </div>

      <div
        style={{
          position: "relative",
          width: w + d,
          height: h,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -d * 0.28,
            left: 0,
            width: w,
            height: d * 0.32,
            background: colors.top,
            transform: "skewX(52deg)",
            transformOrigin: "left bottom",
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            zIndex: 5,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: d,
            height: h,
            background: colors.side,
            boxShadow: "inset -10px 0 14px rgba(0,0,0,0.22)",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10%",
              bottom: "10%",
              left: "55%",
              width: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: w,
            height: h,
            background: colors.front,
            borderRadius: "4px 2px 8px 8px",
            overflow: "hidden",
            boxShadow:
              "0 26px 38px rgba(0,0,0,0.16), inset -10px 0 18px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,0.06)",
            zIndex: 4,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "56%",
              height: 2,
              background: colors.fold,
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "9%",
              background: "rgba(0,0,0,0.08)",
              borderBottom: "1px solid rgba(0,0,0,0.12)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "49%",
              top: "10%",
              bottom: "12%",
              width: 1,
              background: "rgba(120,80,40,0.08)",
            }}
          />

          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "8%",
                right: "12%",
                top: `${15 + i * 9}%`,
                height: 1,
                background:
                  i % 2 === 0
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.025)",
              }}
            />
          ))}

          {[w * 0.31, w * 0.69].map((x, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "5%",
                left: x,
                transform: "translateX(-50%)",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgba(78,53,31,0.45)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            />
          ))}

          <div
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              top: featured ? "23%" : "26%",
              bottom: featured ? "18%" : "22%",
              background: "rgba(255, 248, 236, 0.92)",
              borderRadius: 7,
              border: "1px solid rgba(120,90,35,0.15)",
              boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 8px",
            }}
          >
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                color: "#5a3b1d",
                letterSpacing: featured ? "1.7px" : "1.2px",
                textAlign: "center",
                lineHeight: 1.1,
                fontSize: `${Math.min(w * 0.09, 18)}px`,
                maxWidth: "92%",
                wordBreak: "break-word",
              }}
            >
              {finalBrand}
            </div>

            <div
              style={{
                width: "64%",
                height: 1,
                background: "rgba(120,90,35,0.22)",
                margin: "7px 0 6px",
              }}
            />

            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: `${Math.min(w * 0.043, 10)}px`,
                color: "#7d5930",
                letterSpacing: "3px",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              Kraft Bags
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-35%",
              width: "22%",
              height: "100%",
              transform: "skewX(-14deg)",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
              animation: `shine${index} 5.8s ease ${delay + 1600}ms infinite`,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 0,
              left: "5%",
              width: 2,
              height: "100%",
              background: colors.edge,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: w * 0.2,
            height: h * 0.18,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.14), rgba(255,255,255,0.04))",
            clipPath: "polygon(0 100%, 100% 25%, 100% 100%)",
            zIndex: 5,
            opacity: 0.45,
          }}
        />
      </div>

      <div
        style={{
          width: featured ? w * 0.92 : w * 0.82,
          height: 16,
          marginTop: 6,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.28) 0%, transparent 72%)",
          animation: `shadow${index} 7s ease-in-out infinite`,
        }}
      />

      <div
        style={{
          marginTop: isMobile ? 4 : 10,
          fontSize: isMobile ? 8 : 10,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "rgba(90,70,50,0.6)",
          fontFamily: "Georgia, serif",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function KraftBagSVG() {
  const [show, setShow] = useState(false);
  const [brandName, setBrandName] = useState("NIRMALYAM");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const trimmedBrand = useMemo(() => {
    const text = brandName.trim();
    return text.length > 18 ? text.slice(0, 18) : text;
  }, [brandName]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: isMobile ? "20px 0px" : "30px 0px 33px",
        background: "transparent",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: isMobile ? 180 : 380, // Reduced from 260
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingTop: 20,
            paddingBottom: 15,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "78%",
              maxWidth: 760,
              height: 80,
              opacity: 0.6,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(8,15,24,0.18) 0%, rgba(8,15,24,0.08) 42%, transparent 74%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: isMobile ? 2 : 13,
              width: "100%",
              maxWidth: 820,
              flexWrap: "nowrap", // Forced one line
            }}
          >
            <div style={{ transform: isMobile ? "none" : "translateX(clamp(0px, 1vw, 70px))", scale: isMobile ? 0.45 : 1 }}>
              <Bag
                bag={bagConfigs[0]}
                index={0}
                show={show}
                brandName={trimmedBrand}
                isMobile={isMobile}
              />
            </div>

            <div
              style={{
                transform: "translateY(-4px)",
                marginInline: isMobile ? "-4px" : "clamp(-12px, -1vw, -4px)",
                scale: isMobile ? 0.55 : 1, // Smaller on mobile
              }}
            >
              <Bag
                bag={bagConfigs[1]}
                index={1}
                show={show}
                brandName={trimmedBrand}
                isMobile={isMobile}
              />
            </div>

            <div style={{ transform: isMobile ? "none" : "translateX(clamp(-20px, -3vw, 10px))", scale: isMobile ? 0.45 : 1 }}>
              <Bag
                bag={bagConfigs[2]}
                index={2}
                show={show}
                brandName={trimmedBrand}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? 12 : 14,
              color: "#ffffffff",
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            Live preview brand: <strong>{trimmedBrand || "NIRMALYAM"}</strong>
          </div>

          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Enter your brand name"
            maxLength={18}
            style={{
              width: "min(360px, 90vw)",
              padding: isMobile ? "10px 14px" : "14px 18px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.15)",
              background: "#ffffff",
              color: "#111",
              outline: "none",
              fontSize: isMobile ? 13 : 15,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          />

          <button
            style={{
              padding: "14px 26px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontSize: isMobile ? 13 : 15,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(180deg, #2c2118 0%, #5a3b1d 100%)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.14)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 14px 24px rgba(0,0,0,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.14)";
            }}
          >
            Explore More
          </button>
        </div>
      </div>
    </div>
  );
}

export function BagHeroSection() {
  const stats = [
    { value: "100%", label: "Custom Brand" },
    { value: "3D", label: "Bag Preview" },
    { value: "Premium", label: "Finish Look" },
  ];

  return (
    <div
      style={{
        width: "100%",
        background: "transparent",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "40px",
          alignItems: "center",
        }}
      >
        {/* Left */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "24px",
            width: "100%",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8b5e34",
                marginBottom: "12px",
              }}
            >
              Premium Kraft Collection
            </p>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                lineHeight: 1.05,
                fontWeight: 800,
                color: "#2d1a06",
                fontFamily: "'Playfair Display', serif",
                margin: 0,
                maxWidth: "620px",
              }}
            >
              Realistic Paper Bag Design For Your Brand
            </h1>

            <p
              style={{
                marginTop: "18px",
                fontSize: "clamp(1rem, 2vw, 1.08rem)",
                lineHeight: 1.8,
                color: "#6f5b46",
                maxWidth: "560px",
              }}
            >
              Create a premium bag preview with elegant branding, realistic
              lighting, and a clean luxury presentation for your packaging
              website.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
              width: "100%",
              maxWidth: "560px",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fffaf4",
                  border: "1px solid rgba(90,59,29,0.1)",
                  borderRadius: "18px",
                  padding: "18px 16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  minHeight: "88px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#2d1a06",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7a6a55",
                    marginTop: 6,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <button
              style={{
                padding: "14px 28px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(180deg, #2c2118 0%, #5a3b1d 100%)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 12px 22px rgba(0,0,0,0.14)",
              }}
            >
              Explore More
            </button>

            <button
              style={{
                padding: "14px 24px",
                borderRadius: "14px",
                border: "1px solid rgba(90,59,29,0.18)",
                background: "#fff",
                color: "#2d1a06",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              View Designs
            </button>
          </div>
        </div>

        {/* Right */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "520px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "620px",
            }}
          >
            <KraftBagSVG />
          </div>
        </div>
      </div>
    </div>
  );
}