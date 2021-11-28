import { combineReducers, Reducer } from 'redux';
import {
  BLUE_SERVER_CONNECT, BLUE_SERVER_DISCONNECT,
  BLUE_SERVER_SYNC_WAIT, BLUE_SERVER_SYNC_COMPLETE, SERVER_SYNC_WAIT, SERVER_SYNC_COMPLETE,
} from '../actions/actions';
const initBluetoothStatus = {
  connected: false,
  syncStatus: false,
  isSynWait: false
};
const blueServerConn = (state = initBluetoothStatus, action) => {
  switch (action.type) {
    case BLUE_SERVER_CONNECT:
      return {
        connected: true,
        syncStatus: false,
      };
      break;
    case BLUE_SERVER_DISCONNECT:
      return {
        connected: false,
        syncStatus: false,
      };
      break;
    case BLUE_SERVER_SYNC_WAIT:
      return {
        connected: true,
        syncStatus: true,
      };
      break;
    case BLUE_SERVER_SYNC_COMPLETE:
      return {
        connected: true,
        syncStatus: false,
      };
      break;
    case SERVER_SYNC_WAIT:
      return {
        connected: false,
        syncStatus: false,
        isSynWait: true
      }
      break;
    case SERVER_SYNC_COMPLETE:
      return {
        connected: false,
        syncStatus: false,
        isSynWait: false
      }
      break;
    default:
      return state;
  }
};
const APPReducers: Reducer = combineReducers({
  blueServerConn,
});

export default APPReducers;
