import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api/client';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_reply?: string;
  created_at: string;
}

export function SupportPage() {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/support/tickets');
      if (response.success) {
        setTickets(response.tickets || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/support/tickets', {
        subject: newTicket.subject,
        message: newTicket.message,
      });

      if (response.success) {
        toast.success('Ticket created successfully');
        setNewTicket({ subject: '', message: '' });
        setShowCreateForm(false);
        await loadTickets();
      } else {
        toast.error(response.message || 'Failed to create ticket');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const response = await apiClient.post(`/support/tickets/${ticketId}/reply`, {
        message: replyText,
      });

      if (response.success) {
        toast.success('Reply sent');
        setReplyText('');
        await loadTickets();
        if (selectedTicket) {
          const updated = tickets.find(t => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      } else {
        toast.error(response.message || 'Failed to send reply');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to access support</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-full"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Support
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'New Ticket'}
          </button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6`}>
            <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Enter ticket subject"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your issue..."
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <button
                onClick={handleCreateTicket}
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Submit Ticket'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className="text-lg text-gray-500">No support tickets yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="font-bold text-lg">{ticket.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        ticket.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                    <p className="text-gray-300">{ticket.message}</p>
                  </div>
                </div>

                {ticket.admin_reply && (
                  <div className={`${isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mt-4`}>
                    <div className="text-sm font-bold text-blue-400 mb-2">Admin Reply:</div>
                    <p className="text-gray-300">{ticket.admin_reply}</p>
                  </div>
                )}

                {ticket.status !== 'closed' && (
                  <div className="mt-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Reply to this ticket..."
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2 ${
                        isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                      }`}
                    />
                    <button
                      onClick={() => handleReply(ticket.id)}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
                    >
                      Send Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

