import { UserCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function KYCPolicyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <UserCheck className="w-8 h-8" />
            Know Your Customer (KYC) Policy
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 lg:p-8 space-y-6`}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">1. Overview</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred is committed to maintaining the highest standards of customer identification and verification. Our KYC 
              policy is designed to prevent fraud, money laundering, and other illegal activities while ensuring compliance 
              with applicable regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">2. Verification Requirements</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              All users must complete KYC verification before accessing certain features or making transactions above specified 
              thresholds. Required information includes:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Full legal name</li>
              <li>Date of birth</li>
              <li>Government-issued identification (passport, driver's license, or national ID)</li>
              <li>Proof of address (utility bill, bank statement, or similar)</li>
              <li>Selfie or photo verification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">3. Verification Process</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Our verification process typically takes 24-48 hours. Users will be notified via email once verification is 
              complete. In some cases, additional documentation may be requested.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">4. Data Security</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              All KYC documents and information are encrypted and stored securely. We use industry-standard security measures 
              to protect your personal information and comply with data protection regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">5. Ongoing Monitoring</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We conduct ongoing monitoring of user accounts and may request updated KYC information if:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Account activity changes significantly</li>
              <li>Documents expire or become outdated</li>
              <li>Suspicious activity is detected</li>
              <li>Regulatory requirements change</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">6. Failed Verification</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              If verification fails, users will be notified with the reason. Users may resubmit documents or contact support 
              for assistance. Accounts that cannot be verified may have restricted access or be suspended.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">7. Age Requirements</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Users must be at least 18 years old to use Xpred. Age verification is part of our KYC process, and users under 
              18 will not be able to complete verification or access the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">8. Contact</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              For questions about KYC verification or to submit documents, please contact{' '}
              <a href="mailto:kyc@xpred.com" className="text-blue-500 hover:underline">kyc@xpred.com</a> or visit our{' '}
              <a href="/help" className="text-blue-500 hover:underline">Help Center</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

