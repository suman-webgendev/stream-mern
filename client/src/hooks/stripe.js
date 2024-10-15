import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { loadStripe } from "@stripe/stripe-js";
import { useMutation } from "@tanstack/react-query";

export const useStripePublishableKey = () => {
  return useQuery({
    queryKey: ["stripe-publishable-key"],
    queryFn: async () => {
      const { data } = await api.get(
        "/api/subscription/get-stripe-publishable-key",
      );
      return data.publishableKey;
    },
  });
};

export const useStripeSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["priceTable"],
    queryFn: async () => {
      const { data } = await api.get("/api/subscription/plans");
      return data;
    },
  });
};

export const useCreateSubscription = (apiKey) => {
  return useMutation({
    mutationFn: async (priceId) => {
      const { data } = await api.post("/api/subscriptions", { priceId });
      return data;
    },
    onSuccess: async (data) => {
      const stripe = await loadStripe(apiKey);
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    },
  });
};

export const useBillingPortalSession = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/subscription/billing-portal");
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
};

export const useStripeCheckout = (priceId, setError, navigate) => {
  return useMutation({
    mutationFn: async (token) => {
      if (!token || !priceId) return;
      const { data } = await api.post("/api/subscription/checkout", {
        token,
        priceId,
      });
      return data;
    },
    onSuccess: (data) => {
      navigate(
        "/pricing?status=success&subscriptionId=" + data.subscription.id,
      );
    },
    onError: (error) => {
      setError(error.message);
    },
  });
};

export const useStripePaymentIntent = () => {
  return useQuery({
    queryKey: ["payment-intent"],
    queryFn: async () => {
      const { data } = await api.post("/payment/create-payment-intent");
      return data.client_secret;
    },
  });
};

export const useSessionVerification = (
  subscriptionId = null,
  sessionId = null,
  status,
) => {
  return useQuery({
    queryKey: ["verifySession", sessionId | subscriptionId],
    queryFn: async () => {
      if (sessionId) {
        const { data } = await api.post("/api/subscription/verify-session", {
          sessionId,
        });

        return data;
      }
      if (subscriptionId) {
        const { data } = await api.post("/api/subscription/verify-session", {
          subscriptionId,
        });
        return data;
      }
    },
    enabled: !!(
      (sessionId != null || subscriptionId != null) &&
      status === "success"
    ),
    retry: false,
  });
};

export const useCreateAccount = () => {
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const { data } = await api.post("/api/payment/account");
      return data.account;
    },
    refetchOnMount: true,
  });
};

export const useAccountLink = () => {
  return useMutation({
    mutationFn: async (accountId) => {
      const { data } = await api.post("/api/payment/account-connect-link", {
        account: accountId,
      });
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
};
