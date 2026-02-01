import { settings, setSetting } from '../lib'

export const BadgeSetting = () => {
  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    setSetting('showBadgeCount', target.checked)
  }

  return (
    <section class="section">
      <div class="flex justify-end">
        <label for="showBadgeCount" class="label gap-4 cursor-pointer ">
          <span class="text-xs">show badge count</span>
          <input
            class="toggle dark:toggle-info toggle-sm"
            type="checkbox"
            name="showBadgeCount"
            id="showBadgeCount"
            checked={settings().showBadgeCount}
            oninput={onInput}
          />
        </label>
      </div>
    </section>
  )
}
