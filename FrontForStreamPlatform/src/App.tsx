import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AdminPanel } from './Admin/AdminPanel'
import { CreateMovie } from './Admin/CreateMovie'
import { AdminRoute } from './auth/AdminRoute'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { SignIn } from './auth/SignIn'
import { SignUp } from './auth/SignUp'
import { Home } from './Home/Home'
import { Movies } from './Movies/Movies'
import { MyList } from './MyList/MyList'
import { Sidebar } from './Sidebar/Sidebar'
import './App.css'
import { SearchPage } from './Search/SearchPage'

/** Chrome shown on every signed-in screen. */
const AppLayout = () => (
  <div className='min-h-screen'>
    <Sidebar />
    <main className='md:pl-60'>
      <Outlet />
    </main>
  </div>
)

const Series = () => (
  <div className='mx-auto max-w-6xl px-6 py-10'>
    <h1 className='mb-8 text-2xl font-bold text-white'>Series</h1>
    <p className='text-gray-400'>No series endpoint yet.</p>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path='/signin' element={<SignIn />} />
      <Route path='/signup' element={<SignUp />} />

      {/* Everything below requires a session; ProtectedRoute bounces to /signin. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path='/search' element={<SearchPage />} />
          <Route index element={<Home />} />
          <Route path='/browse' element={<Movies />} />
          <Route path='/series' element={<Series />} />

          {/* Admin-only screens. Lists are hasRole("ADMIN") server-side, so the UI gate
              matches the API gate rather than inviting a guaranteed 403. */}
          <Route element={<AdminRoute />}>
            <Route path='/admin' element={<AdminPanel />} />
            <Route path='/admin/new' element={<CreateMovie />} />
            <Route path='/my-lists' element={<MyList />} />
          </Route>
        </Route>
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
