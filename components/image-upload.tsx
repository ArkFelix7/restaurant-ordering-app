'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { uploadImage, replaceImage, compressImage, type BucketName } from '@/lib/storage'

interface ImageUploadProps {
  currentImage?: string | null
  onUploadComplete: (url: string) => void
  bucket: BucketName
  folder?: string
  maxSizeMB?: number
  compressImages?: boolean
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto'
  disabled?: boolean
}

export default function ImageUpload({
  currentImage,
  onUploadComplete,
  bucket,
  folder,
  maxSizeMB = 5,
  compressImages = true,
  aspectRatio = 'auto',
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)
    setProgress(10)

    try {
      // Show preview immediately
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setProgress(30)

      // Compress image if enabled
      let fileToUpload = file
      if (compressImages && file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImage(file, 1200, 1200, 0.85)
          console.log(
            `Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(fileToUpload.size / 1024).toFixed(1)}KB`
          )
        } catch (compressionError) {
          console.warn('Compression failed, using original:', compressionError)
          fileToUpload = file
        }
      }
      setProgress(50)

      // Upload to Supabase
      const result = currentImage
        ? await replaceImage(fileToUpload, currentImage, {
            bucket,
            folder,
            maxSizeMB,
          })
        : await uploadImage(fileToUpload, {
            bucket,
            folder,
            maxSizeMB,
          })

      setProgress(90)

      if (result.error) {
        setError(result.error)
        setPreview(currentImage || null)
        return
      }

      // Success
      setPreview(result.url)
      onUploadComplete(result.url)
      setProgress(100)

      // Clean up object URL
      if (objectUrl !== result.url) {
        URL.revokeObjectURL(objectUrl)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
      setProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onUploadComplete('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'landscape':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      default:
        return 'aspect-auto'
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview Area */}
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <div className={`relative w-full ${getAspectRatioClass()} overflow-hidden rounded-lg border-2 border-border bg-muted`}>
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            
            {/* Remove button overlay */}
            {!disabled && !uploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}

            {/* Upload progress overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                <div className="w-3/4 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white text-sm mt-2">{progress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`relative w-full ${getAspectRatioClass()} ${aspectRatio === 'auto' ? 'min-h-[180px]' : 'min-h-0'} flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer`}
            onClick={handleButtonClick}
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload image</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={preview ? 'outline' : 'default'}
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          className="flex-1 gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {preview ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </Button>

        {preview && !uploading && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveImage}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded border border-destructive/20">
          {error}
        </div>
      )}

      {/* Helper text */}
      {!error && (
        <p className="text-xs text-muted-foreground">
          {compressImages
            ? 'Images will be automatically compressed and optimized'
            : `Maximum file size: ${maxSizeMB}MB`}
        </p>
      )}
    </div>
  )
}
