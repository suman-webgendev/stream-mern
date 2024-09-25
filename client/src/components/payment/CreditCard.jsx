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
import { cardSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CreditCard = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      postalCode: "",
    },
  });

  const generateStripeToken = async (values) => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardNumberElement);
    const { error, token } = await stripe.createToken(cardElement, {
      name: values.name,
      address_zip: values.postalCode,
      phone: values.phoneNumber,
    });

    if (!token || error) {
      console.error("Error creating token:", error);
      throw error;
    }

    return token;
  };

  const onSubmit = async (values) => {
    try {
      console.log(form.formState);
      const token = await generateStripeToken(values);
      console.log(token);
      setError(null);
      form.reset();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Card className="mx-auto w-[28rem] max-w-[90vw]">
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
                        placeholder="(123) 456-7890"
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
                      <CardNumberElement className="h-10 w-full rounded-md border border-input p-2 px-3 py-2 text-sm text-gray-700" />
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
                      <CardExpiryElement className="h-10 w-full rounded-md border border-input p-2 px-3 py-2 text-sm text-gray-700" />
                    </FormItem>
                  )}
                />

                {/* CVV Field */}
                <FormField
                  control={form.control}
                  name="cvv"
                  render={() => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <CardCvcElement className="h-10 w-full rounded-md border border-input p-2 px-3 py-2 text-sm text-gray-700" />
                      </FormControl>
                      {form.formState.errors.cvv && (
                        <span className="text-xs text-red-600">
                          {form.formState.errors.cvv.message}
                        </span>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              {error && (
                <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <ExclamationTriangleIcon className="size-4" />
                  <p className="text-red-500">{error}</p>
                </div>
              )}
              <div>
                <Button className="w-full">Pay</Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreditCard;
