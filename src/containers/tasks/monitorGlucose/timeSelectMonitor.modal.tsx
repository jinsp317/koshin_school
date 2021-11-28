import React from "react";
import { View, Dimensions, ScaledSize } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  ModalComponentCloseProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text } from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common";
import Strings from "@src/assets/strings";
import GLOBAL from "@src/core/globals";
import ScrollPicker from '@src/components/react-native-picker-scrollview-master';

interface ComponentProps {
  onOK: (pTime: { hour: number; minute: number; pKind: number }) => void;
  onCancel: () => void;
  kind: number;
}
interface State {
  hour: number;
  minute: number;
  hIndex: number;
  mIndex: number;
}

type Props = ThemedComponentProps & ComponentProps & ModalComponentCloseProps;

class MyModalComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hour: 2,
      minute: 0,
      hIndex: 2,
      mIndex: 0
    }

  }
  private onOK = (): void => {
    this.props.onOK({ hour: this.state.hour, minute: this.state.minute, pKind: this.props.kind });
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} status="info" category="h6">
            {this.props.kind === 0 ? "几小时后吃饭提醒" : "选择预约时间"}
          </Text>
        </View>
        <View style={{ paddingVertical: 10 }}>
          <View style={[themedStyle.row, { paddingHorizontal: 25, justifyContent: 'space-between', height: 150 }]}>
            <View style={{ flex: 1 }}>
              <ScrollPicker
                dataSource={GLOBAL.HOURS}
                selectedIndex={this.state.hIndex}
                itemHeight={30}
                wrapperHeight={100}
                wrapperColor={'#ffffff'}
                highlightColor={'#d8d8d8'}
                renderItem={(data, index, isSelected) => {
                  if (isSelected) {
                    return (
                      <View>
                        <Text category="h6">{`${data}时`}</Text>
                      </View>
                    )
                  } else {
                    return (
                      <View>
                        <Text category="s1">{data}</Text>
                      </View>
                    )
                  }

                }}
                onValueChange={(data, selectedIndex) => {
                  const hour = parseInt(GLOBAL.HOURS[selectedIndex], 0);
                  this.setState({ hIndex: selectedIndex, hour: hour });
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ScrollPicker
                dataSource={GLOBAL.MINUTES}
                selectedIndex={this.state.mIndex}
                itemHeight={30}
                wrapperHeight={100}
                wrapperColor={'#ffffff'}
                highlightColor={'#d8d8d8'}
                renderItem={(data, index, isSelected) => {
                  if (isSelected) {
                    return (
                      <View>
                        <Text category="h6">{`${data}分`}</Text>
                      </View>
                    )
                  } else {
                    return (
                      <View>
                        <Text category="s1">{data}</Text>
                      </View>
                    )
                  }
                }}
                onValueChange={(data, selectedIndex) => {
                  const min = parseInt(GLOBAL.MINUTES[selectedIndex], 0);
                  this.setState({ mIndex: selectedIndex, minute: min });
                }}
              />
            </View>
          </View>
        </View>
        <View style={themedStyle.row}>
          <Button textStyle={textStyle.button}
            // appearance="ghost"
            disabled={this.state.hIndex === 0 && this.state.mIndex === 0}
            size="large"
            onPress={this.onOK}
            style={{ flex: 1, borderWidth: 0.5, marginHorizontal: 20 }}
          >
            {`${Strings.common.str_ok}`}
          </Button>
          <Button
            textStyle={textStyle.button}
            // appearance="ghost"
            size="large"
            onPress={this.props.onCancel}
            style={{ flex: 1, borderWidth: 0.5, marginHorizontal: 20 }}
          >
            {`${Strings.common.str_cancel}`}
          </Button>
        </View>
      </View>
    );
  }
}

export const TimeSelectMonitorModal = withStyles(MyModalComponent, (theme: ThemeType) => {

  return {
    container: {
      borderWidth: 0,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: theme["mycolor-background"]
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,

      borderColor: theme["mycolor-lightgray"],
      padding: 10
    },
    titleLabel: {
      ...textStyle.headline
    },
    warningLabel: {
      ...textStyle.headline,
      color: theme["color-warning-500"]
    },
    rowLabel: {
      ...textStyle.subtitle,
      fontSize: 20,
      lineHeight: 22,

      color: theme["#ccc"]
    },
    descriptionLabel: {
      marginVertical: 24,
      ...textStyle.paragraph
    },
    row: {
      flexDirection: "row",
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center"
    }
  };
});
