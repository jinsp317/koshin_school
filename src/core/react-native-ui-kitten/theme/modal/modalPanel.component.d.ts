import React from 'react';
import { ViewProps } from 'react-native';
import { ModalPresenting, ModalComponentCloseProps } from './modal.service';
export interface ModalPanelProps {
    children: React.ReactNode;
}
interface ModalPanelState {
    components: Map<string, React.ReactElement<ModalComponentCloseProps>>;
    backdrops: Map<string, boolean>;
}
export declare class ModalPanel extends React.Component<ModalPanelProps, ModalPanelState> implements ModalPresenting {
    state: ModalPanelState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    hide: (identifier: string) => void;
    show(dialogComponent: React.ReactElement<any>, closeOnBackDrop: boolean): string;
    private generateUniqueComponentKey;
    private areThereAnyComponents;
    private renderModal;
    private renderModals;
    render(): React.ReactElement<ViewProps>;
}
export {};
