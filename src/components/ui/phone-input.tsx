"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Country } from "@/lib/types";

// Lista de países suportados com suas configurações de telefone
export const SUPPORTED_COUNTRIES: Country[] = [
  {
    code: "BR",
    name: "Brasil",
    flag: "🇧🇷",
    phoneCode: "+55",
    mask: "(99) 99999-9999",
    example: "(11) 99999-9999"
  },
  {
    code: "US",
    name: "Estados Unidos",
    flag: "🇺🇸",
    phoneCode: "+1",
    mask: "(999) 999-9999",
    example: "(555) 123-4567"
  },
  {
    code: "PT",
    name: "Portugal",
    flag: "🇵🇹",
    phoneCode: "+351",
    mask: "999 999 999",
    example: "912 345 678"
  },
  {
    code: "ES",
    name: "Espanha",
    flag: "🇪🇸",
    phoneCode: "+34",
    mask: "999 999 999",
    example: "612 345 678"
  },
  {
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    phoneCode: "+52",
    mask: "(999) 999-9999",
    example: "(55) 1234-5678"
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    phoneCode: "+54",
    mask: "(999) 999-9999",
    example: "(11) 1234-5678"
  },
  {
    code: "CO",
    name: "Colômbia",
    flag: "🇨🇴",
    phoneCode: "+57",
    mask: "999 999 9999",
    example: "300 123 4567"
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    phoneCode: "+56",
    mask: "9 9999 9999",
    example: "9 1234 5678"
  }
];

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: string;
  supportedCountries?: string[];
  placeholder?: string;
  required?: boolean;
  label?: string;
  id?: string;
}

export function PhoneInputWithCountry({
  value,
  onChange,
  defaultCountry = "BR",
  supportedCountries,
  placeholder,
  required = false,
  label,
  id
}: PhoneInputWithCountryProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  const [phoneValue, setPhoneValue] = useState<string>("");

  // Filtrar países suportados se especificado
  const availableCountries = supportedCountries
    ? SUPPORTED_COUNTRIES.filter(country => supportedCountries.includes(country.code))
    : SUPPORTED_COUNTRIES;

  // Encontrar país selecionado
  const currentCountry = availableCountries.find(c => c.code === selectedCountry) || availableCountries[0];

  // Aplicar máscara ao valor
  const applyMask = (rawValue: string, mask: string): string => {
    let maskedValue = "";
    let valueIndex = 0;

    for (let i = 0; i < mask.length; i++) {
      const maskChar = mask[i];

      if (maskChar === "9") {
        // Dígito numérico esperado
        if (valueIndex < rawValue.length && /\d/.test(rawValue[valueIndex])) {
          maskedValue += rawValue[valueIndex];
          valueIndex++;
        } else {
          // Não há mais dígitos para colocar, para aqui
          break;
        }
      } else {
        // Caractere especial (parênteses, espaços, hífens)
        maskedValue += maskChar;
      }
    }

    return maskedValue;
  };

  // Limpar valor (remover máscara)
  const cleanValue = (maskedValue: string): string => {
    return maskedValue.replace(/\D/g, "");
  };

  // Atualizar valor quando o país muda
  useEffect(() => {
    if (value) {
      const cleaned = cleanValue(value);
      const masked = applyMask(cleaned, currentCountry.mask);
      setPhoneValue(masked);
    } else {
      setPhoneValue("");
    }
  }, [selectedCountry, value, currentCountry.mask]);

  // Handler para mudança de país
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const newCountry = availableCountries.find(c => c.code === countryCode) || availableCountries[0];

    // Reaplicar máscara com o novo formato
    const cleaned = cleanValue(phoneValue);
    const newMasked = applyMask(cleaned, newCountry.mask);
    setPhoneValue(newMasked);

    // Notificar mudança
    onChange(newMasked);
  };

  // Handler para mudança de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleaned = cleanValue(inputValue);
    const masked = applyMask(cleaned, currentCountry.mask);

    setPhoneValue(masked);
    onChange(masked);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="flex gap-2">
        {/* Seletor de País */}
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableCountries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted-foreground text-sm">({country.phoneCode})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campo de Telefone */}
        <div className="flex-1">
          <Input
            id={id}
            type="tel"
            value={phoneValue}
            onChange={handlePhoneChange}
            placeholder={placeholder || currentCountry.example}
            required={required}
            className="font-mono"
          />
        </div>
      </div>

      {/* Exemplo de formato */}
      <p className="text-xs text-muted-foreground">
        Formato: {currentCountry.mask} (ex: {currentCountry.example})
      </p>
    </div>
  );
}
