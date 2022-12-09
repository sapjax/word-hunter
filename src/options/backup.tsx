import styles from './backup.module.less'
import { StorageKey } from '../constant'
import { downloadAsJsonFile } from '../utils'

const timeFormatter = new Intl.DateTimeFormat('en-US')

export const Backup = () => {
  let dialogRef: HTMLDialogElement
  let fileRef: HTMLInputElement

  const onRestore = () => {
    const fileList = fileRef.files
    if (!fileList?.length) {
      alert('no files')
      return false
    }

    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result
      if (typeof data !== 'string') return
      try {
        const json = JSON.parse(data)

        if (!json[StorageKey.known]) {
          alert('invalid file ❗️')
          return
        }

        chrome.storage.local.get([StorageKey.known, StorageKey.context], result => {
          const known = result[StorageKey.known] || {}
          const contexts = result.context || {}

          const newKnown = { ...known, ...json[StorageKey.known] }
          const newContext = { ...contexts, ...(json[StorageKey.context] ?? {}) }

          chrome.storage.local.set(
            {
              [StorageKey.context]: newContext,
              [StorageKey.known]: newKnown
            },
            () => {
              alert('restore success ✅')
            }
          )
        })
      } catch (e) {
        alert('invalid file ❗️')
      }
    }
    reader.readAsText(fileList[0])
  }

  const showModal = () => {
    dialogRef.showModal()
  }

  const onBackup = () => {
    chrome.storage.local.get([StorageKey.known, StorageKey.context], result => {
      const now = Date.now()
      const fileName = `word_hunter_backup_${timeFormatter.format(now)}_${now}.json`
      downloadAsJsonFile(
        JSON.stringify({
          [StorageKey.known]: result[StorageKey.known],
          [StorageKey.context]: result[StorageKey.context] ?? {}
        }),
        fileName
      )
    })
  }

  return (
    <div class={styles.container}>
      <dialog id="restoreDialog" ref={dialogRef!}>
        <form method="dialog">
          <div style={{ 'margin-bottom': '20px' }}>
            <input type="file" accept=".json" ref={fileRef!} />
          </div>
          <button onclick={onRestore}>confirm</button>
        </form>
      </dialog>
      <button onclick={showModal}>
        ️<img src={chrome.runtime.getURL('icons/upload.png')} width="40" height="40" alt="upload" />
        restore
      </button>
      <button onclick={onBackup}>
        ️<img src={chrome.runtime.getURL('icons/download.png')} width="40" height="40" alt="backup" />
        backup
      </button>
    </div>
  )
}
