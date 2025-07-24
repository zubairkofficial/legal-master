import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import authService from "../../services/auth.service";
import Helpers from "../../config/helpers";
import { trackConversion } from "../../tracking/analytics";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!fullName || !email || !username || !password || !confirmPassword) {
      Helpers.showToast("Please fill in all fields", "error");
      return;
    }
    if (password !== confirmPassword) {
      Helpers.showToast("Passwords do not match", "error");
      return;
    }
    if (!validatePassword(password)) {
      Helpers.showToast(
        "Password must be at least 8 characters with 1 number and 1 special character",
        "error"
      );
      return;
    }
    if (!agreed) {
      Helpers.showToast(
        "You must agree to the Terms of Service and Privacy Policy",
        "error"
      );
      return;
    }

    try {
      setIsLoading(true);
      Helpers.showToast("Creating your account…", "info");

      await authService.signup({
        name: fullName,
        email,
        username,
        password,
      });

      Helpers.showToast(
        "Account created successfully! Please check your email for verification.",
        "success"
      );
      trackConversion("signup");
      navigate("/sign-in", { replace: true });
    } catch (error: any) {
      console.error("Signup error:", error);
      const msg =
        error?.response?.data?.message ||
        "An error occurred during registration. Please try again.";
      Helpers.showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-background order-1 lg:order-0">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Link to="/">
              <img src="/assets/logo.png" alt="Logo" className="w-40 h-auto" />
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground">
              Let's begin your legal journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="full-name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                placeholder="you@example.com"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                placeholder="johndoe"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                placeholder="••••••••"
              />
              <div className="text-xs text-muted-foreground">
                Must be at least 8 characters with 1 number and 1 special
                character
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#BB8A28] focus:border-[#BB8A28] transition"
                placeholder="••••••••"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="h-4 w-4 text-[#BB8A28] focus:ring-[#BB8A28] border-input rounded"
              />
              <label
                htmlFor="terms"
                className="ml-3 text-sm text-muted-foreground"
              >
                I agree to the{" "}
                <a href="#" className="text-[#BB8A28] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#BB8A28] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !agreed}
            >
              {isLoading ? "Creating Account…" : "Create Account"}
            </Button>
          </form>

          {/* Sign-in Link */}
          <div className="text-center text-sm mt-4">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-[#BB8A28] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#BB8A28] relative overflow-hidden justify-center items-center order-0 lg:order-1">
        <div className="absolute inset-0 bg-[url('/images/law-pattern.webp')] opacity-10 bg-repeat"></div>
        <div className="relative z-10 text-white max-w-md p-12">
          <Link to="/">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-40 h-auto mb-8"
            />
          </Link>
          <h2 className="text-3xl font-bold mb-6">
            Cutting-Edge Legal Solutions Powered by AI
          </h2>
          <p className="mb-6 text-white/80">
            Join our trusted platform that connects clients with advanced AI
            legal resources, providing accessible and accurate legal assistance.
          </p>
          <ul className="space-y-4 mb-6">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                ✓
              </div>
              <p>Access legal expertise 24/7</p>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                ✓
              </div>
              <p>Generate and review legal documents</p>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                ✓
              </div>
              <p>Secure and confidential assistance</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
