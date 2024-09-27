import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api, formatAmount } from "@/lib/utils";
import { cardSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

const CardPaymentForm = () => {
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const location = useLocation();
  const { priceId, price } = location.state || {};

  const form = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      postalCode: "",
    },
  });

  const generateStripeToken = async (values) => {
    try {
      if (!stripe || !elements) return;

      const cardElement = elements.getElement(CardNumberElement);
      const { error, token } = await stripe.createToken(cardElement, {
        name: values.name,
        address_zip: values.postalCode,
        phone: values.phoneNumber.replace(/\D/g, ""),
      });

      if (!token || error) {
        throw error;
      }
      return token;
    } catch (err) {
      setError(err.message);
    }
  };

  const stripeElementOptions = {
    showIcon: true,
  };

  const subscriptionMutation = useMutation({
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

  const onSubmit = async (values) => {
    try {
      const token = await generateStripeToken(values);
      await subscriptionMutation.mutateAsync(token);
      setError(null);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <Card className="mx-auto w-[28rem] max-w-[90vw] shadow-xl">
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        type="text"
                        className="w-full invalid:text-red-500"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    {form.formState.errors.name && (
                      <span className="text-xs text-red-600">
                        {form.formState.errors.name.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        type="number"
                        onInput={(e) => {
                          if (e.target.value.length > 12) {
                            e.target.value = e.target.value.slice(0, 12);
                          }
                        }}
                        className="w-full invalid:text-red-500"
                        placeholder="+1 (123) 456-7890"
                        {...field}
                      />
                    </FormControl>
                    {form.formState.errors.phoneNumber && (
                      <span className="text-xs text-red-600">
                        {form.formState.errors.phoneNumber.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        type="number"
                        placeholder="123456"
                        className="w-full invalid:text-red-500"
                        {...field}
                        onInput={(e) => {
                          if (e.target.value.length > 6) {
                            e.target.value = e.target.value.slice(0, 6);
                          }
                        }}
                      />
                    </FormControl>
                    {form.formState.errors.phoneNumber && (
                      <span className="text-xs text-red-600">
                        {form.formState.errors.phoneNumber.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />

              {/* Card Number Field */}
              <FormField
                control={form.control}
                name="cardNumber"
                render={() => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <CardNumberElement
                        options={stripeElementOptions}
                        className="h-10 w-full rounded-md border px-3 py-2"
                      />
                    </FormControl>
                    {form.formState.errors.cardNumber && (
                      <span className="text-xs text-red-600">
                        {form.formState.errors.cardNumber.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />

              {/* Expiration Month and Year */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expirationMonth"
                  render={() => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <CardExpiryElement className="h-10 w-full rounded-md border px-3 py-2" />
                    </FormItem>
                  )}
                />

                {/* CVC Field */}
                <FormField
                  control={form.control}
                  name="cvc"
                  render={() => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <CardCvcElement className="h-10 w-full rounded-md border px-3 py-2" />
                      </FormControl>
                      {form.formState.errors.cvc && (
                        <span className="text-xs text-red-600">
                          {form.formState.errors.cvc.message}
                        </span>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              {error && (
                <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive">
                  <AlertTriangle className="size-5" />
                  <p className="text-red-500">{error}</p>
                </div>
              )}
              <div>
                <Button className="w-full">
                  {form.formState.isSubmitting ? (
                    <>
                      <span>Processing</span>
                      <Loader2 className="ml-2 size-5 animate-spin" />
                    </>
                  ) : (
                    `Pay ${formatAmount(price)}`
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CardPaymentForm;
