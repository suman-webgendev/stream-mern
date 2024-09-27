import CardPaymentFormLoading from "@/components/payment/CardPaymentFormLoading";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { api } from "@/lib/utils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

const Checkout = () => {
  const CardPaymentForm = lazy(
    () => import("@/components/payment/CardPaymentForm"),
  );

  const {
    data: stripePublishableKey,
    isLoading,
    error: stripeError,
  } = useQuery({
    queryKey: ["stripe-publishable-key"],
    queryFn: async () => {
      const { data } = await api.get(
        "/api/subscription/get-stripe-publishable-key",
      );
      return data.publishableKey;
    },
  });

  if (isLoading || stripeError) return null;
  const stripePromise = loadStripe(stripePublishableKey);

  return (
    <AuroraBackground>
      <div className="z-10 flex size-full items-center justify-center">
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
    </AuroraBackground>
  );
};

export default Checkout;
