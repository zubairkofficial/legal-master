import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/theme-provider";
import { Button } from "../../components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://legalmasterai.com/app/logo.png" alt="" className="w-40 h-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-[#BB8A28] transition">Home</Link>
            <Link to="/features" className="text-foreground hover:text-[#BB8A28] transition">Features</Link>
            <Link to="/legal-assistant" className="text-foreground hover:text-[#BB8A28] transition">Legal Assistant</Link>
            <Link to="/pricing" className="text-foreground hover:text-[#BB8A28] transition">Pricing</Link>
            <Link to="/blog" className="text-foreground hover:text-[#BB8A28] transition">Blog</Link>
            <Link to="/about" className="text-foreground hover:text-[#BB8A28] transition">About</Link>
          </nav>

          {/* Right Side - Theme Toggle and CTA */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-foreground hover:bg-muted transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <div className="hidden md:flex items-center space-x-3">
              <Link to="/sign-in" className="text-foreground hover:text-[#BB8A28] transition">
                Sign In
              </Link>
              <Button size="sm" asChild>
                <Link to="/sign-up">
                  Start Consulting
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-foreground hover:bg-muted transition"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12"></path>
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18"></path>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 py-3 border-t border-border">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-foreground hover:text-[#BB8A28] transition py-2">Home</Link>
              <Link to="/features" className="text-foreground hover:text-[#BB8A28] transition py-2">Features</Link>
              <Link to="/legal-assistant" className="text-foreground hover:text-[#BB8A28] transition py-2">Legal Assistant</Link>
              <Link to="/pricing" className="text-foreground hover:text-[#BB8A28] transition py-2">Pricing</Link>
              <Link to="/blog" className="text-foreground hover:text-[#BB8A28] transition py-2">Blog</Link>
              <Link to="/about" className="text-foreground hover:text-[#BB8A28] transition py-2">About</Link>

              <div className="flex flex-col space-y-3 pt-3 border-t border-border">
                <Link to="/sign-in" className="text-foreground hover:text-[#BB8A28] transition py-2">
                  Sign In
                </Link>
                <Button asChild>
                  <Link to="/sign-up">
                    Start Consulting
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 