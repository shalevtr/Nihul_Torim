"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BeforeAfterImage {
  id: string
  beforeUrl: string
  afterUrl: string
  treatmentType?: string
  description?: string
}

interface BeforeAfterGalleryProps {
  images: BeforeAfterImage[]
}

export function BeforeAfterGallery({ images }: BeforeAfterGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>("all")

  // Get unique treatment types
  const treatmentTypes = Array.from(
    new Set(images.map((img) => img.treatmentType).filter(Boolean))
  ) as string[]

  // Filter images
  const filteredImages =
    filter === "all"
      ? images
      : images.filter((img) => img.treatmentType === filter)

  const openGallery = (index: number) => {
    setSelectedIndex(index)
  }

  const closeGallery = () => {
    setSelectedIndex(null)
  }

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredImages.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const goToPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  if (images.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>לפני ואחרי</CardTitle>
        
        {/* Treatment Type Filter */}
        {treatmentTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              הכל
            </Button>
            {treatmentTypes.map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="cursor-pointer group"
              onClick={() => openGallery(index)}
            >
              <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-indigo-400 transition-all">
                <div className="relative aspect-square">
                  <div className="absolute top-0 right-0 bg-black/60 text-white text-xs px-2 py-1 rounded-br">
                    לפני
                  </div>
                  <img
                    src={image.beforeUrl}
                    alt="לפני"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative aspect-square">
                  <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-bl">
                    אחרי
                  </div>
                  <img
                    src={image.afterUrl}
                    alt="אחרי"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {(image.treatmentType || image.description) && (
                <div className="mt-2 text-sm">
                  {image.treatmentType && (
                    <p className="font-medium text-indigo-600">{image.treatmentType}</p>
                  )}
                  {image.description && (
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Gallery Dialog */}
        {selectedIndex !== null && (
          <Dialog open={selectedIndex !== null} onOpenChange={closeGallery}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {filteredImages[selectedIndex].treatmentType || "לפני ואחרי"}
                </DialogTitle>
              </DialogHeader>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-center">לפני</p>
                    <img
                      src={filteredImages[selectedIndex].beforeUrl}
                      alt="לפני"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-center">אחרי</p>
                    <img
                      src={filteredImages[selectedIndex].afterUrl}
                      alt="אחרי"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
                {filteredImages[selectedIndex].description && (
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    {filteredImages[selectedIndex].description}
                  </p>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={goToPrev}
                    disabled={selectedIndex === 0}
                  >
                    <ChevronRight className="h-4 w-4 ml-1" />
                    הקודם
                  </Button>
                  <span className="text-sm text-gray-600 self-center">
                    {selectedIndex + 1} / {filteredImages.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={goToNext}
                    disabled={selectedIndex === filteredImages.length - 1}
                  >
                    הבא
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

