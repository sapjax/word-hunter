import { Messages, WordMap, WordContext, StorageKey } from '../constant'

async function readDict(): Promise<WordMap> {
  const url = chrome.runtime.getURL('dict.json')
  const res = await fetch(url)
  const dict = await res.text()
  return JSON.parse(dict)
}

function updateBadge(wordsKnown: WordMap) {
  const knownWordsCount = Object.keys(wordsKnown).length
  chrome.action.setBadgeText({ text: String(knownWordsCount) }, () => {})
  chrome.action.setBadgeBackgroundColor({ color: '#bbb' }, () => {})
}

const createAudioWindow = async (audio: string) => {
  let url = chrome.runtime.getURL('audio.html')
  url = `${url}?audio=${encodeURIComponent(audio)}`
  await chrome.windows.create({
    type: 'popup',
    focused: false,
    top: 1,
    left: 1,
    height: 1,
    width: 1,
    url
  })
}

/**
 * https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension/66618269#66618269
 * chrome connection will be auto disconnected after 5 minutes
 * so, we manually disconnect it after 4 minutes, then reconnect it in context script
 * to make sure the connection is always alive
 */
function autoDisconnectDelay(port: chrome.runtime.Port, tabId?: number) {
  if (!tabId) return
  setTimeout(() => {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      const tab = tabs.find(t => t.id === tabId)
      if (tab) {
        port.disconnect()
      }
    })
  }, 250000)
}

async function setup() {
  const storage = chrome.storage.local

  chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'word-hunter') {
      const tabId = port.sender?.tab?.id
      autoDisconnectDelay(port, tabId)

      port.onMessage.addListener(async msg => {
        const { action, word, words, context } = msg
        switch (action) {
          case Messages.set_known:
            storage.get([StorageKey.known], result => {
              const knownWords = { ...(result[StorageKey.known] ?? {}), [word]: 0 }
              storage.set({ [StorageKey.known]: knownWords })
              updateBadge(knownWords)
            })
            break
          case Messages.set_all_known:
            storage.get([StorageKey.known], result => {
              const addedWords = words.reduce((acc: WordMap, cur: string) => ({ ...acc, [cur]: 0 }), {})
              const knownWords = { ...(result[StorageKey.known] ?? {}), ...addedWords }
              storage.set({ [StorageKey.known]: knownWords })
              updateBadge(knownWords)
            })
            break
          case Messages.add_context:
            storage.get([StorageKey.context], result => {
              const contexts = result[StorageKey.context] ?? {}
              const wordContexts = (contexts[word] ?? []) as WordContext[]
              if (!wordContexts.find(c => c.text === context.text)) {
                const newContexts = { ...contexts, [word]: [...wordContexts, context] }
                storage.set({ [StorageKey.context]: newContexts })
              }
            })
            break
          case Messages.delete_context:
            storage.get([StorageKey.context], result => {
              const contexts = result[StorageKey.context] ?? {}
              const wordContexts = (contexts[word] ?? []) as WordContext[]
              const index = wordContexts.findIndex(c => c.text === context.text)
              if (index > -1) {
                wordContexts.splice(index, 1)
                const newContexts = { ...contexts, [word]: wordContexts }
                storage.set({ [StorageKey.context]: newContexts })
              }
            })
            break
          case Messages.play_audio:
            createAudioWindow(msg.audio)
            break
        }
      })
    }
  })

  chrome.runtime.onMessage.addListener(msg => {
    if (Messages.app_available in msg) {
      chrome.action.setIcon({
        path: {
          128: msg.app_available ? chrome.runtime.getURL('icon.png') : chrome.runtime.getURL('icons/disabled.png')
        }
      })
    }
  })

  const dict = await readDict()

  storage.set({ dict: dict }, () => {
    console.log('[storage] dict set up')
  })

  storage.get([StorageKey.known], result => {
    updateBadge(result[StorageKey.known] || {})
  })
}

setup()
