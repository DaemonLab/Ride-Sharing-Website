// src/components/Model.tsx
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
// import "../assets/car.glb"

const Model: React.FC = () => {
  const modelRef = useRef<Group>(null)
  const { scene } = useGLTF('/Users/abhishek/Desktop/Web Dev/Ride Sharing/src/assets/car.glb') 

  // Animate rotation
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01
    }
  })

  return <primitive ref={modelRef} object={scene} scale={1.5} />
}

export default Model