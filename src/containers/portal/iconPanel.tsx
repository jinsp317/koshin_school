/**
 * Created by ZhangYu on 2017/6/20.
 */
import React, { Component, PureComponent } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ViewPropTypes,
  ViewStyle,
  TextStyle,
  ImageStyle
} from "react-native";

/**
 * 参数
 * dataList = [
 *      {
 *          icon:       //同Image source属性
 *          text:       //图标文字
 *          onPress:    //点击事件
 *      },
 *      ...
 * ]
 *
 * props = {
 *     dataList,        //图标列表，必要
 *     column:3,        //IconPanelMulti 属性，列数，每行显示数量
 *     iconSize:49,     //图标尺寸
 *     fontSize:14,     //字体大小
 *     distance:10,     //图标与文字距离
 *     height:100,      //行高，IconPanelMulti里指每行的高度
 *     textStyle,       //可指定text其他属性，同Text
 *     iconStyle,       //指定Icon其他属性，同Image
 * }
 */
interface Props {
  dataList: any[];
  style: ViewStyle;
  iconSize: number;
  fontSize: number;
  distance: number;
  height: number;
  textStyle: TextStyle;
  iconStyle: ImageStyle;
}
export class IconPanel extends PureComponent<Props> {
  render() {
    const { dataList, style, ...otherProps } = this.props;
    return (
      <View
        style={[
          {
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center"
          },
          style
        ]}
      >
        {dataList.map((icon, idx) => {
          return <TouchableIcon key={idx} {...icon} {...otherProps} />;
        })}
      </View>
    );
  }
}

type IconPanelMultiProps = Props & {
  column: number;
};
export class IconPanelMulti extends PureComponent<IconPanelMultiProps> {
  render() {
    const { dataList, column, ...otherProps } = this.props;
    const lineNumber = Math.floor(dataList.length / column) + 1;
    const elemArr = [];
    for (let i = 0; i < lineNumber; i++) {
      elemArr.push(
        <IconPanel
          key={i}
          dataList={dataList.slice(i * column, (i + 1) * column)}
          {...otherProps}
        />
      );
    }
    return <View>{elemArr}</View>;
  }
}
interface TouchableIconProps {
  icon: any;
  text: string;
  onPress: () => void;
  iconSize: number;
  fontSize: number;
  distance: number;
  height: number;
  textStyle: TextStyle;
  iconStyle: ImageStyle;
  containerStyle: ViewStyle;
}
class TouchableIcon extends Component<TouchableIconProps> {
  render() {
    const {
      icon,
      text,
      onPress = () => {},
      iconSize = 48, // 默认值
      fontSize = 13,
      distance = 5,
      height = 100,
      iconStyle,
      textStyle
    } = this.props;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            height: height
          }
        ]}
      >
        {icon ? (
          <Image
            source={icon}
            style={[
              {
                height: iconSize,
                width: iconSize
              },
              iconStyle
            ]}
          />
        ) : null}
        {text ? (
          <Text
            style={[
              {
                fontSize: fontSize,
                color: "#333",
                textAlign: "center",
                marginTop: distance
              },
              textStyle
            ]}
          >
            {text}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }
}

export default IconPanel;
