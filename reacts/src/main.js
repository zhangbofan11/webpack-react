import  React  from 'react'
import ReactDom from 'react-dom/client'
import App from './app.jsx'
import {BrowserRouter} from 'react-router-dom'
import "antd/dist/antd.less"

const root=ReactDom.createRoot(document.querySelector('#root'))
root.render(
    <BrowserRouter>
    <App/>
    </BrowserRouter>
)