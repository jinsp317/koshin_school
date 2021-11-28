import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { CurstomPortalMenu } from "./customPortalMenu.component";

export class CustomPortalMenuScreen extends React.Component<
  NavigationScreenProps
> {
  public render(): React.ReactNode {
    return <CurstomPortalMenu />;
  }
}
