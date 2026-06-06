import { useEffect, useState } from 'react'
import countryService from './services/countries'
import weatherService from './services/weather'

const Search = ({ value, onChange }) => {
  return (
    <div>
      find countries <input value={value} onChange={onChange} />
    </div>
  )
}

const CountryList = ({ countries, onShow }) => {
  return (
    <div>
      {countries.map(country =>
        <div key={country.cca3}>
          {country.name.common}{' '}
          <button onClick={() => onShow(country)}>show</button>
        </div>
      )}
    </div>
  )
}

const Languages = ({ languages }) => {
  return (
    <ul>
      {Object.values(languages).map(language =>
        <li key={language}>{language}</li>
      )}
    </ul>
  )
}

const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null)

  const capital = country.capital?.[0]
  const apiKey = import.meta.env.VITE_SOME_KEY

  useEffect(() => {
    setWeather(null)

    if (!capital || !apiKey) {
      return
    }

    weatherService
      .getWeather(capital, apiKey)
      .then(data => {
        setWeather(data)
      })
  }, [capital, apiKey])

  if (!capital) {
    return null
  }

  if (!apiKey) {
    return (
      <div>
        <h2>Weather in {capital}</h2>
        <p>Weather API key is missing. Set VITE_SOME_KEY before running the app.</p>
      </div>
    )
  }

  if (!weather) {
    return (
      <div>
        <h2>Weather in {capital}</h2>
        <p>Loading weather...</p>
      </div>
    )
  }

  const icon = weather.weather[0].icon
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`

  return (
    <div>
      <h2>Weather in {capital}</h2>
      <p>Temperature {weather.main.temp} Celsius</p>
      <img src={iconUrl} alt={weather.weather[0].description} />
      <p>Wind {weather.wind.speed} m/s</p>
    </div>
  )
}

const CountryDetails = ({ country }) => {
  const capital = country.capital?.[0] ?? 'No capital'

  return (
    <div>
      <h1>{country.name.common}</h1>

      <p>
        Capital {capital}<br />
        Area {country.area}
      </p>

      <h2>Languages</h2>
      <Languages languages={country.languages} />

      <img
        src={country.flags.png}
        alt={country.flags.alt ?? `Flag of ${country.name.common}`}
        width="150"
      />

      <Weather country={country} />
    </div>
  )
}

const Results = ({ countries, selectedCountry, onShow }) => {
  if (selectedCountry) {
    return <CountryDetails country={selectedCountry} />
  }

  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }

  if (countries.length > 1) {
    return <CountryList countries={countries} onShow={onShow} />
  }

  if (countries.length === 1) {
    return <CountryDetails country={countries[0]} />
  }

  return <p>No matches found</p>
}

const App = () => {
  const [countries, setCountries] = useState([])
  const [filterText, setFilterText] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    countryService
      .getAll()
      .then(initialCountries => {
        setCountries(initialCountries)
      })
  }, [])

  const handleFilterChange = (event) => {
    setFilterText(event.target.value)
    setSelectedCountry(null)
  }

  const countriesToShow = countries.filter(country =>
    country.name.common.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div>
      <Search value={filterText} onChange={handleFilterChange} />
      <Results
        countries={countriesToShow}
        selectedCountry={selectedCountry}
        onShow={setSelectedCountry}
      />
    </div>
  )
}

export default App
