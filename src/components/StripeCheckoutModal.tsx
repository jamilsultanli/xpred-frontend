import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { walletApi } from '../lib/api/wallet';
import { toast } from 'sonner';

// Initialize Stripe - you'll need to set VITE_STRIPE_PUBLISHABLE_KEY in .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: {
    id: string;
    cost: number;
    xp: number;
    xc: number;
  };
  onSuccess: () => void;
}

function CheckoutForm({ bundle, onSuccess, onClose, clientSecret: propClientSecret, paymentIntentId }: Omit<StripeCheckoutModalProps, 'isOpen'> & { clientSecret: string; paymentIntentId: string | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !propClientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(propClientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded' && paymentIntentId) {
        // Complete the purchase on backend
        const purchaseResponse = await walletApi.purchaseBundle(
          bundle.id,
          'stripe',
          undefined,
          paymentIntentId
        );

        if (purchaseResponse.success) {
          toast.success(`Purchase Successful! Added ${bundle.xp.toLocaleString()} XP + ${bundle.xc} XC Bonus!`);
          onSuccess();
          onClose();
        } else {
          throw new Error(purchaseResponse.message || 'Purchase failed');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: isDark ? '#ffffff' : '#000000',
        '::placeholder': {
          color: isDark ? '#6b7280' : '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`p-4 border rounded-xl ${isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'}`}>
        <CardElement options={cardElementOptions} />
      </div>
      
      <div className={`${isDark ? 'bg-black/50' : 'bg-gray-50'} rounded-xl p-4 space-y-2`}>
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount</span>
          <span className="font-bold">${bundle.cost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>You'll receive</span>
          <span className="font-bold text-green-400">
            {bundle.xp.toLocaleString()} XP + {bundle.xc} XC
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !propClientSecret}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          `Pay $${bundle.cost.toFixed(2)}`
        )}
      </button>
    </form>
  );
}

export function StripeCheckoutModal({ isOpen, onClose, bundle, onSuccess }: StripeCheckoutModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bundle.id) {
      walletApi.createPaymentIntent(bundle.id).then((response) => {
        if (response.success && response.client_secret) {
          setClientSecret(response.client_secret);
          setPaymentIntentId(response.payment_intent_id);
        }
      }).catch(() => {
        toast.error('Failed to initialize payment');
        onClose();
      });
    } else {
      setClientSecret(null);
      setPaymentIntentId(null);
    }
  }, [isOpen, bundle.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'}`}>
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">Complete Purchase</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                bundle={bundle} 
                onSuccess={onSuccess} 
                onClose={onClose} 
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
              />
            </Elements>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

