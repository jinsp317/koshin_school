
export const BLUE_SERVER_CONNECT = 'BLUE_SERVER_CONNECT';
export const BLUE_SERVER_DISCONNECT = 'BLUE_SERVER_DISCONNECT';
export const BLUE_SERVER_SYNC_WAIT = 'BLUE_SERVER_SYNC_WAIT';
export const BLUE_SERVER_SYNC_COMPLETE = 'BLUE_SERVER_SYNC_COMPLETE';
export const SERVER_SYNC_WAIT = 'SERVER_SYNC_WAIT';
export const SERVER_SYNC_COMPLETE = 'SERVER_SYNC_COMPLETE';
export function changeDate(date) {
  return {
    type: 'CHANGE_DATE',
    date
  }
}
// 
export function connectedBluetoothServer(state: boolean) {
  if (__DEV__) console.info(state);
  if (state) {
    return {
      type: BLUE_SERVER_CONNECT,
      state
    }
  } else {
    return {
      type: BLUE_SERVER_DISCONNECT,
      state
    }
  }
}
export function setSyncWait(wait: boolean) {
  if (__DEV__) console.info(wait);
  if (wait) {
    return {
      type: BLUE_SERVER_SYNC_WAIT
    }
  } else {
    return {
      type: BLUE_SERVER_SYNC_COMPLETE
    }
  }
}
export function syncWait(wait: boolean) {
  if (wait) {
    return {
      type: SERVER_SYNC_WAIT
    }
  } else {
    return {
      type: SERVER_SYNC_COMPLETE
    }
  }
}

export function selectGame(selectedGame) {
  return {
    type: 'SELECT_GAME',
    selectedGame
  }
}

export function selectTeam(selectedTeam) {
  return {
    type: 'SELECT_TEAM',
    selectedTeam
  }
}

export function selectPlayer(selectedPlayer) {
  return {
    type: 'SELECT_PLAYER',
    selectedPlayer
  }
}

export function selectCategory(selectedCategory) {
  return {
    type: 'SELECT_CATEGORY',
    selectedCategory
  }
}
