import React, { useState, useEffect, useContext, useCallback } from 'react'
import {
  clearDogCache,
  getDog,
  updateDog,
  updateDogImage,
  createDogImages,
  deleteDogImage,
} from '../../../../services/DogService'
import BackButton from '../../../common/BackButton/BackButton'
import MainImage from '../../../Dogs/MainImage/MainImage'
import ContentContainer from '../../../common/ContentContainer'
import DogRead from './DogRead'
import DogEdit from './DogEdit'
import UserContext from '../../../../UserContext'
import UploadPhotos from '../../../Dogs/UploadPhotos/UploadPhotos'
import { useRouteMatch } from 'react-router-dom'
import Gallery from '../Gallery/Gallery'
import Spinner from '../../../common/Spinner/Spinner'

const DogProfile = () => {
  const [state, setState] = useState({
    dog: {},
    user: JSON.parse(localStorage.getItem('user')),
    isEditMode: false,
    uploadedImages: [],
    imagesCopy: [],
  })
  const { dog, user, isEditMode, uploadedImages, imagesCopy } = state

  const match = useRouteMatch()
  let uc = useContext(UserContext)

  const getCurrentDog = useCallback(() => {
    clearDogCache()
    getDog(match.params.id).then((response) => {
      if (response) {
        setState((prevState) => ({
          ...prevState,
          dog: response.data,
          imagesCopy: response.data.dog_images,
        }))
      }
    })
  }, [match])

  const transformBreeds = (breeds) => {
    return breeds.map((b) => {
      return b.id
    })
  }

  const updateEditMode = (mode) => {
    setState((prevState) => ({
      ...prevState,
      isEditMode: mode,
    }))
  }

  const updateInfo = (dogForm, breeds) => {
    let dog = { ...dogForm }
    delete dog.breeds
    let body = {
      dog: { ...dog },
      breeds: transformBreeds(dogForm.breeds),
    }
    updateDog(match.params.id, body).then((response) => {
      if (response) {
        uc.openSnack({
          message: 'Dog has been updated!',
          isOpen: true,
          className: 'success',
        })
        updateEditMode(false)
      }
    })
  }

  // const isMainImage = (image) => {
  //   return image.main_image && !image.deleted
  // }

  // const cleanupImages = (images) => {
  //   let newImages = [...images]
  //     .map((ni) => {
  //       if (!ni.deleted) {
  //         return {
  //           main_image: ni.main_image,
  //           url: ni.url,
  //         }
  //       } else {
  //         return null
  //       }
  //     })
  //     .filter(Boolean)
  //   if (!newImages.some(isMainImage)) {
  //     newImages[0].main_image = true
  //   }
  //   return newImages
  // }

  const findDeleted = () => {
    let newImages = [...imagesCopy]
      .map((ni) => {
        if (ni.deleted && ni.id) {
          return ni.id
        } else {
          return null
        }
      })
      .filter(Boolean)
    return newImages
  }

  const findUploaded = () => {
    let newImages = [...imagesCopy]
      .map((ni) => {
        if (ni.uploaded_image && !ni.deleted) {
          return {
            main_image: ni.main_image,
            url: ni.url,
          }
        } else {
          return null
        }
      })
      .filter(Boolean)
    return newImages
  }

  const findExisting = () => {
    let newImages = [...imagesCopy]
      .map((ni) => {
        if (!ni.uploaded_image && !ni.deleted) {
          return {
            main_image: ni.main_image,
            url: ni.url,
            id: ni.id,
          }
        } else {
          return null
        }
      })
      .filter(Boolean)
    return newImages
  }

  const updateImages = () => {
    let deletedImages = findDeleted()
    let uploadedImages = findUploaded()
    let existingImages = findExisting()
    if (
      Array.isArray(deletedImages) &&
      Array.isArray(uploadedImages) &&
      Array.isArray(existingImages)
    ) {
      if (deletedImages.length > 0) {
        // delete images
        deletedImages.forEach((di) => {
          deleteDogImage(di)
        })
      }
      if (uploadedImages.length > 0) {
        // upload images
        let body = {
          dog_id: dog.id,
          dog_images: uploadedImages,
        }
        createDogImages(dog.id, body)
      }
      if (existingImages.length > 0) {
        // update existingImages images
        existingImages.forEach((ei) => {
          updateDogImage(ei.id, ei)
        })
      }
    }
  }

  const update = (dogForm, breeds) => {
    updateInfo(dogForm, breeds)
    updateImages()
  }

  const updateImageCopy = useCallback((images) => {
    setState((prevState) => ({
      ...prevState,
      imagesCopy: images,
    }))
  }, [])

  const uploadImages = (files) => {
    files.forEach((file) => {
      let reader = new FileReader()
      reader.onloadend = () => {
        setState((prevState) => ({
          ...prevState,
          uploadedImages: [
            ...prevState.imagesCopy,
            {
              url: reader.result,
              main_image: prevState.imagesCopy.length === 0 ? true : false,
              uploaded_image: true,
              uploaded_id: `uploaded-${prevState.imagesCopy.length + 1}`,
            },
          ],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const cancelEdit = () => {
    setState((prevState) => ({
      ...prevState,
      isEditMode: false,
    }))
  }

  useEffect(() => {
    getCurrentDog()
  }, [getCurrentDog])

  useEffect(() => {
    updateImageCopy(uploadedImages)
  }, [uploadedImages, updateImageCopy])

  return (
    <div className='dog-profile profile'>
      <div className='main-content-header'>
        <BackButton />
      </div>
      <ContentContainer customClass='profile-container'>
        <div className='left-section'>
          {isEditMode && <UploadPhotos callout={uploadImages} type='dog' />}
          {!isEditMode && (
            <>
              {dog?.dog_images && user?.id ? (
                <MainImage images={dog.dog_images} />
              ) : (
                <Spinner type='circle' />
              )}
            </>
          )}
        </div>
        <div className={`right-section ${isEditMode ? 'is-edit' : ''}`}>
          {!isEditMode ? (
            <DogRead
              dog={dog}
              user={user}
              setIsEditMode={updateEditMode}
              getCurrentDog={getCurrentDog}
            />
          ) : (
            <DogEdit dog={dog}>
              {({ form, breeds }) => (
                <div className='form-button-container'>
                  <button className={'plain'} onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button
                    className={'primary'}
                    onClick={() => update(form, breeds)}
                  >
                    Save
                  </button>
                </div>
              )}
            </DogEdit>
          )}
        </div>
      </ContentContainer>
      {imagesCopy && (
        <div
          style={{ maxWidth: '1472px', margin: 'auto', padding: '0 20px 20px' }}
          className='animated fadeIn delay-10 relative'
        >
          <Gallery
            images={imagesCopy}
            uploadedImages={isEditMode ? uploadedImages : null}
            isEdit={isEditMode}
            updateImageCopy={updateImageCopy}
          />
        </div>
      )}
    </div>
  )
}

export default DogProfile
