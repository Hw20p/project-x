import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { isEndingGuidePageOpen, isSimulationPageOpen } from './devTools'
import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'

// 개발용 페이지는 개발 서버에서, 스위치(`devTools.ts`)가 켜져 있을 때만 라우트를 연다.
const SimulationPage = lazy(() => import('./pages/SimulationPage').then((module) => ({ default: module.SimulationPage })))
const EndingGuidePage = lazy(() => import('./pages/EndingGuidePage').then((module) => ({ default: module.EndingGuidePage })))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<GamePage />} />
        {isSimulationPageOpen && (
          <Route
            path="/dev/sim"
            element={
              <Suspense fallback={null}>
                <SimulationPage />
              </Suspense>
            }
          />
        )}
        {isEndingGuidePageOpen && (
          <Route
            path="/dev/endings"
            element={
              <Suspense fallback={null}>
                <EndingGuidePage />
              </Suspense>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
