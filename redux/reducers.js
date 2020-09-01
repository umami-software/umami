import { combineReducers } from 'redux';
import user from './actions/user';
import websites from './actions/websites';

export default combineReducers({ user, websites });
