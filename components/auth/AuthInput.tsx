"use client"

import { useState } from "react"
import { InputHTMLAttributes } from "react"

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  showPasswordToggle?: boolean
}

export function AuthInput({
  label,
  error,
  icon,
  showPasswordToggle = false,
  type = "text",
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type

  return (
    <>
      <style>{`
        .auth-input-wrapper {
          position: relative;
          margin-bottom: 1rem;
        }

        .auth-input-label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }

        .auth-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input {
          width: 100%;
          padding: 0.75rem 1rem;
          padding-left: 2.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.9375rem;
          transition: all 300ms ease;
          backdrop-filter: blur(12px);
        }

        .auth-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .auth-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.35);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .auth-input:focus::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .auth-input-icon {
          position: absolute;
          left: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          color: rgba(255, 255, 255, 0.6);
          pointer-events: none;
        }

        .auth-input-password-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 200ms ease;
        }

        .auth-input-password-toggle:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .auth-input-error {
          margin-top: 0.375rem;
          font-size: 0.8125rem;
          color: #ff6b6b;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
      `}</style>

      <div className="auth-input-wrapper">
        <label className="auth-input-label">{label}</label>
        <div className="auth-input-container">
          {icon && <div className="auth-input-icon">{icon}</div>}
          <input
            type={inputType}
            className="auth-input"
            {...props}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-input-password-toggle"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M15.171 13.576l1.414 1.414A1 1 0 0016.586 14.341l-.293-.293.293.293a10.012 10.012 0 01-1.715 1.318l1.782 1.781a9.956 9.956 0 004.512-1.074l1.78 1.781a1 1 0 001.414-1.414l-14-14z" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <div className="auth-input-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </>
  )
}
