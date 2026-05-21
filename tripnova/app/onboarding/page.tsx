'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';
import { 
  Palmtree, Mountain, Compass as CompassIcon, Sparkles, Footprints, 
  Landmark, Heart, Map, User, Users, Users2, Plane, DollarSign,
  TrendingUp, Star, Award, MessageSquare, AlertCircle
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { saveOnboardingAction } from '@/app/actions/auth';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { StepCard } from '@/components/onboarding/StepCard';
import { MultiSelectCard } from '@/components/onboarding/MultiSelectCard';
import { SingleSelectCard } from '@/components/onboarding/SingleSelectCard';
import { DestinationSearch } from '@/components/onboarding/DestinationSearch';
import { StepNavigation } from '@/components/onboarding/StepNavigation';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { CompletionScreen } from '@/components/onboarding/CompletionScreen';

// Zod Schema definitions for each step validation
const stepSchemas = {
  step1: z.array(z.string()).min(1, 'Please select at least one travel interest.'),
  step2: z.string().min(1, 'Please select a travel companion option.'),
  step3: z.string().min(1, 'Please select a budget range.'),
  step4: z.array(z.string()).min(1, 'Please select or add at least one destination.'),
  step5: z.array(z.string()).min(1, 'Please select at least one activity.'),
  step6: z.string().min(1, 'Please select your travel frequency.'),
  step7: z.string().min(1, 'Please pick an option to continue.'),
};

const LOCAL_STORAGE_KEY = 'tripnova_onboarding_draft';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [hasStarted, setHasStarted] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Core preferences state
  const [preferences, setPreferences] = useState({
    travel_interests: [] as string[],
    travel_style: '',
    budget_preference: '',
    favorite_destinations: [] as string[],
    activities: [] as string[],
    travel_frequency: '',
    notifications: '',
  });

  // Load profile and draft state on mount
  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch User profile details
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setProfile(profileData);

        // Load auto-save draft if available
        const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          setPreferences(parsed.preferences);
          setCurrentStep(parsed.currentStep);
          toast.info('Resuming onboarding from your saved draft!');
        }
      } catch (err: any) {
        console.error('Failed to load profile context:', err.message);
      }
    };

    initOnboarding();
  }, []);

  // Sync / Auto-save draft preference changes to localStorage
  useEffect(() => {
    if (hasStarted && !isComplete) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          preferences,
          currentStep,
          hasStarted,
        })
      );
    }
  }, [preferences, currentStep, hasStarted, isComplete]);

  // Handle Multi-select updates
  const handleToggleMulti = (key: 'travel_interests' | 'favorite_destinations' | 'activities', value: string) => {
    setPreferences((prev) => {
      const currentList = prev[key];
      const isSelected = currentList.includes(value);
      return {
        ...prev,
        [key]: isSelected
          ? currentList.filter((item) => item !== value)
          : [...currentList, value],
      };
    });
  };

  // Handle Single-select updates
  const handleSetSingle = (key: 'travel_style' | 'budget_preference' | 'travel_frequency' | 'notifications', value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Skip onboarding handler
  const handleSkip = async () => {
    const confirmSkip = window.confirm(
      'Are you sure you want to skip customization? We will configure default preferences for you.'
    );
    if (!confirmSkip) return;

    setIsSubmitting(true);
    // Fill defaults
    const defaultData = {
      travel_interests: ['Adventure', 'Luxury'],
      travel_style: 'Solo',
      budget_preference: 'Mid-Range',
      favorite_destinations: ['Bali', 'Europe'],
      activities: ['Trekking', 'Nature Relaxing'],
      travel_frequency: 'Once a Year',
    };

    const result = await saveOnboardingAction(defaultData);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.success('Preferences initialized with defaults.');
      routeRedirect();
    }
  };

  // Route redirect flow depending on user role
  const routeRedirect = () => {
    const role = profile?.role || 'user';
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'vendor') {
      router.push('/vendor');
    } else {
      router.push('/dashboard');
    }
    router.refresh();
  };

  // Form submit handler
  const handleComplete = async () => {
    setIsSubmitting(true);
    const result = await saveOnboardingAction({
      travel_interests: preferences.travel_interests,
      travel_style: preferences.travel_style,
      budget_preference: preferences.budget_preference,
      favorite_destinations: preferences.favorite_destinations,
      activities: preferences.activities,
      travel_frequency: preferences.travel_frequency,
    });

    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setIsComplete(true);
      setTimeout(() => {
        routeRedirect();
      }, 3000);
    }
  };

  // Step step validator
  const validateStep = (step: number): boolean => {
    try {
      if (step === 1) {
        stepSchemas.step1.parse(preferences.travel_interests);
      } else if (step === 2) {
        stepSchemas.step2.parse(preferences.travel_style);
      } else if (step === 3) {
        stepSchemas.step3.parse(preferences.budget_preference);
      } else if (step === 4) {
        stepSchemas.step4.parse(preferences.favorite_destinations);
      } else if (step === 5) {
        stepSchemas.step5.parse(preferences.activities);
      } else if (step === 6) {
        stepSchemas.step6.parse(preferences.travel_frequency);
      } else if (step === 7) {
        stepSchemas.step7.parse(preferences.notifications);
      }
      return true;
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Animations configuration
  const variants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <OnboardingLayout>
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CompletionScreen />
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ProgressBar currentStep={currentStep} totalSteps={7} />

            <StepCard>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  {/* STEP 1: TRAVEL INTERESTS */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">What type of trips do you love?</h2>
                        <p className="text-xs text-zinc-500 mt-1">Select all categories that match your travel personality.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <MultiSelectCard
                          label="Beach 🏖️"
                          isSelected={preferences.travel_interests.includes('Beach')}
                          onClick={() => handleToggleMulti('travel_interests', 'Beach')}
                          icon={Palmtree}
                          iconColor="text-amber-400"
                        />
                        <MultiSelectCard
                          label="Mountains ⛰️"
                          isSelected={preferences.travel_interests.includes('Mountains')}
                          onClick={() => handleToggleMulti('travel_interests', 'Mountains')}
                          icon={Mountain}
                          iconColor="text-sky-400"
                        />
                        <MultiSelectCard
                          label="Adventure 🪂"
                          isSelected={preferences.travel_interests.includes('Adventure')}
                          onClick={() => handleToggleMulti('travel_interests', 'Adventure')}
                          icon={CompassIcon}
                          iconColor="text-orange-400"
                        />
                        <MultiSelectCard
                          label="Luxury ✨"
                          isSelected={preferences.travel_interests.includes('Luxury')}
                          onClick={() => handleToggleMulti('travel_interests', 'Luxury')}
                          icon={Sparkles}
                          iconColor="text-yellow-400"
                        />
                        <MultiSelectCard
                          label="Wildlife 🐘"
                          isSelected={preferences.travel_interests.includes('Wildlife')}
                          onClick={() => handleToggleMulti('travel_interests', 'Wildlife')}
                          icon={Footprints}
                          iconColor="text-emerald-400"
                        />
                        <MultiSelectCard
                          label="Spiritual 🛕"
                          isSelected={preferences.travel_interests.includes('Spiritual')}
                          onClick={() => handleToggleMulti('travel_interests', 'Spiritual')}
                          icon={Landmark}
                          iconColor="text-purple-400"
                        />
                        <MultiSelectCard
                          label="Honeymoon ❤️"
                          isSelected={preferences.travel_interests.includes('Honeymoon')}
                          onClick={() => handleToggleMulti('travel_interests', 'Honeymoon')}
                          icon={Heart}
                          iconColor="text-rose-400"
                        />
                        <MultiSelectCard
                          label="Road Trips 🚗"
                          isSelected={preferences.travel_interests.includes('Road Trips')}
                          onClick={() => handleToggleMulti('travel_interests', 'Road Trips')}
                          icon={Map}
                          iconColor="text-indigo-400"
                        />
                        <MultiSelectCard
                          label="Solo Travel 🎒"
                          isSelected={preferences.travel_interests.includes('Solo Travel')}
                          onClick={() => handleToggleMulti('travel_interests', 'Solo Travel')}
                          icon={User}
                          iconColor="text-teal-400"
                        />
                        <MultiSelectCard
                          label="Family Vacation 👨👩👧"
                          isSelected={preferences.travel_interests.includes('Family Vacation')}
                          onClick={() => handleToggleMulti('travel_interests', 'Family Vacation')}
                          icon={Users}
                          iconColor="text-blue-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: COMPANION */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Who do you usually travel with?</h2>
                        <p className="text-xs text-zinc-500 mt-1">This helps us search for the best lodging and team sizes.</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <SingleSelectCard
                          label="Solo"
                          description="Explore the world alone, at your own pace"
                          isSelected={preferences.travel_style === 'Solo'}
                          onClick={() => handleSetSingle('travel_style', 'Solo')}
                          icon={User}
                        />
                        <SingleSelectCard
                          label="Friends"
                          description="Group matches, active party houses, hostels"
                          isSelected={preferences.travel_style === 'Friends'}
                          onClick={() => handleSetSingle('travel_style', 'Friends')}
                          icon={Users2}
                        />
                        <SingleSelectCard
                          label="Family"
                          description="Kid-friendly excursions, resorts, safe bookings"
                          isSelected={preferences.travel_style === 'Family'}
                          onClick={() => handleSetSingle('travel_style', 'Family')}
                          icon={Users}
                        />
                        <SingleSelectCard
                          label="Partner"
                          description="Romantic getaways, private villas, spa packages"
                          isSelected={preferences.travel_style === 'Partner'}
                          onClick={() => handleSetSingle('travel_style', 'Partner')}
                          icon={Heart}
                        />
                        <SingleSelectCard
                          label="Group Tours"
                          description="Join preset active traveler communities and guide maps"
                          isSelected={preferences.travel_style === 'Group Tours'}
                          onClick={() => handleSetSingle('travel_style', 'Group Tours')}
                          icon={Plane}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: BUDGET */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">What’s your travel budget range?</h2>
                        <p className="text-xs text-zinc-500 mt-1">Filter searches and deals within this tier.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SingleSelectCard
                          label="Budget Friendly"
                          description="Smart hostels, cheap transport, local street food guide"
                          isSelected={preferences.budget_preference === 'Budget Friendly'}
                          onClick={() => handleSetSingle('budget_preference', 'Budget Friendly')}
                          icon={DollarSign}
                        />
                        <SingleSelectCard
                          label="Mid-Range"
                          description="Comfortable 3-star stays, popular local diners, guide tours"
                          isSelected={preferences.budget_preference === 'Mid-Range'}
                          onClick={() => handleSetSingle('budget_preference', 'Mid-Range')}
                          icon={TrendingUp}
                        />
                        <SingleSelectCard
                          label="Luxury"
                          description="4-5 star resorts, fine dining, private drivers"
                          isSelected={preferences.budget_preference === 'Luxury'}
                          onClick={() => handleSetSingle('budget_preference', 'Luxury')}
                          icon={Star}
                        />
                        <SingleSelectCard
                          label="Premium Luxury"
                          description="Michelin star tables, private villas, premium guide charters"
                          isSelected={preferences.budget_preference === 'Premium Luxury'}
                          onClick={() => handleSetSingle('budget_preference', 'Premium Luxury')}
                          icon={Award}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: DESTINATIONS */}
                  {currentStep === 4 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Which destinations inspire you?</h2>
                        <p className="text-xs text-zinc-500 mt-1">Select from suggestions or add custom cities/regions.</p>
                      </div>

                      <DestinationSearch
                        selectedDestinations={preferences.favorite_destinations}
                        onChange={(val) => setPreferences((p) => ({ ...p, favorite_destinations: val }))}
                      />
                    </div>
                  )}

                  {/* STEP 5: ACTIVITIES */}
                  {currentStep === 5 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">What activities excite you the most?</h2>
                        <p className="text-xs text-zinc-500 mt-1">Choose activities that will guide your daily schedule recommendation.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['Trekking', 'Camping', 'Shopping', 'Food Exploring', 'Nightlife', 'Photography', 'Water Sports', 'Historical Places', 'Nature Relaxing'].map((act) => {
                          const isSelected = preferences.activities.includes(act);
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => handleToggleMulti('activities', act)}
                              className={`p-4 rounded-xl border text-center text-xs font-bold leading-tight transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-b from-violet-950/40 to-violet-900/10 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                  : 'bg-zinc-950/20 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                              }`}
                            >
                              {act}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 6: TRAVEL FREQUENCY */}
                  {currentStep === 6 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">How often do you travel?</h2>
                        <p className="text-xs text-zinc-500 mt-1">Personalizes notifications and recommended intervals.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Monthly', 'Every 3 Months', 'Twice a Year', 'Once a Year', 'Rarely'].map((freq) => (
                          <SingleSelectCard
                            key={freq}
                            label={freq}
                            isSelected={preferences.travel_frequency === freq}
                            onClick={() => handleSetSingle('travel_frequency', freq)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 7: NOTIFICATIONS */}
                  {currentStep === 7 && (
                    <div className="space-y-5 text-center flex flex-col justify-center items-center py-6">
                      <div className="p-3 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-2">
                        <MessageSquare className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Enable personalized travel alerts & exclusive deals?</h2>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-2 leading-relaxed">
                          Receive notifications about fare drops, custom booking deals, and travel companion requests.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-xs w-full pt-4">
                        <button
                          type="button"
                          onClick={() => handleSetSingle('notifications', 'Yes')}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            preferences.notifications === 'Yes'
                              ? 'bg-gradient-to-b from-violet-950/40 to-violet-900/10 border-violet-500 text-white'
                              : 'bg-zinc-950/20 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-sm font-bold">Yes, Notify Me</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Email + Web</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetSingle('notifications', 'Maybe Later')}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            preferences.notifications === 'Maybe Later'
                              ? 'bg-gradient-to-b from-violet-950/40 to-violet-900/10 border-violet-500 text-white'
                              : 'bg-zinc-950/20 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-sm font-bold">Maybe Later</span>
                          <span className="text-[10px] text-zinc-500 font-mono">Decide later</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION CONTROL FOOTER */}
                  <StepNavigation
                    onBack={handleBack}
                    onNext={handleNext}
                    onSkip={handleSkip}
                    isFirstStep={currentStep === 1}
                    isLastStep={currentStep === 7}
                    isLoading={isSubmitting}
                  />
                </motion.div>
              </AnimatePresence>
            </StepCard>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingLayout>
  );
}
