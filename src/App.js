import React, { Component } from 'react'
import ContentEditable from './components/ContentEditable'
import api from './utils/api'
import sortByDate from './utils/sortByDate'
import isLocalHost from './utils/isLocalHost'
import './App.css'

export default class App extends Component {

  state = {
    todos: [],
    showMenu: false
  }

  componentDidMount() {

    api.readAll().then((todos) => {
      if (todos.message === 'unauthorized') {
        if (isLocalHost()) {
          alert('Key is not unauthorized')
        }
        return false
      }

      console.log('all todos', todos)
      this.setState({
        todos: todos
      })
    })
  }

  saveTodo = (e) => {
    e.preventDefault()
    const { todos } = this.state
    const todoValue = this.inputElement.value
    const valueData = this.inputDate.value

    if (!todoValue) {
      alert('You need put one goal')
      this.inputElement.focus()
      return false
    }

    this.inputElement.value = ''

    const todoInfo = {
      title: todoValue,
      date: valueData,
      completed: false,
    }

    const newTodoArray = [{
      data: todoInfo,
      ts: new Date().getTime() * 10000
    }]

    const optimisticTodoState = newTodoArray.concat(todos)

    this.setState({
      todos: optimisticTodoState
    })

    api.create(todoInfo).then((response) => {
      console.log(response)
      const persistedState = removeOptimisticTodo(todos).concat(response)
      this.setState({
        todos: persistedState
      })
    }).catch((e) => {
      console.log('An API error occurred', e)
      const revertedState = removeOptimisticTodo(todos)
      this.setState({
        todos: revertedState
      })
    })
  }
  deleteTodo = (e) => {
    const { todos } = this.state
    const todoId = e.target.dataset.id

    const filteredTodos = todos.reduce((acc, current) => {
      const currentId = getTodoId(current)
      if (currentId === todoId) {
        acc.rollbackTodo = current
        return acc
      }
      acc.optimisticState = acc.optimisticState.concat(current)
      return acc
    }, {
      rollbackTodo: {},
      optimisticState: []
    })

    this.setState({
      todos: filteredTodos.optimisticState
    })

    api.delete(todoId).then(() => {
      console.log(`deleted todo id ${todoId}`)
    }).catch((e) => {
      console.log(`There was an error removing ${todoId}`, e)
      this.setState({
        todos: filteredTodos.optimisticState.concat(filteredTodos.rollbackTodo)
      })
    })
  }
  handleTodoCheckbox = (event) => {
    const { todos } = this.state
    const { target } = event
    const todoCompleted = target.checked
    const todoId = target.dataset.id

    const updatedTodos = todos.map((todo, i) => {
      const { data } = todo
      const id = getTodoId(todo)
      if (id === todoId && data.completed !== todoCompleted) {
        data.completed = todoCompleted
      }
      return todo
    })

    this.setState({
      todos: updatedTodos
    }, () => {
      api.update(todoId, {
        completed: todoCompleted
      }).then(() => {
        console.log(`update todo ${todoId}`, todoCompleted)
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    })
  }
  updateTodoTitle = (event, currentValue) => {
    let isDifferent = false
    const todoId = event.target.dataset.key

    const updatedTodos = this.state.todos.map((todo, i) => {
      const id = getTodoId(todo)
      if (id === todoId && todo.data.title !== currentValue) {
        todo.data.title = currentValue
        isDifferent = true
      }
      return todo
    })

    if (isDifferent) {
      this.setState({
        todos: updatedTodos
      }, () => {
        api.update(todoId, {
          title: currentValue
        }).then(() => {
          console.log(`update todo ${todoId}`, currentValue)
        }).catch((e) => {
          console.log('An error occurred', e)
        })
      })
    }
  }
  clearCompleted = () => {
    const { todos } = this.state

    const data = todos.reduce((acc, current) => {
      if (current.data.completed) {
        acc.completedTodoIds = acc.completedTodoIds.concat(getTodoId(current))
        return acc
      }
      acc.optimisticState = acc.optimisticState.concat(current)
      return acc
    }, {
      completedTodoIds: [],
      optimisticState: []
    })

    if (!data.completedTodoIds.length) {
      alert('check')
      this.closeModal()
      return false
    }

    this.setState({
      todos: data.optimisticState
    }, () => {
      setTimeout(() => {
        this.closeModal()
      }, 600)

      api.batchDelete(data.completedTodoIds).then(() => {
        console.log(`Batch removal complete`, data.completedTodoIds)
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    })
  }
  closeModal = (e) => {
    this.setState({
      showMenu: false
    })
  }
  openModal = () => {
    this.setState({
      showMenu: true
    })
  }
  renderTodos() {
    const { todos } = this.state

    if (!todos || !todos.length) {
      return null
    }

    const timeStampKey = 'ts'
    const orderBy = 'desc'
    const sortOrder = sortByDate(timeStampKey, orderBy)
    const todosByDate = todos.sort(sortOrder)

    return todosByDate.map((todo, i) => {

      const { data, ref } = todo
      const id = getTodoId(todo)

      let deleteButton

      if (ref) {
        deleteButton = (
          <button data-id={id} onClick={this.deleteTodo}>
            delete
          </button>
        )
      }

      return (
        <div key={i} className='todo-item'>
          <label className="todo">

            <div className='todo-list-title'>

              <ContentEditable
                tagName='span'
                editKey={id}
                onBlur={this.updateTodoTitle}
                html={data.title}

              />
              <p>
                {data.date}
              </p>
              {deleteButton}

            </div>

          </label>



        </div>
      )
    })
  }
  render() {
    return (
      <div className='app'>

        <header className='header'>
          <div className='header-left-nav'>
            <h1 className='header-title'>My Goals  </h1>
            <h2 className='header-title2'>Define objectives,
                set a deadline and show up the achieves
            </h2>
          </div>
        </header>

        <div className='todo-list'>

          <form className='todo-create-wrapper' onSubmit={this.saveTodo}>

            <input
              className='todo-create-input'
              placeholder='Start a new goal'
              name='name'
              ref={el => this.inputElement = el}
              autoComplete='off'
              style={{ marginRight: 20 }}
            />

            <input
              className='todo-create-input'
              type="date"
              ref={dt => this.inputDate = dt}
              style={{ marginRight: 20 }} />

            <input
              className='todo-create-input'
              type="number"
              placeholder='Initial number'
              style={{ marginRight: 20 }} />

            <input
              className='todo-create-input'
              type="number"
              placeholder='Final number'
              style={{ marginRight: 20 }} />

            <input
              className='todo-create-input'
              type="option"
              placeholder='Type'
              style={{ marginRight: 20 }} />

            <div className='todo-actions'>
              <button className='todo-create-button'>
                NEW CHALLENGE
              </button>
            </div>
          </form>

          {this.renderTodos()}

        </div>

        <footer className="footer">
          <div className='footer-left-nav'>

            <ul className='footer-text'>
              <li>Daniel Roncaglia</li>
              <li>São Paulo - Brasil</li>
              <li>+55 (11) 97286-1722</li>
              <li>daniel.roncaglia@gmail.com</li>
            </ul>
          </div>
        </footer>
      </div>
    )
  }
}

function removeOptimisticTodo(todos) {
  return todos.filter((todo) => {
    return todo.ref
  })
}

function getTodoId(todo) {
  if (!todo.ref) {
    return null
  }
  return todo.ref['@ref'].id
}
