"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { CustomField } from "@/lib/types";
import { SUPPORTED_COUNTRIES } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";

interface CustomFieldsManagerProps {
  customFields: CustomField[];
  onFieldsChange: (fields: CustomField[]) => void;
}

export function CustomFieldsManager({ customFields, onFieldsChange }: CustomFieldsManagerProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    type: 'text',
    required: false,
    defaultCountry: 'BR'
  });
  const { toast } = useToast();

  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddField = () => {
    if (!newField.label?.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira um rótulo para o campo.",
      });
      return;
    }

    const field: CustomField = {
      id: generateFieldId(),
      label: newField.label.trim(),
      type: newField.type || 'text',
      required: newField.required || false,
      options: newField.type === 'select' ? [] : undefined,
      defaultCountry: newField.type === 'phone' ? (newField.defaultCountry || 'BR') : undefined,
      supportedCountries: newField.type === 'phone' ? (newField.supportedCountries || ['BR']) : undefined,
    };

    onFieldsChange([...customFields, field]);
    setNewField({ type: 'text', required: false, defaultCountry: 'BR' });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<CustomField>) => {
    const updatedFields = customFields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
  };

  const handleDeleteField = (fieldId: string) => {
    onFieldsChange(customFields.filter(field => field.id !== fieldId));
  };

  const handleAddOption = (fieldId: string, option: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (field && field.options) {
      const updatedOptions = [...field.options, option.trim()];
      handleUpdateField(fieldId, { options: updatedOptions });
    }
  };

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    const field = customFields.find(f => f.id === fieldId);
    if (field && field.options) {
      const updatedOptions = field.options.filter((_, index) => index !== optionIndex);
      handleUpdateField(fieldId, { options: updatedOptions });
    }
  };

  const handleCountryToggle = (fieldId: string, countryCode: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (field && field.supportedCountries) {
      const isSelected = field.supportedCountries.includes(countryCode);
      const updatedCountries = isSelected
        ? field.supportedCountries.filter(code => code !== countryCode)
        : [...field.supportedCountries, countryCode];

      // Ensure at least one country is selected
      if (updatedCountries.length === 0) {
        updatedCountries.push('BR');
      }

      handleUpdateField(fieldId, { supportedCountries: updatedCountries });
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const labels = {
      text: 'Texto',
      number: 'Número',
      email: 'E-mail',
      phone: 'Telefone',
      select: 'Seleção',
      textarea: 'Texto longo'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campos Personalizados do Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Fields */}
          {customFields.map((field) => (
            <Card key={field.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{field.label}</h4>
                      <Badge variant="outline">{getFieldTypeLabel(field.type)}</Badge>
                      {field.required && <Badge variant="destructive">Obrigatório</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {field.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                    >
                      {editingField === field.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {editingField === field.id && (
                  <div className="space-y-4 border-t pt-4">
                    {/* Field Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo do Campo</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => handleUpdateField(field.id, { type: value as CustomField['type'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="phone">Telefone</SelectItem>
                            <SelectItem value="select">Seleção</SelectItem>
                            <SelectItem value="textarea">Texto longo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => handleUpdateField(field.id, { required: !!checked })}
                        />
                        <Label htmlFor={`required-${field.id}`}>Campo obrigatório</Label>
                      </div>
                    </div>

                    {/* Phone-specific settings */}
                    {field.type === 'phone' && (
                      <div className="space-y-4">
                        <div>
                          <Label>País padrão</Label>
                          <Select
                            value={field.defaultCountry || 'BR'}
                            onValueChange={(value) => handleUpdateField(field.id, { defaultCountry: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SUPPORTED_COUNTRIES.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.flag} {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Países suportados</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {SUPPORTED_COUNTRIES.map((country) => (
                              <div key={country.code} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`country-${field.id}-${country.code}`}
                                  checked={field.supportedCountries?.includes(country.code) ?? false}
                                  onCheckedChange={() => handleCountryToggle(field.id, country.code)}
                                />
                                <Label htmlFor={`country-${field.id}-${country.code}`} className="text-sm">
                                  {country.flag} {country.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Select options */}
                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <Label>Opções de seleção</Label>
                        {field.options?.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input value={option} readOnly className="flex-1" />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOption(field.id, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nova opção"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleAddOption(field.id, input.value);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input.value.trim()) {
                                handleAddOption(field.id, input.value);
                                input.value = '';
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add New Field */}
          <Card className="border-dashed border-2">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-4">Adicionar Novo Campo</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="new-field-label">Rótulo do Campo</Label>
                  <Input
                    id="new-field-label"
                    placeholder="Ex: Telefone de emergência"
                    value={newField.label || ''}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="new-field-type">Tipo do Campo</Label>
                  <Select
                    value={newField.type || 'text'}
                    onValueChange={(value) => setNewField(prev => ({ ...prev, type: value as CustomField['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="select">Seleção</SelectItem>
                      <SelectItem value="textarea">Texto longo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddField} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Campo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
