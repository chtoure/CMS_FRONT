
interface Pagination<T> {
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  current_page: number
  results: T[]
}

export type { Pagination }


