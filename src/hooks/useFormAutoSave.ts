import { useState, useEffect } from 'react';

export interface GrievanceDraft {
  step: number;
  category: string;
  latitude: string;
  longitude: string;
  landmark: string;
  description: string;
  citizenName: string;
  email: string;
  photoPreview: string;
  photoName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
}

const STORAGE_KEY = 'jansewa_grievance_draft';

export function useFormAutoSave(preselectedCategory: string = '') {
  // Read existing draft or return defaults
  const [draft] = useState<GrievanceDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          step: parsed.step ?? 1,
          category: parsed.category ?? preselectedCategory,
          latitude: parsed.latitude ?? '',
          longitude: parsed.longitude ?? '',
          landmark: parsed.landmark ?? '',
          description: parsed.description ?? '',
          citizenName: parsed.citizenName ?? '',
          email: parsed.email ?? '',
          photoPreview: parsed.photoPreview ?? '',
          photoName: parsed.photoName ?? '',
          priority: parsed.priority ?? 'Medium',
        };
      }
    } catch (e) {
      console.error('Failed to parse grievance draft from localStorage:', e);
    }
    return {
      step: 1,
      category: preselectedCategory,
      latitude: '',
      longitude: '',
      landmark: '',
      description: '',
      citizenName: '',
      email: '',
      photoPreview: '',
      photoName: '',
      priority: 'Medium',
    };
  });

  // State management to expose values directly
  const [step, setStep] = useState(draft.step);
  const [category, setCategory] = useState(draft.category);
  const [latitude, setLatitude] = useState(draft.latitude);
  const [longitude, setLongitude] = useState(draft.longitude);
  const [landmark, setLandmark] = useState(draft.landmark);
  const [description, setDescription] = useState(draft.description);
  const [citizenName, setCitizenName] = useState(draft.citizenName);
  const [email, setEmail] = useState(draft.email);
  const [photoPreview, setPhotoPreview] = useState(draft.photoPreview);
  const [photoName, setPhotoName] = useState(draft.photoName);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>(draft.priority);

  // Sync to local storage whenever a field changes
  useEffect(() => {
    const dataToSave: GrievanceDraft = {
      step,
      category,
      latitude,
      longitude,
      landmark,
      description,
      citizenName,
      email,
      photoPreview,
      photoName,
      priority,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to write grievance draft to localStorage:', e);
    }
  }, [step, category, latitude, longitude, landmark, description, citizenName, email, photoPreview, photoName, priority]);

  // Clean up draft after successful submission
  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear grievance draft from localStorage:', e);
    }
  };

  return {
    step,
    setStep,
    category,
    setCategory,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    landmark,
    setLandmark,
    description,
    setDescription,
    citizenName,
    setCitizenName,
    email,
    setEmail,
    photoPreview,
    setPhotoPreview,
    photoName,
    setPhotoName,
    priority,
    setPriority,
    clearDraft,
  };
}
