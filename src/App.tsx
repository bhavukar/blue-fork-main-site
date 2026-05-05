import { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment,
  ContactShadows,
  PresentationControls,
  Loader,
  MeshReflectorMaterial,
  BakeShadows
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import founderImg from './assets/founder.jpeg';

const PRODUCT_URL = 'https://fork.bhavuk-arora03.workers.dev/';

// Original Brand Colors
const BLUE_600 = "#2563eb";
const BLUE_HOVER = "#1d4ed8";
const BLUE_LIGHT = "#60a5fa";

// --- Magnetic Component (Refined for Cuberto Feel) ---
const Magnetic = ({ children, onHoverChange }: { children: React.ReactElement, onHoverChange?: (hovered: boolean) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.4);
    y.set(middleY * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    onHoverChange?.(false);
  };

  const handleMouseEnter = () => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch) onHoverChange?.(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
};

// --- Custom Cursor ---
const CustomCursor = ({ hoverType }: { hoverType: string | null }) => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorSize = useMotionValue(12);

  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const sizeSpringConfig = { damping: 20, stiffness: 200 };
  
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const cursorSizeSpring = useSpring(cursorSize, sizeSpringConfig);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (hoverType === 'button') {
      cursorSize.set(80);
    } else if (hoverType === 'text') {
      cursorSize.set(120);
    } else {
      cursorSize.set(12);
    }
  }, [hoverType, cursorSize]);

  // Hide on mobile/touch
  const [showCursor, setShowCursor] = useState(false);
  useEffect(() => {
    setShowCursor(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (!showCursor) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] flex items-center justify-center mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        width: cursorSizeSpring,
        height: cursorSizeSpring,
        translateX: "-50%",
        translateY: "-50%",
        backgroundColor: "white",
      }}
    >
      {hoverType === 'button' && (
          <div className="w-1 h-1 rounded-full bg-black opacity-20" />
      )}
    </motion.div>
  );
};

// --- Masked Text Reveal ---
const MaskedText = ({ children, delay = 0, trigger = true }: { children: React.ReactNode; delay?: number; trigger?: boolean }) => {
  return (
    <div className="mask-container">
      <motion.div
        initial={{ translateY: "100%" }}
        animate={trigger ? { translateY: 0 } : { translateY: "100%" }}
        transition={{
          duration: 1.2,
          delay,
          ease: [0.76, 0, 0.24, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const BlueFork = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { mouse, viewport } = useThree();

  const isMobile = viewport.width < 5;
  const xPos = isMobile ? 0 : viewport.width * 0.28;
  const yPos = isMobile ? 1.4 : 1.0;

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = yPos + Math.sin(t * 1.2) * 0.1;

      // Disable mouse following on mobile to save perf
      if (!isMobile) {
        const targetRotationX = mouse.y * 0.4;
        const targetRotationY = mouse.x * 0.4;
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
      }
      groupRef.current.rotation.z = 0;

      const baseScale = isMobile ? 2.0 : 1.7; 
      const hoverScale = isMobile ? 2.0 : 1.9; // No hover scale on mobile
      const targetScale = hovered ? hoverScale : baseScale;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
      <group
          ref={groupRef}
          position={[xPos, yPos, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
      >
        <group position={[0, -0.5, 0]}>
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.04, 0.07, 2, 32]} />
            <meshStandardMaterial color={hovered ? BLUE_HOVER : BLUE_600} metalness={1} roughness={0.05} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.35, 0.4, 0.08]} />
            <meshStandardMaterial color={hovered ? BLUE_HOVER : BLUE_600} metalness={1} roughness={0.05} />
          </mesh>
          {[ -0.12, -0.04, 0.04, 0.12 ].map((x, i) => (
              <mesh key={i} position={[x, 0.7, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 16]} />
                <meshStandardMaterial color={hovered ? BLUE_HOVER : BLUE_600} metalness={1} roughness={0.05} />
              </mesh>
          ))}
        </group>
      </group>
  );
};

const ReflectiveGround = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  
  if (!isDarkMode || isMobile) return null; // Disable expensive reflections on mobile
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[0, 0]} resolution={512} mixBlur={0} mixStrength={40} roughness={1} depthScale={1}
        minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#000000" metalness={0.5} mirror={0.2}
      />
    </mesh>
  );
};

const Scene = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nextTheme, setNextTheme] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoverType, setHoverType] = useState<string | null>(null);
  const [titleHovered, setTitleHovered] = useState(false);

  // Investor Relations State
  const [isIROpen, setIsIROpen] = useState(false);
  const [isIRTransitioning, setIsIRTransitioning] = useState(false);

  const toggleTheme = (e: React.MouseEvent) => {
    if (isTransitioning || isIRTransitioning) return;
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    setNextTheme(!isDarkMode);
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', `${x}px`);
    root.style.setProperty('--reveal-y', `${y}px`);
    root.style.setProperty('--reveal-radius', `${endRadius}px`);
    setIsTransitioning(true);
    setTimeout(() => {
      setIsDarkMode(!isDarkMode);
      setIsTransitioning(false);
    }, 800);
  };

  const toggleIR = (e: React.MouseEvent) => {
    if (isTransitioning || isIRTransitioning) return;
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', `${x}px`);
    root.style.setProperty('--reveal-y', `${y}px`);
    root.style.setProperty('--reveal-radius', `${endRadius}px`);
    
    setIsIRTransitioning(true);
    
    if (!isIROpen) {
      setTimeout(() => {
        setIsIROpen(true);
        setIsIRTransitioning(false);
      }, 800);
    } else {
      setTimeout(() => {
        setIsIROpen(false);
        setIsIRTransitioning(false);
      }, 800);
    }
  };

  return (
    <div className={`w-screen h-screen relative font-['Plus_Jakarta_Sans'] overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <CustomCursor hoverType={hoverType} />
      
      {isDarkMode && !isIROpen && (
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-blue-900/20 via-black to-black" />
      )}

      {/* Theme Transition Overlay */}
      <div className={`absolute inset-0 z-[55] pointer-events-none transition-all duration-700 ease-in-out clip-reveal ${isTransitioning ? 'active' : ''} ${nextTheme ? 'bg-black' : 'bg-white'}`} />

      {/* IR Transition Overlay */}
      <div className={`absolute inset-0 z-[65] pointer-events-none transition-all duration-700 ease-in-out clip-reveal ${isIRTransitioning ? 'active' : ''} bg-black`} />

      {/* Investor Relations Content */}
      <AnimatePresence>
        {isIROpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70] bg-black text-white flex flex-col md:flex-row overflow-hidden"
          >
            {/* Left Side: Founder Image - Optimized size */}
            <div className="w-full md:w-[40%] h-[40%] md:h-full overflow-hidden relative grayscale">
              <img 
                src={founderImg} 
                alt="Founder" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-[60%] h-[60%] md:h-full flex flex-col justify-center p-8 md:p-32 relative">
              <button 
                onClick={toggleIR}
                className="absolute top-8 right-8 md:top-12 md:right-12 px-6 py-2 rounded-full border border-white/20 text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all z-[80] pointer-events-auto"
              >
                Back
              </button>

              <div className="max-w-xl">
                <MaskedText delay={0.2} trigger={isIROpen}>
                  <h2 className="text-4xl md:text-6xl font-['Bebas_Neue'] font-black mb-6 tracking-tight">Our Mission</h2>
                </MaskedText>
                <MaskedText delay={0.4} trigger={isIROpen}>
                  <p className="text-lg md:text-xl font-light leading-relaxed mb-12 opacity-80">
                    To build AI-native products that redefine human-computer interaction, starting with the most fundamental tools of excellence. We believe in simplicity that scales and elegance that endures.
                  </p>
                </MaskedText>

                <div className="flex flex-col sm:flex-row gap-4">
                  <MaskedText delay={0.6} trigger={isIROpen}>
                    <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
                      <a 
                        href="mailto:bhavuk.arora03@gmail.com"
                        className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-full text-center block pointer-events-auto"
                      >
                        Contact Mail
                      </a>
                    </Magnetic>
                  </MaskedText>
                  <MaskedText delay={0.7} trigger={isIROpen}>
                    <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
                      <a 
                        href="https://www.linkedin.com/in/bhavuk-arora-4a7263216/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-4 border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full text-center block pointer-events-auto hover:border-white transition-colors"
                      >
                        LinkedIn
                      </a>
                    </Magnetic>
                  </MaskedText>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-32">
                <div className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em]">
                  Investor Relations
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Canvas shadows={!window.matchMedia("(pointer: coarse)").matches} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={35} />
        <color attach="background" args={[isDarkMode ? '#000000' : '#ffffff']} />
        <fog attach="fog" args={[isDarkMode ? '#000000' : '#ffffff', 15, 30]} />
        <Suspense fallback={null}>
          <Environment preset={isDarkMode ? "city" : "apartment"} />
          <PresentationControls
            global snap speed={1.5} rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]} azimuth={[-Math.PI / 3, Math.PI / 3]}
          >
            <BlueFork />
          </PresentationControls>
          <ReflectiveGround isDarkMode={isDarkMode} />
          {isDarkMode && !window.matchMedia("(pointer: coarse)").matches && (
            <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={20} blur={1} far={4} />
          )}
          <BakeShadows />
        </Suspense>
        <ambientLight intensity={isDarkMode ? 0.6 : 0.8} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={isDarkMode ? 10 : 2} castShadow={!window.matchMedia("(pointer: coarse)").matches} color="#ffffff" />
        <pointLight position={[-5, 5, 5]} intensity={isDarkMode ? 5 : 1} color={BLUE_LIGHT} />
      </Canvas>

      <div className="absolute top-8 right-8 md:top-12 md:right-12 z-[60] pointer-events-auto">
        <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
          <button onClick={toggleTheme} className={`px-6 py-2 rounded-full border text-[10px] font-black tracking-widest uppercase transition-colors duration-500 ${isDarkMode ? 'border-white/20 text-white' : 'border-black/10 text-black'}`}>
            {isDarkMode ? 'LIGHT' : 'DARK'}
          </button>
        </Magnetic>
      </div>

      <div className="absolute inset-0 flex flex-col items-start justify-center p-8 md:p-32 pointer-events-none z-10">
        <div className="w-full max-w-4xl">
          <div onMouseEnter={() => { setTitleHovered(true); setHoverType('text'); }} onMouseLeave={() => { setTitleHovered(false); setHoverType(null); }} className="pointer-events-auto inline-block mb-4">
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-['Bebas_Neue'] font-black leading-[0.85] uppercase select-none cursor-default transition-all duration-500">
              <MaskedText delay={0.2}>Blue</MaskedText>
              <MaskedText delay={0.3}><span className="text-blue-600">Fork</span></MaskedText>
            </h1>
          </div>
          <motion.div 
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="w-16 h-1 bg-blue-600 mb-12 md:mb-14 origin-left"
            style={{ width: titleHovered ? '120px' : '64px' }}
          />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pointer-events-auto">
            <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
              <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-12 py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full text-center shadow-lg block">
                Explore Fork
              </a>
            </Magnetic>
            <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
              <button 
                onClick={toggleIR}
                className={`w-full sm:w-auto px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-full border text-center transition-colors duration-500 ${isDarkMode ? 'bg-transparent border-white/20 text-white' : 'bg-white border-black/10 text-black shadow-sm'}`}>
                Investor Relations
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 w-full px-8 md:px-32 flex flex-col md:flex-row justify-between items-start md:items-end pointer-events-none z-20">
        <div className="flex flex-col gap-1">
          <MaskedText delay={1}>
            <div className={`text-[12px] md:text-[13px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Blue Fork Pvt. Ltd.
            </div>
          </MaskedText>
          <MaskedText delay={1.1}>
            <div className="text-blue-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
              AI-Native Products
            </div>
          </MaskedText>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Loader 
        containerStyles={{ background: '#ffffff' }}
        innerStyles={{ background: BLUE_600, height: '2px' }}
        barStyles={{ background: '#eee' }}
        dataStyles={{ color: '#000', fontFamily: 'Plus Jakarta Sans', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em' }}
        dataInterpolation={(p) => `READY... ${p.toFixed(0)}%`}
      />
    </>
  );
}
