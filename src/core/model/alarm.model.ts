export interface AlarmModel {
	id: string;
	title: string; // Required
	message: string; // Required
	channel: string; // Required. Same id as specified in MainApplication's onCreate method
	ticker?: string;
	auto_cancel?: boolean; // default: true
	vibrate?: boolean;
	vibration?: number; // default: 100, no vibration if vibrate: false
	small_icon: string; // Required
	large_icon?: string; // "ic_launcher",
	play_sound?: boolean; // true,
	sound_name?: string; // Plays custom notification ringtone if sound_name: null
	color?: string;
	schedule_once?: boolean; // Works with ReactNativeAN.scheduleAlarm so alarm fires once
	tag?: string;
	fire_date?: Date; // Date for firing alarm, Required for ReactNativeAN.scheduleAlarm.

	// You can add any additional data that is important for the notification
	// It will be added to the PendingIntent along with the rest of the bundle.
	// e.g.
	data?: any; // { foo: "bar" }
}
