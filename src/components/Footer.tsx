import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Mail, HelpCircle, FileText, Shield, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t ${isDark ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'} mt-auto`}>
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-base">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-base">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4 text-base">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4 text-base">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/xpred"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/xpred"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/xpred"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} pt-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            © {new Date().getFullYear()} Xpred. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/help" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <HelpCircle className="w-4 h-4 inline mr-1" />
              Help
            </Link>
            <Link to="/terms" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <FileText className="w-4 h-4 inline mr-1" />
              Terms
            </Link>
            <Link to="/privacy" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <Shield className="w-4 h-4 inline mr-1" />
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

