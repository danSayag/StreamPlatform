import { useState } from 'react'
import { Home } from './Home/Home'
import { Movies } from './Movies/Movies'
import { MyList } from './MyList/MyList'
import { Sidebar, type NavKey } from './Sidebar/Sidebar'
import './App.css'

function App() {
  const [active, setActive] = useState<NavKey>('home')

  return (
    <div className='min-h-screen'>
      <Sidebar active={active} onSelect={setActive} />
      <main className='md:pl-60'>
        {active === 'home' && <Home onNavigate={setActive} />}
        {active === 'movies' && <Movies />}
        {active === 'myList' && <MyList onNavigate={setActive} />}
        {active === 'series' && (
          <div className='mx-auto max-w-6xl px-6 py-10'>
            <h1 className='mb-8 text-2xl font-bold text-white'>Series</h1>
            <p className='text-gray-400'>No series endpoint yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
