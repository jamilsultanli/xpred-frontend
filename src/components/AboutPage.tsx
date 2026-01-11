import { Info, Users, Target, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <Info className="w-8 h-8" />
            About Xpred
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Learn more about our mission, vision, and values
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 lg:p-8 space-y-6`}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl flex items-center gap-2">
              <Target className="w-6 h-6" />
              Our Mission
            </h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred is a revolutionary prediction platform that empowers users to make informed predictions on various topics 
              including technology, cryptocurrency, sports, politics, and global events. Our mission is to create an engaging, 
              transparent, and rewarding environment where users can test their knowledge and intuition while earning rewards 
              for accurate predictions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              Who We Are
            </h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Xpred was founded by a team of passionate technologists, data scientists, and prediction enthusiasts who believe 
              in the power of collective intelligence. We combine cutting-edge technology with user-friendly design to create a 
              platform that is both fun and meaningful. Our team is committed to maintaining the highest standards of fairness, 
              transparency, and user experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl flex items-center gap-2">
              <Award className="w-6 h-6" />
              What Makes Us Different
            </h2>
            <ul className={`list-disc list-inside mt-2 space-y-2 text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Transparent Predictions:</strong> All predictions are publicly visible and verifiable</li>
              <li><strong>Fair Rewards:</strong> Our XP and XC reward system ensures fair distribution based on accuracy</li>
              <li><strong>Community-Driven:</strong> Users can create communities, share insights, and learn from each other</li>
              <li><strong>AI-Powered:</strong> Advanced AI helps categorize and moderate content for better user experience</li>
              <li><strong>Secure Platform:</strong> State-of-the-art security measures protect user data and transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-black/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">Integrity</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  We maintain the highest standards of honesty and transparency in all our operations.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-black/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  We continuously improve our platform with new features and technologies.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-black/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">User-Centric</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Our users are at the heart of everything we do. We listen and adapt based on feedback.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-black/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">Responsibility</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  We promote responsible prediction practices and provide tools for users to manage their activity.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-base lg:text-xl">Contact Information</h2>
            <p className={`text-sm lg:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              For business inquiries, partnerships, or media requests, please contact us at{' '}
              <a href="mailto:contact@xpred.com" className="text-blue-500 hover:underline">contact@xpred.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

