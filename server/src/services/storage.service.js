/**
 * Storage Service - Handles file uploads to Supabase Storage
 */

import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'donation-images';

/**
 * Upload an image to Supabase Storage
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} originalName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Object} Upload result with public URL
 */
export const uploadImage = async (fileBuffer, originalName, mimeType) => {
  try {
    const fileExt = originalName.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `donations/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: urlData.publicUrl,
      fileName,
    };
  } catch (error) {
    console.error('Upload error:', error.message);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - Path of the file in storage
 */
export const deleteImage = async (filePath) => {
  try {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Delete error:', error.message);
    throw new Error('Failed to delete image');
  }
};

export default { uploadImage, deleteImage };
