import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HelperService from '../../../services/HelperService'
import Icon from '../../common/Icons/Icon'
import noImage from '../../../images/no-image.jpg'
import FavoriteIcon from '../../FavoriteIcon/FavoriteIcon'

const DogCard = ({ dog, count, user }) => {
  const [image, setImage] = useState({})

  useEffect(() => {
    findMainImage(dog.dog_images)
  }, [])

  const findMainImage = images => {
    let mainImage = images.filter(i => {
      return i.main_image
    })
    if (mainImage.length === 0) {
      mainImage = [images[0]]
    }
    setImage(mainImage[0])
  }

  const trimText = (text, characterLength) => {
    return text.length > characterLength
      ? `${text.substring(0, characterLength).trim()}...`
      : text
  }

  const messageOwner = () => {
    console.log('message owner')
  }

  return (
    <div className={`animated fadeInRight delay-${count}`}>
      <div className='card dog-card'>
        <div className='top-content'>
          <Link to={`/dogs/${dog.id}`}>
            <img
              src={image ? image.url : noImage}
              alt={dog.name}
              className={`dog-picture`}
            />
          </Link>
          <div className='card-content'>
            <h2>{dog.name}</h2>
            <span className='gender-age'>
              <span className='gender'>{dog.gender}</span>
              &nbsp;&nbsp;/&nbsp;&nbsp;
              <span className='age'>
                {HelperService.getYearsOld(dog.birthdate)}
              </span>
            </span>
            <span className='dog-breed'>
              {dog.breeds.length > 1 ? (
                // popover here with list of breeds
                <span>Breeds</span>
              ) : (
                // {dog.breeds.map((e, i) => (
                //   <span key={i}>
                //     {e.name} {dog.breeds.length > i + 1 && <span>/</span>}
                //   </span>
                // ))}
                <span>{dog.breeds[0].name}</span>
              )}
            </span>
            {user.city && user.state && (
              <span className='location'>
                {dog.city || 'Lehi'}, {dog.state || 'UT'}
              </span>
            )}
            <p>
              {dog.description ? (
                <>{trimText(dog.description, 150)}</>
              ) : (
                <>No description available</>
              )}
            </p>
          </div>
        </div>
        <div className='card-footer'>
          <Link to={`/dogs/${dog.id}`}>
            <button className='view-profile primary'>View Profile</button>
          </Link>
          {user.id !== dog.user_id && (
            <>
              <div className='icon-container'>
                <Icon icon='message' callout={messageOwner} />
              </div>
              <FavoriteIcon dog={dog} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DogCard
