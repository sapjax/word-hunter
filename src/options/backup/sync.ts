import { StorageKey, WordMap, ContextMap } from '../../constant'
import { mergeKnowns, mergeContexts, cleanupContexts, getAllKnownSync } from '../../lib'
import { SettingType, mergeSetting } from '../../lib/settings'
import * as GDrive from './drive'

type BackupData = {
  known: WordMap
  context: ContextMap
  settings: SettingType
  knwon_update_timestamp: number
  context_update_timestamp: number
  settings_update_timestamp: number
}

export async function getBackupData(): Promise<BackupData> {
  const locals = await chrome.storage.local.get([StorageKey.context, StorageKey.context_update_timestamp])
  const syncs = await chrome.storage.sync.get([
    StorageKey.settings,
    StorageKey.knwon_update_timestamp,
    StorageKey.settings_update_timestamp
  ])
  const knowns = await getAllKnownSync()
  return {
    [StorageKey.known]: knowns,
    [StorageKey.settings]: syncs[StorageKey.settings] || null,
    [StorageKey.context]: cleanupContexts(locals[StorageKey.context] || {}, knowns),
    [StorageKey.knwon_update_timestamp]: syncs[StorageKey.knwon_update_timestamp] ?? 0,
    [StorageKey.settings_update_timestamp]: syncs[StorageKey.settings_update_timestamp] ?? 0,
    [StorageKey.context_update_timestamp]: locals[StorageKey.context_update_timestamp] ?? 0
  }
}

export async function syncWithDrive() {
  await GDrive.auth(true)
  let dirId = await GDrive.findDirId()
  let fileId = ''
  if (!dirId) {
    dirId = await GDrive.createFolder(GDrive.FOLDER_NAME)
  } else {
    fileId = await GDrive.findFileId(dirId)
  }

  if (fileId) {
    // merge and sync
    const appData = await getBackupData()
    const gdriveData = (await GDrive.downloadFile(fileId)) as BackupData

    const [mergedSettings, setting_update_time] = await mergeSetting(
      appData[StorageKey.settings],
      gdriveData[StorageKey.settings],
      appData[StorageKey.settings_update_timestamp],
      gdriveData[StorageKey.settings_update_timestamp]
    )
    const [mergedKnowns, knwon_update_timestamp] = await mergeKnowns(gdriveData[StorageKey.known])
    const [mergedContexts, context_update_timestamp] = await mergeContexts(
      gdriveData[StorageKey.context],
      gdriveData[StorageKey.context_update_timestamp]
    )

    const mergedData = {
      [StorageKey.known]: mergedKnowns,
      [StorageKey.context]: cleanupContexts(mergedContexts, mergedKnowns),
      [StorageKey.settings]: mergedSettings,
      [StorageKey.settings_update_timestamp]: setting_update_time,
      [StorageKey.knwon_update_timestamp]: knwon_update_timestamp,
      [StorageKey.context_update_timestamp]: context_update_timestamp
    }

    const file = new File([JSON.stringify(mergedData)], GDrive.FILE_NAME, { type: 'application/json' })
    await GDrive.uploadFile(file, 'application/json', dirId, fileId)
  } else {
    // just upload
    const localData = await getBackupData()
    const file = new File([JSON.stringify(localData)], GDrive.FILE_NAME, { type: 'application/json' })
    await GDrive.uploadFile(file, 'application/json', dirId)
  }
  const latest_sync_time = Date.now()
  await chrome.storage.sync.set({ [StorageKey.latest_sync_time]: latest_sync_time })
  return latest_sync_time
}