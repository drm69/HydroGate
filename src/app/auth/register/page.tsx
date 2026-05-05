"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function RegisterPage() {
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!username || !email || !password) {
            setError("Semua field wajib diisi.")
            return
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter.")
            return
        }

        try {
            setLoading(true)

            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            await updateProfile(user, {
                displayName: username,
            })

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                username,
                email: user.email,
                role: "admin",
                createdAt: serverTimestamp(),
            })

            setSuccess("User berhasil ditambahkan.")
            router.push("/login")
        } catch (err: unknown) {
            if (err instanceof FirebaseError) {
                switch (err.code) {
                    case "auth/email-already-in-use":
                        setError("Email sudah digunakan.")
                        break
                    case "auth/invalid-email":
                        setError("Format email tidak valid.")
                        break
                    case "auth/weak-password":
                        setError("Password terlalu lemah.")
                        break
                    default:
                        setError("Gagal menambahkan user. Coba lagi.")
                }
            } else {
                setError("Gagal menambahkan user. Coba lagi.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#020d1a] via-[#04111f] to-[#05182b] text-white">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-[120px]" />
            </div>

            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md">
                    <div className="mb-8 text-center">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                            Superuser Access
                        </p>
                        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white">
                            Tambah User
                        </h1>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Tambah user baru untuk mengelola pintu air, memantau status sistem, dan
                            mengakses kontrol admin.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-300"
                                >
                                    Password
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition hover:text-cyan-400"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                                {success}
                            </div>
                        )}

                        <div className="mt-6 flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Menambahkan..." : "Tambah User"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Kembali ke{" "}
                        <Link href="/auth/login" className="text-cyan-400 transition hover:text-cyan-300">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}