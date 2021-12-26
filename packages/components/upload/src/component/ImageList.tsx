/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { FileOperation } from '../composables/useOperation'
import type { UploadToken } from '../token'
import type { UploadFile } from '../types'
import type { IconsMap } from '../util/icon'
import type { Locale } from '@idux/components/i18n'
import type { ComputedRef } from 'vue'

import { computed, defineComponent, inject, normalizeClass } from 'vue'

import { getLocale } from '@idux/components/i18n'
import { IxProgress } from '@idux/components/progress'
import { IxTooltip } from '@idux/components/tooltip'

import { useCmpClasses, useListClasses } from '../composables/useClasses'
import { useIcon } from '../composables/useIcon'
import { useOperation } from '../composables/useOperation'
import { uploadToken } from '../token'
import { uploadListProps } from '../types'
import { getThumbNode } from '../util/file'
import { renderIcon, renderOprIcon } from '../util/icon'
import { showDownload, showErrorTip, showPreview, showProgress, showRetry } from '../util/visible'

export default defineComponent({
  name: 'IxUploadImageList',
  props: uploadListProps,
  setup(listProps) {
    const {
      props: uploadProps,
      upload,
      abort,
      onUpdateFiles,
    } = inject(uploadToken, {
      props: { files: [] },
      upload: () => {},
      abort: () => {},
      onUpdateFiles: () => {},
    } as unknown as UploadToken)
    const icons = useIcon(listProps)
    const cpmClasses = useCmpClasses()
    const listClasses = useListClasses(uploadProps, 'image')
    const files = computed(() => uploadProps.files)
    const locale = getLocale('upload')
    const fileOperation = useOperation(files, listProps, uploadProps, { abort, upload, onUpdateFiles })

    return () =>
      uploadProps.files.length > 0 && (
        <ul class={listClasses.value}>
          {uploadProps.files.map(file => renderItem(file, icons, cpmClasses, fileOperation, locale))}
        </ul>
      )
  },
})

function renderItem(
  file: UploadFile,
  icons: ComputedRef<IconsMap>,
  cpmClasses: ComputedRef<string>,
  fileOperation: FileOperation,
  locale: ComputedRef<Locale['upload']>,
) {
  const fileClasses = normalizeClass([`${cpmClasses.value}-file`, `${cpmClasses.value}-file-${file.status}`])
  const fileNameClasses = normalizeClass([`${cpmClasses.value}-name`, `${cpmClasses.value}-name-pointer`])
  const errorTipNode = renderIcon('exclamation-circle', { class: `${cpmClasses.value}-icon-error` })
  const { retryNode, downloadNode, removeNode } = renderOprIcon(file, icons, cpmClasses, fileOperation, locale)
  return (
    <li class={fileClasses}>
      <div class={`${cpmClasses.value}-thumb-info`}>
        <span class={`${cpmClasses.value}-thumb`}>{getThumbNode(file)}</span>
        <span class={fileNameClasses} onClick={() => showPreview(file.status) && fileOperation.preview(file)}>
          {file.name}
        </span>
      </div>
      <div class={`${cpmClasses.value}-icon-wrap`}>
        <IxTooltip title={file.errorTip}>{showErrorTip(file.status, file.errorTip) && errorTipNode}</IxTooltip>
        {showRetry(file.status) && retryNode}
        {showDownload(file.status) && downloadNode}
        {removeNode}
      </div>
      {showProgress(file.status, file.percent) && (
        <IxProgress
          class={`${cpmClasses.value}-progress`}
          percent={file.percent}
          strokeColor="#20CC94"
          strokeWidth={2}
          hide-info
        ></IxProgress>
      )}
    </li>
  )
}
