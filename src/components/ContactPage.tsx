import { useState } from 'react';
import { Mail, Send, MessageSquare, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { apiClient } from '../lib/api/client';

export function ContactPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post('/support/contact', formData);
      if (response.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <Mail className="w-8 h-8" />
            Contact Us
          </h1>
          <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Get in touch with our team
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 space-y-6`}>
            <div>
              <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
              <p className={`text-sm lg:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className={`w-5 h-5 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <div>
                  <div className="font-semibold text-sm">Email</div>
                  <a href="mailto:support@xpred.com" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    support@xpred.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className={`w-5 h-5 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <div>
                  <div className="font-semibold text-sm">Phone</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    +1 (555) 123-4567
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <div>
                  <div className="font-semibold text-sm">Address</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    123 Tech Street<br />
                    San Francisco, CA 94105<br />
                    United States
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
            <h2 className="text-xl font-bold mb-4">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

