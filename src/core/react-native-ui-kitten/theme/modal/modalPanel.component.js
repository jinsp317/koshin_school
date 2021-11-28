import React from 'react';
import { View, StyleSheet, } from 'react-native';
import { Modal } from '../../ui/modal/modal.component';
import { ModalService, } from './modal.service';
export class ModalPanel extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            components: new Map(),
            backdrops: new Map(),
        };
        this.hide = (identifier) => {
            const component = this.state.components
                .get(identifier);
            if (component) {
                component.props.onRequestClose && component.props.onRequestClose();
            }
            const components = this.state.components;
            components.delete(identifier);
            const backdrops = this.state.backdrops;
            backdrops.delete(identifier);
            this.setState({
                components: components,
                backdrops: backdrops,
            });
        };
        this.generateUniqueComponentKey = () => {
            return Math.random().toString(36).substring(2);
        };
    }
    componentDidMount() {
        ModalService.mount(this);
    }
    componentWillUnmount() {
        ModalService.unmount();
    }
    show(dialogComponent, closeOnBackDrop) {
        const key = this.generateUniqueComponentKey();
        const componentsMap = this.state.components
            .set(key, dialogComponent);
        const backdrops = this.state.backdrops.set(key, closeOnBackDrop);
        this.setState({
            components: componentsMap,
            backdrops: backdrops,
        });
        return key;
    }
    areThereAnyComponents() {
        return this.state.components && this.state.components.size !== 0;
    }
    renderModal(modal, index) {
        const allModalKeys = Array.from(this.state.components.keys());
        const identifier = allModalKeys
            .find(item => this.state.components.get(item) === modal);
        const closeOnBackdrop = this.state.backdrops.get(identifier);
        return (<Modal {...modal.props} visible={true} isBackDropAllowed={closeOnBackdrop} key={index} identifier={identifier} onCloseModal={this.hide}>
        {modal}
      </Modal>);
    }
    renderModals() {
        return Array.from(this.state.components.values())
            .map((component, i) => this.renderModal(component, i));
    }
    render() {
        return (<View style={styles.container}>
        {this.props.children}
        {this.areThereAnyComponents() && this.renderModals()}
      </View>);
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
