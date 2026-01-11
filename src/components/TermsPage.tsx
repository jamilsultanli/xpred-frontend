import { FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function TermsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Terms of Service
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 lg:p-8 space-y-6`}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">1. Acceptance of Terms</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              By accessing and using Xpred, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">2. Use License</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Permission is granted to temporarily use Xpred for personal, non-commercial transitory viewing only. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to reverse engineer any software contained on Xpred</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">3. Predictions</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred is a prediction platform where users can make predictions on various topics. All predictions are for 
              entertainment purposes only. Users must be 18 years or older to use prediction features. Xpred is not responsible 
              for any losses incurred through predictions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">4. User Accounts</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
              responsibility for all activities that occur under your account. You must notify us immediately of any 
              unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">5. Prohibited Activities</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              You agree not to:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">6. Intellectual Property</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              All content on Xpred, including but not limited to text, graphics, logos, and software, is the property of 
              Xpred or its content suppliers and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">7. Limitation of Liability</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting 
              from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">8. Changes to Terms</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred reserves the right to modify these terms at any time. We will notify users of any significant changes. 
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">9. Contact Information</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@xpred.com" className="text-blue-500 hover:underline">legal@xpred.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

