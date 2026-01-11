import { Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function PrivacyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Privacy Policy
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 lg:p-8 space-y-6`}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">1. Information We Collect</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We collect information that you provide directly to us, including:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Account information (username, email, password)</li>
              <li>Profile information (name, bio, avatar, location)</li>
              <li>Content you create (predictions, comments, messages)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">2. How We Use Your Information</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We use the information we collect to:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">3. Information Sharing</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist us in operating our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">4. Data Security</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We implement appropriate technical and organizational measures to protect your personal information. However, 
              no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">5. Your Rights</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              You have the right to:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">6. Cookies</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">7. Children's Privacy</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Our service is not intended for children under 18 years of age. We do not knowingly collect personal information 
              from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">8. Changes to This Policy</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">9. Contact Us</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@xpred.com" className="text-blue-500 hover:underline">privacy@xpred.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

