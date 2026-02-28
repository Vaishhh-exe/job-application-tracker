"use client"

interface AuthTabsProps {
  activeTab: "login" | "signup"
  onTabChange: (tab: "login" | "signup") => void
}

export function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <>
      <style>{`
        @keyframes slideIndicator {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .auth-tabs-container {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.375rem;
          border-radius: 0.875rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          position: relative;
          margin-bottom: 1.75rem;
        }

        .auth-tab {
          flex: 1;
          padding: 0.625rem 1rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 300ms ease;
          background: transparent;
          position: relative;
          z-index: 1;
        }

        .auth-tab:hover:not(.active) {
          color: rgba(255, 255, 255, 0.8);
        }

        .auth-tab.active {
          color: white;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
      `}</style>

      <div className="auth-tabs-container">
        <button
          onClick={() => onTabChange("login")}
          className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
        >
          Login
        </button>
        <button
          onClick={() => onTabChange("signup")}
          className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
        >
          Sign Up
        </button>
      </div>
    </>
  )
}
