import React, { useEffect, useState } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Fab, Drawer } from '@material-ui/core'
import Auth from '../services/Auth/Auth'
import UserContext from '../userContext'

import theme from '../theme'
import Sidebar from './Sidebar/Sidebar'

import Header from './Header/Header'
import DogsRoute from './Pages/Dogs/DogsRoute'
import ProfileRoute from './Pages/Profile/ProfileRoute'
import MobileMenu from './MobileMenu/MobileMenu'
import Search from './Pages/Search/Search'

const auth = new Auth()

const Main = props => {
  const [currentUser, setCurrentUser] = useState({})
  const [searchDogs, setSearchDogs] = useState([])
  const [previousPage, setPreviousPage] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      auth.renewSession()
    }
  }, [])

  const setUser = user => {
    setCurrentUser(user)
  }

  const setDogs = dogs => {
    setSearchDogs(dogs)
  }

  const setPrevPage = page => {
    setPreviousPage(page)
  }

  return (
    <MuiThemeProvider theme={theme}>
      <UserContext.Provider
        value={{
          user: currentUser,
          dogs: searchDogs,
          prevPage: previousPage,
          setDogs,
          setUser,
          setPrevPage
        }}
      >
        <div className='App'>
          <Sidebar />
          <div>
            <Header auth={auth} />
            <div className='app-content'>
              <Switch>
                <Route
                  path='/search'
                  render={props => (
                    <Search {...props} auth={auth} dogs={searchDogs} />
                  )}
                />
                <Route
                  path='/dogs'
                  render={props => <DogsRoute {...props} auth={auth} />}
                />
                <Route
                  path='/profile'
                  render={props => <ProfileRoute {...props} auth={auth} />}
                />
                <Redirect from='/' exact to='/dogs' />
              </Switch>
            </div>
          </div>
          <Fab
            color='secondary'
            className={'fab-menu-button'}
            onClick={() => setIsOpen(true)}
          >
            <span className='fab-line' />
            <span className='fab-line' />
            <span className='fab-line' />
          </Fab>
          <Drawer
            anchor='right'
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className='mobile-menu-drawer'
          >
            <MobileMenu auth={auth} closeMenu={() => setIsOpen(false)} />
          </Drawer>
        </div>
      </UserContext.Provider>
    </MuiThemeProvider>
  )
}

export default Main
