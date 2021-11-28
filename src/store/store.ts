import { createStore, applyMiddleware, Store } from 'redux'
import APPReducers from '../reducers'


const store: Store = createStore(APPReducers);


export default store
