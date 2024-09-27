import { api } from "@/lib/utils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CheckoutForm from "./CheckoutForm";

const Payment = () => {
  const [clientSecret, setClientSecret] = useState("");

  const {
    data: stripePublishableKey,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stripe-publishable-key"],
    queryFn: async () => {
      const { data } = await api.get(
        "/api/subscription/get-stripe-publishable-key",
      );
      return data;
    },
  });

  useQuery({
    queryKey: ["payment-intent"],
    queryFn: async () => {
      const { data } = await api.post("/payment/create-payment-intent");
      setClientSecret(data.client_secret);
      return data;
    },
  });

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
