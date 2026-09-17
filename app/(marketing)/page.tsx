import { ThemeToggle } from "@/components/theme-toggle";
import { ExploreDemoButton } from "@/components/marketing/explore-demo-button";

// Landing page. Visual concept: "every blueprint starts as a scribble" —
// the product's actual mechanic (messy idea → structured problem/
// audience/solution/MVP) is the hero itself, not illustrated separately
// from it. See marketing.css for the full token system and animation.
export default function LandingPage() {
  return (
    <>
      <nav className="mkt-nav">
        <div className="mkt-wordmark mkt-display">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="8.5" stroke="var(--mkt-cyan)" strokeWidth="1.4" />
            <path d="M11 2.5V5M11 17V19.5M2.5 11H5M17 11H19.5" stroke="var(--mkt-cyan)" strokeWidth="1.4" />
            <circle cx="11" cy="11" r="1.6" fill="var(--mkt-amber)" />
          </svg>
          IdeaVault
        </div>
        <div className="mkt-nav-right">
          <ThemeToggle className="mkt-theme-toggle" />
          <a href="/login" className="mkt-nav-link">
            Sign in
          </a>
        </div>
      </nav>

      <section className="mkt-hero">
        <div className="mkt-grid-bg" aria-hidden="true" />

        <div className="mkt-hero-stage">
          <div className="mkt-scribbles" aria-hidden="true">
            <div className="mkt-card mkt-card-1 mkt-hand" style={{ "--rot": "-4deg" } as React.CSSProperties}>
              ppl always late 4 class bc dining hall lines are insane
            </div>
            <div className="mkt-card mkt-card-2 mkt-hand" style={{ "--rot": "3deg" } as React.CSSProperties}>
              mostly commuter students w/ like 15 min between classes
            </div>
            <div className="mkt-card mkt-card-3 mkt-hand" style={{ "--rot": "-2deg" } as React.CSSProperties}>
              what if you could just... pre-order and grab it??
            </div>
          </div>

          <svg className="mkt-connectors" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
            <path className="mkt-line-1" pathLength={1} d="M230,55 C 380,55 380,140 540,140" />
            <path className="mkt-line-2" pathLength={1} d="M430,195 C 480,195 480,205 540,205" />
            <path className="mkt-line-3" pathLength={1} d="M230,335 C 380,335 380,265 540,265" />
          </svg>

          <div className="mkt-spec">
            <div className="mkt-spec-head mkt-mono">
              <span>PROJECT SPEC</span>
              <span>REV 01 · NTS</span>
            </div>
            <div className="mkt-spec-row" data-row="problem">
              <span className="mkt-spec-label mkt-mono">PROBLEM</span>
              <span className="mkt-spec-value">Students miss meals between back-to-back classes.</span>
            </div>
            <div className="mkt-spec-row" data-row="audience">
              <span className="mkt-spec-label mkt-mono">AUDIENCE</span>
              <span className="mkt-spec-value">Commuter students with tight 15-minute gaps.</span>
            </div>
            <div className="mkt-spec-row" data-row="solution">
              <span className="mkt-spec-label mkt-mono">SOLUTION</span>
              <span className="mkt-spec-value">Pre-order from campus carts, skip the line.</span>
            </div>
            <div className="mkt-spec-row" data-row="mvp">
              <span className="mkt-spec-label mkt-mono">MVP</span>
              <span className="mkt-spec-value">3 carts. Pickup slots. No delivery yet.</span>
            </div>
          </div>
        </div>

        <div className="mkt-hero-copy">
          <h1 className="mkt-display">Every blueprint starts as a scribble.</h1>
          <p>
            Capture the mess. Structure the problem, audience, and solution. Plan the MVP. Ship it —
            with an AI copilot that only writes what you approve.
          </p>
          <div className="mkt-cta">
            <ExploreDemoButton className="mkt-btn-primary" />
            <a href="/register" className="mkt-btn-secondary">
              Start capturing — free
            </a>
          </div>
          <p className="mkt-cta-subtext">
            No signup. Signs you into a live, shared demo account so you can click around the real
            app. <a href="/login">Sign in</a> if you already have your own account.
          </p>
        </div>
      </section>

      <section className="mkt-stages">
        <div className="mkt-stages-row">
          <div className="mkt-stage">
            <span className="mkt-stage-rev mkt-mono">REV 01 — CAPTURE</span>
            <h3 className="mkt-display">Capture</h3>
            <p>Drop the idea before it slips away.</p>
          </div>
          <div className="mkt-stage">
            <span className="mkt-stage-rev mkt-mono">REV 02 — STRUCTURE</span>
            <h3 className="mkt-display">Structure</h3>
            <p>Problem, audience, solution — defined.</p>
          </div>
          <div className="mkt-stage">
            <span className="mkt-stage-rev mkt-mono">REV 03 — PLAN</span>
            <h3 className="mkt-display">Plan</h3>
            <p>MVP scope and a real roadmap.</p>
          </div>
          <div className="mkt-stage">
            <span className="mkt-stage-rev mkt-mono">REV 04 — BUILD</span>
            <h3 className="mkt-display">Build</h3>
            <p>Tasks, AI copilot, shipped.</p>
          </div>
        </div>
      </section>

      <section className="mkt-values">
        <div className="mkt-values-row">
          <div className="mkt-value">
            <span className="mkt-mono">→</span>
            <span>Free AI copilot — Gemini-powered, 50 calls a day</span>
          </div>
          <div className="mkt-value">
            <span className="mkt-mono">→</span>
            <span>Invite your team as editors or viewers</span>
          </div>
          <div className="mkt-value">
            <span className="mkt-mono">→</span>
            <span>AI proposes changes, you approve — nothing writes itself in</span>
          </div>
        </div>
      </section>

      <footer className="mkt-footer mkt-mono">
        <span>© IDEAVAULT AI</span>
        <a href="/register" className="mkt-nav-link">
          Start capturing →
        </a>
      </footer>
    </>
  );
}
