# Syncing between devices

Every rule here comes from a budgeting PWA that keeps its data on the phone and syncs an encrypted copy through a small server. Sync caused its worst bugs, because it silently replaced work the person had done. Read this before adding sync to any app, and before changing how an existing sync merges.

## The five bugs, and the rule each one left

| Bug | What happened | Rule now |
|---|---|---|
| Ticks lost | When both devices had changes, the merge only kept new records (new expenses). Bills marked paid and money set aside on the other device disappeared: the rent showed as unpaid the next day. | Merge changes inside existing records too, not only new ids. |
| An outdated device overwrote the up-to-date one | On opening, the app changes data by itself (a new week starts, a migration runs). That made a laptop with a days-old copy look like the newest edit, so it won the merge and the phone then downloaded the old data. Refreshing repeated it every time. | Changes the app makes by itself never count as the person's change. On opening, and on returning to the foreground, download the synced copy first and only then send. |
| Unticked items came back | Marking a bill as not paid on one device was undone by the other, which still had it ticked and could not tell "new on that device" from "removed here". | Remember what was in the last successful sync. Something that was there and is now missing was removed on purpose: don't bring it back. |
| No way back | When a sync brought bad data there was no copy of how the device looked before, so the person fixed everything by hand. | Before replacing local data with the synced copy, keep the previous copy and offer "Go back to this device's data before the last sync". |
| Old versions kept syncing | An installed copy that had not updated yet kept sending data with the old merge. | The app sends its version with every upload and the server rejects versions older than the fix (HTTP 426), so an outdated device can't overwrite anything. |

## How to build it

- **One "quiet" flag while the app opens.** Set it on load and when the page becomes visible; clear it in the `finally` of the first sync, when the device is offline, and on the first `pointerdown` or `keydown` (a real person acting). While it is on, a data change does not mark the copy as changed. The automatic changes still happen on the downloaded copy, because migrations run there too.
- **Every record carries `id` and `u`** (time of its last change, set only by actions the person takes). When both devices changed the same record, the newest `u` wins for that record, not the newest copy as a whole.
- **Keep the set of ids (and of ticked states) from the last sync.** A record or tick missing locally but in that set was removed here; one missing from that set is new on the other device.
- **Records the app creates by itself get a fixed id**, such as `seriesId + ":" + date` for the sessions of a weekly series, so two devices never create two copies of the same session. Add a migration that merges any duplicates already saved, keeping the one that was marked or paid.
- **Cancel a pending Undo when a sync or a reload arrives.** Undo restores a snapshot, and that snapshot predates what the sync brought in.
- **Sync is not a backup.** Keep the backup file and its reminder; a sync faithfully copies mistakes to every device.

## The test that would have caught all of it

Run it with two browser contexts and a local copy of the sync endpoint (a few lines of Node that keep one record in memory):

1. Device A turns sync on. Device B joins with the same code.
2. B marks an item done and edits another record, then syncs.
3. A, still holding the old copy, is reloaded with its local "last synced" fingerprint made stale (to imitate a change the app made by itself on opening).
4. Expected: A shows B's changes, the server's revision does not move, and B still has both changes after its next sync.
5. A then unmarks the item on purpose and syncs. Expected: B shows it unmarked.
6. Run the same test with the previous release to confirm it fails there; a test that passes on both versions tests nothing.
