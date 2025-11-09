"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useClimateStore } from "@/hooks/useClimateStore"
import { getColorForValue } from "@/lib/colorScales"
import { getRegionsWithAnomalies } from "@/lib/climateDataLoader"

const HEAT_COLORS = [
  "#3b82f6", // azul frío
  "#60a5fa", // azul claro
  "#fbbf24", // amarillo
  "#f97316", // naranja
  "#dc2626", // rojo caliente
]

function DataPoints() {
  const { data, setSelection, selection, layer } = useClimateStore()
  const [hoverRegion, setHoverRegion] = useState<string | null>(null)
  const pointsRef = useRef<THREE.Group>(null)

  const handlePointerOver = (region: string) => setHoverRegion(region)
  const handlePointerOut = () => setHoverRegion(null)
  const handleClick = (region: string) => setSelection(region)

  return (
    <group ref={pointsRef}>
      {data.map((datum, index) => {
        const phi = (90 - datum.lat) * (Math.PI / 180)
        const theta = (datum.lon + 180) * (Math.PI / 180)
        const radius = 2.08

        const x = -(radius * Math.sin(phi) * Math.cos(theta))
        const z = radius * Math.sin(phi) * Math.sin(theta)
        const y = radius * Math.cos(phi)

        const isHovered = hoverRegion === datum.region
        const isSelected = selection === datum.region
        const color = isSelected
          ? "#FFD700"
          : isHovered
          ? "#00BFFF"
          : getColorForValue(layer, datum.value)

        return (
          <mesh
            key={`${index}-${datum.lat}-${datum.lon}`}
            position={[x, y, z]}
            userData={{ lat: datum.lat, lon: datum.lon, value: datum.value, region: datum.region }}
            onPointerOver={() => handlePointerOver(datum.region)}
            onPointerOut={handlePointerOut}
            onClick={() => handleClick(datum.region)}
          >
            <sphereGeometry args={[isHovered ? 0.06 : 0.04, 8, 8]} />
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

  // Create a realistic Earth material with continents
  const earthMaterial = earthTexture
    ? new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpScale: 0.05,
        specular: new THREE.Color("#292828ff"),
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

function latLonToXYZ(lat: number, lon: number, radius = 2.13) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return [x, y, z]
}

function lerpColor(a: string, b: string, t: number) {
  const ca = new THREE.Color(a)
  const cb = new THREE.Color(b)
  return ca.lerp(cb, t)
}

function getHeatGradientColor(temp: number, min = 10, max = 30) {
  // Normaliza la temperatura entre min y max
  const t = Math.max(0, Math.min(1, (temp - min) / (max - min)))
  // Divide la escala en 4 tramos
  const idx = Math.floor(t * (HEAT_COLORS.length - 1))
  const localT = (t * (HEAT_COLORS.length - 1)) - idx
  return lerpColor(HEAT_COLORS[idx], HEAT_COLORS[idx + 1] || HEAT_COLORS[idx], localT)
}

function HeatSurfaceRegion({ lat, lon, temperature, anomaly }: { lat: number; lon: number; temperature: number; anomaly: number }) {
  const [x, y, z] = latLonToXYZ(lat, lon, 2)
  const geometry = useMemo(() => {
    const radius = 0.7
    const geo = new THREE.PlaneGeometry(radius * 2, radius * 2, 32, 32)
    const maxHeight = temperature > 10 ? Math.max(0.18, 0.18 + (temperature - 15) * 0.07) : 0.18
    const r2 = radius * radius
    const exponent = 2.8

    // Altura y color
    const colors = []
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const vx = geo.attributes.position.getX(i)
      const vy = geo.attributes.position.getY(i)
      const dist2 = vx * vx + vy * vy
      let z = 0
      let t = 0
      let alpha = 0

      if (dist2 <= r2) {
        const base = 1 - dist2 / r2
        z = maxHeight * Math.pow(base, exponent)
        t = maxHeight > 0 ? z / maxHeight : 0
        // Difumina el borde: alpha bajo cerca del borde
        alpha = Math.max(0, Math.min(1, base * 1.2))
      }

      geo.attributes.position.setZ(i, z)
      const color = getHeatGradientColor(temperature)
      const tipColor = lerpColor(color.getStyle(), "#dc2626", Math.max(0, Math.min(1, anomaly / 2)))
      const finalColor = color.clone().lerp(tipColor, t)
      colors.push(finalColor.r, finalColor.g, finalColor.b, alpha)
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4)) // 4 for RGBA
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [temperature, anomaly])

  const center = new THREE.Vector3(0, 0, 0)
  const position = new THREE.Vector3(x, y, z)
  const normal = position.clone().sub(center).normalize()

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    return q
  }, [x, y, z])

  return (
    <mesh
      position={[x, y, z]}
      geometry={geometry}
      quaternion={quaternion}
    >
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.85}
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  )
}

function RotatingGlobeGroup({ isInteracting, year }) {
  const globeGroupRef = useRef<THREE.Group>(null)
  const regions = getRegionsWithAnomalies(year)

  useFrame(() => {
    if (globeGroupRef.current && !isInteracting) {
      globeGroupRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={globeGroupRef}>
      <Earth />
      <DataPoints />
      {regions.map((region) =>
        region.coords ? (
          <HeatSurfaceRegion
            key={region.name}
            lat={region.coords.lat}
            lon={region.coords.lon}
            temperature={region.temperature}
            anomaly={region.anomaly}
          />
        ) : null
      )}
    </group>
  )
}

export function GlobeScene() {
  const [mounted, setMounted] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const { year } = useClimateStore()
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
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 5, 5]} intensity={1.5} color="#ffffee" />
        <directionalLight position={[-8, -3, -5]} intensity={0.4} color="#4a9eff" />

        <Stars />
        <RotatingGlobeGroup isInteracting={isInteracting} year={year} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          autoRotate={false}
          rotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>
    </div>
  )
}
