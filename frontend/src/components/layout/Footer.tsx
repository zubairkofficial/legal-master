import { Link } from "react-router-dom";

export function Footer() {

  return (
    <footer className="bg-background border-t border-border">
      <div className=" mx-20 container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/assets/logo.png" alt="" className="w-40 h-auto" />
              </Link>
            </div>
            <p className="text-muted-foreground">
              Transforming legal assistance with AI technology to make justice accessible for all.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-[#BB8A28] transition">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-[#BB8A28] transition">About</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-[#BB8A28] transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <a href="mailto:info@legalmaster.ai" className="text-muted-foreground hover:text-[#BB8A28] transition">info@legalmaster.ai</a>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#BB8A28] transition"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>Copyright © {new Date().getFullYear()} LegalMaster.AI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
} 