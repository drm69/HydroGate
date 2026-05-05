"use client"

import Link from "next/link"
import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Email dan password wajib diisi")
            return
        }

        try {
            setLoading(true)

            await signInWithEmailAndPassword(auth, email, password)

            router.push("/dashboard")
        } catch (err: any) {
            switch (err.code) {
                case "auth/invalid-credential":
                    setError("Email atau password salah")
                    break
                case "auth/user-not-found":
                    setError("User tidak ditemukan")
                    break
                default:
                    setError("Gagal login, coba lagi")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#020d1a] via-[#04111f] to-[#05182b] text-white">
            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md">
                    <div className="mb-8 text-center">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                            Superuser Access
                        </p>
                        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white">
                            Login ke HydroGate
                        </h1>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Masuk untuk mengelola pintu air, memantau status sistem, dan
                            mengakses kontrol admin.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* EMAIL */}
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white"
                        >
                            {loading ? "Loading..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Belum punya akun?{" "}
                        <Link href="/auth/register" className="text-cyan-400">
                            Daftar
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}