"use client"

import { useRef, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useClimateStore } from "@/hooks/useClimateStore"
import { getColorForValue } from "@/lib/colorScales"

function DataPoints() {
  const { data, layer, setSelection } = useClimateStore()
  const pointsRef = useRef<THREE.Group>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const { camera, gl } = useThree()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!pointsRef.current) return

      const rect = gl.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.current.setFromCamera({ x, y }, camera)
      const intersects = raycaster.current.intersectObjects(pointsRef.current.children)

      if (intersects.length > 0) {
        const point = intersects[0].object.userData
        setSelection({
          lat: point.lat,
          lon: point.lon,
          name: point.region,
          value: point.value,
          region: point.region,
        })
      }
    }

    gl.domElement.addEventListener("click", handleClick)
    return () => gl.domElement.removeEventListener("click", handleClick)
  }, [camera, gl, setSelection])

  return (
    <group ref={pointsRef}>
      {data.map((datum, index) => {
        const phi = (90 - datum.lat) * (Math.PI / 180)
        const theta = (datum.lon + 180) * (Math.PI / 180)
        const radius = 2.08

        const x = -(radius * Math.sin(phi) * Math.cos(theta))
        const z = radius * Math.sin(phi) * Math.sin(theta)
        const y = radius * Math.cos(phi)

        const color = getColorForValue(layer, datum.value)

        return (
          <mesh
            key={`${index}-${datum.lat}-${datum.lon}`}
            position={[x, y, z]}
            userData={{ lat: datum.lat, lon: datum.lon, value: datum.value, region: datum.region }}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const texture = createEarthTexture()
    setEarthTexture(texture)
  }, [])

  // Very slow continuous rotation like Google Earth
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003 // Very slow rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0005 // Clouds rotate slightly faster
    }
  })

  // Create a realistic Earth material with continents
  const earthMaterial = earthTexture
    ? new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpScale: 0.05,
        specular: new THREE.Color("#222222"),
        shininess: 15,
      })
    : new THREE.MeshPhongMaterial({
        color: "#2b5797",
      })

  return (
    <group>
      {/* Main Earth sphere with continents */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Subtle clouds layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.03, 64, 64]} />
        <meshPhongMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          map={createCloudTexture()}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function createEarthTexture(): THREE.Texture {
  const loader = new THREE.TextureLoader()
  // Textura de la Tierra en alta resolución
  const texture = loader.load("https://unpkg.com/three-globe@2.24.11/example/img/earth-day.jpg", (tex) => {
    tex.needsUpdate = true
  })
  return texture
}

function createCloudTexture(): THREE.Texture {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "rgba(255, 255, 255, 0)"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw random cloud patches
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = 30 + Math.random() * 60

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    ctx.fillStyle = gradient
    ctx.fillRect(x - size, y - size, size * 2, size * 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function Stars() {
  const starsRef = useRef<THREE.Points>(null)
  const stars2Ref = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!starsRef.current || !stars2Ref.current) return

    // Layer 1: Distant stars
    const geometry1 = new THREE.BufferGeometry()
    const vertices1 = []
    for (let i = 0; i < 3000; i++) {
      const x = (Math.random() - 0.5) * 150
      const y = (Math.random() - 0.5) * 150
      const z = (Math.random() - 0.5) * 150
      vertices1.push(x, y, z)
    }
    geometry1.setAttribute("position", new THREE.Float32BufferAttribute(vertices1, 3))
    starsRef.current.geometry = geometry1

    // Layer 2: Closer stars
    const geometry2 = new THREE.BufferGeometry()
    const vertices2 = []
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 100
      const y = (Math.random() - 0.5) * 100
      const z = (Math.random() - 0.5) * 100
      vertices2.push(x, y, z)
    }
    geometry2.setAttribute("position", new THREE.Float32BufferAttribute(vertices2, 3))
    stars2Ref.current.geometry = geometry2
  }, [])

  // Slow parallax rotation
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00005
      starsRef.current.rotation.x += 0.00002
    }
    if (stars2Ref.current) {
      stars2Ref.current.rotation.y += 0.0001
      stars2Ref.current.rotation.x += 0.00004
    }
  })

  return (
    <>
      <points ref={starsRef}>
        <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.4} />
      </points>
      <points ref={stars2Ref}>
        <pointsMaterial size={0.12} color="#ffffff" transparent opacity={0.6} />
      </points>
    </>
  )
}

export function GlobeScene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/60">Cargando globo 3D...</div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        {/* Dynamic lighting setup */}
        <ambientLight intensity={0.3} />
        {/* Sun light from the right */}
        <directionalLight position={[10, 5, 5]} intensity={1.5} color="#ffffee" />
        {/* Subtle fill light from the left */}
        <directionalLight position={[-8, -3, -5]} intensity={0.4} color="#4a9eff" />

        <Stars />
        <Earth />
        <DataPoints />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          autoRotate={false}
          rotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
