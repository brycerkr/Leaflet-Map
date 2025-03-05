import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from './components/Map';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Map of Azraq camp using Leaflet</h1>
      <Map />
    </>
  )
}

export default App
