import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'

export function App() {
  return (
    <BrowserRouter basename="/pixmemo">
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
