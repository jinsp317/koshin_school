import Strings from "@src/assets/strings";
import {
  createStackNavigator,
  createAppContainer,
  createSwitchNavigator,
  NavigationContainer as ReactNavigationContainer,
  HeaderProps,
  createBottomTabNavigator,
} from "react-navigation";
import {
  AuthLoadingScreen,
  SetAppInfoScreen,
  SetWifiScreen,
  SetBlueToothScreen,
  TrendGraphScreen,
  ScanBarcodeScreen,
  ManualMonitorScreen,
} from "@src/containers/common";
import { BottomNavigationBar } from "./components/bottomNavigationBar.component";
import { getCurrentRouteState } from "./routeUtil";
import { PatientsScreen, PatientsSatisticScreen } from "@src/containers/patient";
import {
  AddPatientScreen,
  PatientsOutHospitalScreen,
  ProcOutHospitalScreen,
  VisitManageScreen,
  ConsultManageScreen,
  ManageAlertScreen,
  InhospitalManageScreen,
} from "@src/containers/manager";
import { UploadScreen, PortalContainer } from "@src/containers/menu";
import { SignInScreen } from "@src/containers/common/auth";
import {
  MenuTopNavigationParams,
  MenuBottomNavigationParams,
  MenuNavigatorParams,
  TopNavigationElement,
  RootNavigatorParams,
  MeasureNavigationParams,
  PatientsNavigationParams,
  MyTopNavigationParams,
  TaskNavigationParams,
} from "./navigationParams";
import {
  MonitorTaskScreen,
  MonitorPatientScreen,
  TaskFreeMeasureScreen,
  TaskFreeMeasureHistoryScreen,
  MonitorResultScreen,
  GetIdentityInfoScreen,
  EditMonitorDataScreen,
  TaskFilterScreen,
  MonitorLogScreen,
  MonitorGlucoseScreen,
  CureTasksScreen,
  MonitorLogBScreen,
  CureTaskEditScreen,
  CurePatientScreen,
} from "@src/containers/tasks";
import {
  PairDeviceScreen,
  MakeQRCodeScreen,
  SettingsContainer,
  ChangePasswordScreen,
  QualityTestScreen,
  AppHelpScreen,
  ConfigEnvScreen,
  UploadReportScreen,
  SwitchUserScreen,
  TestGlucoseScreen,
  TestResultScreen,
  CustomPortalMenuScreen,
} from "@src/containers/setting";
import { WarningManage } from "@src/containers/portal/warningManage/warningManage.component";
import { WarningManageScreen } from "@src/containers/portal";
import { DailyTest } from "@src/containers/setting/dailyTest/dailyTest.component";
import { DetailMainScreen } from "@src/containers/patient";

const HeadingNavigationOptions = ({ navigation }) => {
  const header = (headerProps: HeaderProps): TopNavigationElement | null => {
    const { params } = getCurrentRouteState(navigation);

    return params && params.topNavigation && params.topNavigation(headerProps);
  };

  return { ...navigation, header };
};

const SettingsNavigator: ReactNavigationContainer = createStackNavigator(
  {
    ["Setting Container"]: {
      screen: SettingsContainer,
      params: {
        ...RootNavigatorParams,
        ...MenuNavigatorParams,
        caption: Strings.menu.main_profile,
      },
    },
    ["Pair Device"]: {
      screen: PairDeviceScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_pairDevice,
      },
    },
    ["Change Password"]: {
      screen: ChangePasswordScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_password,
      },
    },
    ["Make QRCode"]: {
      screen: MakeQRCodeScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_shareApp,
      },
    },
    ["App Help"]: {
      screen: AppHelpScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_help,
      },
    },
    ["Config Env"]: {
      screen: ConfigEnvScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.setting_configEnv,
      },
    },
    ["Upload Report"]: {
      screen: UploadReportScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_consultReport,
      },
    },
    ["Swtich User"]: {
      screen: SwitchUserScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.common.str_switchAccount,
      },
    },
    ["Quality Test"]: {
      screen: QualityTestScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_quailityTest,
      },
    },
    ["Test Glucose"]: {
      screen: TestGlucoseScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_quailityTest,
      },
    },
    ["Test Result"]: {
      screen: TestResultScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_quailityTestResult,
      },
    },
    ["Custom PortalMenu"]: {
      screen: CustomPortalMenuScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_customMenu,
      },
    },
    ["Set DailyTest"]: {
      screen: DailyTest,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_dailyTest,
      },
    },
  },
  {
    headerMode: "none",
  }
);
const PortalNavigator: ReactNavigationContainer = createStackNavigator(
  {
    ["Portal Container"]: {
      screen: PortalContainer,
      params: {
        ...RootNavigatorParams,
        ...MenuNavigatorParams,
        caption: Strings.menu.main_data,
      },
    },
    ["ManageAlert Container"]: {
      screen: ManageAlertScreen,
      params: { caption: Strings.hospital.xuetangyujing },
    },
    ["Portal WarningManage"]: {
      screen: WarningManageScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.portal_warningManage,
      },
    },
  },
  {
    headerMode: "none",
  }
);
const UploadNavigator: ReactNavigationContainer = createStackNavigator(
  {
    ["Upload Container"]: {
      screen: UploadScreen,
      params: {
        ...RootNavigatorParams,
        ...MyTopNavigationParams,
        ...MenuBottomNavigationParams,
        caption: Strings.menu.main_upload,
      },
    },
  },
  {
    headerMode: "none",
  }
);
const TasksNavigator: ReactNavigationContainer = createStackNavigator(
  {
    ["Task Patient"]: {
      screen: MonitorPatientScreen,
      params: {
        ...RootNavigatorParams,
        ...TaskNavigationParams,
        ...MenuBottomNavigationParams,
        caption: Strings.menu.task_patient,
      },
    },
    ["Patients Statistic"]: {
      screen: PatientsSatisticScreen,
      params: {
        ...RootNavigatorParams,
        ...TaskNavigationParams,
        ...MenuBottomNavigationParams,
        caption: Strings.menu.main_statistic,
      },
    },
    ["Task Glucose"]: {
      screen: MonitorTaskScreen,
      params: {
        ...RootNavigatorParams,
        ...TaskNavigationParams,
        ...MenuBottomNavigationParams,
        caption: Strings.menu.task_bloodSugar,
      },
    },
    ["Task FilterA"]: {
      screen: TaskFilterScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.task_select,
      },
    },
    ["Task Select"]: {
      screen: MonitorPatientScreen,
      params: { caption: Strings.menu.task_select },
    },
    ["Monitor Result"]: {
      screen: MonitorResultScreen,
      params: { ...MenuTopNavigationParams, caption: Strings.menu.task_result },
    },
    ["Cure Edit"]: {
      screen: CureTaskEditScreen,
      params: { ...MenuTopNavigationParams, caption: Strings.menu.task_insulin },
    },
    ["Task ScanBand"]: {
      screen: MonitorResultScreen,
      params: {
        ...RootNavigatorParams,
        ...MenuTopNavigationParams,
        caption: Strings.menu.task_scanBand,
      },
    },
    ["Task TrendGraph"]: {
      screen: TrendGraphScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.task_trendGraph,
      },
    },
    ["Task MonitorLog"]: {
      screen: MonitorLogScreen,
      params: {
        ...RootNavigatorParams,
        ...TaskNavigationParams,
        ...MenuBottomNavigationParams,

        //        ...MyTopNavigationParams,
        caption: Strings.menu.task_monitorLog,
      },
    },
    ["Task MonitorLogB"]: {
      screen: MonitorLogBScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.task_monitorLog,
      },
    },
    ["Task Cure"]: {
      screen: CureTasksScreen,
      params: {
        ...RootNavigatorParams,
        ...TaskNavigationParams,
        ...MenuBottomNavigationParams,

        //        ...MyTopNavigationParams,
        caption: Strings.menu.task_cureItem,
      },
    },
    ["Monitor GlucoseA"]: {
      screen: MonitorGlucoseScreen,
      params: {
        ...MyTopNavigationParams,
        myKind: 0,
        caption: Strings.menu.main_monitor,
      },
    },
    ["Monitor ManualInputA"]: {
      screen: ManualMonitorScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.main_monitor,
      },
    },

    ["Task GetIdentityInfo"]: {
      screen: GetIdentityInfoScreen,
      params: {
        ...MenuNavigatorParams,
        caption: Strings.menu.task_getIdentityInfo,
      },
    },
    ["Task FreeMeasure"]: {
      screen: TaskFreeMeasureScreen,
      params: {
        ...RootNavigatorParams,
        ...TaskNavigationParams,
        ...MenuBottomNavigationParams,
        //        ...MyTopNavigationParams,
        caption: Strings.menu.task_freeMeasure,
      },
    },
    ["Task FreeMeasureHistory"]: {
      screen: TaskFreeMeasureHistoryScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.task_freeMeasureHistory,
      },
    },
    ["Task FreeMeasureEdit"]: {
      screen: EditMonitorDataScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.task_result,
      },
    },
    ["Monitor ScanPatient"]: {
      screen: ScanBarcodeScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.task_scanBand,
      },
    },
  },
  {
    headerMode: "none",
    initialRouteName: "Task MonitorLog",
    headerLayoutPreset: "center",
  }
);

const PatientsNavigator: ReactNavigationContainer = createStackNavigator(
  {
    ["Patients Screen"]: {
      screen: PatientsScreen,
      params: {
        ...RootNavigatorParams,
        ...MyTopNavigationParams,
        ...MenuBottomNavigationParams,
        caption: Strings.menu.main_patient,
      },
    },

    ["Detail Main"]: {
      screen: DetailMainScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.main_patient,
      },
    },
    ["Patients OutHospital"]: {
      screen: PatientsOutHospitalScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.patient.banlizhuyuan,
      },
    },
    ["Add Patient"]: {
      screen: AddPatientScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.patient.tianjiahuanzhe,
      },
    },

    ["Inhospital Manage"]: {
      screen: InhospitalManageScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.patient.banlizhuyuan,
      },
    },

    ["Consult Manage"]: {
      screen: ConsultManageScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.patient.faqihuizhen,
      },
    },
    ["Visit Manage"]: {
      screen: VisitManageScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.patient.faqisuifang,
      },
    },
    ["Proc OutHospital"]: {
      screen: ProcOutHospitalScreen,
      params: { ...MenuNavigatorParams, caption: Strings.patient.banlichuyuan },
    },
    ["Task FilterB"]: {
      screen: TaskFilterScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.task_select,
      },
    },
    ["Monitor ManualInputB"]: {
      screen: ManualMonitorScreen,
      params: {
        ...MyTopNavigationParams,
        caption: Strings.menu.main_monitor,
      },
    },
    ["Monitor ResultB"]: {
      screen: MonitorResultScreen,
      params: { ...MenuTopNavigationParams, caption: Strings.menu.task_result },
    },
    ["Cure EditB"]: {
      screen: CureTaskEditScreen,
      params: { ...MenuTopNavigationParams, caption: Strings.menu.task_insulin },
    },
    ["Cure Advice"]: {
      screen: CurePatientScreen,
      params: { ...MenuTopNavigationParams, caption: Strings.menu.task_insulin },
    },
    ["Monitor GlucoseB"]: {
      screen: MonitorGlucoseScreen,
      params: {
        ...MyTopNavigationParams,
        myKind: 1,
        caption: Strings.menu.main_monitor,
      },
    },
  },
  {
    headerMode: "none",
  }
);

const MenuNavigator: ReactNavigationContainer = createBottomTabNavigator(
  {
    ["BingRen"]: PatientsNavigator,
    ["RenWu"]: TasksNavigator,
    ["ShuJu"]: PortalNavigator,
    //["ChuanShu"]: UploadNavigator,
    ["SheZhi"]: SettingsNavigator,
  },
  {
    tabBarComponent: BottomNavigationBar,
  }
);

const MainNavigator: ReactNavigationContainer = createStackNavigator({
  ["Home"]: {
    screen: MenuNavigator,
    navigationOptions: HeadingNavigationOptions,
  },
});
const SignNavigator: ReactNavigationContainer = createStackNavigator(
  {
    ["Sign in"]: {
      screen: SignInScreen,
      params: {
        ...RootNavigatorParams,
      },
    },
    ["Set AppInfo"]: {
      screen: SetAppInfoScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.signin_config_version,
      },
    },
    ["Set Wifi"]: {
      screen: SetWifiScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.signin_set_wifi,
      },
    },
    ["Set BlueTooth"]: {
      screen: SetBlueToothScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.signin_set_bluetooth,
      },
    },
  },
  {
    headerMode: "none",
  }
);
const FirstNavigator: ReactNavigationContainer = createStackNavigator({
  ["First"]: {
    screen: SignNavigator,
    navigationOptions: HeadingNavigationOptions,
  },
});

const DailyTestNavigator: ReactNavigationContainer = createStackNavigator(
  {
    ["Daily Quality Test"]: {
      screen: QualityTestScreen,
      params: {
        ...RootNavigatorParams,
        ...MyTopNavigationParams,
        caption: Strings.menu.setting_quailityTest,
      },
    },
    ["Daily Test Glucose"]: {
      screen: TestGlucoseScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_quailityTest,
      },
    },
    ["Daily Test Result"]: {
      screen: TestResultScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.menu.setting_quailityTestResult,
      },
    },
    ["Daily Swtich User"]: {
      screen: SwitchUserScreen,
      params: {
        ...MenuTopNavigationParams,
        caption: Strings.common.str_switchAccount,
      },
    },
  },
  {
    headerMode: "none",
  }
);
const DailyTestHomeNavigator: ReactNavigationContainer = createStackNavigator({
  ["Home DailyTest"]: {
    screen: DailyTestNavigator,
    navigationOptions: HeadingNavigationOptions,
  },
});
const AppNavigator: ReactNavigationContainer = createSwitchNavigator(
  {
    ["AuthLoading"]: AuthLoadingScreen,
    ["FirstNavigator"]: FirstNavigator,
    ["MainNavigator"]: MainNavigator,
    ["DailyTestHomeNavigator"]: DailyTestHomeNavigator,
  },
  {
    initialRouteName: "AuthLoading",
  }
);
export const Router: ReactNavigationContainer = createAppContainer(AppNavigator);
