"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import authService from '@/lib/auth'
import { APP_VERSION } from '@/lib/version'

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
                setError(result.message || 'Verification failed.')
                setIsAuthenticating(false)
            }
        } catch (err) {
            setError('Connection failure.')
            setIsAuthenticating(false)
        }
    }

    if (isRedirecting) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-pace-purple font-figtree">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen flex bg-white font-figtree text-sm overflow-hidden">
            {/* Login Form Side */}
            <div className="w-full lg:w-[480px] h-full flex flex-col justify-center px-12 lg:px-20 relative z-10 bg-white shadow-xl">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full"
                >
                    <div className="mb-10">
                        <div className="mb-8">
                            <Image src="/logoc.png" alt="Pace" width={140} height={46} className="h-10 w-auto object-contain" priority />
                        </div>
                        <h1 className="text-2xl font-semibold text-admin-value tracking-tight">PPPoE Portal</h1>
                        <p className="text-xs font-medium text-admin-dim mt-1">Administrative Node Management</p>
                    </div>

                    <form onSubmit={enterDashboard} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/5 border border-red-500/10 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-[11px] font-medium">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={isAuthenticating}
                                className="w-full px-4 py-3 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-medium text-admin-value disabled:opacity-50"
                                placeholder="Enter username"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isAuthenticating}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-medium text-admin-value disabled:opacity-50"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value transition-colors p-2"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className="w-full bg-pace-purple text-white py-3.5 rounded-xl font-medium text-sm hover:opacity-95 transition-all active:scale-[0.98] mt-4 shadow-sm disabled:opacity-50 flex items-center justify-center"
                        >
                            {isAuthenticating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-pace-border">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">
                                Pace Networks © 2026
                            </p>
                            <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">
                                Version {APP_VERSION}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Visual Side */}
            <div className="hidden lg:block flex-1 relative bg-white overflow-hidden">
                <Image 
                    src="/sidesvg.svg" 
                    alt="Side" 
                    fill
                    className="object-cover w-full h-full"
                    priority
                />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/70 via-white/20 to-transparent" />
            </div>
        </div>
    )
}
