import React, { Suspense, lazy } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
// import About from './page/about/about'
import {Button} from 'antd'

// import Home from './page/home'
const Home = lazy(() => import(/*webpackChunkName:"home"*/'./page/home'))
const About = lazy(() => import(/*webpackChunkName:"about"*/'./page/about/about'))
function App() {
    return <div>
        <h1>App</h1>
        <Button type='primary'>sad</Button>
        <ul>
            <li>
                <Link to="/home">home</Link>
            </li>
            <li>
                <Link to="/about">about</Link>
            </li>
        </ul>
        <Suspense fallback={<div>loading.....</div>}>
            <Routes>
                <Route path='/home' element={<Home></Home>}></Route>
                <Route path='/about' element={<About />}></Route>
            </Routes>
        </Suspense>

    </div>

}
export default App;