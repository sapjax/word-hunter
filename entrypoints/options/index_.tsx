/* @refresh reload */
import { render } from 'solid-js/web'
import './index_.css'
import { App } from './app'

render(() => <App />, document.getElementById('app') ?? document.body)
