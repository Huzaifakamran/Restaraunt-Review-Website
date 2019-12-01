let restaurant;
var newMap;


document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});


initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { 
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibWFqaWQ5NiIsImEiOiJjazNuMmkxcXMwODl4M2tsN2N2d3U5OHdmIn0.DYfvo3itQiUKJXeKxnSPgw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}


fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { 
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { 
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}


fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.className="name1"

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name + ' restaurant image.';

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  
  fillReviewsHTML();
}


fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}


fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}


createReviewHTML = (review) => {
  const li = document.createElement('li');
  const reviewHeader = document.createElement('div');
  reviewHeader.className = 'row review-header'
  const reviewBody = document.createElement('div');
  reviewBody.className = 'review-body'
  const nameDiv = document.createElement('div');
  nameDiv.className = 'col-5'
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'name'
  nameDiv.appendChild(name);
  reviewHeader.appendChild(nameDiv);

  const dateDiv = document.createElement('div');
  dateDiv.className = 'col-7'
  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = 'date'
  dateDiv.appendChild(date);
  reviewHeader.appendChild(dateDiv);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating'
  reviewBody.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'review-comment'
  reviewBody.appendChild(comments);

  li.appendChild(reviewHeader);
  li.appendChild(reviewBody);
  return li;
}


fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const restaurantLink = document.createElement('a');
  restaurantLink.innerHTML = restaurant.name;
  restaurantLink.href = DBHelper.urlForRestaurant(restaurant);
  restaurantLink.setAttribute("aria-current","page");
  li.append(restaurantLink)
  breadcrumb.appendChild(li);
}


getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
