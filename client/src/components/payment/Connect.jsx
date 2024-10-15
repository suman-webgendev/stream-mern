import { useAccountLink, useCreateAccount } from "@/hooks/stripe";

const Connect = () => {
  const { data: account, isLoading } = useCreateAccount();
  const { mutateAsync: createLink, isPending, error } = useAccountLink();

  return (
    <div className="container">
      <div className="banner">
        <h2>Rocket Rides</h2>
      </div>
      <div className="content">
        {!account && <h2>Get ready for take off</h2>}
        {account && <h2>Add information to start accepting money</h2>}
        {!account && (
          <p>
            Rocket Rides is the world&apos;s leading air travel platform: join
            our team of pilots to help people travel faster.
          </p>
        )}
        {!isPending && !isLoading && (
          <div>
            <button onClick={async () => await createLink(account)}>
              Sign up
            </button>
          </div>
        )}

        {error && <p className="error">Something went wrong!</p>}
      </div>
    </div>
  );
};

export default Connect;
