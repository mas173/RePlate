import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppAuth } from '@/hooks/useAppAuth';
import { donationsAPI } from '@/services/api';
import FoodDetailsStep from './FoodDetailsStep';
import ImageUploadStep from './ImageUploadStep';
import PickupLocationStep from './PickupLocationStep';
import ReviewSubmitStep from './ReviewSubmitStep';

const STEPS = [
  { id: 1, label: 'Food Details' },
  { id: 2, label: 'Upload Image' },
  { id: 3, label: 'Pickup Info' },
  { id: 4, label: 'Review' },
];

const INITIAL_FORM = {
  // Step 1
  name: '',
  category: '',
  quantity: '',
  unit: 'meals',
  expiryDate: '',
  expiryTime: '',
  storageCondition: '',
  // Step 2
  images: [],
  notes: '',
  // Step 3
  address: '',
  city: '',
  state: '',
  pincode: '',
  pickupFrom: '',
  pickupTo: '',
  instructions: '',
};

function Stepper({ currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, i) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-initial">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted
                    ? 'bg-primary-500 text-white shadow-glow-green'
                    : isCurrent
                      ? 'bg-primary-500 text-white shadow-glow-green scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 hidden sm:block ${isCurrent
                    ? 'text-primary-600 dark:text-primary-400'
                    : isCompleted
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-3 h-0.5 rounded-full relative overflow-hidden bg-slate-200 dark:bg-slate-700">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export default function FoodUploadForm() {
  const { getAuthToken } = useAppAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateForm = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const goToStep = (step) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('You must be logged in to donate');
        setIsSubmitting(false);
        return;
      }

      // Build FormData
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('category', formData.category);
      dataToSend.append('quantity', formData.quantity);
      dataToSend.append('unit', formData.unit);
      dataToSend.append('expiryDate', formData.expiryDate);
      dataToSend.append('expiryTime', formData.expiryTime);
      dataToSend.append('storageCondition', formData.storageCondition);
      dataToSend.append('address', formData.address);
      dataToSend.append('city', formData.city);
      dataToSend.append('state', formData.state);
      dataToSend.append('pincode', formData.pincode);
      dataToSend.append('pickupFrom', formData.pickupFrom);
      dataToSend.append('pickupTo', formData.pickupTo);
      dataToSend.append('instructions', formData.instructions);
      dataToSend.append('notes', formData.notes);

      // Append image files
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((imageFile) => {
          dataToSend.append('images', imageFile);
        });
      }

      await donationsAPI.create(token, dataToSend);
      toast.success('Donation submitted successfully!');
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setCurrentStep(1);
    setIsSubmitted(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FoodDetailsStep data={formData} onChange={updateForm} />;
      case 2:
        return <ImageUploadStep data={formData} onChange={updateForm} />;
      case 3:
        return <PickupLocationStep data={formData} onChange={updateForm} />;
      case 4:
        return (
          <ReviewSubmitStep
            data={formData}
            onEdit={goToStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSubmitted={isSubmitted}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Stepper */}
      {!isSubmitted && <Stepper currentStep={currentStep} />}

      {/* Step content */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {!isSubmitted && currentStep < 4 && (
        <motion.div
          className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-30"
          >
            Back
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            Step {currentStep} of {STEPS.length}
          </div>

          <button onClick={nextStep} className="btn-primary">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
