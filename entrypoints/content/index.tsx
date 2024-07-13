import './index_.css'
import '@webcomponents/custom-elements'
import { render } from 'solid-js/web'
import { ZenMode } from './card'
import { genMarkStyle, settings } from '../../lib'

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'wh-card': any
    }
  }
}

const App = () => {
  return (
    <>
      <wh-card />
      <ZenMode />
      <style>
        {`
          ${genMarkStyle()}
        `}
        {`
          ${!settings().showCnTrans ? 'w-mark-t { display:none }' : ''}
        `}
      </style>
    </>
  )
}

export default defineContentScript({
  matches: ['<all_urls>'],
  all_frames: true,
  match_about_blank: true,
  main() {
    const root = document.createElement('wh-root')
    document.body.appendChild(root)
    render(() => <App />, root)
  }
})
