import { NativeSyntheticEvent, NativeScrollEvent, TextInputFocusEventData, TextInputEndEditingEventData, TouchableOpacityProps, GestureResponderEvent } from 'react-native';
export declare type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;
export declare type InputFocusEvent = NativeSyntheticEvent<TextInputFocusEventData>;
export declare type InputEndEditEvent = NativeSyntheticEvent<TextInputEndEditingEventData>;
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export interface TouchableIndexedProps extends TouchableOpacityProps {
    onPress?: (index: number, event: GestureResponderEvent) => void;
    onPressIn?: (index: number, event: GestureResponderEvent) => void;
    onPressOut?: (index: number, event: GestureResponderEvent) => void;
    onLongPress?: (index: number, event: GestureResponderEvent) => void;
}
