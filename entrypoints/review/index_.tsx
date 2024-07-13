/* @refresh reload */
import { render } from 'solid-js/web'
import './index_.css'
import { App } from './app'
import contentScript from '../content/index'

render(
  () => {
    contentScript.main()
    return <App />
  },
  document.getElementById('app') ?? document.body
)
