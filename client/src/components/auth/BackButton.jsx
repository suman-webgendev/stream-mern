import React from "react";
import { Button } from "@/components/ui/button";
import {Link} from "react-router-dom";

const BackButton = (props) => {
  return (
    <Button variant="link" className="font-normal w-full" size="sm" asChild>
      <Link href={props.backButtonHref}>{props.label}</Link>
    </Button>
  );
};

export default BackButton;

