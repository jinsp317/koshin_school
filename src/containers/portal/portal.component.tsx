import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
  FlatList
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Toggle, Text, Button } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle } from "@src/components/common";
import { imageSignIn1Bg } from "@src/assets/images";
import {
  BloodDropIconFill,
  PeopleIconFill,
  SettingsIconFill,
  GlucoseMeterIconOutline,
  StarIconFill,
  PatientBedIcon,
  LogIconOutline
} from "@src/assets/icons";
import Strings from "@src/assets/strings";
import { ButtonItemModel } from "@src/core/model";
interface ComponentProps {
  data: ButtonItemModel[];
  onInvalidPress: () => void;
  onItemPress: (index: number) => void;
}

export type PortalProps = ThemedComponentProps & ComponentProps;

class PortalComponent extends React.Component<PortalProps> {
  renderItem = ({ item }) => {
    const { themedStyle } = this.props;
    return (
      <Button
        icon={item.icon}
        status={item.status}
        onPress={() => this.props.onItemPress(item.id)}
        style={themedStyle.portalbtn}
        disabled={item.disabled}
      >
        {item.text}
      </Button>
    );
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return (
      <View style={themedStyle.container}>
        <FlatList
          numColumns={2}
          data={this.props.data}
          renderItem={this.renderItem}
          keyExtractor={({ id }, index) => id}
        />
      </View>
    );
  }
}

interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (
  props?: SectionProps
): React.ReactElement<TouchableOpacityProps> => {
  return <TouchableOpacity activeOpacity={0.65} {...props} />;
};

export const Portal = withStyles(PortalComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    alignItems: "center",
    paddingTop: 10
  },
  section: {
    padding: 10,
    borderBottomWidth: 0,
    borderBottomColor: theme["border-basic-color-2"]
  },
  notificationSection: {
    paddingTop: 0
  },
  soundEnabledSection: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingTop: 10
  },
  portalbtn: {
    margin: 10,
    width: "44%"
  },
  listItem: {
    flex: 0.5,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 4
  }
}));
