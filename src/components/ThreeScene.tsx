// src/components/ThreeScene.tsx
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Model from './Model'

const ThreeScene: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      <Suspense fallback={null}>
        <Model />
        <Environment preset="sunset" />
      </Suspense>
      <OrbitControls enableZoom={true} />
    </Canvas>
  )
}

export default ThreeScene