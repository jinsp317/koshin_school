import React from 'react';
import { View, Dimensions, ScaledSize, ProgressBarAndroid, NativeModules } from 'react-native';
import {
	ThemedComponentProps,
	ThemeType,
	withStyles,
	ModalComponentCloseProps,
} from '@src/core/react-native-ui-kitten/theme';
import { Button, Text, Input } from '@src/core/react-native-ui-kitten/ui';
import { textStyle } from '@src/components/common/style';
import Strings from '@src/assets/strings';
import { PersonIconFill, CreditCardIconFill, DoctorIconOutline } from '@src/assets/icons';
import { StringValidator } from '@src/core/validators';
import GLOBAL from '@src/core/globals';
import * as UTILS from '@src/core/app_utils';
import RNFS from 'react-native-fs';
import ReactNativeAPK from "react-native-apk";
// import  from 'react-native';
import { VersionInfoModel } from '@src/core/model/versionInfo.model';

interface ComponentProps {
	onClose: () => void;
	versionInfo: VersionInfoModel;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
	isUpdate: boolean;
	downloadProgress: number;
}
class MyModalComponent extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			isUpdate: false,
			downloadProgress: 0,
		};
	}
	/**
const android = RNFetchBlob.android

RNFetchBlob.config({
    addAndroidDownloads : {
      useDownloadManager : true,
      title : 'awesome.apk',
      description : 'An APK that will be installed',
      mime : 'application/vnd.android.package-archive',
      mediaScannable : true,
      notification : true,
    }
  })
  .fetch('GET', `http://www.example.com/awesome.apk`)
  .then((res) => {
      android.actionViewIntent(res.path(), 'application/vnd.android.package-archive')
  })
 */
	private onPressYes = () => {
		this.setState({ isUpdate: true });
		const versionInfo = this.props.versionInfo;
		const filePath = `${RNFS.DocumentDirectoryPath}/com.daleapp.${versionInfo.file_name}`;

		RNFS.exists(filePath).then((exist) => {
			exist = false;
			if (exist) {
				this.setState({ downloadProgress: 1 });
				// NativeModules.InstallApk.install(filePath);
				ReactNativeAPK.installApp(filePath);
				this.props.onClose();
			} else {
				// RNFS.stopDownload(jobId)
				const download = RNFS.downloadFile({
					fromUrl: `http://${GLOBAL.server_ip}/api/version/download?id=${versionInfo.id}&file=${versionInfo.file_name}`,
					toFile: filePath,
					progress: (res) => {
						// console.log((res.bytesWritten / res.contentLength).toFixed(2));
						this.setState({
							downloadProgress: res.bytesWritten / res.contentLength,
						});
					},
					progressDivider: 1,
				});
				download.promise
					.then((result) => {
						if (result.statusCode == 200) {
							// NativeModules.InstallApk.install(filePath);
							// console.log(filePath);
							ReactNativeAPK.installApp(filePath);
							this.props.onClose();
						}
					})
					.catch((e) => {
						UTILS.showToast(Strings.common.str_opFailed);
						this.props.onClose();
					});
			}
		});
	};

	private onPressNo = () => {
		this.props.onClose();
	};
	public render(): React.ReactNode {
		const { themedStyle } = this.props;
		const versionInfo = this.props.versionInfo;
		const filePath = `${RNFS.DocumentDirectoryPath}/com.daleapp.${versionInfo.file_name}`;
		return (
			<View style={themedStyle.container}>
				<View style={themedStyle.headerContainer}>
					<Text style={themedStyle.titleLabel} category="h6">
						版本更新
					</Text>
				</View>
				<View style={{ paddingVertical: 10 }}>
					{this.state.isUpdate ? (
						<View style={{ alignItems: 'center' }}>
							<View
								style={{
									width: '80%',
								}}
							>
								<ProgressBarAndroid
									styleAttr="Horizontal"
									indeterminate={false}
									progress={this.state.downloadProgress}
								/>
							</View>
							<Text style={{ paddingVertical: 10 }}>{`下载进度 ${(this.state.downloadProgress * 100).toFixed(
								0
							)}%`}</Text>
						</View>
					) : (
							<View style={{ alignItems: 'center' }}>
								<Text style={themedStyle.titleLabel} category="h6">
									{Strings.message.version_confirm_update}
								</Text>
								<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
									<Button style={{ margin: 10, flex: 1 }} onPress={this.onPressYes}>
										是
								</Button>

									<Button style={{ margin: 10, flex: 1 }} onPress={this.onPressNo}>
										否
								</Button>
								</View>
							</View>
						)}
				</View>
			</View>
		);
	}
}

export const UpdateVersionModal = withStyles(MyModalComponent, (theme: ThemeType) => {
	const dimensions: ScaledSize = Dimensions.get('window');
	const contentWidth: number = dimensions.width - 24;
	const contentHeight: number = 192;

	return {
		container: {
			borderWidth: 0,
			borderColor: theme['color-primary-500'],
			zIndex: 1,
			justifyContent: 'space-between',
			paddingVertical: 10,
			paddingHorizontal: 10,
			// width: contentWidth,
			// height: contentHeight,
			borderRadius: 12,
			// top: (dimensions.height - contentHeight) / 2,
			// left: (dimensions.width - contentWidth) / 2,
			backgroundColor: theme['mycolor-background'],
		},
		headerContainer: {
			alignItems: 'center',
			justifyContent: 'center',
			borderBottomWidth: 1,

			borderColor: theme['mycolor-lightgray'],
			padding: 10,
		},
		titleLabel: {
			...textStyle.headline,
			color: theme['#ccc'],
		},
		descriptionLabel: {
			marginVertical: 24,
			...textStyle.paragraph,
		},
	};
});
