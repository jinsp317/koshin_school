import React from "react";
import {
  View,
  Dimensions,
  ScaledSize,
  ProgressBarAndroid,
  NativeModules,
  Image
} from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  ModalComponentCloseProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input } from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common/style";
import Strings from "@src/assets/strings";
import {
  PersonIconFill,
  CreditCardIconFill,
  DoctorIconOutline,
  StateEatIconFill,
  StateDoubleIconFill,
  NewPatientIcon
} from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import RNFS from "react-native-fs";
import { VersionInfoModel } from "@src/core/model/versionInfo.model";
import commonStyles from "@src/containers/styles/common";
import { VisitModel } from "@src/core/model";
import { ImageSource, RemoteImage } from "@src/assets/images";
import { min } from "moment";
const dimensions: ScaledSize = Dimensions.get("window");

interface ComponentProps {
  data: VisitModel;
}

type Props = ThemedComponentProps & ComponentProps;
interface State { }
class MyModalComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const visit_image: ImageSource = new RemoteImage(
      `http://${GLOBAL.server_ip}/api/visit/image?token=${GLOBAL.token}&id=${this.props.data.id}`
    );
    const w = Math.min(dimensions.width, dimensions.height) - 50;
    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            {this.props.data.to_time}
          </Text>
        </View>
        <Image
          source={visit_image.imageSource}
          style={{ width: w, height: w }}
          resizeMode="contain"
        />
      </View>
    );
  }
}

export const ShowImageModal = withStyles(MyModalComponent, (theme: ThemeType) => {
  return {
    container: {
      borderWidth: 0,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      justifyContent: "center",
      padding: 10,
      backgroundColor: theme["mycolor-background"],
      alignItems: "center"
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,

      borderColor: theme["mycolor-lightgray"],
      padding: 10
    },
    titleLabel: {
      ...textStyle.headline,
      color: theme["#ccc"]
    }
  };
});
