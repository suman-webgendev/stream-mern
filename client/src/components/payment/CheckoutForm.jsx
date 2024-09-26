import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { lazy, Suspense, useEffect, useState } from "react";

const CheckoutForm = () => {
  const [stripePromise, setStripePromise] = useState(null);
  const CreditCard = lazy(() => import("./CreditCard"));

  useEffect(() => {
    const loadStripeClient = async () => {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY);
      setStripePromise(stripe);
    };
    loadStripeClient();
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      {stripePromise ? (
        <Suspense fallback={<div>Loading payment form...</div>}>
          <Elements stripe={stripePromise}>
            <CreditCard />
          </Elements>
        </Suspense>
      ) : (
        <div>Initializing payment system...</div>
      )}
    </div>
  );
};

export default CheckoutForm;
