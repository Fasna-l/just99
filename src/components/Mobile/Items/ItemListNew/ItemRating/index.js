import { Rating } from '@material-ui/lab'
import React from 'react'
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	iconFilled: {
		color: localStorage.getItem('storeColor'), // Change this to your desired color
	},
  smallIcon: {
    fontSize: '1.2rem', // Adjust this to make the stars smaller
},
});


function ItemRating({item}) {
  const classes = useStyles();
  return (
    <>
      {localStorage.getItem("itemratingstorepage")=="true" &&item.countRating>=localStorage.getItem("numberofitemrating")&&
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            
            <Rating name="half-rating-read" defaultValue={item.avgRating} precision={0.1}
              classes={{
                iconFilled: classes.iconFilled,
                icon: classes.smallIcon,
              }}
              readOnly />
            <span class="item-price  "
            style={{
              marginLeft:"0.2rem"
            }}
            >
              <span>
                {item.avgRating === "0"
                  ? item.rating
                  : item.avgRating + " (" + item.countRating + ")"}

              </span>
              <br />
            </span>
          </div>
        </>
      }
    </>
  )
}

export default ItemRating