import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { lazy, Suspense } from "react";

const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY);

const CheckoutForm = () => {
  const CreditCard = lazy(() => import("./CreditCard"));
  return (
    <div className="h-[90vh]">
      <Suspense fallback={<div>Loading...</div>}>
        <Elements stripe={stripe}>
          <CreditCard />
        </Elements>
      </Suspense>
    </div>
  );
};

export default CheckoutForm;
