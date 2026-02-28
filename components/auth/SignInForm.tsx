"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { AuthTabs } from "./AuthTabs"
import { AuthInput } from "./AuthInput"

export function SignInForm() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  // Reset form when switching modes
  useEffect(() => {
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setErrors({})
  }, [mode])

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (mode === "signup") {
      if (!name.trim()) {
        newErrors.name = "Name is required"
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (mode === "signup") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (mode === "login") {
        // Sign in with credentials
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setErrors({ email: "Invalid email or password" })
        } else if (result?.ok) {
          window.location.href = "/applications"
        }
      } else {
        // Sign up
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })

        if (response.ok) {
          // Automatically sign in after registration
          await signIn("credentials", {
            email,
            password,
            redirect: false,
          })
          window.location.href = "/applications"
        } else {
          const data = await response.json()
          setErrors({ email: data.message || "Registration failed" })
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      setErrors({ email: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/applications" })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    email &&
    password &&
    (mode === "login" || (name && confirmPassword && password === confirmPassword)) &&
    !isLoading

  return (
    <>
      <style>{`
        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .heading-gradient {
          background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.95) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .google-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 500ms ease;
        }

        .google-button:hover::before {
          left: 100%;
        }

        .google-button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .animate-spin-loading {
          animation: spin 1s linear infinite;
        }

        .auth-form-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0 1.5rem 0;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.875rem;
        }

        .auth-form-divider::before,
        .auth-form-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
        }

        .auth-submit-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(99, 102, 241, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.5);
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 300ms ease;
          position: relative;
          overflow: hidden;
          disabled:opacity-50 disabled:cursor-not-allowed;
        }

        .auth-submit-button:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.8);
          border-color: rgba(99, 102, 241, 0.7);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }

        .auth-submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-form-container {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 3rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .auth-form-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .auth-branding-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 400px;
        }

        @media (max-width: 768px) {
          .auth-branding-section {
            min-height: auto;
            text-align: center;
          }
        }

        .auth-branding-section h1 {
          font-size: 1.875rem;
        }

        .auth-branding-section h2 {
          font-size: 2.25rem;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .auth-branding-section h1 {
            font-size: 1.5rem;
          }

          .auth-branding-section h2 {
            font-size: 2rem;
          }
        }

        .auth-form-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
      `}</style>

      <div className="auth-form-container">
        {/* Branding Section - Left Side */}
        <div className="auth-branding-section space-y-4">
          {/* App Name */}
          <h1 className="text-4xl font-bold text-white tracking-tight">Meridian</h1>

          {/* Main Heading */}
          <h2 className="font-bold leading-tight tracking-tight space-y-1">
            <div className="heading-gradient">Track smarter.</div>
            <div className="heading-gradient">Land faster.</div>
          </h2>

          {/* Subheading */}
          <p className="text-white/70 text-sm leading-relaxed pt-2">
            Organize your job hunt with intelligent tracking and insights
          </p>
        </div>

        {/* Form Section - Right Side */}
        <div className="auth-form-section">
          {/* Authentication Tabs */}
          <AuthTabs activeTab={mode} onTabChange={setMode} />

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <AuthInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              error={errors.name}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
            />
          )}
          <AuthInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors({ ...errors, email: undefined })
            }}
            error={errors.email}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.5 3A1.5 1.5 0 001 4.5v.793c.026.009.051.02.076.032L10 9.071l8.924-4.746c.025-.012.05-.023.076-.032V4.5A1.5 1.5 0 0017.5 3h-15z" />
                <path d="M18.941 7.046A1.5 1.5 0 0019 7.5v6A1.5 1.5 0 0117.5 15h-15A1.5 1.5 0 011 13.5v-6c0-.173.025-.342.076-.502L10 11.571l8.924-5.023z" />
              </svg>
            }
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors({ ...errors, password: undefined })
            }}
            error={errors.password}
            showPasswordToggle
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />

          {mode === "signup" && (
            <AuthInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: undefined })
              }}
              error={errors.confirmPassword}
              showPasswordToggle
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="auth-submit-button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin-loading w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-form-divider">
          <span>OR</span>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="google-button relative overflow-hidden
            w-full flex items-center justify-center gap-3
            px-6 py-3
            bg-white/15 hover:bg-white/20
            border border-white/25 hover:border-white/35
            rounded-xl
            text-white font-semibold text-base
            transition-all duration-300
            hover:scale-[1.02]
            active:scale-[0.95]
            disabled:opacity-70 disabled:cursor-not-allowed
            disabled:hover:scale-100
          "
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Terms and Conditions */}
        <p className="text-center text-white/50 text-xs leading-relaxed">
          By signing in, you agree to our&nbsp;
          <a href="#" className="text-white/70 hover:text-white/90 transition-colors underline underline-offset-2">
            Terms
          </a>
          &nbsp;•&nbsp;
          <a href="#" className="text-white/70 hover:text-white/90 transition-colors underline underline-offset-2">
            Privacy
          </a>
        </p>
        </div>
      </div>
    </>
  )
}