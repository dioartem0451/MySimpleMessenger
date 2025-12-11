import React, { useEffect, useState } from 'react'
import './App.css'
import Message from './components/message/message'
import axios from 'axios'
const App = () => {

  const [name, SetName] = useState('name')
  const [message, SetMessage] = useState('message')
  const [messages, setMessages] = useState([])
  const [ws, setWs] = useState()
  const [connected, setConnected] = useState(false)

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
    ws.send(message)
    setMessage('')
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
  } 
  else {
    return (
      <div className='win'>
        <div className='connect'>
          <input type='text' className='name' placeholder='Имя' value={name} onChange={e => SetName(e.target.value)} />
          <button onClick={connect}>Подключиться</button>
        </div>
      </div>
    )
  }
}
export default App
