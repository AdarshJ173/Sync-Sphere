import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Slider,
  Stack,
} from '@mui/material';
import {
  IoCamera,
  IoTrash,
  IoRefresh,
  IoClose,
  IoResize,
  IoCheckmark,
} from 'react-icons/io5';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  size?: number;
  onAvatarChange: (newAvatar: string | null) => void;
  generateRandomAvatar?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatar,
  size = 120,
  onAvatarChange,
  generateRandomAvatar,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload an image file (JPEG, PNG, GIF, or WebP)');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size should be less than 5MB');
      return false;
    }
    return true;
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsUploading(true);

      if (!validateFile(file)) {
        setIsUploading(false);
        return;
      }

      const compressedBlob = await compressImage(file);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageToEdit(result);
        setCropDialogOpen(true);
        setIsUploading(false);
      };

      reader.onerror = () => {
        setError('Failed to read the image file');
        setIsUploading(false);
      };

      reader.readAsDataURL(compressedBlob);
    } catch (err) {
      setError('Failed to process the image');
      setIsUploading(false);
    }

    // Clear the input value to allow uploading the same file again
    event.target.value = '';
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<string> => {
    if (!imageToEdit || !croppedAreaPixels) {
      throw new Error('No image to crop');
    }

    const image = new Image();
    image.src = imageToEdit;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to the cropped size
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Draw the cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        // Convert to base64
        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        resolve(base64Image);
      };
      image.onerror = () => reject(new Error('Failed to load image for cropping'));
    });
  };

  const handleCropSave = async () => {
    try {
      setIsUploading(true);
      const croppedImage = await createCroppedImage();
      onAvatarChange(croppedImage);
      setCropDialogOpen(false);
      setImageToEdit(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (err) {
      setError('Failed to crop the image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange(null);
  };

  return (
    <>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Upload Picture" placement="top">
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    bgcolor: 'rgba(82, 5, 123, 0.9)',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: 'rgba(137, 44, 220, 0.9)',
                      transform: 'scale(1.1)',
                    },
                  }}
                  size="small"
                >
                  <IoCamera size={16} color="#FFFFFF" />
                </IconButton>
              </Tooltip>
              {generateRandomAvatar && (
                <Tooltip title="Generate Random Avatar" placement="top">
                  <IconButton
                    onClick={generateRandomAvatar}
                    sx={{
                      bgcolor: 'rgba(82, 5, 123, 0.9)',
                      backdropFilter: 'blur(4px)',
                      '&:hover': {
                        bgcolor: 'rgba(137, 44, 220, 0.9)',
                        transform: 'scale(1.1)',
                      },
                    }}
                    size="small"
                  >
                    <IoRefresh size={16} color="#FFFFFF" />
                  </IconButton>
                </Tooltip>
              )}
              {currentAvatar && (
                <Tooltip title="Remove Picture" placement="top">
                  <IconButton
                    onClick={handleRemoveAvatar}
                    sx={{
                      bgcolor: 'rgba(220, 44, 44, 0.9)',
                      backdropFilter: 'blur(4px)',
                      '&:hover': {
                        bgcolor: 'rgba(220, 44, 44, 1)',
                        transform: 'scale(1.1)',
                      },
                    }}
                    size="small"
                  >
                    <IoTrash size={16} color="#FFFFFF" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          }
        >
          <Avatar
            src={currentAvatar}
            sx={{
              width: size,
              height: size,
              border: '4px solid rgba(137, 44, 220, 0.3)',
              boxShadow: '0 4px 20px rgba(82, 5, 123, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 30px rgba(137, 44, 220, 0.4)',
                border: '4px solid rgba(188, 111, 241, 0.5)',
              },
            }}
          />
        </Badge>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
        />

        {isUploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}
      </Box>

      {error && (
        <Typography
          color="error"
          variant="caption"
          sx={{ mt: 1, display: 'block', textAlign: 'center' }}
        >
          {error}
        </Typography>
      )}

      <Dialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Crop Profile Picture</Typography>
            <IconButton onClick={() => setCropDialogOpen(false)}>
              <IoClose />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ position: 'relative', height: 400, mb: 2 }}>
            {imageToEdit && (
              <Cropper
                image={imageToEdit}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            )}
          </Box>
          
          <Stack spacing={2} direction="row" alignItems="center" sx={{ px: 2 }}>
            <IoResize />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_, value) => setZoom(value as number)}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setCropDialogOpen(false)}
            startIcon={<IoClose />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropSave}
            variant="contained"
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : <IoCheckmark />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 