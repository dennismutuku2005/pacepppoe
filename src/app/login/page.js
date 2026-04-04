"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import authService from '@/lib/auth'

export default function LoginPage() {
    const router = useRouter()
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    useEffect(() => {
        // Check if already logged in
        if (authService.isAuthenticated()) {
            router.push('/dashboard')
        }
    }, [router])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const enterDashboard = async (e) => {
        e.preventDefault()
        setError('')
        setIsAuthenticating(true)

        try {
            const result = await authService.login(formData.username, formData.password)

            if (result.success) {
                setIsAuthenticating(false)
                setIsRedirecting(true)

                setTimeout(() => {
                    router.push(`/dashboard`)
                }, 400)
            } else {
                setError(result.message || 'Login failed. Please check your credentials.')
                setIsAuthenticating(false)
            }
        } catch (err) {
            setError('Network error. Please try again.')
            console.error('Login error:', err)
            setIsAuthenticating(false)
        }
    }

    if (isRedirecting) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background font-figtree transition-colors duration-300">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-4 border-pace-border" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pace-purple animate-spin" />
                        <div className="absolute inset-2 rounded-full bg-pace-purple/10 animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen flex bg-background font-figtree text-[13px] overflow-hidden transition-colors duration-300">

            {/* Login Container */}
            <div className="w-full lg:w-[500px] h-full bg-card-bg border-r border-pace-border flex flex-col justify-center px-12 lg:px-20 relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full"
                >
                    <div className="mb-12 flex flex-col items-center">
                        <div className="flex mb-10 justify-center">
                            <Image src="/logoc.png" alt="Pace Wisp" width={130} height={42} className="h-11 w-auto object-contain" priority />
                        </div>
                        <h1 className="text-[26px] font-bold text-admin-value leading-none tracking-tight text-center">Pace Wisp Portal</h1>
                    </div>

                    <form onSubmit={enterDashboard} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded flex items-center gap-2 text-[12px] font-bold animate-in fade-in zoom-in-95 duration-300">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-admin-label mb-2 uppercase tracking-[2px]">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={isAuthenticating}
                                className="w-full px-4 py-3 rounded-lg border border-pace-border bg-pace-bg-subtle focus:bg-card-bg focus:border-pace-purple outline-none transition-all placeholder:text-admin-dim/40 font-bold text-admin-value disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="paceadmin"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold text-admin-label uppercase tracking-[2px]">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isAuthenticating}
                                    className="w-full px-4 py-3 pr-12 rounded-lg border border-pace-border bg-pace-bg-subtle focus:bg-card-bg focus:border-pace-purple outline-none transition-all placeholder:text-admin-dim/40 font-bold text-admin-value disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className="w-full bg-pace-purple text-white py-3.5 rounded font-bold text-[12px] uppercase tracking-[3px] hover:bg-[#3d1a75] transition-all active:scale-[0.99] mt-6 shadow-none disabled:opacity-50 flex items-center justify-center"
                        >
                            {isAuthenticating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    <div className="mt-16 pt-10 border-t border-pace-border">
                        <p className="text-[10px] text-admin-dim font-bold leading-relaxed uppercase tracking-widest">
                            © 2026 Pace Wisp. All rights reserved.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Hero Side */}
            <div className="hidden lg:flex flex-1 bg-pace-bg-subtle items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image 
                        src="/sidesvg.svg" 
                        alt="Side Background" 
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>
        </div>
    )
}
