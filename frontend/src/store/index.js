import { createStore } from 'vuex'

export default createStore({
  state: {
    auth: '',
    userId: '',
  },
  getters: {
    getAuth(state){
      return `${state.auth}`
    },
    getUserId(state){
      return `${state.userId}`
    },
  },
  mutations: {
    SET_AUTHENTICATION(state, newAuth)
    {
      state.auth = newAuth
    },
    SET_USERID(state, newUserId)
    {
      state.userId = newUserId
    }
  },
  actions: {
  },
  modules: {
  }
})
