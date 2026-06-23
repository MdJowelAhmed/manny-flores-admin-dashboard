import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/utils/constants'
import { formatFileSize } from '@/utils/formatters'

interface ImageUploaderProps {
  value?: string | File | null
  onChange?: (file: File | null) => void
  files?: File[]
  onFilesChange?: (files: File[]) => void
  multiple?: boolean
  label?: string
  hint?: string
  className?: string
  maxSize?: number
  acceptedTypes?: string[]
  error?: string
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

export function ImageUploader({
  value,
  onChange,
  files = [],
  onFilesChange,
  multiple = false,
  label,
  hint,
  className,
  maxSize = MAX_IMAGE_SIZE,
  acceptedTypes = ACCEPTED_IMAGE_TYPES,
  error,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  )
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (multiple) return
    if (typeof value === 'string') {
      setPreview(value)
      return
    }
    if (value instanceof File && isImageFile(value)) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(value)
      return
    }
    if (!value) setPreview(null)
  }, [value, multiple])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setUploadError(null)

      if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0]
        setUploadError(firstError.message)
        return
      }

      if (acceptedFiles.length === 0) return

      if (multiple) {
        onFilesChange?.([...files, ...acceptedFiles])
        return
      }

      const file = acceptedFiles[0]
      if (isImageFile(file)) {
        const reader = new FileReader()
        reader.onload = () => setPreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
      onChange?.(file)
    },
    [files, multiple, onChange, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
  })

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onChange?.(null)
    setUploadError(null)
  }

  const removeFileAt = (index: number) => {
    onFilesChange?.(files.filter((_, i) => i !== index))
  }

  const displayError = error || uploadError
  const dropHint =
    hint ||
    (multiple
      ? `Supported: images, PDF, DOC, XLS, PPT, TXT, ZIP (max ${formatFileSize(maxSize)})`
      : `Supported: JPG, PNG, WebP (max ${formatFileSize(maxSize)})`)

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10',
          displayError && 'border-destructive',
          !multiple && preview ? 'p-2' : 'p-8'
        )}
      >
        <input {...getInputProps()} />
        {!multiple && preview ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleRemove}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={cn(
                'p-4 rounded-full transition-colors',
                isDragActive ? 'bg-primary/20' : 'bg-muted'
              )}
            >
              {isDragActive ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : multiple ? (
                <FileText className="h-8 w-8 text-muted-foreground" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop your files here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{dropHint}</p>
            </div>
          </div>
        )}
      </div>

      {multiple && files.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-white"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isImageFile(file) ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFileAt(index)}
                className="text-red-500 hover:text-red-700 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {displayError && <p className="text-sm text-destructive">{displayError}</p>}
    </div>
  )
}
