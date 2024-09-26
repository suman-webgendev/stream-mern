import CardPaymentFormLoading from "@/components/payment/CardPaymentFormLoading";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";

const Checkout = () => {
  const [stripePromise, setStripePromise] = useState(null);
  const CardPaymentForm = lazy(
    () => import("@/components/payment/CardPaymentForm"),
  );

  useEffect(() => {
    const loadStripeClient = async () => {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY);
      setStripePromise(stripe);
    };
    loadStripeClient();
  }, []);

  return (
    <div className="flex h-[94vh] w-full items-center justify-center">
      {stripePromise ? (
        <Suspense fallback={<CardPaymentFormLoading />}>
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Elements stripe={stripePromise}>
              <CardPaymentForm />
            </Elements>
          </motion.div>
        </Suspense>
      ) : (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardPaymentFormLoading />
        </motion.div>
      )}
    </div>
  );
};

export default Checkout;
