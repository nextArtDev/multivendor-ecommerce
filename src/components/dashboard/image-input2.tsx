import { useState } from 'react'

import { Plus } from 'lucide-react'

export default function ImageForm() {
  const [images, setImages] = useState<File[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return
    setImages([...images, ...event.target.files])
  }

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleImageSelect = (image: File) => {
    setSelectedImage(image)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <form>
        <Input type="file" multiple onChange={handleImageChange} />
        <Button variant="outline" className="mt-4">
          <Plus className="h-4 w-4 mr-2" /> Upload Images
        </Button>
      </form>
      {images.length > 0 && (
        <ImagesPreviewGrid
          images={images}
          onImageRemove={handleImageRemove}
          onImageSelect={handleImageSelect}
        />
      )}
    </div>
  )
}
