import React from 'react'
import PropTypes from 'prop-types'
import Card from './DogCard/DogCard'
import noDogImg from '../../images/no-image.jpg'

const List = ({ dogs }) => {
  let count = 0
  return (
    <>
      {dogs.length > 0 ? (
        <div className='card-list'>
          {dogs.map((e, i) => {
            count++
            return <Card dog={e} key={i} count={count} />
          })}
        </div>
      ) : (
        <div className='no-results animated fadeInRight'>
          <div className='card'>
            <span>
              <h3>Sorry about that!</h3>
              <img src={noDogImg} alt='no-dog' />
              We could not find any dogs with the filters you have selected.
              <br />
              Please try changing the filters.
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default List

List.propTypes = {
  dogs: PropTypes.array.isRequired
}
