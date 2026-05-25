import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useAppAuth } from '@/hooks/useAppAuth';
import { aiAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import FreshnessIndicator from './FreshnessIndicator';

export default function ImageUploadStep({ data, onChange }) {
  const { getAuthToken } = useAppAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async (imageFile) => {
    setIsAnalyzing(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Authentication required for AI analysis');
        return;
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('name', data.name || '');
      formData.append('category', data.category || '');
      formData.append('quantity', data.quantity ? `${data.quantity} ${data.unit || 'meals'}` : '');
      formData.append('storageCondition', data.storageCondition || '');

      const response = await aiAPI.analyzeFreshness(token, formData);
      
      onChange({
        ai_freshness_score: response.freshnessScore,
        ai_analysis: response,
      });

      toast.success('AI freshness analysis completed!');
    } catch (err) {
      console.error('AI Analysis client error:', err);
      toast.error('AI freshness analysis failed to process');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const newImages = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      
      // Update local images list
      const updatedImages = [...(data.images || []), ...newImages].slice(0, 4);
      onChange({ images: updatedImages });

      // Run AI analysis on the first uploaded image
      if (updatedImages.length > 0 && !data.ai_analysis) {
        runAnalysis(updatedImages[0]);
      }
    },
    [data.images, data.ai_analysis, onChange]
  );

  const removeImage = (index) => {
    const updated = [...data.images];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    
    // Clear AI analysis if all images are removed
    if (updated.length === 0) {
      onChange({ 
        images: updated,
        ai_freshness_score: null,
        ai_analysis: null
      });
    } else {
      onChange({ images: updated });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 4,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Upload Images
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add photos of the food to help NGOs and our AI analyse quality.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300',
          isDragActive
            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-600 bg-slate-50 dark:bg-slate-800/30 hover:bg-primary-50/30 dark:hover:bg-primary-950/20'
        )}
      >
        <input {...getInputProps()} />

        <div className={cn(
          'w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300',
          isDragActive
            ? 'bg-primary-100 dark:bg-primary-900/40 scale-110'
            : 'bg-slate-100 dark:bg-slate-700/60'
        )}>
          <Upload className={cn(
            'w-7 h-7 transition-colors duration-300',
            isDragActive
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-slate-400 dark:text-slate-500'
          )} />
        </div>

        {isDragActive ? (
          <p className="text-primary-600 dark:text-primary-400 font-medium">
            Drop images here…
          </p>
        ) : (
          <>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Drag & drop images here, or <span className="text-primary-600 dark:text-primary-400 font-semibold">browse</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              JPG, PNG or WebP · Max 10MB · Up to 4 images
            </p>
          </>
        )}
      </div>

      {/* Loading analysis state */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center p-8 border rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-3">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <Sparkles className="w-4 h-4 text-indigo-500 absolute animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              AI freshness analysis in progress...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Gemini is evaluating image quality, freshness, and shelf life
            </p>
          </div>
        </div>
      )}

      {/* Render AI Freshness Analysis indicator if present */}
      {!isAnalyzing && data.ai_analysis && (
        <FreshnessIndicator
          score={data.ai_freshness_score}
          urgency={data.ai_analysis.urgencyLevel}
          shelfLife={data.ai_analysis.estimatedShelfLife}
          recommendations={data.ai_analysis.safetyRecommendations}
          distributionMethod={data.ai_analysis.distributionMethod}
          analysis={data.ai_analysis.analysis}
        />
      )}

      {/* Image previews */}
      {data.images && data.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.images.map((img, i) => (
            <div
              key={i}
              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 aspect-square"
            >
              <img
                src={img.preview}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-red-600 hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* File name */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white truncate">{img.name}</p>
              </div>
            </div>
          ))}

          {/* Add more placeholder */}
          {data.images.length < 4 && (
            <div
              {...getRootProps()}
              className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-600 flex flex-col items-center justify-center aspect-square cursor-pointer transition-colors duration-200 bg-slate-50 dark:bg-slate-800/20"
            >
              <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-1" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Add more</span>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Additional Notes <span className="text-slate-400 text-xs">(optional)</span>
        </label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="Any details about the food condition, allergens, preparation details…"
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}
