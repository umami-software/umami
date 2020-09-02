import { combineReducers } from 'redux';
import user from './actions/user';
import websites from './actions/websites';
import queries from './actions/queries';

export default combineReducers({ user, websites, queries });
