import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Camera, Check, X } from 'lucide-react';
import { imageService } from '../services/imageService';

const TestImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Valider le fichier
      imageService.validateImageFile(file);

      // Upload vers Cloudinary
      const result = await imageService.uploadImage(file, 'product');
      
      setUploadedImages(prev => [...prev, result.image]);
      console.log('✅ Image uploadée:', result.image);
      
    } catch (err) {
      console.error('❌ Erreur upload:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      // Valider tous les fichiers
      files.forEach(file => imageService.validateImageFile(file));

      // Upload multiple
      const result = await imageService.uploadMultipleImages(files, 'product');
      
      setUploadedImages(prev => [...prev, ...result.images]);
      console.log('✅ Images uploadées:', result.images);
      
    } catch (err) {
      console.error('❌ Erreur upload multiple:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadedImages([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Test Upload Cloudinary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload simple */}
          <div className="space-y-2">
            <Label htmlFor="single-upload">Upload d'image simple</Label>
            <div className="flex gap-2">
              <Input
                id="single-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <Button
                onClick={() => document.getElementById('single-upload').click()}
                disabled={uploading}
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                Sélectionner
              </Button>
            </div>
          </div>

          {/* Upload multiple */}
          <div className="space-y-2">
            <Label htmlFor="multiple-upload">Upload multiple (max 10 images)</Label>
            <div className="flex gap-2">
              <Input
                id="multiple-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleUpload}
                disabled={uploading}
              />
              <Button
                onClick={() => document.getElementById('multiple-upload').click()}
                disabled={uploading}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Multiples
              </Button>
            </div>
          </div>

          {/* Indicateur de chargement */}
          {uploading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Upload en cours...
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <Button onClick={clearAll} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Effacer tout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Images uploadées */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Images uploadées ({uploadedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  
                  <Button
                    onClick={() => removeImage(index)}
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  {image.publicId && (
                    <div className="absolute bottom-1 left-1">
                      <Check className="h-3 w-3 text-green-600 bg-white rounded-full" />
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-600">
                    <div>Format: {image.format}</div>
                    <div>Taille: {imageService.formatFileSize(image.size)}</div>
                    {image.width && image.height && (
                      <div>Dimensions: {image.width}x{image.height}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* URLs des images */}
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">URLs des images :</h4>
              {uploadedImages.map((image, index) => (
                <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                  <div className="font-medium">Image {index + 1}:</div>
                  <div className="break-all text-blue-600">
                    {image.url}
                  </div>
                  {image.thumbnailUrl && (
                    <div className="break-all text-green-600 mt-1">
                      Thumbnail: {image.thumbnailUrl}
                    </div>
                  )}
                  {image.optimizedUrl && (
                    <div className="break-all text-purple-600 mt-1">
                      Optimisée: {image.optimizedUrl}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestImageUpload; 