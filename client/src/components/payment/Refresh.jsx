import { useAccountLink } from "@/hooks/stripe";
import { useParams } from "react-router-dom";

export default function Refresh() {
  const { connectedAccountId } = useParams();
  const { error, isLoading } = useAccountLink(connectedAccountId);

  return (
    <div className="container">
      <div className="banner">
        <h2>Rocket Rides</h2>
      </div>
      <div className="content">
        <h2>Add information to start accepting money</h2>
        <p>
          Rocket Rides is the world&apos;s leading air travel platform: join our
          team of pilots to help people travel faster.
        </p>
        {error && <p className="error">Something went wrong!</p>}
      </div>
      <div className="dev-callout">
        {connectedAccountId && (
          <p>
            Your connected account ID is:
            <code className="bold">{connectedAccountId}</code>
          </p>
        )}
        {isLoading && <p>Creating a new Account Link...</p>}
      </div>
    </div>
  );
}
