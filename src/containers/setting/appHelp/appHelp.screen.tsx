import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { httpHelper } from "@src/core/utils/httpHelper";
import GLOBAL from "@src/core/globals";
import { AppHelp } from "./appHelp.component";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";

const html = "你好中国";
function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}
interface State {
  data: string;
  isReady: boolean;
}
export class AppHelpScreen extends React.Component<NavigationScreenProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      data: GLOBAL.help,
      isReady: false
    };
  }
  componentDidMount() {
    this.getHelp();
  }
  private getHelp = () => {
    this.setState({ isReady: false });
    httpHelper
      .downloadHospital()
      .then(responseJson => {
        if (responseJson.result) {
          GLOBAL.curHospital = responseJson.result;
          GLOBAL.help = replaceAll(
            GLOBAL.curHospital.help,
            'src="',
            `src=\"http://${GLOBAL.server_ip}`
          );
          const help = GLOBAL.help;
          asyncStorageHelper.setHelpData();
          this.setState({ data: GLOBAL.help }); //responseJson.result });
          this.setState({ isReady: true });
        } else {
          this.setState({ isReady: true });
        }
      })
      .catch(exception => {
        this.setState({ isReady: true });
      });
  };

  public render(): React.ReactNode {
    return <AppHelp data={this.state.data} isReady={this.state.isReady} />;
  }
}
