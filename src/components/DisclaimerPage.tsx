import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function DisclaimerPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            Disclaimer
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 lg:p-8 space-y-6`}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">1. General Information</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred is a prediction platform designed for entertainment and educational purposes. The information provided on 
              this platform is for general informational purposes only and should not be construed as financial, legal, or 
              professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">2. No Investment Advice</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred does not provide investment, financial, or trading advice. All predictions and content on the platform 
              are opinions and should not be used as the sole basis for making financial decisions. Users should conduct their 
              own research and consult with qualified professionals before making any financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">3. Prediction Accuracy</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              While we strive for accuracy in prediction resolution, Xpred makes no warranties or representations regarding 
              the accuracy, completeness, or reliability of any predictions or outcomes. Predictions are based on available 
              information at the time of creation and may be subject to change based on unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">4. Risk Warning</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Participation in predictions involves risk. Users may lose XP or XC based on incorrect predictions. Xpred is 
              not responsible for any losses incurred through participation in predictions. Users should only participate with 
              amounts they can afford to lose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">5. Third-Party Content</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred may contain links to third-party websites or content. We are not responsible for the content, accuracy, 
              or opinions expressed on such websites. Users access third-party content at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">6. Limitation of Liability</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              To the fullest extent permitted by law, Xpred shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
              or any loss of data, use, goodwill, or other intangible losses resulting from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">7. Platform Availability</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred does not guarantee that the platform will be available at all times or that it will be free from errors, 
              viruses, or other harmful components. We reserve the right to modify, suspend, or discontinue any aspect of the 
              platform at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">8. User Responsibility</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Users are solely responsible for their actions on the platform, including the predictions they make and the 
              content they post. Users must comply with all applicable laws and regulations in their jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

