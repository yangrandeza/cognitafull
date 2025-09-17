"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Mail, User, Building } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { signUpWithEmail } from "@/lib/firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const invitationId = params.invitationId as string;

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const invitationRef = doc(db, 'users', invitationId);
        const invitationSnap = await getDoc(invitationRef);

        if (!invitationSnap.exists()) {
          setError("Convite não encontrado ou expirado.");
          return;
        }

        const invitationData = invitationSnap.data();

        if (invitationData.status !== 'pending') {
          setError("Este convite já foi utilizado.");
          return;
        }

        // Check if invitation is expired (7 days)
        const createdAt = invitationData.createdAt?.toDate();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
          setError("Este convite expirou. Solicite um novo convite ao administrador.");
          return;
        }

        setInvitation({
          id: invitationSnap.id,
          ...invitationData
        });
      } catch (err) {
        console.error('Error loading invitation:', err);
        setError("Erro ao carregar convite. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    if (invitationId) {
      loadInvitation();
    }
  }, [invitationId]);

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    setAccepting(true);
    try {
      // Create password for the teacher (they can change it later)
      const tempPassword = Math.random().toString(36).slice(-12) + 'Temp2024!';

      // Try to sign up the teacher
      const { user, error: signupError } = await signUpWithEmail(
        invitation.email,
        tempPassword,
        invitation.name
      );

      if (signupError) {
        // Check if the error is because email is already in use
        if (signupError.includes('email-already-in-use') || signupError.includes('already in use')) {
          // Email already exists - let's check if it's a teacher account that needs activation
          const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
          const { collection, query, where, getDocs, doc, updateDoc, deleteDoc } = await import('firebase/firestore');

          try {
            // Try to sign in with the existing account
            const auth = getAuth();
            await signInWithEmailAndPassword(auth, invitation.email, tempPassword);

            // If sign in succeeds, check if there's a pending invitation to activate
            const pendingQuery = query(
              collection(db, 'users'),
              where('email', '==', invitation.email),
              where('status', '==', 'pending'),
              where('role', '==', 'teacher')
            );

            const pendingSnapshot = await getDocs(pendingQuery);

            if (!pendingSnapshot.empty) {
              const pendingDoc = pendingSnapshot.docs[0];
              const pendingData = pendingDoc.data();

              // Update the existing user document to active
              const userDocRef = doc(db, 'users', auth.currentUser!.uid);
              await updateDoc(userDocRef, {
                status: 'active',
                role: 'teacher',
                organizationId: pendingData.organizationId,
                name: pendingData.name,
              });

              // Delete the pending document
              await deleteDoc(pendingDoc.ref);

              toast({
                title: "Convite aceito!",
                description: "Sua conta foi ativada com sucesso. Você será redirecionado em instantes.",
              });

              // Redirect to dashboard after a short delay
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);

              setAccepting(false);
              return;
            } else {
              // No pending invitation found for this email
              throw new Error("Este email já está cadastrado no sistema. Entre em contato com o administrador.");
            }
          } catch (signInError) {
            // Could not sign in with the temporary password
            // Let's check if there's an existing user document that might need activation
            const { query, where, getDocs } = await import('firebase/firestore');

            const existingUserQuery = query(
              collection(db, 'users'),
              where('email', '==', invitation.email)
            );

            const existingUserSnapshot = await getDocs(existingUserQuery);

            if (!existingUserSnapshot.empty) {
              const existingUserDoc = existingUserSnapshot.docs[0];
              const existingUserData = existingUserDoc.data();

              // Check if this is an existing teacher account that needs activation
              if (existingUserData.role === 'teacher' && existingUserData.status === 'pending') {
                // This is a pending teacher account - we can activate it
                await updateDoc(existingUserDoc.ref, {
                  status: 'active',
                  name: invitation.name,
                  organizationId: invitation.organizationId,
                });

                // Delete the invitation document
                const invitationRef = doc(db, 'users', invitationId);
                await deleteDoc(invitationRef);

                toast({
                  title: "Convite aceito!",
                  description: "Sua conta de professor foi ativada com sucesso.",
                });

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                  router.push("/dashboard");
                }, 2000);

                setAccepting(false);
                return;
              } else if (existingUserData.role === 'admin' || existingUserData.role === 'superadmin') {
                throw new Error("Este email já está cadastrado como administrador. Entre em contato com o administrador do sistema.");
              } else if (existingUserData.status === 'active') {
                throw new Error("Este email já está associado a uma conta ativa. Faça login normalmente ou entre em contato com o administrador.");
              }
            }

            // If we get here, it's a Firebase Auth account without a Firestore document
            throw new Error("Este email já está em uso em outro serviço. Entre em contato com o administrador para resolver.");
          }
        } else {
          throw new Error(signupError);
        }
      }

      // If signup succeeded, the createUserProfileInFirestore function will automatically:
      // 1. Find the pending invitation by email
      // 2. Create a new active document with the correct Firebase Auth UID
      // 3. Delete the old pending document

      toast({
        title: "Convite aceito!",
        description: "Sua conta foi criada com sucesso. Você será redirecionado em instantes.",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast({
        variant: "destructive",
        title: "Erro ao aceitar convite",
        description: (err as Error).message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Convite Inválido</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle>Convite para Professor</CardTitle>
          <CardDescription>
            Você foi convidado para fazer parte da plataforma MUDEAI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {invitation && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm text-muted-foreground">{invitation.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{invitation.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Organização</p>
                  <p className="text-sm text-muted-foreground">MUDEAI</p>
                </div>
              </div>
            </div>
          )}

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Ao aceitar este convite, você concorda em fazer parte da plataforma MUDEAI como professor.
              Uma senha temporária será criada e você poderá alterá-la posteriormente.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleAcceptInvitation}
            disabled={accepting}
            className="w-full"
          >
            {accepting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Aceitando convite...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aceitar Convite
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
