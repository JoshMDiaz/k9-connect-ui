import React, { useState, useEffect, useContext } from 'react'
import { Snackbar } from '@material-ui/core'
import { Link } from 'react-router-dom'
import ContentContainer from '../../../common/ContentContainer'
import List from '../../../Dogs/List'
import userContext from '../../../../userContext'
import UserRead from './UserRead'
import UserEdit from './UserEdit'
import UserService from '../../../../services/UserService'
import UploadPhotos from '../../../Dogs/UploadPhotos/UploadPhotos'
import Plural from '../../../common/Plural'

const UserProfile = props => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [user, setUser] = useState({})
  const [uploadedImage, setUploadedImage] = useState(null)
  const [snack, setSnack] = useState({
    isOpen: false,
    message: ''
  })
  const uc = useContext(userContext)
  let isCancelled,
    getUserCount = 0

  useEffect(() => {
    setUser(uc.user)
    setUploadedImage(uc.user.picture)
    if (Object.entries(uc.user).length !== 0 && !uc.user.id) {
      if (getUserCount === 0) {
        !isCancelled && getUser()
        setIsEditMode(true)
        getUserCount = 1
      }
    }
  }, [uc.user])

  useEffect(() => {
    setUploadedImage(uc.user.picture)
  }, [isEditMode])

  const determineUserChange = form => {
    if (user.id) {
      update(form)
    } else {
      create(form)
    }
  }

  const getUser = () => {
    UserService.get(uc.user.sub).then(response => {
      if (response && response.data) {
        setUser(response.data)
        uc.setUser(response.data)
        setUploadedImage(response.data.picture)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    })
  }

  const responseAction = form => {
    setSnack({
      message: 'Your account has been updated!',
      isOpen: true,
      className: 'success'
    })
    getUser()
    setIsEditMode(false)
  }

  const postBody = form => {
    return {
      ...form,
      picture: uploadedImage || form.picture
    }
  }

  const update = form => {
    UserService.updateUser(user.sub, postBody(form)).then(response => {
      if (response) {
        responseAction()
      }
    })
  }

  const create = form => {
    UserService.createUser(postBody(form)).then(response => {
      if (response) {
        responseAction()
      }
    })
  }

  const closeSnack = () => {
    setSnack({
      ...snack,
      isOpen: false
    })
  }

  const uploadImage = files => {
    if (files.length > 0) {
      let reader = new FileReader()
      let file = files[0]
      reader.onloadend = () => {
        setUploadedImage(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setSnack({
        message: 'File type not accepted. Only .jpg and .png are accepted.',
        isOpen: true
      })
    }
  }

  return (
    <div className='user-profile profile'>
      <div className='main-content-header'>
        <span className='animated fadeInLeft'>
          You have {user.dogs ? user.dogs.length : 0}{' '}
          <Plural text='Dog' number={user.dogs ? user.dogs.length : 0} />{' '}
          Registered
        </span>
        <Link
          to='/profile/new-dog'
          className='new-dog-link animated fadeInRight'
        >
          <button className='primary'>New Dog</button>
        </Link>
      </div>
      <ContentContainer customClass='profile-container'>
        <div className='left-section animated fadeInLeft'>
          {isEditMode ? (
            <>
              <UploadPhotos callout={uploadImage} type='user' />
              {uploadedImage && (
                <div className='image-container'>
                  <img src={uploadedImage} alt='uploaded profile' />
                </div>
              )}
            </>
          ) : (
            <div className='image-container'>
              <img src={user.picture} alt={user.name} />
            </div>
          )}
        </div>
        <div className='right-section animated fadeInRight'>
          {isEditMode ? (
            <UserEdit
              user={user}
              setIsEditMode={setIsEditMode}
              update={determineUserChange}
              history={props.history}
            />
          ) : (
            <UserRead user={user} setIsEditMode={setIsEditMode} />
          )}
        </div>
      </ContentContainer>
      {user.dogs && user.dogs.length > 0 && (
        <div className='page-padding'>
          <List dogs={user.dogs} />
        </div>
      )}
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        key={`top,right`}
        open={snack.isOpen}
        onClose={closeSnack}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        autoHideDuration={3000}
        className={`snackbar ${snack.className || 'error'}`}
        message={<span id='message-id'>{snack.message}</span>}
      />
    </div>
  )
}

export default UserProfile
