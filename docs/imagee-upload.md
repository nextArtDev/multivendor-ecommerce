## v1

```ts
import { useState } from 'react';
import { Input } from "/components/ui/input";
import { Button } from "/components/ui/button";
import { Plus } from 'lucide-react';
import ImagesPreviewGrid from './ImagesPreviewGrid';

export default function ImageForm() {
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setImages([...images, ...event.target.files]);
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageSelect = (image: File) => {
    setSelectedImage(image);
  };

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
  );
}
```

## V2

```ts
import { useState } from 'react';
import { Input } from "/components/ui/input";
import { Button } from "/components/ui/button";
import { Trash } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "/components/ui/card";

const extractDominantColor = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(image, 0, 0);
  const pixels = ctx?.getImageData(0, 0, canvas.width, canvas.height);
  if (!pixels) return;

  const colorCounts: { [key: string]: number } = {};
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    const color = `rgb(${r}, ${g}, ${b})`;
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  }

  let maxCount = 0;
  let dominantColor = '';
  for (const color in colorCounts) {
    if (colorCounts[color] > maxCount) {
      maxCount = colorCounts[color];
      dominantColor = color;
    }
  }

  return dominantColor;
};

export default function ImageUploader() {
  const [images, setImages] = useState<File[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setImages([...images, ...event.target.files]);
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleColorAdd = (color: string) => {
    setColors([...colors, color]);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Input type="file" multiple onChange={handleImageUpload} />
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img src={URL.createObjectURL(image)} alt="" className="w-full h-full object-cover" />
            <Button
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => handleImageRemove(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="absolute bottom-2 right-2"
              onClick={() => {
                const img = new Image();
                img.src = URL.createObjectURL(image);
                img.onload = () => {
                  const dominantColor = extractDominantColor(img);
                  if (dominantColor) handleColorAdd(dominantColor);
                };
              }}
            >
              Extract Color
            </Button>
          </div>
        ))}
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {colors.map((color, index) => (
              <div key={index} className={`w-8 h-8 bg-${color.replace('rgb(', '').replace(')', '').split(',').join('-')} rounded-full`} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Image Input

```ts
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import { ColorPalette } from './ColorPalette';
import { ImagesPreviewGrid } from './ImagesPreviewGrid';

interface ImageInputProps {
  name: string;
  label: string;
  accept?: string;
}

export function ImageInput({ name, label, accept = 'image/*' }: ImageInputProps) {
  const { setValue, watch } = useFormContext();
  const [colors, setColors] = useState<{ color: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const currentFiles = watch(name) || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const imageUrls = selectedFiles.map(file => ({
        url: URL.createObjectURL(file)
      }));
      setValue(name, imageUrls, { shouldValidate: true });
    }
  };

  const handleRemove = (urlToRemove: string) => {
    const newFiles = currentFiles.filter((file: { url: string }) => file.url !== urlToRemove);
    setValue(name, newFiles, { shouldValidate: true });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div
        onClick={handleClick}
        className="relative w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={accept}
          multiple
        />
        
        {currentFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop images
            </p>
          </div>
        )}
      </div>

      {currentFiles.length > 0 && (
        <ImagesPreviewGrid
          images={currentFiles}
          onRemove={handleRemove}
          colors={colors}
          setColors={setColors}
        />
      )}

      {colors.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Colors:</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border border-gray-200"
                style={{ backgroundColor: color.color }}
                title={color.color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```
