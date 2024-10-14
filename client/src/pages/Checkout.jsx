import CardPaymentFormLoading from "@/components/payment/CardPaymentFormLoading";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useStripePublishableKey } from "@/hooks/stripe";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

const Checkout = () => {
  const CardPaymentForm = lazy(
    () => import("@/components/payment/CardPaymentForm"),
  );

  const { data: stripePublishableKey } = useStripePublishableKey();

  return (
    <AuroraBackground>
      <div className="z-10 flex size-full items-center justify-center">
        {loadStripe(stripePublishableKey) ? (
          <Suspense fallback={<CardPaymentFormLoading />}>
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Elements stripe={loadStripe(stripePublishableKey)}>
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
    </AuroraBackground>
  );
};

export default Checkout;
