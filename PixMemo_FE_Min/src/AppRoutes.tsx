import { Routes, Route, Navigate } from 'react-router-dom'
import PixMemoHome from './pages/PixMemoHome'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PixMemoHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
