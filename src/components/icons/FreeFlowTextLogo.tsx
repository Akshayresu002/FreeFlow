import React from "react";
export default function FreeFlowTextLogo(props: any) {
  return (
    <div className={`text-xl font-bold tracking-wider text-logo-primary ${props.className || ""}`}>
      FreeFlow
    </div>
  );
}
