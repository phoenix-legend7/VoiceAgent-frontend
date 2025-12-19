import { useEffect, useState } from "react";
import { FaCreditCard, FaRegCopyright, FaPlus, FaTrash } from "react-icons/fa";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import Card from "../../library/Card";
import { InputBoxWithUnit } from "../../library/FormField";
import SettingsLayout from "./SettingsLayout";
import clsx from "clsx";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../core/authProvider";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import { toast } from "react-toastify";
import CurrencySelector from "../../components/CurrencySelector";
import { formatCurrency, getSelectedCurrency, convertFromUSDCents } from "../../utils/currency";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

const CardSetupForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsDarkMode(document.body.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains("dark"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        color: isDarkMode ? '#f8fafc' : '#1e293b',
        backgroundColor: isDarkMode ? 'transparent' : 'transparent',
        '::placeholder': {
          color: isDarkMode ? '#94a3b8' : '#64748b',
        },
        ':-webkit-autofill': {
          color: isDarkMode ? '#f8fafc' : '#1e293b',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: isDarkMode ? '#10b981' : '#059669',
        iconColor: isDarkMode ? '#10b981' : '#059669',
      },
    },
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    // Create payment method
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    try {
      // Send payment method to backend
      const payload = {
        payment_method_id: paymentMethod.id
      };
      await axiosInstance.post("/billing/setup-payment-method", payload);
      onSuccess();
    } catch (err) {
      handleAxiosError("Request failed", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md">
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="bg-sky-600 px-4 py-2 rounded-md text-white hover:bg-sky-600/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};

const PaymentMethodCard = ({
  paymentMethod,
  onRemove,
  canRemove,
  onSetDefault,
  canSetDefault,
}: {
  paymentMethod: PaymentMethod;
  onRemove: (id: string) => void;
  canRemove: boolean;
  onSetDefault: (id: string) => Promise<void> | void;
  canSetDefault: boolean;
}) => {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!canRemove) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/billing/payment-methods/${paymentMethod.id}`);
      onRemove(paymentMethod.id);
    } catch (error) {
      handleAxiosError('Failed to remove payment method', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async () => {
    if (!canSetDefault || paymentMethod.is_default) return;
    setLoading(true);
    try {
      await onSetDefault(paymentMethod.id);
    } catch (error) {
      handleAxiosError('Failed to set default payment method', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <div className="flex items-center gap-3">
        <FaCreditCard className="text-gray-500" />
        <div>
          <div className="font-medium">
            {paymentMethod.card.brand.toUpperCase()} •••• {paymentMethod.card.last4}
          </div>
          <div className="text-sm text-gray-500">
            Expires {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
          </div>
        </div>
        {paymentMethod.is_default && (
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            Default
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!paymentMethod.is_default && canSetDefault && (
          <button
            onClick={handleSetDefault}
            disabled={loading}
            className="cursor-pointer px-3 py-1 text-xs rounded-md border border-sky-600 text-sky-600 hover:bg-sky-600/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set as default
          </button>
        )}
        <button
          onClick={handleRemove}
          disabled={loading || !canRemove}
          className={clsx(
            "p-2 disabled:opacity-50 disabled:cursor-not-allowed",
            canRemove
              ? "text-red-500 hover:text-red-700"
              : "text-gray-400 cursor-not-allowed"
          )}
          title={!canRemove ? "At least one payment method is required" : "Remove payment method"}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const CardAction = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="bg-transparent cursor-pointer hover:bg-gray-300/50 dark:hover:bg-gray-700/50 px-4 py-2 rounded-md transition-all duration-300"
    >
      <FaPlus className="inline mr-2" />
      Add Card
    </button>
  );
};

const Billing = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [threshold, setThreshold] = useState<number>(0);
  const [refillAmount, setRefillAmount] = useState<number>(5000);
  const [showCardForm, setShowCardForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefillLoading, setAutoRefillLoading] = useState(false);
  const [selectedCurrency] = useState(getSelectedCurrency());

  useEffect(() => {
    setThreshold(currentUser?.auto_threshold || 0);
    setRefillAmount(currentUser?.auto_refill_amount || 5000);
    fetchPaymentMethods();
  }, [currentUser]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axiosInstance.get("/billing/payment-methods");
      setPaymentMethods(response.data.payment_methods || []);
    } catch (error) {
      handleAxiosError('Failed to fetch payment methods', error);
    }
  };

  const handleCardSetupSuccess = () => {
    setShowCardForm(false);
    fetchPaymentMethods();
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await axiosInstance.post(`/billing/payment-methods/${id}/default`);
      setPaymentMethods(methods =>
        methods.map(m => ({
          ...m,
          is_default: m.id === id,
        }))
      );
    } catch (error) {
      handleAxiosError('Failed to set default payment method', error);
    }
  };

  const handleAutoRefillToggle = async () => {
    if (paymentMethods.length === 0) {
      toast.warning('Please add a payment method first');
      return;
    }

    setAutoRefillLoading(true);
    try {
      const payload = {
        threshold: threshold / 100,
        refill_amount: refillAmount / 100,
        enabled: !currentUser?.auto_refill
      };
      await axiosInstance.post('/billing/auto-refill/configure', payload);
    } catch (error) {
      handleAxiosError('Failed to configure auto-refill', error);
    } finally {
      setAutoRefillLoading(false);
    }
  };

  const handleManualTopup = async (amount: number) => {
    if (paymentMethods.length === 0) {
      toast.warning('Please add a payment method first');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/billing/manual-topup', { amount: (amount / 100) });
      if (!response.data.success) {
        throw new Error(response.data.status);
      }
      toast.success(`Successfully added ${response.data.amount_added} to your account`);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          total_credit: currentUser.total_credit + amount,
        })
      }
    } catch (error) {
      handleAxiosError('Failed to process payment', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <SettingsLayout isOverlayShown={false}>
        <div className="flex justify-end mb-4">
          <CurrencySelector />
        </div>
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 items-start justify-center gap-6">
          <div
            className={clsx(
              "bg-white dark:bg-gray-900 rounded-md px-8 py-4",
              paymentMethods.length === 0 && "order-2",
            )}
          >
            <div className="mb-4">
              <FaRegCopyright size={32} />
            </div>
            <div className="text-2xl font-bold">Credit Usage</div>
            <p className="my-5">
              Ensure you have enough credits to maintain uninterrupted service.
            </p>
            <div className="flex items-center gap-3">
              <div className="text-nowrap">
                {formatCurrency(convertFromUSDCents(currentUser?.used_credit || 0, selectedCurrency), selectedCurrency)} / {formatCurrency(convertFromUSDCents(currentUser?.total_credit || 0, selectedCurrency), selectedCurrency)}
              </div>
              <div className="bg-sky-600/30 w-full h-2 rounded overflow-hidden">
                <div
                  className="bg-sky-500 h-full"
                  style={{
                    width: `${((currentUser?.used_credit || 0) / (currentUser?.total_credit || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick top-up buttons */}
            <div className="my-6">
              <h4 className="font-semibold mb-3">Quick Top-up</h4>
              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 2500, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleManualTopup(amount)}
                    disabled={loading}
                    className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-all duration-300"
                  >
                    +{formatCurrency(convertFromUSDCents(amount, selectedCurrency), selectedCurrency)}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-6 text-gray-300 dark:text-gray-300" />

            <div className="text-lg font-semibold">Auto Refill Your Credits</div>
            <p className="text-gray-600 dark:text-gray-400">
              Keep your services running without interruption. Automatically top
              up your balance when it falls below your chosen threshold.
            </p>

            <div className="my-3 flex gap-3 w-full items-center">
              <div className="w-1/2">Threshold</div>
              <div className="w-1/2">
                <InputBoxWithUnit
                  value={threshold}
                  unit="$"
                  onChange={(e) => setThreshold(Number(e) || 0)}
                  showRightUnit={false}
                />
              </div>
            </div>

            <div className="my-3 flex gap-3 w-full items-center">
              <div className="w-1/2">Refill Amount</div>
              <div className="w-1/2 flex items-center rounded overflow-hidden border border-gray-200 dark:border-gray-700 select-none">
                {[500, 1000, 5000, 10000].map((amount, index) => (
                  <div
                    key={amount}
                    className={clsx(
                      "p-3 cursor-pointer transition-all duration-300 text-center flex-1",
                      index < 3 && "border-r border-gray-200 dark:border-gray-700",
                      refillAmount === amount
                        ? "bg-sky-600/20 text-sky-600 dark:text-sky-400 hover:bg-sky-300/40 dark:hover:bg-sky-700/50"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => setRefillAmount(amount)}
                  >
                    {formatCurrency(convertFromUSDCents(amount, selectedCurrency), selectedCurrency)}
                  </div>
                ))}
              </div>
            </div>

            <div className="my-3 flex gap-3 w-full items-center">
              <div className="w-1/2">Status</div>
              <div>
                {currentUser?.auto_refill ? (
                  <StatusBadge
                    colors="border-emerald-500 bg-emerald-200/20 text-emerald-500"
                    status="Active"
                  />
                ) : (
                  <StatusBadge
                    colors="border-red-400 bg-red-200/20 dark:bg-red-800/20 text-red-400"
                    status="Inactive"
                  />
                )}
              </div>
            </div>

            <div className="my-3 flex gap-3 w-full items-center justify-end">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAutoRefillToggle}
                  disabled={autoRefillLoading}
                  className={clsx(
                    "px-4 py-2 rounded-md cursor-pointer text-white transition-all duration-300",
                    currentUser?.auto_refill
                      ? "bg-red-600 hover:bg-red-600/80"
                      : "bg-sky-600 hover:bg-sky-600/80",
                    autoRefillLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {autoRefillLoading
                    ? 'Processing...'
                    : currentUser?.auto_refill
                      ? 'Disable Auto Refill'
                      : 'Enable Auto Refill'
                  }
                </button>
              </div>
            </div>
          </div>

          <Card
            className="my-0"
            title="Payment Methods"
            icon={<FaCreditCard size={24} />}
            toolbar={<CardAction onClick={() => setShowCardForm(true)} />}
          >
            <div className="p-6">
              {showCardForm ? (
                <CardSetupForm
                  onSuccess={handleCardSetupSuccess}
                  onCancel={() => setShowCardForm(false)}
                />
              ) : (
                <>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No payment methods added yet</p>
                      <button
                        onClick={() => setShowCardForm(true)}
                        className="flex gap-2 items-center justify-center px-4 py-2 mx-auto rounded-md cursor-pointer bg-transparent border border-sky-600 text-sky-600 hover:bg-sky-600/10 transition-all duration-300"
                      >
                        <FaPlus />
                        Add Payment Method
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <PaymentMethodCard
                          key={method.id}
                          paymentMethod={method}
                          onRemove={handleRemovePaymentMethod}
                          canRemove={paymentMethods.length > 1}
                          onSetDefault={handleSetDefaultPaymentMethod}
                          canSetDefault={paymentMethods.length > 1}
                        />
                      ))}
                      <div className="pt-4">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          Secured by Stripe
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </SettingsLayout>
    </Elements>
  );
};

export default Billing;
