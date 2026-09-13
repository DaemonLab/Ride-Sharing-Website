import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

/**
 * 404 Not Found page — shown for any URL that doesn't match a known route.
 * Matches the site's glassmorphic design system.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute w-[30rem] h-[30rem] rounded-full bg-primary/10 blur-[120px] -top-20 -left-20 pointer-events-none animate-float-slow" />
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-secondary/10 blur-[110px] -bottom-24 -right-16 pointer-events-none animate-float" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="glass-strong rounded-2xl p-10 sm:p-12">
          <div className="mb-6">
            <span className="font-display text-8xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent select-none">
              404
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-ink mb-3">
            Page Not Found
          </h1>
          <p className="text-ink-variant text-sm leading-relaxed mb-8">
            The page you are looking for does not exist or may have been moved.
            Let us get you back on the road.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-primary to-secondary text-white font-semibold text-sm shadow-glow hover:-translate-y-0.5 transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              to="/find"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg glass hover:border-primary/40 font-semibold text-sm text-ink hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-4 h-4" />
              Find a Ride
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
