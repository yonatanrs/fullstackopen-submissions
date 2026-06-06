import axios from 'axios'

const getWeather = (city, apiKey) => {
  const request = axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  )

  return request.then(response => response.data)
}

export default { getWeather }
