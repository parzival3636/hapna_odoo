"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResourceSelector } from "./ResourceSelector";
import { DatePicker } from "./DatePicker";
import { SlotGrid } from "./SlotGrid";
import { CapacitySelector } from "./CapacitySelector";
import { IntakeForm } from "./IntakeForm";

const STEPS = [
  { id: 1, label: "Resource" },
  { id: 2, label: "Date" },
  { id: 3, label: "Time Slot" },
  { id: 4, label: "Capacity" },
  { id: 5, label: "Details" },
  { id: 6, label: "Payment" },
  { id: 7, label: "Confirm" },
];

const MOCK_RESOURCES = [
  {
    id: "r1",
    name: "Dr. Sarah Smith",
    role: "Senior Physician",
    availability: "Available today",
    imageUrl: "https://lh3.googleusercontent.com/aida/ADBb0ugAlcOxgCNwS71v6E0TI1YokQernWs5ElOgie2wxMrSVLq2YDr4wYhmTuYgOtywZHX_DR69RDM__qI6nQPQrOP71kOAfngzvB_Za1vtRNu6vQMsAb-SlnxcdeCvTCx_4r9y_w-XwhMjIBXISA9_Ng-6Dwanh5Jy6ahup0fbjOk1kJLE7aap-41i7F1hFGxIz4Ub7wMPPOV3EZ3wAylGFbN2E81rBPKsuRa4lNepe3btU_4hky_W3fvxWEoqNB-AtWSUyZJsby0",
    isAvailableToday: true,
  },
  {
    id: "r2",
    name: "Dr. James Wilson",
    role: "Cardiologist",
    availability: "Next available: tomorrow",
    isAvailableToday: false,
  },
];

interface BookingWizardProps {
  serviceId: string;
  serviceName?: string;
  price?: string;
}

export function BookingWizard({ serviceId, serviceName = "General Consultation", price = "₹1,200" }: BookingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [capacity, setCapacity] = useState(1);

  const progress = Math.round((currentStep / STEPS.length) * 100);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedResource !== null;
      case 2: return selectedDate !== null;
      case 3: return selectedTime !== null;
      case 4: return capacity >= 1;
      case 5: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
    else router.push("/services");
  };

  const handleIntakeSubmit = (data: any) => {
    router.push(`/booking/confirm?service=${serviceId}`);
  };

  const selectedResourceData = MOCK_RESOURCES.find(r => r.id === selectedResource);

  return (
    <div className="w-full min-h-screen pb-32">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-10 pt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-xs font-medium text-slate-400">{progress}% Complete</span>
        </div>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-1 rounded-full transition-colors duration-300 ${
                step.id <= currentStep ? "bg-indigo-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 px-0">
          {STEPS.map((step) => (
            <span
              key={step.id}
              className={`text-[9px] font-bold uppercase tracking-tight ${
                step.id === currentStep ? "text-indigo-600" : step.id < currentStep ? "text-emerald-500" : "text-slate-400"
              }`}
            >
              {step.id < currentStep ? "✓" : step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Service Summary Strip */}
      <div className="w-full max-w-2xl mb-10 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{serviceName}</h4>
            <p className="text-xs text-slate-500">
              60 min
              {selectedResourceData ? ` • ${selectedResourceData.name}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-emerald-700 text-[10px] font-bold tracking-wider uppercase">Active Session</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full">
        {currentStep === 1 && (
          <ResourceSelector
            resources={MOCK_RESOURCES}
            selectedId={selectedResource}
            onSelect={setSelectedResource}
          />
        )}
        {currentStep === 2 && (
          <DatePicker
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
        )}
        {currentStep === 3 && (
          <SlotGrid
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelect={setSelectedTime}
          />
        )}
        {currentStep === 4 && (
          <CapacitySelector
            capacity={capacity}
            maxCapacity={8}
            additionalPrice={500}
            onChange={setCapacity}
          />
        )}
        {currentStep === 5 && (
          <IntakeForm
            onSubmit={handleIntakeSubmit}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            serviceName={serviceName}
            providerName={selectedResourceData?.name || "Dr. Sarah Smith"}
            price={price}
          />
        )}
        {currentStep >= 6 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-amber-600 text-3xl">construction</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">
              {currentStep === 6 ? "Payment Step" : "Confirmation Step"}
            </h2>
            <p className="text-slate-500">This step will be integrated shortly.</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Footer (hidden for IntakeForm which has its own submit) */}
      {currentStep !== 5 && (
        <div className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-8 md:px-16 py-5 bg-white/90 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 border border-slate-200 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 rounded-full px-12 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
              canProceed()
                ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Continue
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
