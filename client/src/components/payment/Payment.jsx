import {
  useStripePaymentIntent,
  useStripePublishableKey,
} from "@/hooks/stripe";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const Payment = () => {
  const {
    data: stripePublishableKey,
    isLoading,
    error,
  } = useStripePublishableKey();
  const clientSecret = useStripePaymentIntent();

  if (isLoading || error) return null;
  const stripePromise = loadStripe(stripePublishableKey);

  return (
    <>
      {stripePromise && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
};

export default Payment;
