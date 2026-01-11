import { Gift } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function SweepstakePolicyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <Gift className="w-8 h-8" />
            Sweepstake Policy
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
              Xpred may conduct sweepstakes, contests, and promotional activities from time to time. This policy governs 
              participation in such activities and outlines the rules, eligibility requirements, and prize distribution procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">2. Eligibility</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              To be eligible to participate in Xpred sweepstakes:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>You must be at least 18 years old (or the age of majority in your jurisdiction)</li>
              <li>You must have a valid Xpred account</li>
              <li>You must be a resident of a jurisdiction where sweepstakes are legal</li>
              <li>You must not be an employee of Xpred or its affiliates</li>
              <li>You must comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">3. How to Enter</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Entry methods vary by sweepstake but may include:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Making predictions on the platform</li>
              <li>Completing specific actions or challenges</li>
              <li>Participating in community events</li>
              <li>Random selection from active users</li>
            </ul>
            <p className={`text-sm lg:text-base leading-relaxed mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Each sweepstake will have specific entry requirements detailed in its official rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">4. Prizes</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Prizes may include XP, XC, physical items, gift cards, or other rewards as specified in each sweepstake's 
              official rules. Prize values and descriptions will be clearly stated. Prizes are non-transferable and cannot 
              be exchanged for cash unless specifically stated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">5. Winner Selection</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Winners are selected through random drawing or based on specific criteria outlined in the sweepstake rules. 
              Selection is conducted fairly and transparently. Winners will be notified via email or through their Xpred 
              account within 7 days of selection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">6. Claiming Prizes</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Winners must claim their prizes within 30 days of notification. To claim a prize, winners may be required to:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Complete and return an affidavit of eligibility</li>
              <li>Provide proof of identity</li>
              <li>Complete tax forms if required</li>
              <li>Respond to notification within the specified timeframe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">7. Taxes</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Winners are solely responsible for any taxes associated with prizes. Xpred may be required to report prize 
              winnings to tax authorities and may request tax information from winners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">8. Prohibited Activities</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              The following activities are prohibited and will result in disqualification:
            </p>
            <ul className={`list-disc list-inside mt-2 space-y-1 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Using multiple accounts to enter</li>
              <li>Using automated systems or bots</li>
              <li>Fraudulent or deceptive practices</li>
              <li>Violating platform terms of service</li>
              <li>Attempting to manipulate the selection process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">9. Limitation of Liability</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred is not responsible for lost, late, misdirected, or undeliverable entries or notifications, or for any 
              technical failures or human error that may occur in the administration of sweepstakes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">10. Contact</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              For questions about sweepstakes or to request official rules, please contact{' '}
              <a href="mailto:sweepstakes@xpred.com" className="text-blue-500 hover:underline">sweepstakes@xpred.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

