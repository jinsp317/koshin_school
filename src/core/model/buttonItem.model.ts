import { DrawerIconProps } from "react-navigation";
import { ImageProps } from "react-native";

export interface ButtonItemModel {
    id: number;
    text: string;
    icon?: any;
    status?: string;
    disabled?: boolean;
    valid?: boolean;
}
