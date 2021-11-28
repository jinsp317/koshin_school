import React from 'react';
import PopupWindow from './lib/Popover'
import { ModalService } from "react-native-ui-kitten/theme";

export default class Popover {
    static show(menus, position, isTop) {
        const top = position.top
        ModalService.show(<PopupWindow menus={menus} top={top} isTop={isTop} />, true);
    }

    static hide(modalId) {
        ModalService.hide(modalId);
    }
}