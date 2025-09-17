"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, Lock, Users, Database, Mail } from "lucide-react";

interface PrivacyPolicyProps {
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export function PrivacyPolicy({ onAccept, showAcceptButton = false }: PrivacyPolicyProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-6 w-6 text-primary" />
          Política de Privacidade - MUDEAI
        </CardTitle>
        <CardDescription>
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-6 text-sm leading-relaxed">
            {/* Introdução */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                1. Introdução
              </h3>
              <p className="text-muted-foreground">
                A presente Política de Privacidade descreve como o MUDEAI coleta, utiliza, armazena e protege suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            {/* Dados Coletados */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                2. Dados Coletados
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Coletamos os seguintes tipos de dados:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Dados de identificação:</strong> Nome, e-mail, instituição de ensino</li>
                  <li><strong>Dados psicométricos:</strong> Respostas do quiz de avaliação de aprendizagem</li>
                  <li><strong>Dados de navegação:</strong> Páginas visitadas, tempo de uso, interações</li>
                  <li><strong>Dados educacionais:</strong> Desempenho acadêmico, estratégias de aprendizagem</li>
                  <li><strong>Dados voluntários:</strong> Informações adicionais fornecidas pelos usuários (idade, profissão, etc.)</li>
                </ul>
              </div>
            </section>

            {/* Finalidade do Tratamento */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                3. Finalidade do Tratamento
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Utilizamos seus dados para:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Fornecer avaliação psicométrica personalizada</li>
                  <li>Gerar insights sobre perfis de aprendizagem</li>
                  <li>Recomendar estratégias pedagógicas adequadas</li>
                  <li>Melhorar a experiência do usuário na plataforma</li>
                  <li>Cumprir obrigações legais e educacionais</li>
                  <li>Realizar pesquisas e desenvolvimento educacional</li>
                </ul>
              </div>
            </section>

            {/* Compartilhamento de Dados */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                4. Compartilhamento de Dados
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Seus dados podem ser compartilhados apenas nas seguintes situações:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Com seu consentimento explícito</strong></li>
                  <li><strong>Com instituições educacionais</strong> para fins pedagógicos</li>
                  <li><strong>Com prestadores de serviços</strong> necessários ao funcionamento da plataforma</li>
                  <li><strong>Quando exigido por lei</strong> ou ordem judicial</li>
                  <li><strong>Para proteção de direitos</strong> em casos de violação de termos de uso</li>
                </ul>
                <p className="mt-2">
                  <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais.</strong>
                </p>
              </div>
            </section>

            {/* Segurança dos Dados */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                5. Segurança dos Dados
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Implementamos medidas de segurança técnicas e administrativas para proteger seus dados:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Criptografia de dados em trânsito e armazenamento</li>
                  <li>Controle de acesso restrito aos dados</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Backups regulares e seguros</li>
                  <li>Auditorias de segurança periódicas</li>
                </ul>
              </div>
            </section>

            {/* Seus Direitos - LGPD */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                6. Seus Direitos (LGPD)
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>De acordo com a LGPD, você tem os seguintes direitos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Confirmação da existência de tratamento</strong> de dados pessoais</li>
                  <li><strong>Acesso aos dados</strong> pessoais tratados</li>
                  <li><strong>Correção de dados</strong> incompletos, inexatos ou desatualizados</li>
                  <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários</li>
                  <li><strong>Portabilidade dos dados</strong> a outro fornecedor</li>
                  <li><strong>Eliminação dos dados</strong> tratados com consentimento</li>
                  <li><strong>Informação sobre compartilhamento</strong> de dados com terceiros</li>
                  <li><strong>Revogação do consentimento</strong> a qualquer momento</li>
                </ul>
              </div>
            </section>

            {/* Retenção de Dados */}
            <section>
              <h3 className="font-semibold text-base mb-3">7. Retenção de Dados</h3>
              <p className="text-muted-foreground">
                Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades descritas nesta política,
                respeitando os prazos legais de retenção. Dados educacionais podem ser mantidos por períodos mais longos
                para fins históricos e de pesquisa educacional, sempre com adequada proteção.
              </p>
            </section>

            {/* Cookies e Tecnologias */}
            <section>
              <h3 className="font-semibold text-base mb-3">8. Cookies e Tecnologias Similares</h3>
              <p className="text-muted-foreground">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma,
                analisar o uso do sistema e personalizar o conteúdo. Você pode controlar o uso de cookies
                através das configurações do seu navegador.
              </p>
            </section>

            {/* Menores de Idade */}
            <section>
              <h3 className="font-semibold text-base mb-3">9. Menores de Idade</h3>
              <p className="text-muted-foreground">
                O MUDEAI é destinado ao uso educacional. Para menores de 18 anos,
                é necessário o consentimento dos responsáveis legais para o tratamento de dados pessoais.
                Instituições educacionais devem garantir que todos os consentimentos necessários sejam obtidos.
              </p>
            </section>

            {/* Alterações na Política */}
            <section>
              <h3 className="font-semibold text-base mb-3">10. Alterações nesta Política</h3>
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Quando houver alterações significativas,
                notificaremos os usuários através da plataforma ou por e-mail. O uso continuado da plataforma
                após as alterações constitui aceitação da nova política.
              </p>
            </section>

            {/* Contato */}
            <section>
              <h3 className="font-semibold text-base mb-3">11. Contato</h3>
              <div className="text-muted-foreground">
                <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>E-mail: contato@mudeeducacao.com.br</li>
                  <li>Encarregado de Dados (DPO): contato@mudeeducacao.com.br</li>
                  <li>Prazo para resposta: até 15 dias úteis</li>
                </ul>
              </div>
            </section>

            {/* Consentimento */}
            <section className="border-t pt-4">
              <h3 className="font-semibold text-base mb-3">12. Consentimento</h3>
              <p className="text-muted-foreground">
                Ao utilizar o MUDEAI e aceitar esta política, você consente com o tratamento de seus dados
                pessoais conforme descrito acima, em conformidade com a LGPD e demais legislações aplicáveis.
              </p>
            </section>
          </div>
        </ScrollArea>

        {showAcceptButton && onAccept && (
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={onAccept}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Aceito a Política de Privacidade
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
