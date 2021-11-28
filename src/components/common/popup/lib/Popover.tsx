import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { ModalComponentCloseProps } from "@src/core/react-native-ui-kitten/theme";

interface ComponentProps {
  menus: object;
  position?: object;
  isTop: boolean;
  top: number;
}

type Props = ComponentProps & ModalComponentCloseProps;
export default class PopupWindow extends React.Component<Props> {
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return PopupWindow1(this.props);
  }
}

function PopupWindow1(props) {
  //const top = props.top; //props.position.top;
  if (props.menus) {
    return (
      <View style={[styles.popover, { top: props.top }]}>
        {props.isTop && (
          <View style={styles.anchor}>
            <View style={styles.anchorTop} />
          </View>
        )}
        <View style={{ flexDirection: "row" }}>
          {props.menus.map((a, i) => {
            return (
              <TouchableOpacity onPress={a.onPress} key={i}>
                <View
                  style={[
                    styles.btn,
                    props.menus.length === 1
                      ? styles.singleBtn
                      : i === props.menus.length - 1
                      ? styles.rightBtn
                      : i === 0
                      ? styles.leftBtn
                      : styles.centerBtn
                  ]}
                >
                  <Text style={styles.font}>{a.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {!props.isTop && (
          <View style={styles.anchor}>
            <View style={styles.anchorBottom} />
          </View>
        )}
      </View>
    );
  }
}

//export default React.Component(PopupWindow)

const styles = StyleSheet.create({
  popover: {
    backgroundColor: "red",
    //zIndex: 1,
    alignItems: "center",
    position: "absolute",
    justifyContent: "center"
  },
  btn: {
    backgroundColor: "#1CAFF6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 0.3
  },
  leftBtn: {
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10
  },
  rightBtn: {
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10
  },
  centerBtn: {},
  singleBtn: {
    borderRadius: 10
  },
  anchor: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  font: {
    color: "white"
  },
  anchorBottom: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: 7,
    borderTopColor: "#1CAFF6",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "transparent"
  },
  anchorTop: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: 7,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderBottomColor: "#1CAFF6",
    borderRightColor: "transparent"
  }
});
