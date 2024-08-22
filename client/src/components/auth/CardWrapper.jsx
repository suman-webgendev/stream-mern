
import React, { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import AuthHeader from "./AuthHeader";
import BackButton from "./BackButton";



const CardWrapper = (props) => {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <AuthHeader label={props.headerLabel} />
      </CardHeader>
      <CardContent>{props.children}</CardContent>
      <CardFooter>
        <BackButton
          label={props.backButtonLabel}
          backButtonHref={props.backButtonHref}
        />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;

