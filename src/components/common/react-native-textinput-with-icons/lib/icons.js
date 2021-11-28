import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
//import IonIcons from 'react-native-vector-icons/Ionicons';
//import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
//import OctIcons from 'react-native-vector-icons/Octicons';
//import EvilIcons from 'react-native-vector-icons/EvilIcons';
//import AwesomeIcons from 'react-native-vector-icons/FontAwesome';

const IonIcon = ({ icon, size, color, style, onPress }) => {
    return <FontAwesomeIcon name={icon} size={size} style={style} color={color} onPress={onPress} />;
}
const MaterialDesignIcon = ({ icon, size, color, style, onPress }) => {
    return <FontAwesomeIcon name={icon} size={size} style={style} color={color} onPress={onPress} />;
}

const OctIcon = ({ icon, size, color, style, onPress }) => {
    return <FontAwesomeIcon name={icon} size={size} style={style} color={color} onPress={onPress} />;
}

const EvilIcon = ({ icon, size, color, style, onPress }) => {
    return <FontAwesomeIcon name={icon} size={size} style={style} color={color} onPress={onPress} />;
}

const AwesomeIcon = ({ icon, size, color, style, onPress }) => {
    return <FontAwesomeIcon name={icon} size={size} style={style} color={color} onPress={onPress} />;
}

export { IonIcon, MaterialDesignIcon, OctIcon, EvilIcon, AwesomeIcon };