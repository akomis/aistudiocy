'use client'

import { useEffect, useState, useRef } from 'react'
import { Gutter, useListDrawerContext } from '@payloadcms/ui'
import Link from 'next/link'
import { Plus, Search, Upload, Trash2, Check } from 'lucide-react'
import type { Media } from '@/payload-types'

interface PaginatedDocs {
  docs: Media[]
  totalDocs: number
  totalPages: number
  page: number
}

export default function MediaGrid() {
  const { isInDrawer, onSelect } = useListDrawerContext()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const [refetchKey, setRefetchKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null)

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          limit: '0',
          sort: '-createdAt',
        })
        if (search) {
          params.append('where[filename][contains]', search)
        }
        const res = await fetch(`/api/media?${params}`)
        const data: PaginatedDocs = await res.json()
        setMedia(data.docs)
      } catch (error) {
        console.error('Failed to fetch media:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMedia()
  }, [search, refetchKey])

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', 'silver jewellery image')

      try {
        await fetch('/api/media', {
          method: 'POST',
          body: formData,
        })
        setUploadProgress({ current: i + 1, total: files.length })
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }

    setUploading(false)
    setUploadProgress(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setRefetchKey((k) => k + 1)
  }

  const toggleSelection = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(media.map((m) => m.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return

    setDeleting(true)
    const ids = Array.from(selectedIds)
    setDeleteProgress({ current: 0, total: ids.length })

    for (let i = 0; i < ids.length; i++) {
      try {
        await fetch(`/api/media/${ids[i]}`, { method: 'DELETE' })
        setDeleteProgress({ current: i + 1, total: ids.length })
      } catch (error) {
        console.error(`Failed to delete media ${ids[i]}:`, error)
      }
    }

    setDeleting(false)
    setDeleteProgress(null)
    setSelectedIds(new Set())
    setRefetchKey((k) => k + 1)
  }

  const isSelecting = selectedIds.size > 0

  return (
    <Gutter>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--theme-elevation-800)]">
          {isInDrawer ? 'Select Media' : 'Media'}
        </h1>
        {!isInDrawer && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkUpload}
              className="hidden"
            />
            {isSelecting ? (
              <>
                <span className="text-sm text-[var(--theme-elevation-600)]">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={selectedIds.size === media.length ? deselectAll : selectAll}
                  className="flex items-center gap-2 py-2 px-4 rounded-md bg-[var(--theme-elevation-100)] font-medium hover:bg-[var(--theme-elevation-150)] transition-colors"
                >
                  {selectedIds.size === media.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={deselectAll}
                  className="flex items-center gap-2 py-2 px-4 rounded-md bg-[var(--theme-elevation-100)] font-medium hover:bg-[var(--theme-elevation-150)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 py-2 px-4 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={18} />
                  {deleting && deleteProgress
                    ? `Deleting ${deleteProgress.current}/${deleteProgress.total}...`
                    : 'Delete'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 py-2 px-4 rounded-md bg-[var(--theme-elevation-100)] font-medium hover:bg-[var(--theme-elevation-150)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={18} />
                  {uploading && uploadProgress
                    ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                    : 'Bulk Upload'}
                </button>
                <Link
                  href="/admin/collections/media/create"
                  className="flex items-center gap-2 py-2 px-4 rounded-md bg-[var(--theme-elevation-100)] no-underline font-medium hover:bg-[var(--theme-elevation-150)] transition-colors"
                >
                  <Plus size={18} />
                  Upload New
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
            <Search size={18} className="text-[var(--theme-elevation-400)]" />
          </div>
          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
            }}
            className="w-full max-w-md pl-10 pr-4 py-2 rounded-md border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-0)] text-[var(--theme-elevation-800)] placeholder:text-[var(--theme-elevation-400)] focus:outline-none focus:border-[var(--theme-elevation-300)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-[var(--theme-elevation-50)] animate-pulse"
            />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-[var(--theme-elevation-500)]">
          {search ? 'No media found matching your search.' : 'No media yet.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {media.map((item) => {
              const isSelected = selectedIds.has(item.id)
              const content = (
                <>
                  {item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailURL || item.url}
                      alt={item.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[var(--theme-elevation-100)] flex items-center justify-center text-[var(--theme-elevation-400)]">
                      No preview
                    </div>
                  )}
                  {/* Selection checkbox */}
                  {!isInDrawer && (
                    <button
                      type="button"
                      onClick={(e) => toggleSelection(item.id, e)}
                      className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-all z-10 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-black/30 border-white/70 text-transparent hover:border-white hover:bg-black/50'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                  )}
                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/20 pointer-events-none" />
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                    <span className="w-fit px-2 py-1 rounded bg-black/30 backdrop-blur-sm text-white text-xs truncate max-w-full">
                      {item.filename}
                    </span>
                    <div className="flex gap-1">
                      {item.width && item.height && (
                        <span className="w-fit px-2 py-1 rounded bg-black/30 backdrop-blur-sm text-white/80 text-xs">
                          {item.width}x{item.height}
                        </span>
                      )}
                      {item.filesize && (
                        <span className="w-fit px-2 py-1 rounded bg-black/30 backdrop-blur-sm text-white/80 text-xs">
                          {formatFileSize(item.filesize)}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )

              const baseClassName =
                'group relative aspect-square rounded-lg overflow-hidden no-underline border transition-all cursor-pointer'
              const borderClassName = isSelected
                ? 'border-blue-600 border-2'
                : 'border-[var(--theme-elevation-100)] hover:border-[var(--theme-elevation-300)]'

              if (isInDrawer && onSelect) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onSelect({ collectionSlug: 'media', doc: item, docID: String(item.id) })
                    }
                    className={`${baseClassName} ${borderClassName}`}
                  >
                    {content}
                  </button>
                )
              }

              return (
                <Link key={item.id} href={`/admin/collections/media/${item.id}`} className={`${baseClassName} ${borderClassName}`}>
                  {content}
                </Link>
              )
            })}
          </div>
        </>
      )}
    </Gutter>
  )
}
