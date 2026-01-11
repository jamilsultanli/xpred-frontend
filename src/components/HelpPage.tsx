import { HelpCircle, Search, BookOpen, MessageCircle, TrendingUp, Users, Wallet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

export function HelpPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const faqs = [
    {
      category: 'Getting Started',
      icon: BookOpen,
      questions: [
        {
          q: 'How do I create a prediction?',
          a: 'Click the "Create" button in the header or sidebar, fill in your prediction question, add details, choose a category, and set an end date. You can optionally add an initial prediction to start the pool.',
        },
        {
          q: 'How do I make a prediction?',
          a: 'Click on any prediction card, then click "Predict" button. Choose "Yes" or "No", enter your prediction amount in XP or XC, and confirm.',
        },
        {
          q: 'What are XP and XC?',
          a: 'XP (Experience Points) is the primary currency earned through predictions. XC (Xpred Coins) is a premium currency that can be purchased or earned.',
        },
      ],
    },
    {
      category: 'Predictions',
      icon: TrendingUp,
      questions: [
        {
          q: 'How are predictions resolved?',
          a: 'Predictions are automatically resolved when the deadline passes. The outcome is determined based on real-world events and verified data.',
        },
        {
          q: 'What happens if I win a prediction?',
          a: 'You receive XP/XC based on the multiplier and your prediction amount. Winnings are automatically added to your wallet.',
        },
        {
          q: 'Can I edit or delete my prediction?',
          a: 'You can edit predictions before the deadline, but you cannot delete them once others have made predictions.',
        },
      ],
    },
    {
      category: 'Communities',
      icon: Users,
      questions: [
        {
          q: 'How do I join a community?',
          a: 'Browse communities on the Communities page, find one you like, and click "Join". You can also create your own community if you have moderator privileges.',
        },
        {
          q: 'What can I do in a community?',
          a: 'You can view community-specific predictions, interact with members, and share your own predictions related to the community topic.',
        },
      ],
    },
    {
      category: 'Wallet & Payments',
      icon: Wallet,
      questions: [
        {
          q: 'How do I add funds to my wallet?',
          a: 'Go to the Wallet page and click "Purchase Bundles". Choose a bundle and complete the payment via Stripe.',
        },
        {
          q: 'Can I withdraw my earnings?',
          a: 'Withdrawal functionality is coming soon. For now, you can use your XP/XC to make predictions and purchase items in the XP Market.',
        },
        {
          q: 'What is the XP Market?',
          a: 'The XP Market is where you can spend your XP to purchase titles, avatar frames, and badges to customize your profile.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <HelpCircle className="w-8 h-8" />
            Help Center
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Find answers to common questions and learn how to use Xpred
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category} className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <section.icon className="w-6 h-6" />
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((faq, idx) => (
                  <div key={idx}>
                    <h3 className={`font-semibold mb-2 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {faq.q}
                    </h3>
                    <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-8 ${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
          <h2 className="text-xl font-bold mb-4">Still need help?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className={`flex-1 p-4 rounded-xl border transition-colors text-center ${
                isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Contact Support</div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Get in touch with our team
              </div>
            </Link>
            <Link
              to="/faq"
              className={`flex-1 p-4 rounded-xl border transition-colors text-center ${
                isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Search className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Browse FAQ</div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                More questions and answers
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

