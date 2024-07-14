import { defineConfig } from 'wxt'
import packageJson from './package.json'

// See https://wxt.dev/api/config.html
export default defineConfig({
  alias: {
    '~lib': 'lib'
  },
  experimental: {
    includeBrowserPolyfill: false
  },
  modules: ['@wxt-dev/module-solid'],
  outDir: 'build',
  manifestVersion: 3,
  manifest: {
    name: packageJson.name,
    description: "Discover new words you don't know on any web page",
    version: packageJson.version,
    // @ts-ignore
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA37Tu6LgsThnqIusXCvgDP+kzjHmJgwehDp01nEvTCH3N19Qpe3+q6o20yjMfyT1681f3mzugV4scpjSsYH7ixO8wZHDNBwJlPPLV8jjpwRd/rBiXLYw7sSSHsX1dN7mQuKdua7WrsN+CUc7s8acq0F9lAXGtsk/BA3tNSidB5kVmog1iLf3m6wbbYK9wKmlgIjw8OkAxOs4YnZ/Z5Dfj4lPZ0aYxUmQkXSZgc3Jj0IUiQBfY3+RsJw0u7M2njPlU6AQ8pPET3BHY86ee0xSksINMrVYYMjAmHv+05RzIF+rANlHGqHYoPaD3z/rxkeki4uXXkVEi4Yv+AhdKxGUwYwIDAQAB',
    icons: {
      '16': 'icon.png',
      '32': 'icon.png',
      '48': 'icon.png',
      '128': 'icon.png'
    },
    action: {
      default_icon: 'icon.png'
    },
    side_panel: {
      default_path: 'options.html'
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content-scripts/content.js'],
        match_about_blank: true,
        all_frames: true
      }
    ],
    web_accessible_resources: [
      {
        resources: ['*.svg', 'icons/*.png', 'elephant.pdf'],
        matches: ['<all_urls>']
      }
    ],
    permissions: [
      'tts',
      'storage',
      'activeTab',
      'scripting',
      'tabs',
      'offscreen',
      'identity',
      'contextMenus',
      'sidePanel',
      'alarms'
    ],
    //@ts-ignore
    oauth2: {
      client_id: '718785835689-d2lqmos8aa7kfgtq6mplp7v2hb83eahh.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/drive.file']
    }
  }
})
