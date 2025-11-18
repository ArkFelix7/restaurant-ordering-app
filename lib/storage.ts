import { createClient } from '@/lib/supabase/client'

export type BucketName = 'menu-images' | 'inventory-images'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export interface UploadOptions {
  bucket: BucketName
  folder?: string
  maxSizeMB?: number
  allowedTypes?: string[]
}

/**
 * Validates image file before upload
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024 // Convert MB to bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Generates a unique filename for uploaded images
 */
export function generateFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  
  const fileName = prefix
    ? `${prefix}-${timestamp}-${randomString}.${extension}`
    : `${timestamp}-${randomString}.${extension}`

  return fileName
}

/**
 * Uploads an image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const supabase = createClient()

  try {
    // Validate file
    const validation = validateImageFile(
      file,
      options.maxSizeMB,
      options.allowedTypes
    )
    
    if (!validation.valid) {
      return {
        url: '',
        path: '',
        error: validation.error,
      }
    }

    // Generate unique filename
    const fileName = generateFileName(file.name)
    const folder = options.folder || ''
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        url: '',
        path: '',
        error: error.message,
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(options.bucket).getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    console.error('Error in uploadImage:', error)
    return {
      url: '',
      path: '',
      error: error.message || 'Failed to upload image',
    }
  }
}

/**
 * Deletes an image from Supabase Storage
 */
export async function deleteImage(
  bucket: BucketName,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Extract path from URL if full URL was provided
    let pathToDelete = filePath
    
    // If it's a full URL, extract the path
    if (filePath.includes('supabase.co/storage')) {
      const urlParts = filePath.split(`/storage/v1/object/public/${bucket}/`)
      pathToDelete = urlParts[1] || filePath
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([pathToDelete])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteImage:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete image',
    }
  }
}

/**
 * Replaces an existing image with a new one
 */
export async function replaceImage(
  file: File,
  oldImageUrl: string | null,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Upload new image first
    const uploadResult = await uploadImage(file, options)

    if (uploadResult.error) {
      return uploadResult
    }

    // Delete old image if it exists
    if (oldImageUrl) {
      await deleteImage(options.bucket, oldImageUrl)
    }

    return uploadResult
  } catch (error: any) {
    console.error('Error in replaceImage:', error)
    return {
      url: '',
      path: '',
      error: error.message || 'Failed to replace image',
    }
  }
}

/**
 * Gets the public URL for an image
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

/**
 * Compresses an image file (client-side)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
}
