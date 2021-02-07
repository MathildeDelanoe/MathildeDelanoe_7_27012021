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
    SET_AUTHENTICATION(state, payload)
    {
      state.auth = payload
    },
    SET_USERID(state, payload)
    {
      state.userId = payload
    }
  },
  actions: {
  },
  modules: {
  }
})
