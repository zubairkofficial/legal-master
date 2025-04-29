import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, LogOut, Settings } from "lucide-react";
import { useTheme } from "../theme/theme-provider";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sidebar } from "./Sidebar";
import useUserStore from "@/store/useUserStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AdminHeaderProps {
  variant?: "admin" | "user";
}

export function AdminHeader({ variant = "admin" }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const { clearUser } = useUserStore();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogout = () => {
    // Clear user data from store
    clearUser();
    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar variant={variant} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Visible on Mobile Only */}
        <div className="lg:hidden flex items-center">
          <div className="w-8 h-8 bg-[#BB8A28] rounded flex items-center justify-center text-white font-bold">
            {variant === "admin" ? "A" : "L"}
          </div>
          <span className="ml-2 text-lg font-semibold">
            {variant === "admin" ? "Admin" : "User"}
          </span>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center relative max-w-md w-full">
        
        </div>

        {/* Right side icons and profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-0 h-9 w-9">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-0 h-9 w-9"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </Button>

          {/* Profile Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 focus:outline-none">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>
                    {variant === "admin" ? "AD" : "US"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {variant === "admin" ? "Admin" : user?.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center cursor-pointer">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>
                      {variant === "admin" ? "AD" : "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {variant === "admin" ? "Admin User" : "John Doe"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {variant === "admin" ? "Administrator" : "User"}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={variant == "admin" ? "/admin/profile" : "/chat/profile"} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 