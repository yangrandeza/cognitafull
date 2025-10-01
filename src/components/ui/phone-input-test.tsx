"use client";

import { useState } from "react";
import { PhoneInputWithCountry } from "./phone-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PhoneInputTest() {
  const [phoneValue, setPhoneValue] = useState("");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Teste do Campo de Telefone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PhoneInputWithCountry
          value={phoneValue}
          onChange={setPhoneValue}
          defaultCountry="BR"
          label="Telefone"
          placeholder="Digite seu telefone"
        />

        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">Valor atual:</p>
          <p className="text-sm font-mono">{phoneValue || "Nenhum valor"}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPhoneValue("")}
          >
            Limpar
          </Button>
          <Button
            variant="outline"
            onClick={() => setPhoneValue("(11) 99999-9999")}
          >
            Preencher BR
          </Button>
          <Button
            variant="outline"
            onClick={() => setPhoneValue("(555) 123-4567")}
          >
            Preencher US
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
