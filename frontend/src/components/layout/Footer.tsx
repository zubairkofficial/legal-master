import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollLink = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-background border-t border-border container mx-auto">
      <div className="px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-20">
          {/* Brand */}
          <div>
            <div
              className="flex items-center space-x-2 mb-6 cursor-pointer"
              onClick={() => handleScrollLink("hero")}
            >
              <img src="/assets/logo.png" alt="Logo" className="w-40 h-auto" />
            </div>
            <p className="text-muted-foreground">
              Transforming legal assistance with AI technology to make justice
              accessible for all.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleScrollLink("hero")}
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollLink("about")}
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollLink("testimonials")}
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  Reviews
                </button>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@legalmaster.ai"
                  className="text-muted-foreground hover:text-[#BB8A28] transition"
                >
                  info@legalmaster.ai
                </a>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <FaFacebookF className="text-muted-foreground hover:text-[#BB8A28] transition cursor-pointer" />
              <FaTwitter className="text-muted-foreground hover:text-[#BB8A28] transition cursor-pointer" />
              <FaInstagram className="text-muted-foreground hover:text-[#BB8A28] transition cursor-pointer" />
              <FaLinkedin className="text-muted-foreground hover:text-[#BB8A28] transition cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>
            Copyright © {new Date().getFullYear()} LegalMaster.AI. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
