import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Generator from './Generator'
import Admin from './Admin'
import Feedback from './Feedback'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

