/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { TablePagination, TableProps } from '../types'
import type { TableConfig } from '@idux/components/config'
import type { ComputedRef } from 'vue'

import { computed, ref, watchEffect } from 'vue'

import { callEmit } from '@idux/cdk/utils'
import { useGlobalConfig } from '@idux/components/config'

export interface PaginationContext {
  mergedPagination: ComputedRef<TablePagination | null>
}

export function usePagination(props: TableProps, config: TableConfig): PaginationContext {
  const paginationConfig = useGlobalConfig('pagination')
  const pageIndex = ref<number>()
  const pageSize = ref<number>()

  const tempPagination = computed(() => {
    const { pagination } = props
    if (pagination === false) {
      return null
    }
    return pagination === true ? {} : pagination
  })

  watchEffect(() => {
    const pagination = tempPagination.value
    pageIndex.value = pagination?.pageIndex ?? 1
    pageSize.value = pagination?.pageSize ?? config.pagination.pageSize ?? paginationConfig.pageSize
  })

  const handlePageIndexChange = (index: number) => {
    pageIndex.value = index
    callEmit(tempPagination.value?.['onUpdate:pageIndex'], index)
  }

  const handlePageSizeChange = (size: number) => {
    pageSize.value = size
    callEmit(tempPagination.value?.['onUpdate:pageSize'], size)
  }

  const mergedPagination = computed(() => {
    const pagination = tempPagination.value
    if (pagination === null) {
      return null
    }
    return {
      ...config.pagination,
      ...pagination,
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
      'onUpdate:pageIndex': handlePageIndexChange,
      'onUpdate:pageSize': handlePageSizeChange,
    }
  })

  return { mergedPagination }
}
