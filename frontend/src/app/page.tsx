"use client"
import { useAuthStore } from '@/stores/auth'
import Link from 'next/link'
import React from 'react'

const HomePage = () => {
  const { user } = useAuthStore()
  console.log(user)
  return (
    <div>
      <Link href="/login">Login</Link>
    </div>
  )
}

export default HomePage