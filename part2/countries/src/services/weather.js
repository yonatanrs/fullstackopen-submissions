import axios from 'axios'

const getWeather = (capital, apiKey) => {
  const encodedCapital = encodeURIComponent(capital)
  const request = axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodedCapital}&appid=${apiKey}&units=metric`
  )

  return request.then(response => response.data)
}

export default { getWeather }
