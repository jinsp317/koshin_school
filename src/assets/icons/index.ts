import { ImageStyle, StyleProp } from "react-native";
import { Icon, IconElement, IconSource, RemoteIcon } from "./icon.component";
import symbolicateStackTrace from "react-native/Libraries/Core/Devtools/symbolicateStackTrace";

export const ArrowHeadDownIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/arrowhead-down.png")
  };

  return Icon(source, style);
};
// tslint:disable-next-line: max-line-length
export const UserSearchSvg = '<svg t="1622183842399" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1225" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128"><defs><style type="text/css"></style></defs><path d="M548.169956 402.966756c0 56.558933-45.841067 102.4-102.4 102.4-56.558933 0-102.4-45.841067-102.4-102.4s45.841067-102.4 102.4-102.4C502.317511 300.566756 548.169956 346.4192 548.169956 402.966756zM881.288533 883.154489c-13.323378 13.334756-30.799644 20.002133-48.264533 20.002133s-34.941156-6.667378-48.264533-20.002133c0 0-173.8752-174.057244-175.251911-175.763911-48.651378 31.049956-106.3936 49.117867-168.391111 49.117867-173.1584 0-313.526044-140.367644-313.526044-313.526044S267.969422 129.456356 441.116444 129.456356s313.526044 140.367644 313.526044 313.526044c0 61.997511-18.067911 119.739733-49.117867 168.391111 1.706667 1.365333 175.763911 175.251911 175.763911 175.251911C907.958044 813.272178 907.958044 856.496356 881.288533 883.154489zM689.322667 442.9824c0-137.079467-111.126756-248.206222-248.206222-248.206222s-248.206222 111.126756-248.206222 248.206222c0 79.109689 37.057422 149.526756 94.708622 194.980978 7.497956-55.569067 55.000178-98.451911 112.628622-98.451911l91.022222 0c55.261867 0 101.284978 39.412622 111.593244 91.648C655.7696 585.636978 689.322667 518.2464 689.322667 442.9824z" p-id="1226" fill="#1CAFF6"></path></svg>';
export const ArrowHeadUpIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/arrowhead-up.png")
  };

  return Icon(source, style);
};

export const ArrowIosBackFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/arrow-ios-back.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};

export const BulbIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/bulb.png")
  };

  return Icon(source, style);
};

export const CameraIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/camera.png")
  };

  return Icon(source, style);
};

export const CartIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/shopping-cart-outline.png")
  };

  return Icon(source, style);
};

export const CartIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/shopping-cart.png")
  };

  return Icon(source, style);
};

export const ClockIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/clock-outline.png")
  };

  return Icon(source, style);
};

export const EmailIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/email.png")
  };

  return Icon(source, style);
};

export const EyeOffIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/eye-off.png")
  };

  return Icon(source, style);
};

export const ColorPaletteIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/color-palette-outline.png")
  };

  return Icon(source, style);
};

export const ArrowForwardIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/arrow-forward-outline.png")
  };

  return Icon(source, style);
};

export const GridIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/grid-outline.png")
  };

  return Icon(source, style);
};

export const HeartIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/heart.png")
  };

  return Icon(source, style);
};

export const LayoutIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/layout-outline.png")
  };

  return Icon(source, style);
};
export const UploadIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/upload.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const SettingsIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/settings.png")
  };

  return Icon(source, style);
};
export const LockIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/lock.png")
  };

  return Icon(source, style);
};

export const MessageCircleIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/message-circle.png")
  };

  return Icon(source, style);
};

export const MessageCircleIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/message-circle-outline.png")
  };

  return Icon(source, style);
};

export const MoreHorizontalIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/more-horizontal.png")
  };

  return Icon(source, style);
};

export const PersonIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/person.png")
  };

  return Icon(source, style);
};

export const PhoneIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/phone.png")
  };

  return Icon(source, style);
};

export const PersonAddIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/person-add.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};

export const PinIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/pin.png")
  };

  return Icon(source, style);
};

export const PinIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/pin-outline.png")
  };

  return Icon(source, style);
};

export const PlusIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/plus.png")
  };

  return Icon(source, style);
};

export const MinusIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/minus.png")
  };

  return Icon(source, style);
};

export const SearchIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/search-outline.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};

export const Filterline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/funnel-outline.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};

export const StarIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/star.png")
  };

  return Icon(source, style);
};

export const StarIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/star-outline.png")
  };

  return Icon(source, style);
};

export const FlashIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/flash-outline.png")
  };

  return Icon(source, style);
};

export const DoneAllIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/done-all-outline.png")
  };

  return Icon(source, style);
};

export const MoreVerticalIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/more-vertical.png")
  };

  return Icon(source, style);
};

export const CreditCardIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/credit-card.png")
  };

  return Icon(source, style);
};

export const CloseIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/close-outline.png")
  };

  return Icon(source, style);
};

export const MicIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/mic.png")
  };

  return Icon(source, style);
};

export const PaperPlaneIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/paper-plane.png")
  };

  return Icon(source, style);
};

export const ImageIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/image.png")
  };

  return Icon(source, style);
};

export const FileTextIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/file-text.png")
  };

  return Icon(source, style);
};

export const MapIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/map.png")
  };

  return Icon(source, style);
};

export const PeopleIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/people.png")
  };
  return Icon(source, style);
};
export const SwtichUserIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/people.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const PlayCircleIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/play-circle.png")
  };

  return Icon(source, style);
};

export const ShareIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/share-outline.png")
  };

  return Icon(source, style);
};

export const ListIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/list.png")
  };

  return Icon(source, style);
};

export const GoogleIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/google.png")
  };

  return Icon(source, style);
};

export const FacebookIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/facebook.png")
  };

  return Icon(source, style);
};

export const TwitterIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/twitter.png")
  };

  return Icon(source, style);
};

export const SyncIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/sync.png")
  };

  return Icon(source, style);
};
export const SearchIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/search.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const ScannerIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/scan_icon.png")
  };
  return Icon(source, style);
};
export const BarChartIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/bar-chart.png")
  };
  return Icon(source, style);
};
export const CloudIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/cloud_enabled.png")
  };
  return Icon(source, style);
};
export const LanIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/lan_enabled.png")
  };
  return Icon(source, style);
};
export const CloudDownloadIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/cloud-download.png")
  };
  return Icon(source, style);
};
export const WifiIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/wifi.png")
  };
  return Icon(source, style);
};



export const GlucoseDeviceIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/service_type_service_appointment.png")
  };
  return Icon(source, style);
};
export const ArrowRightIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/right_arrow_icon.png")
  };
  return Icon(source, style);
};

export const PatientInfoIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/patient_info_icon.png")
  };
  return Icon(source, style);
};
export const BluetoothIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/bluetooth.png")
  };
  return Icon(source, style);
};
export const HistoryIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/history_icon.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const LogIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/log.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const BloodDropIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/blooddrop_icon.png")
  };
  return Icon(source, style);
};
export const HomeIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/home_icon.png")
  };
  return Icon(source, style);
};
export const SaveIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/save-outline.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const SaveIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/save.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const CameraIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/camera.png")
  };
  return Icon(source, style);
};
export const DoctorIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/doctor.png")
  };
  return Icon(source, style);
};
export const TrashIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/trash-2.png")
  };
  return Icon(source, style);
};
export const EditIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/edit.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const LoginIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/log-in.png")
  };
  return Icon(source, style);
};
export const LoginoutOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/log-out.png")
  };
  return Icon(source, style);
};
export const CertIDIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/cert_id.png")
  };
  return Icon(source, style);
};
export const CertCardIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/cert_card.png")
  };
  return Icon(source, style);
};
export const CertPhoneIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/cert_phone.png")
  };
  return Icon(source, style);
};
export const GlucoseMeterIconOutline = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/glucose_meter.png")
  };
  return Icon(source, style);
};

export const StateEatIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/state_eat.png")
  };
  return Icon(source, style);
};
export const StateReserveIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/state_reserve.png")
  };
  return Icon(source, style);
};
export const StateDoubleIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/state_double.png")
  };
  return Icon(source, style);
};
export const DefAvataIconFill = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/default_avatar.png")
  };
  return Icon(source, style);
};
export const PatientBedIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/filter_bed_number_icon.png")
  };

  return Icon(source, style);
};
export const MyPatientIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/log_mypatient.png")
  };

  return Icon(source, style);
};
export const SwapIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/swap.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const PersionDoneIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/person-done.png")
  };
  return Icon(source, style);
};
export const ArrowUpIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/arrow-ios-upward.png")
  };
  return Icon(source, style);
};
export const ArrowDownIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./eva/arrow-ios-downward.png")
  };
  return Icon(source, style);
};
export const NewPatientIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/patient_new_icon.png")
  };
  return Icon(source, style);
};
export const HospitalIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/hospital.png")
  };
  style.tintColor = "white";
  return Icon(source, style);
};
export const TemperatureIcon = (style: StyleProp<ImageStyle>): IconElement => {
  const source: IconSource = {
    imageSource: require("./app/temperature_icon.png")
  };

  return Icon(source, style);
};


export { Icon, IconSource, RemoteIcon } from "./icon.component";
