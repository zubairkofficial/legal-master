import { Link, useNavigate } from "react-router-dom";
import { Scale, Menu, LogOut, Settings, DollarSign, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sidebar } from "./Sidebar";
import useUserStore from "@/store/useUserStore";
import { CreditsPopup } from "../credits/CreditsPopup";
import creditsImg from "./credits.png";
import { CreditCard } from "lucide-react";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import chatService from "@/services/chat.service";

interface AdminHeaderProps {
  variant?: "admin" | "user";
}

export function AdminHeader({ variant = "admin" }: AdminHeaderProps) {
  const user = useUserStore((state) => state.user);
  const credits = useUserStore((state) => state.user?.credits);

  const navigate = useNavigate();
  const { clearUser } = useUserStore();
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  const fetchUserCredits = async () => {
    try {
      const credits = await chatService.fetchUserCredits();
      if (user) {
        useUserStore.getState().updateUser({ credits });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user?.id]);

  return (
    <header className="bg-[#F8F6F4] border-border sticky top-0 z-40 h-24">
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
        <div className="hidden md:flex items-center relative max-w-md w-full"></div>

        {/* Right side icons and profile */}
        <div className="flex items-center space-x-4">
          {/* Credits Display - Only show for user variant */}
          {variant === "user" && (
            <>
              <div
                className="flex items-center max-w-[120px] sm:max-w-none space-x-2 border border-[#BB8A28] px-3 py-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                onClick={() => navigate("/chat/products")}
              >
                <img
                  src={creditsImg}
                  alt="credits"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-sm font-medium text-primary truncate">
                  {credits || 0} Credits
                </span>
              </div>

              <Button
                onClick={() => navigate("/user/trial")}
                variant="ghost"
                className="hidden lg:flex items-center space-x-2 border border-[#BB8A28] px-3 py-2 rounded-lg hover:bg-[#BB8A28]/90 transition-colors duration-200 bg-[#BB8A28] text-white"
              >
                <Scale className="w-5 h-5 text-white" />
                <span className="text-sm font-medium">Mock Trials</span>
              </Button>
            </>
          )}

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

                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {variant === "admin" ? "Admin" : user?.name}
                  </span>
                  <span className="text-xs text-gray-500 max-w-[100px] truncate md:max-w-none">
                    {variant === "admin" ? "Admin" : user?.email}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* Full email shown here */}
              <div className="px-3 py-2 text-xs text-gray-700 break-all">
                {variant === "admin" ? "Admin" : user?.email}
              </div>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  to={variant === "admin" ? "/admin/profile" : "/chat/profile"}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              {variant === "user" && (
                <DropdownMenuItem asChild>
                  <Link to={"/chat/products"} className="cursor-pointer">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Upgrade</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {variant === "user" && (
                <DropdownMenuItem asChild>
                  <Link to="/user/payment-history" className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Payment History</span>
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Credits Popup */}
      {variant === "user" && (
        <CreditsPopup
          isOpen={isCreditsOpen}
          onClose={() => setIsCreditsOpen(false)}
        />
      )}
    </header>
  );
}
