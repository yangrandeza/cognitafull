"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PrivacyPolicy } from "./privacy-policy";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, CheckCircle } from "lucide-react";

interface QuizConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  className?: string;
  customFields?: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
  }>;
}

export function QuizConsentDialog({
  isOpen,
  onClose,
  onAccept,
  className,
  customFields = []
}: QuizConsentDialogProps) {
  const [currentStep, setCurrentStep] = useState<'consent' | 'privacy' | 'custom-fields'>('consent');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const handleAcceptTerms = () => {
    if (acceptedTerms) {
      setCurrentStep('privacy');
    }
  };

  const handleAcceptPrivacy = () => {
    if (acceptedPrivacy) {
      if (customFields.length > 0) {
        setCurrentStep('custom-fields');
      } else {
        handleFinalAccept();
      }
    }
  };

  const handleCustomFieldsSubmit = () => {
    // Validate required fields
    const missingRequired = customFields.filter(field =>
      field.required && !customFieldValues[field.id]?.trim()
    );

    if (missingRequired.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    handleFinalAccept();
  };

  const handleFinalAccept = () => {
    onAccept();
    onClose();
    // Reset state
    setCurrentStep('consent');
    setAcceptedTerms(false);
    setAcceptedPrivacy(false);
    setCustomFieldValues({});
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'consent', label: 'Termos', icon: FileText },
      { key: 'privacy', label: 'Privacidade', icon: Shield },
    ];

    if (customFields.length > 0) {
      steps.push({ key: 'custom-fields', label: 'Dados', icon: CheckCircle });
    }

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;

          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                isActive ? 'border-primary bg-primary text-primary-foreground' :
                isCompleted ? 'border-green-500 bg-green-500 text-white' :
                'border-gray-300 text-gray-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`ml-2 text-sm ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderConsentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Quiz Psicométrico</h2>
        <p className="text-muted-foreground">
          Antes de começar, precisamos do seu consentimento para prosseguir com a avaliação.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Termos de Uso do Quiz</h3>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Ao participar deste quiz psicométrico, você concorda com os seguintes termos:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>As respostas serão utilizadas exclusivamente para análise de perfil de aprendizagem</li>
                <li>Os dados coletados serão tratados de forma confidencial e segura</li>
                <li>Você pode interromper o quiz a qualquer momento</li>
                <li>Os resultados são confidenciais e serão compartilhados apenas com fins educacionais</li>
                <li>Você tem o direito de solicitar a exclusão dos seus dados a qualquer momento</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                Li e concordo com os termos de uso do quiz psicométrico
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleAcceptTerms} disabled={!acceptedTerms}>
          Próximo
        </Button>
      </div>
    </div>
  );

  const renderPrivacyStep = () => (
    <div className="space-y-6">
      <PrivacyPolicy />

      <div className="flex items-center space-x-2 pt-4 border-t">
        <Checkbox
          id="privacy"
          checked={acceptedPrivacy}
          onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
        />
        <Label htmlFor="privacy" className="text-sm">
          Li e concordo com a Política de Privacidade
        </Label>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('consent')}>
          Voltar
        </Button>
        <Button onClick={handleAcceptPrivacy} disabled={!acceptedPrivacy}>
          {customFields.length > 0 ? 'Próximo' : 'Iniciar Quiz'}
        </Button>
      </div>
    </div>
  );

  const renderCustomFieldsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Informações Adicionais</h2>
        <p className="text-muted-foreground">
          Por favor, forneça as informações solicitadas pelo professor.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {customFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    className="w-full p-3 border rounded-md resize-none"
                    rows={3}
                    value={customFieldValues[field.id] || ''}
                    onChange={(e) => setCustomFieldValues(prev => ({
                      ...prev,
                      [field.id]: e.target.value
                    }))}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.id}
                    className="w-full p-3 border rounded-md"
                    value={customFieldValues[field.id] || ''}
                    onChange={(e) => setCustomFieldValues(prev => ({
                      ...prev,
                      [field.id]: e.target.value
                    }))}
                    required={field.required}
                  >
                    <option value="">Selecione uma opção</option>
                    {/* Options would be populated from field configuration */}
                  </select>
                ) : (
                  <input
                    id={field.id}
                    type={field.type}
                    className="w-full p-3 border rounded-md"
                    value={customFieldValues[field.id] || ''}
                    onChange={(e) => setCustomFieldValues(prev => ({
                      ...prev,
                      [field.id]: e.target.value
                    }))}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('privacy')}>
          Voltar
        </Button>
        <Button onClick={handleCustomFieldsSubmit}>
          Iniciar Quiz
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Consentimento para Quiz Psicométrico
          </DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        {currentStep === 'consent' && renderConsentStep()}
        {currentStep === 'privacy' && renderPrivacyStep()}
        {currentStep === 'custom-fields' && renderCustomFieldsStep()}
      </DialogContent>
    </Dialog>
  );
}
