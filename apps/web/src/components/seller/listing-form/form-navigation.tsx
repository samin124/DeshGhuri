import { ChevronLeft, ChevronRight, Save, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useListingForm } from '@/contexts/listing-form-context';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

const STEPS = [
  { number: 1, label: 'Basic Info', description: 'Title, description, location' },
  { number: 2, label: 'Pricing', description: 'Price, capacity, group tiers' },
  { number: 3, label: 'Media', description: 'Images, amenities, inclusions' },
  { number: 4, label: 'Policies', description: 'Cancellation, rules, preview' },
] as const;

export function FormNavigation() {
  const { state, prevStep, nextStep, saveDraft, submitForReview, getValidationErrors } =
    useListingForm();
  const navigate = useNavigate();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const currentErrors = getValidationErrors(state.currentStep);
  const isLastStep = state.currentStep === 4;

  const handleNext = () => {
    nextStep();
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      alert('Draft saved successfully!');
    } catch (error) {
      alert('Failed to save draft. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      await submitForReview();
      setSubmitSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate({ to: '/seller/dashboard/listings' });
      }, 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to submit listing. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold
                      ${
                        state.currentStep === step.number
                          ? 'border-primary bg-primary text-primary-foreground'
                          : state.currentStep > step.number
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 bg-background text-muted-foreground'
                      }
                    `}
                  >
                    {state.currentStep > step.number ? '✓' : step.number}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <p
                      className={`
                        text-sm font-medium
                        ${
                          state.currentStep === step.number
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      `}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-4
                      ${
                        state.currentStep > step.number
                          ? 'bg-primary'
                          : 'bg-muted-foreground/30'
                      }
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {submitSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900">
              🎉 Listing submitted for review successfully!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Your listing will be reviewed by our admin team. You'll be notified once it's approved.
              Redirecting to your listings...
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {currentErrors.length > 0 && !submitSuccess && (
        <Alert variant="destructive">
          <AlertDescription>
            <p className="font-semibold mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {currentErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Last Saved */}
      {state.lastSaved && (
        <p className="text-sm text-muted-foreground text-center">
          Last saved: {new Date(state.lastSaved).toLocaleTimeString()}
        </p>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={state.currentStep === 1 || state.isSubmitting || submitSuccess}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          {/* Save Draft Button */}
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={state.isSubmitting || submitSuccess}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          {/* Next/Submit Button */}
          {!isLastStep ? (
            <Button onClick={handleNext} disabled={state.isSubmitting || submitSuccess}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={state.isSubmitting || submitSuccess}
              className="bg-primary"
            >
              {submitSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submitted!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {state.isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Help Text */}
      {!submitSuccess && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isLastStep
              ? 'Review your listing and submit for admin approval'
              : 'You can save your progress and continue later'}
          </p>
        </div>
      )}
    </div>
  );
}
