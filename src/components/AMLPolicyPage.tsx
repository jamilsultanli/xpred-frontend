import { Scale } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function AMLPolicyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <Scale className="w-8 h-8" />
            Anti-Money Laundering (AML) Policy
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 lg:p-8 space-y-6`}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">1. Policy Statement</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred is committed to preventing money laundering and terrorist financing activities on our platform. We have 
              implemented comprehensive policies and procedures to detect, prevent, and report suspicious activities in 
              accordance with applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">2. Customer Due Diligence (CDD)</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We conduct thorough customer due diligence on all users, including:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Identity verification (KYC procedures)</li>
              <li>Ongoing monitoring of user transactions</li>
              <li>Risk assessment based on user activity</li>
              <li>Enhanced due diligence for high-risk users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">3. Suspicious Activity Reporting</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred maintains a robust system for detecting and reporting suspicious activities. We monitor transactions for 
              patterns that may indicate money laundering, including:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Unusually large transactions</li>
              <li>Rapid movement of funds</li>
              <li>Transactions inconsistent with user profile</li>
              <li>Multiple accounts from same source</li>
              <li>Transactions involving high-risk jurisdictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">4. Record Keeping</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We maintain detailed records of all transactions and customer information for a minimum period as required by law. 
              These records are securely stored and may be provided to regulatory authorities upon request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">5. Employee Training</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              All Xpred employees receive regular training on AML policies and procedures. Our compliance team is responsible 
              for ensuring adherence to these policies and staying current with regulatory changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">6. Sanctions Screening</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We screen all users against international sanctions lists and will not provide services to individuals or entities 
              subject to sanctions or embargoes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">7. Cooperation with Authorities</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred fully cooperates with law enforcement and regulatory authorities in investigations related to money laundering 
              or terrorist financing. We will provide information as required by law while respecting user privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">8. Contact</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              For questions about our AML policy or to report suspicious activity, please contact our compliance team at{' '}
              <a href="mailto:compliance@xpred.com" className="text-blue-500 hover:underline">compliance@xpred.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

