import { all } from 'redux-saga/effects'
import { playerSagas } from './player.sagas'

export default function* APPsagas() {
  yield all([
    ...playerSagas,
  ])
}
