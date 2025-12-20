import React, { useEffect, useState } from 'react'
import './App.css'
import Message from './components/message/message'
import axios from 'axios'
const App = () => {
  const [password, SetPassword] = useState('')
  const [name, SetName] = useState('')
  const [message, SetMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [ws, setWs] = useState()
  const [connected, setConnected] = useState(false)
  const [user_created, setUserCreated] = useState(false)
const connect = () => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${name}`)
    ws.onmessage = (event) => {
      const data = event.data.split('-')
      const username = data[0]
      const message = data[1]
      
      setMessages(prev => [...prev, {username: username, message: message}])
    }

    axios.get('http://localhost:8000/getMessages')
      .then(res => {
        const data = res.data

        const messages = data.map(mess => {
          const data = mess.split('-')
          const username = data[0]
          const message = data[1]

          return {username: username, message: message}
        })
        
        setMessages(messages)
      })
    setWs(ws)
    setConnected(true)

  }
  const send_message = () => {
    if (message === '') return
      ws.send(message)
      SetMessage('')
  }
  const create_user = async () => {
    try {
    await axios.post(`http://localhost:8000/Users/createUser/${name}/${password}`, {
      username: name,
      password: password
    })
    setUserCreated(true)}
  catch (error) {
    alert('Пользователь с таким именем уже существует')
    return
  }
  }
  const login_user = async () => {
    try {
      await axios.post(`http://localhost:8000/Users/loginUser/${name}/${password}`, {
        username: name,
        password: password
      })
      connect()
    } 
    catch (error) {
      alert('Неверное имя пользователя или пароль')
      return
      
    }
  }
  const skip = () => {
    setUserCreated(true)
  }
  if (connected){
  return (
    <div className='win'>
      <div className='chat'>
        {
          messages.map(mess => <Message mess={mess} /> )
        }
      </div>
      <div className='controls'>
        <input type='text' className='message' placeholder='Напишите сообщение...' value={message} onChange={e => SetMessage(e.target.value)}  />
        <button onClick={send_message}>Отправить</button>
      </div>
    </div>
  )
  } else if (!user_created){
    return (
      <div className='win'>
        <div className='connect'>
          <div className='info'>
          <h1>Зарегистрироваться</h1>
            <div className='skip_info'>
              <p1 className='skip_text'>Если аккаунт уже есть: </p1>
              <button className='skip' onClick={skip} >Войти</button>
            </div>
          </div>
          <input type='text' className='name' placeholder='Имя' value={name} onChange={e => SetName(e.target.value)} />
          <input type='password' className='password' placeholder='Пароль'value={password} onChange={e => SetPassword(e.target.value)} />
          <div className='user_controls'>
          <button className='create_user' onClick={create_user} >Создать пользователя</button>
          </div>
        </div>
      </div>
    )
  }
  else {
    return (
      <div className='win'>
        <div className='connect'>
          <h1>Подключиться</h1>
          <input type='text' className='name' placeholder='Имя' value={name} onChange={e => SetName(e.target.value)} />
          <input type='password' className='password' placeholder='Пароль'value={password} onChange={e => SetPassword(e.target.value)} />
          <button onClick={login_user} >Подключиться</button>
        </div>
      </div>
    )
  }
}
export default App
