import Strings from "@src/assets/strings";
import React from "react";
import { SafeAreaView } from "@src/core/navigation";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { BottomNavigation, BottomNavigationTab } from "@src/core/react-native-ui-kitten/ui";
import {
  ListIconFill,
  PeopleIconFill,
  SyncIconFill,
  SettingsIconFill,
  GridIconOutline,
  BloodDropIconFill
} from "@src/assets/icons";
import { themes } from "@src/core/themes";
import { Dimensions } from 'react-native';
const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};
interface State {
  isPortrait: boolean;
}
interface ComponentProps {
  selectedIndex: number;
  onTabSelect: (index: number) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MenuComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isPortrait: isPortrait()
    }
  }
  private onTabSelect = (index: number) => {
    this.props.onTabSelect(index);
  };
  componentDidMount() {
    Dimensions.addEventListener('change', () => {
      this.setState({ isPortrait: isPortrait() })
    });
  }
  public render(): React.ReactNode {
    const { selectedIndex, themedStyle } = this.props;
    const isPortrait = this.state.isPortrait;
    const nHeight = isPortrait ? 0 : 24;
    return (
      <SafeAreaView style={themedStyle.safeAreaContainer}>
        <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
          {
            isPortrait ?
              (
                <BottomNavigation
                  appearance="noIndicator"
                  selectedIndex={selectedIndex}
                  onSelect={this.onTabSelect}
                >
                  <BottomNavigationTab title={Strings.menu.main_patient} icon={PeopleIconFill} />
                  <BottomNavigationTab title={Strings.menu.main_monitor} icon={BloodDropIconFill} />
                  <BottomNavigationTab title={Strings.menu.main_data} icon={GridIconOutline} />
                  {
                    // <BottomNavigationTab title={Strings.menu.main_upload} icon={SyncIconFill} />
                  }


                  <BottomNavigationTab title={Strings.menu.main_profile} icon={SettingsIconFill} />
                </BottomNavigation>
              ) :
              (
                <BottomNavigation
                  appearance="noIndicator"
                  selectedIndex={selectedIndex}
                  onSelect={this.onTabSelect}
                  style={{ height: (nHeight + 5) }}
                >
                  <BottomNavigationTab style={{ height: nHeight }} icon={PeopleIconFill} />
                  <BottomNavigationTab style={{ height: nHeight }} icon={BloodDropIconFill} />
                  <BottomNavigationTab style={{ height: nHeight }} icon={GridIconOutline} />
                  {
                    // <BottomNavigationTab title={Strings.menu.main_upload} icon={SyncIconFill} />
                  }


                  <BottomNavigationTab style={{ height: nHeight }} icon={SettingsIconFill} />
                </BottomNavigation>
              )
          }

        </ThemeProvider>
      </SafeAreaView>
    );
  }
}

export const Menu = withStyles(MenuComponent, (theme: ThemeType) => ({
  safeAreaContainer: {
    backgroundColor: theme["color-basic-400"],
    paddingTop: 1
  }
}));
