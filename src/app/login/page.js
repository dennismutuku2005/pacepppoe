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
            const user = authService.getUser()
            const role = (user?.type || user?.role || '').toLowerCase()
            const isAdmin = role === 'admin' || role === 'superadmin'
            router.replace(isAdmin ? '/admin' : '/dashboard')
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
                    const role = (result.data?.user?.type || result.data?.user?.role || '').toLowerCase()
                    const isAdmin = role === 'admin' || role === 'superadmin'
                    router.replace(isAdmin ? '/admin' : '/dashboard')
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
        <div className="min-h-screen min-h-dvh w-full flex bg-white font-figtree text-sm overflow-x-hidden">
            {/* Login Form Side */}
            <div className="w-full lg:w-[480px] min-h-screen lg:min-h-full flex flex-col justify-between lg:justify-center px-6 sm:px-12 lg:px-14 py-8 sm:py-12 relative z-10 bg-white mx-auto lg:mx-0">
                <div className="hidden lg:block" />
                
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-sm mx-auto"
                >
                    <div className="mb-8 sm:mb-10 flex flex-col items-center text-center">
                        <div className="mb-5 sm:mb-6 flex justify-center">
                            <Image src="/logoc.png" alt="Pace" width={180} height={56} className="h-11 sm:h-12 w-auto object-contain" priority />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-admin-value tracking-tight">ISP LOGIN</h1>
                        <p className="text-xs text-admin-dim font-medium mt-1">Authenticate to access ISP operations control</p>
                    </div>

                    <form onSubmit={enterDashboard} className="space-y-4 sm:space-y-5">
                        {error && (
                            <div className="bg-red-500/5 border border-red-500/15 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-medium">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-admin-dim uppercase tracking-wider pl-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                autoComplete="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={isAuthenticating}
                                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-medium text-admin-value text-sm disabled:opacity-50"
                                placeholder="Enter username"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-admin-dim uppercase tracking-wider pl-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isAuthenticating}
                                    className="w-full px-4 py-3 sm:py-3.5 pr-12 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-medium text-admin-value text-sm disabled:opacity-50"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value transition-colors p-2 cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className="w-full bg-pace-purple text-white py-3.5 rounded-xl font-semibold text-sm hover:opacity-95 transition-all active:scale-[0.99] mt-3 shadow-none disabled:opacity-50 flex items-center justify-center cursor-pointer"
                        >
                            {isAuthenticating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>
                </motion.div>

                <div className="mt-8 pt-6 border-t border-pace-border max-w-sm mx-auto w-full">
                    <div className="flex items-center justify-between text-xs text-admin-dim font-medium">
                        <p>
                            Pace Networks © 2026
                        </p>
                        <p>
                            Version {APP_VERSION}
                        </p>
                    </div>
                </div>
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
                <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-white/70 via-white/20 to-transparent" />
            </div>
        </div>
    )
}
