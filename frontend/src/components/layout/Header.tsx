import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../theme/theme-provider";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      theme === "dark" 
        ? "bg-gradient-to-r from-zinc-900/95 via-zinc-900/98 to-zinc-900/95 backdrop-blur-md" 
        : "bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-md",
      scrolled 
        ? "shadow-lg py-2" 
        : "py-4 border-b border-primary/10"
    )}>
      <div className="absolute  mx-20 inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] bg-grid-small-white/[0.05] dark:bg-grid-small-white/[0.05]" />
        {theme === "dark" && (
          <>
            <div className="absolute left-0 top-0 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute right-0 top-8 h-16 w-16 rounded-full bg-blue-500/20 blur-2xl" />
          </>
        )}
        {theme === "light" && (
          <>
            <div className="absolute right-1/4 top-0 h-16 w-60 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute left-1/4 top-8 h-12 w-24 rounded-full bg-blue-500/10 blur-xl" />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105 z-10">
            <img src="https://legalmasterai.com/app/logo.png" alt="" className="w-44 h-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10 z-10">
            {[
              { path: "/", label: "Home" },
              { path: "/features", label: "Features" },
              { path: "/legal-assistant", label: "Legal Assistant" },
              { path: "/pricing", label: "Pricing" },
              { path: "/blog", label: "Blog" },
              { path: "/about", label: "About" }
            ].map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={cn(
                  "font-medium text-base transition-colors relative group",
                  isActive(item.path) 
                    ? "text-primary font-semibold" 
                    : "text-foreground hover:text-primary"
                )}
              >
                {item.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                  isActive(item.path) && "w-full"
                )} />
              </Link>
            ))}
          </nav>

          {/* Right Side - Theme Toggle and CTA */}
          <div className="flex items-center space-x-6 z-10">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2.5 rounded-full transition-all duration-300",
                theme === "dark" 
                  ? "bg-zinc-800/80 hover:bg-zinc-700/90 text-zinc-200" 
                  : "bg-white/90 hover:bg-white shadow-sm hover:shadow text-gray-800 border border-gray-200/50"
              )}
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

            <div className="hidden md:flex items-center space-x-5">
              <Link to="/sign-in" className={cn(
                "font-medium transition-colors px-4 py-2 rounded-lg",
                theme === "dark"
                  ? "text-zinc-200 hover:text-white hover:bg-zinc-800/50"
                  : "text-gray-700 hover:text-primary hover:bg-gray-100/80"
              )}>
                Sign In
              </Link>
              <Button 
                size="lg" 
                className={cn(
                  "px-6 rounded-lg transition-all duration-300 font-medium",
                  theme === "dark"
                    ? "bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-500 text-white shadow-[0_0_15px_rgba(187,138,40,0.3)] hover:shadow-[0_0_25px_rgba(187,138,40,0.4)]"
                    : "bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-400 text-white shadow-md hover:shadow-xl"
                )}
                asChild
              >
                <Link to="/sign-up">
                  Start Consulting
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className={cn(
                "md:hidden p-2 rounded-md transition-colors duration-300",
                theme === "dark"
                  ? "bg-zinc-800/80 hover:bg-zinc-700/90 text-zinc-200"
                  : "bg-white/90 hover:bg-white shadow-sm hover:shadow text-gray-800 border border-gray-200/50"
              )}
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
          <div className={cn(
            "md:hidden mt-4 py-4 border-t animate-in slide-in-from-top duration-300 relative z-10",
            theme === "dark" ? "border-zinc-800" : "border-gray-200/70"
          )}>
            <nav className="flex flex-col space-y-4">
              {[
                { path: "/", label: "Home" },
                { path: "/features", label: "Features" },
                { path: "/legal-assistant", label: "Legal Assistant" },
                { path: "/pricing", label: "Pricing" },
                { path: "/blog", label: "Blog" },
                { path: "/about", label: "About" }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={cn(
                    "py-2 px-3 rounded-md transition-colors",
                    isActive(item.path)
                      ? theme === "dark"
                        ? "bg-zinc-800/70 text-primary font-medium"
                        : "bg-gray-100 text-primary font-medium"
                      : theme === "dark"
                        ? "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100/80 hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className={cn(
                "flex flex-col space-y-3 pt-4 mt-2 border-t",
                theme === "dark" ? "border-zinc-800" : "border-gray-200/70"
              )}>
                <Link 
                  to="/sign-in" 
                  className={cn(
                    "py-2 px-3 rounded-md transition-colors",
                    theme === "dark"
                      ? "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100/80 hover:text-primary"
                  )}
                >
                  Sign In
                </Link>
                <Button 
                  size="lg"
                  className={cn(
                    "w-full py-6 rounded-lg transition-all duration-300 font-medium",
                    theme === "dark"
                      ? "bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-500 text-white shadow-[0_0_15px_rgba(187,138,40,0.3)] hover:shadow-[0_0_25px_rgba(187,138,40,0.4)]"
                      : "bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-400 text-white shadow-md hover:shadow-xl"
                  )}
                  asChild
                >
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