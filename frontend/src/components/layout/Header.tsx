import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

export function Header() {
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

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      "bg-white/95 backdrop-blur-md",
      scrolled 
        ? "shadow-sm py-2" 
        : "py-4 border-b border-gray-100"
    )}>
      <div className="mx-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <img src="/assets/logo.png" alt="" className="w-40 h-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
                  "font-medium text-sm transition-colors relative group",
                  isActive(item.path) 
                    ? "text-primary font-semibold" 
                    : "text-gray-600 hover:text-primary"
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

          {/* Right Side - CTA */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/sign-in" className="font-medium text-sm transition-colors px-4 py-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50">
                Sign In
              </Link>
              <Button 
                size="sm" 
                className="px-5 rounded-lg transition-all duration-300 font-medium bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow"
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
              className="md:hidden p-2 rounded-md transition-colors duration-300 bg-white hover:bg-gray-50 text-gray-600 border border-gray-100"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="md:hidden mt-4 py-4 border-t animate-in slide-in-from-top duration-300 relative z-10 border-gray-100">
            <nav className="flex flex-col space-y-3">
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
                    "py-2 px-3 rounded-md transition-colors text-sm",
                    isActive(item.path)
                      ? "bg-gray-50 text-primary font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex flex-col space-y-3 pt-4 mt-2 border-t border-gray-100">
                <Link 
                  to="/sign-in" 
                  className="py-2 px-3 rounded-md transition-colors text-sm text-gray-600 hover:bg-gray-50 hover:text-primary"
                >
                  Sign In
                </Link>
                <Button 
                  size="sm"
                  className="w-full py-2 rounded-lg transition-all duration-300 font-medium bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow"
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