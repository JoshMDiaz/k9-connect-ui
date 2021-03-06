import history from './History'
import auth0 from 'auth0-js'
import { getUser, createUser } from '../UserService'

export default class Auth {
  accessToken
  idToken
  expiresAt
  userProfile

  auth0 = new auth0.WebAuth({
    domain: 'k9-connect.auth0.com',
    clientID: 'RJlTOOYnoxc7SdCRbV7rpuYJNMTawcj9',
    redirectUri: 'http://localhost:9000/callback',
    responseType: 'token id_token',
    scope: 'openid profile',
  })

  constructor() {
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.getAccessToken = this.getAccessToken.bind(this)
    this.getIdToken = this.getIdToken.bind(this)
    this.renewSession = this.renewSession.bind(this)
    this.getProfile = this.getProfile.bind(this)
  }

  login() {
    this.auth0.authorize()
  }

  getProfile(cb) {
    this.auth0.client.userInfo(this.accessToken, (err, profile) => {
      if (profile) {
        this.userProfile = profile
      }
      cb(err, profile)
    })
  }

  getCurrentUser(profile, authResult) {
    getUser({}, profile.sub).then((response) => {
      if (!response?.data) {
        createUser({ sub: profile.sub, email: profile.name })
      }
      this.setSession(authResult)
    })
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.auth0.client.userInfo(authResult.accessToken, (err, profile) => {
          if (profile) {
            this.userProfile = profile
            localStorage.setItem('auth0User', JSON.stringify(profile))
            this.getCurrentUser(profile, authResult)
          }
        })
      } else if (err) {
        history.replace('/')
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }

  getAccessToken() {
    return this.accessToken
  }

  getIdToken() {
    return this.idToken
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true')

    // Set the time that the access token will expire at
    let expiresAt = authResult.expiresIn * 1000 + new Date().getTime()
    this.accessToken = authResult.accessToken
    this.idToken = authResult.idToken
    this.expiresAt = expiresAt
    localStorage.setItem('expiresAt', expiresAt)

    // navigate to the browse route
    if (history.location.pathname === '/callback') {
      history.push('/dogs')
      window.location.reload()
    }
  }

  renewSession() {
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
      } else if (err) {
        this.logout()
        console.log(err)
        alert(
          `Could not get a new token (${err.error}: ${err.error_description}).`
        )
      }
    })
  }

  logout() {
    // Remove tokens and expiry time
    this.accessToken = null
    this.idToken = null
    this.expiresAt = 0
    this.userProfile = null

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('auth0User')
    localStorage.removeItem('user')

    this.auth0.logout({
      returnTo: window.location.origin,
    })
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = localStorage.getItem('expiresAt')
    return new Date().getTime() < expiresAt
  }
}
