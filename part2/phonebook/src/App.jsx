import { useEffect, useRef, useState } from 'react'
import personService from './services/persons'

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={`notification ${message.type}`}>
      {message.text}
    </div>
  )
}

const Filter = ({ value, onChange }) => {
  return (
    <div>
      filter shown with <input value={value} onChange={onChange} />
    </div>
  )
}

const PersonForm = ({
  onSubmit,
  name,
  number,
  onNameChange,
  onNumberChange
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input value={name} onChange={onNameChange} />
      </div>
      <div>
        number: <input value={number} onChange={onNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Person = ({ person, onRemove }) => {
  return (
    <p>
      {person.name} {person.number}{' '}
      <button onClick={onRemove}>delete</button>
    </p>
  )
}

const Persons = ({ persons, onRemove }) => {
  return (
    <div>
      {persons.map(person =>
        <Person
          key={person.id}
          person={person}
          onRemove={() => onRemove(person)}
        />
      )}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterText, setFilterText] = useState('')
  const [notification, setNotification] = useState(null)
  const notificationTimeout = useRef(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type })

    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current)
    }

    notificationTimeout.current = setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const resetForm = () => {
    setNewName('')
    setNewNumber('')
  }

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      const shouldUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (!shouldUpdate) {
        return
      }

      const changedPerson = {
        ...existingPerson,
        number: newNumber
      }

      personService
        .update(existingPerson.id, changedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(person =>
            person.id !== existingPerson.id ? person : returnedPerson
          ))
          resetForm()
          showNotification(`Updated ${returnedPerson.name}`)
        })
        .catch(() => {
          setPersons(persons.filter(person => person.id !== existingPerson.id))
          showNotification(
            `Information of ${existingPerson.name} has already been removed from server`,
            'error'
          )
        })

      return
    }

    const personObject = {
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        resetForm()
        showNotification(`Added ${returnedPerson.name}`)
      })
  }

  const removePerson = (personToRemove) => {
    const shouldRemove = window.confirm(`Delete ${personToRemove.name}?`)

    if (!shouldRemove) {
      return
    }

    personService
      .remove(personToRemove.id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== personToRemove.id))
        showNotification(`Deleted ${personToRemove.name}`)
      })
      .catch(() => {
        setPersons(persons.filter(person => person.id !== personToRemove.id))
        showNotification(
          `Information of ${personToRemove.name} has already been removed from server`,
          'error'
        )
      })
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilterText(event.target.value)
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification} />

      <Filter value={filterText} onChange={handleFilterChange} />

      <h3>Add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        name={newName}
        number={newNumber}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} onRemove={removePerson} />
    </div>
  )
}

export default App
