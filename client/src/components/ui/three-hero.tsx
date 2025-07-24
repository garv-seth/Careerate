import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  ArrowRight, 
  Github, 
  Users, 
  Zap, 
  Shield,
  Cloud,
  Bot,
  Activity,
  Monitor,
  Terminal,
  Workflow
} from 'lucide-react';

export const ThreeHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const totalSections = 5;

  // Device motion values
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const smoothMotionX = useSpring(motionX, { stiffness: 100, damping: 30 });
  const smoothMotionY = useSpring(motionY, { stiffness: 100, damping: 30 });
  
  const threeRefs = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    stars: [] as THREE.Points[],
    nebula: null as THREE.Mesh | null,
    mountains: [] as THREE.Mesh[],
    atmosphere: null as THREE.Mesh | null,
    animationId: null as number | null,
    targetCameraX: 0,
    targetCameraY: 30,
    targetCameraZ: 100
  });

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });

  // Mobile detection for performance optimization
  const isMobile = window.innerWidth <= 768;
  const isLowPowerDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const initThree = () => {
      const { current: refs } = threeRefs;
      
      // Scene setup with mobile optimization
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, isMobile ? 0.0005 : 0.0001);

      // Camera with mobile-optimized settings
      refs.camera = new THREE.PerspectiveCamera(
        isMobile ? 60 : 75, // Smaller FOV on mobile for better performance
        window.innerWidth / window.innerHeight,
        0.1,
        isMobile ? 1000 : 2000 // Reduced far plane on mobile
      );
      refs.camera.position.set(0, 30, 100);

      // Renderer with mobile optimization
      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        antialias: !isMobile, // Disable antialiasing on mobile for better performance
        alpha: true,
        precision: isMobile ? 'mediump' : 'highp',
        powerPreference: isMobile ? 'low-power' : 'high-performance'
      });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      // Limit pixel ratio on mobile to improve performance
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = isMobile ? 0.6 : 0.8;
      
      // Additional mobile optimizations
      if (isMobile) {
        refs.renderer.shadowMap.enabled = false;
        refs.renderer.physicallyBasedShading = false;
      }

      // Create scene elements
      createStarField();
      createNebula();
      createMountains();
      createAtmosphere();

      // Start animation
      animate();
      
      setIsReady(true);
    };

    const createStarField = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;

      // Mobile optimization: drastically reduce particle count and layers
      const starCount = isMobile ? 800 : 3000;
      const layerCount = isMobile ? 2 : 3;
      
      for (let i = 0; i < layerCount; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 300 + Math.random() * 1000;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Simplified colors for mobile - reduce color variations
          const color = new THREE.Color();
          if (isMobile) {
            // Use simpler color scheme on mobile
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
              color.setHSL(0.6, 0.6, 0.7); // Blue
            } else {
              color.setHSL(0.75, 0.5, 0.8); // Purple
            }
          } else {
            // Full color range on desktop
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
              color.setHSL(0.6, 0.8, 0.8); // Blue
            } else if (colorChoice < 0.7) {
              color.setHSL(0.75, 0.7, 0.9); // Purple
            } else if (colorChoice < 0.9) {
              color.setHSL(0.5, 0.6, 0.8); // Cyan
            } else {
              color.setHSL(0, 0, 0.9); // White
            }
          }
          
          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = isMobile ? Math.random() * 2 + 0.5 : Math.random() * 3 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Use simplified material on mobile
        const material = isMobile 
          ? new THREE.PointsMaterial({
              size: 2,
              vertexColors: true,
              transparent: true,
              opacity: 0.7,
              sizeAttenuation: false,
              blending: THREE.AdditiveBlending
            })
          : new THREE.ShaderMaterial({
              uniforms: {
                time: { value: 0 },
                depth: { value: i }
              },
              vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                uniform float depth;
                
                void main() {
                  vColor = color;
                  vec3 pos = position;
                  
                  // Rotation based on depth
                  float angle = time * 0.02 * (1.0 - depth * 0.2);
                  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
                  pos.xy = rot * pos.xy;
                  
                  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                  gl_PointSize = size * (300.0 / -mvPosition.z);
                  gl_Position = projectionMatrix * mvPosition;
                }
              `,
              fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                  float dist = length(gl_PointCoord - vec2(0.5));
                  if (dist > 0.5) discard;
                  
                  float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
                  gl_FragColor = vec4(vColor, opacity);
                }
              `,
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            });

        const stars = new THREE.Points(geometry, material);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;
      
      // Mobile optimization: reduce geometry complexity and use simpler materials
      const segments = isMobile ? 20 : 50;
      const geometry = new THREE.PlaneGeometry(6000, 3000, segments, segments);
      
      const material = isMobile 
        ? new THREE.MeshBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
          })
        : new THREE.ShaderMaterial({
            uniforms: {
              time: { value: 0 },
              color1: { value: new THREE.Color(0x4f46e5) }, // Indigo
              color2: { value: new THREE.Color(0x06b6d4) }, // Cyan
              color3: { value: new THREE.Color(0x8b5cf6) }, // Violet
              opacity: { value: 0.2 }
            },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            
            float elevation = sin(pos.x * 0.005 + time * 0.5) * cos(pos.y * 0.005 + time * 0.3) * 30.0;
            pos.z += elevation;
            vElevation = elevation;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;
          
          void main() {
            float noise1 = sin(vUv.x * 8.0 + time * 0.5) * cos(vUv.y * 8.0 + time * 0.3);
            float noise2 = sin(vUv.x * 15.0 + time * 0.7) * cos(vUv.y * 15.0 + time * 0.4);
            
            vec3 color = mix(color1, color2, noise1 * 0.5 + 0.5);
            color = mix(color, color3, noise2 * 0.3 + 0.3);
            
            float alpha = opacity * (1.0 - length(vUv - 0.5) * 1.5);
            alpha *= 1.0 + vElevation * 0.01;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -800;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;
      
      const layers = [
        { distance: -100, height: 80, color: 0x1e293b, opacity: 0.9 },
        { distance: -200, height: 100, color: 0x0f172a, opacity: 0.7 },
        { distance: -300, height: 120, color: 0x020617, opacity: 0.5 },
        { distance: -400, height: 140, color: 0x000000, opacity: 0.3 }
      ];

      layers.forEach((layer, index) => {
        const points = [];
        const segments = 40;
        
        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1200;
          const y = Math.sin(i * 0.1) * layer.height + 
                   Math.sin(i * 0.05) * layer.height * 0.5 +
                   Math.random() * layer.height * 0.1 - 50;
          points.push(new THREE.Vector2(x, y));
        }
        
        points.push(new THREE.Vector2(600, -200));
        points.push(new THREE.Vector2(-600, -200));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = -80;
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    const createAtmosphere = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;
      
      const geometry = new THREE.SphereGeometry(800, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float time;
          
          void main() {
            float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 atmosphere = vec3(0.2, 0.4, 0.9) * intensity;
            
            float pulse = sin(time * 1.5) * 0.1 + 0.9;
            atmosphere *= pulse;
            
            gl_FragColor = vec4(atmosphere, intensity * 0.15);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene.add(atmosphere);
      refs.atmosphere = atmosphere;
    };

    const animate = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene || !refs.camera || !refs.renderer) return;

      refs.animationId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;

      // Update stars
      refs.stars.forEach((starField) => {
        if (starField.material.uniforms) {
          starField.material.uniforms.time.value = time;
        }
      });

      // Update nebula
      if (refs.nebula && refs.nebula.material.uniforms) {
        refs.nebula.material.uniforms.time.value = time;
      }

      // Update atmosphere
      if (refs.atmosphere && refs.atmosphere.material.uniforms) {
        refs.atmosphere.material.uniforms.time.value = time;
      }

      // Smooth camera movement
      const smoothingFactor = 0.03;
      smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * smoothingFactor;
      smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * smoothingFactor;
      smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * smoothingFactor;
      
      // Add floating motion
      const floatX = Math.sin(time * 0.2) * 3;
      const floatY = Math.cos(time * 0.15) * 2;
      
      refs.camera.position.x = smoothCameraPos.current.x + floatX;
      refs.camera.position.y = smoothCameraPos.current.y + floatY;
      refs.camera.position.z = smoothCameraPos.current.z;
      refs.camera.lookAt(0, 0, -400);

      // Parallax mountains
      refs.mountains.forEach((mountain, i) => {
        const parallaxFactor = 1 + i * 0.3;
        mountain.position.x = Math.sin(time * 0.1) * 5 * parallaxFactor;
      });

      refs.renderer.render(refs.scene, refs.camera);
    };

    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (refs.camera && refs.renderer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    
    initThree();

    return () => {
      const { current: refs } = threeRefs;
      
      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }

      window.removeEventListener('resize', handleResize);

      // Cleanup Three.js resources
      if (refs.renderer) {
        refs.renderer.dispose();
      }
    };
  }, []);

  // Device motion handling
  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.accelerationIncludingGravity) {
        const { x, y } = event.accelerationIncludingGravity;
        motionX.set((x || 0) * 1.5);
        motionY.set((y || 0) * 1.5);
      }
    };

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      motionX.set((gamma || 0) * 0.3);
      motionY.set((beta || 0) * 0.3);
    };

    // Request permission for device motion on iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      });
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [motionX, motionY]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      
      setScrollProgress(progress);
      const newSection = Math.floor(progress * totalSections);
      setCurrentSection(newSection);

      const { current: refs } = threeRefs;
      
      // Camera positions for each section
      const cameraPositions = [
        { x: 0, y: 30, z: 100 },     // CAREERATE
        { x: 20, y: 50, z: 50 },     // 5 AI AGENTS
        { x: -20, y: 70, z: 0 },     // VIBE HOSTING
        { x: 0, y: 90, z: -50 },     // REAL-TIME WORKFLOW
        { x: 0, y: 110, z: -100 }    // READY TO DEPLOY
      ];
      
      const currentPos = cameraPositions[newSection] || cameraPositions[0];
      const nextPos = cameraPositions[newSection + 1] || currentPos;
      const sectionProgress = (progress * totalSections) % 1;
      
      refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
      refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  // GSAP animations
  useEffect(() => {
    if (!isReady) return;

    const tl = gsap.timeline();
    
    // Animate hero content
    if (heroContentRef.current) {
      tl.from(heroContentRef.current.children, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: [0.22, 1, 0.36, 1]
      });
    }

    // Animate scroll indicator
    if (scrollIndicatorRef.current) {
      tl.from(scrollIndicatorRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: [0.22, 1, 0.36, 1]
      }, "-=0.5");
    }

    return () => {
      tl.kill();
    };
  }, [isReady]);

  const sectionTitles = [
    { 
      title: "CAREERATE", 
      subtitle: "Agentic DevOps Platform",
      description: "Where AI agents think, communicate, and deploy with vibe hosting principles"
    },
    { 
      title: "5 AI AGENTS", 
      subtitle: "Working in Harmony",
      description: "Planner • Builder • Tester • Deployer • Monitor agents collaborate through A2A protocols"
    },
    { 
      title: "VIBE HOSTING", 
      subtitle: "Beyond Traditional DevOps",
      description: "Embrace the vibes, accept exponentials, forget infrastructure complexity"
    },
    {
      title: "REAL-TIME WORKFLOW",
      subtitle: "Visual Agent Communication", 
      description: "Watch agents collaborate, delegate tasks, and heal issues autonomously"
    },
    {
      title: "READY TO DEPLOY?",
      subtitle: "Start Your Agentic Journey",
      description: "Experience the future of DevOps with intelligent agents and vibe hosting"
    }
  ];

  const currentContent = sectionTitles[currentSection] || sectionTitles[0];

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height: '500vh' }}>
      {/* Three.js Canvas - Fixed position */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #000000 100%)' }}
      />
      
      {/* Content that changes on scroll */}
      <div className="sticky top-0 h-screen z-10 flex flex-col justify-center items-center text-center px-6">
        <motion.div
          ref={heroContentRef}
          className="max-w-6xl mx-auto"
          style={{
            x: smoothMotionX,
            y: smoothMotionY,
          }}
        >
          {/* Main Title */}
          <motion.h1
            ref={titleRef}
            className={`text-6xl md:text-8xl lg:text-9xl font-bold mb-6 ${
              currentSection === 0 ? 'text-white' : 
              currentSection === 1 ? 'bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent' :
              currentSection === 2 ? 'bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent' :
              currentSection === 3 ? 'bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent' :
              'bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent'
            }`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentContent.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            ref={subtitleRef}
            className="text-2xl md:text-4xl lg:text-5xl font-light mb-8 text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentContent.subtitle}
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentContent.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg font-medium rounded-full backdrop-blur-sm border border-white/20 shadow-2xl transition-all duration-300"
                onClick={() => window.location.href = "/api/auth/azure"}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Launch Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 px-8 py-6 text-lg font-medium rounded-full backdrop-blur-sm transition-all duration-300"
                onClick={() => window.location.href = "/api/auth/github"}
              >
                <Github className="mr-2 h-5 w-5" />
                Connect GitHub
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            className="mt-16 flex flex-wrap justify-center gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {[
              { icon: Bot, label: "AI Agents" },
              { icon: Cloud, label: "Multi-Cloud" },
              { icon: Shield, label: "Security" },
              { icon: Activity, label: "Monitoring" },
              { icon: Workflow, label: "Automation" },
              { icon: Zap, label: "Performance" }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              >
                <feature.icon className="h-6 w-6 text-blue-400" />
                <span className="text-xs text-gray-300">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>



      {/* Glass overlay for depth */}
      <div className="absolute inset-0 z-5 bg-gradient-to-b from-transparent via-black/10 to-black/30 pointer-events-none" />
    </div>
  );
};