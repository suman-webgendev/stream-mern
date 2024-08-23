import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BackButton = (props) => {
  return (
    <Button variant="link" className="mx-auto font-normal" size="sm" asChild>
      <Link to={props.backButtonHref}>{props.label}</Link>
    </Button>
  );
};

export default BackButton;
