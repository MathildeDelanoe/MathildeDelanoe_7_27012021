import { createStore } from 'vuex'

export default createStore({
  state: {
    auth: '',
    userId: '',
    day: 12,
    month: 9,
    year: 2021,
    employee: {},
    lastName: '',
    firstName: '',
    avatar: ''
  },
  getters: {
    formattedDate(state){
      return `${state.day}-${state.month}-${state.year}`
    },
    getFullName(state)
    {
      return `${state.firstName} ${state.lastName}`
    },
    getAvatar(state)
    {
      return `${state.avatar}`
    },
    getAuth(state){
      return `${state.auth}`
    },
    getUserId(state){
      return `${state.userId}`
    },
    getEmployee(state){
      return `${state.employee}`
    }
  },
  mutations: {
    INCREMENT_DAY(state){
      state.day++
    },
    SET_AUTHENTICATION(state, payload)
    {
      state.auth = payload
    },
    SET_USERID(state, payload)
    {
      state.userId = payload
    },
    SET_EMPLOYEE(state, payload)
    {
      console.log("in set_employee")
      console.log(payload)
      state.employee = payload
      console.log("end of set_employee")
    },
    SET_FIRSTNAME(state, payload)
    {
      state.firstName = payload;
    },
    SET_LASTNAME(state, payload)
    {
      state.lastName = payload;
    },
    SET_AVATAR(state, payload)
    {
      state.avatar = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
