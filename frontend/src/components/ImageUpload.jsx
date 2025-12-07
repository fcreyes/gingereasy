import { useState, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function ImageUpload({ onUpload, currentImage }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setError('')
    setIsUploading(true)

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // Upload to server
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      setPreview(data.url)
      onUpload(data.url)
    } catch (err) {
      setError(err.message || 'Failed to upload image')
      setPreview(currentImage || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    setPreview(null)
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="image-upload-container">
      <div
        className={`image-upload-dropzone ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div className="upload-status">
            <div className="upload-spinner"></div>
            <p>Uploading...</p>
          </div>
        ) : preview ? (
          <div className="image-preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <button type="button" className="remove-image-btn" onClick={handleRemove}>
              Remove
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="upload-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="upload-hint">PNG, JPG, GIF or WebP (max 10MB)</p>
          </div>
        )}
      </div>

      {error && <p className="upload-error">{error}</p>}

      <style>{`
        .image-upload-container {
          margin-bottom: 1.5rem;
        }

        .image-upload-dropzone {
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-upload-dropzone:hover {
          border-color: #8B4513;
          background: #fff8f0;
        }

        .image-upload-dropzone.dragging {
          border-color: #8B4513;
          background: #fff3e0;
          border-style: solid;
        }

        .image-upload-dropzone.has-image {
          padding: 1rem;
        }

        .upload-placeholder {
          color: #666;
        }

        .upload-icon {
          color: #8B4513;
          margin-bottom: 1rem;
        }

        .upload-text {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .upload-text strong {
          color: #8B4513;
        }

        .upload-hint {
          margin: 0;
          font-size: 0.875rem;
          color: #888;
        }

        .upload-status {
          color: #8B4513;
        }

        .upload-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f0f0f0;
          border-top-color: #8B4513;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .image-preview-container {
          position: relative;
          width: 100%;
        }

        .image-preview {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
          object-fit: contain;
        }

        .remove-image-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .remove-image-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        .upload-error {
          color: #c00;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default ImageUpload
