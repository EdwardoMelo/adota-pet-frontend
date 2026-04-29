import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { store } from "@/store";
import { clearFeedback } from "@/store/feedbackSlice";
import { resolveApiErrorMessage } from "@/services/apiClient";
import { onboardingService, petService } from "@/services";
import type { PetResponseDTO } from "@/dtos";
import { emptyAddress, validateAddress } from "@/lib/address";
import { homeForRole } from "@/lib/roleRoutes";
import { PetCard } from "@/components/PetCard";
import { toast } from "sonner";
import { ArrowRight, Calendar, HeartHandshake, Loader2, PawPrint, Search, ShieldCheck } from "lucide-react";
import { track } from "@/lib/analytics";
import heroPet from "@/assets/hero-pet.jpg";

const features = [
  {
    icon: Search,
    title: "Encontre seu pet",
    body: "Explore animais disponíveis nos canis municipais parceiros da sua cidade.",
  },
  {
    icon: Calendar,
    title: "Agende em minutos",
    body: "Castração, consulta veterinária e mais — tudo em poucos cliques.",
  },
  {
    icon: ShieldCheck,
    title: "Gestão para canis",
    body: "Cadastro de pets, controle de agendamentos e visão multi-tenant.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [citizenSubmitting, setCitizenSubmitting] = useState(false);
  const [shelterSubmitting, setShelterSubmitting] = useState(false);
  const [citizenFormError, setCitizenFormError] = useState<string | null>(null);
  const [shelterFormError, setShelterFormError] = useState<string | null>(null);
  const [citizenForm, setCitizenForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [shelterForm, setShelterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shelterName: "",
    cnpj: "",
    contact: "",
    address: { ...emptyAddress },
    shelterEmail: "",
  });
  const [featuredPets, setFeaturedPets] = useState<PetResponseDTO[]>([]);
  const [loadingFeaturedPets, setLoadingFeaturedPets] = useState(true);

  useEffect(() => {
    petService
      .getAvailable()
      .then((pets) => setFeaturedPets(pets.slice(0, 6)))
      .finally(() => setLoadingFeaturedPets(false));
  }, []);

  async function handleCitizenSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCitizenFormError(null);
    if (citizenForm.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (citizenForm.password !== citizenForm.confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    try {
      setCitizenSubmitting(true);
      const { user } = await onboardingService.createCitizen({
        name: citizenForm.name,
        email: citizenForm.email,
        password: citizenForm.password,
      });
      await login(user.id);
      track("signup_citizen_success", {
        role: user.role,
        source_page: "/",
        tenant_id: user.tenantId ?? undefined,
      });
      toast.success("Cadastro concluído com sucesso!");
      navigate(homeForRole[user.role]);
    } catch (error) {
      store.dispatch(clearFeedback());
      setCitizenFormError(resolveApiErrorMessage(error));
    } finally {
      setCitizenSubmitting(false);
    }
  }

  async function handleShelterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShelterFormError(null);
    if (shelterForm.password.length < 6) {
      toast.error("A senha do responsável deve ter no mínimo 6 caracteres.");
      return;
    }
    if (shelterForm.password !== shelterForm.confirmPassword) {
      toast.error("As senhas do responsável não conferem.");
      return;
    }
    const addressError = validateAddress(shelterForm.address);
    if (addressError) {
      toast.error(addressError);
      return;
    }
    try {
      setShelterSubmitting(true);
      await onboardingService.createAdminRegisterTicket({
        name: shelterForm.name,
        email: shelterForm.email,
        password: shelterForm.password,
        shelter: {
          name: shelterForm.shelterName,
          cnpj: shelterForm.cnpj || undefined,
          contact: shelterForm.contact,
          address: shelterForm.address,
          email: shelterForm.shelterEmail,
        },
      });
      track("signup_shelter_ticket_submitted", {
        source_page: "/",
      });
      toast.success(
        "Solicitação enviada! Um super admin irá analisar seu cadastro.",
      );
      setShelterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        shelterName: "",
        cnpj: "",
        contact: "",
        address: { ...emptyAddress },
        shelterEmail: "",
      });
    } catch (error) {
      store.dispatch(clearFeedback());
      setShelterFormError(resolveApiErrorMessage(error));
    } finally {
      setShelterSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-soft">
            <PawPrint className="h-5 w-5" />
          </span>
          AdotaPet
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Olá, <strong className="text-foreground">{user.name.split(" ")[0]}</strong>
              </span>
              <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to={homeForRole[user.role]}>Ir para a plataforma</Link>
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-semibold text-muted-foreground hover:text-foreground sm:block"
              >
                Entrar
              </Link>
              <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="#onboarding">Começar agora</a>
              </Button>
            </>
          )}
        </div>
      </header>

      {user?.role === "citizen" && (
        <section className="border-b border-border/60 bg-secondary/40">
          <div className="container mx-auto px-6 py-6">
            <Card className="border-accent/30 bg-card p-5 shadow-card sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Próximos passos</p>
              <h2 className="mt-1 font-display text-xl font-bold">Continue de onde parou</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Explore pets, cadastre seu animal para agendar procedimentos no canil e acompanhe solicitações de adoção.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/pets">Ver pets disponíveis</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to="/my-pets">Meus pets</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to="/appointments/new">Agendar procedimento</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <Link to="/adoptions">Minhas adoções</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto grid items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              <HeartHandshake className="h-3.5 w-3.5" />
              Plataforma para canis municipais
            </span>
            <h1 className="mt-6 font-display text-5xl font-black leading-tight text-foreground md:text-6xl">
              Seu novo melhor amigo está esperando.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Conectamos famílias a animais que precisam de um lar e simplificamos o agendamento de
              procedimentos veterinários nos canis municipais.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground shadow-warm hover:bg-accent/90">
                <a href="#onboarding">
                  Quero adotar <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2">
                <a href="#onboarding">Agendar procedimento</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
              >
                <a href="#shelter-onboarding">Quero administrar o canil</a>
              </Button>
            </div>

            <div className="mt-12 max-w-2xl rounded-2xl border border-accent/20 bg-accent/5 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Sobre o AdotaPet</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O AdotaPet surgiu em contexto acadêmico, com a proposta de usar tecnologia para facilitar e incentivar
                a população a conhecer novos pets e se aproximar dos canis municipais.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A plataforma não pretende ser, neste momento, uma solução final e definitiva. A ideia é oferecer um
                ponto de partida sólido para consolidar as primeiras relações entre canis, população e pets, com base
                em aprendizados contínuos.
              </p>
            </div>
          </div>

          <div className="relative mx-auto flex h-full w-full items-center justify-center">
            <div className="absolute inset-0 m-auto h-80 w-80 rounded-full bg-secondary md:h-96 md:w-96" aria-hidden />
            <div className="relative h-72 w-72 overflow-hidden rounded-full border-8 border-brand-cream shadow-warm md:h-[22rem] md:w-[22rem]">
              <img
                src={heroPet}
                alt="Cachorro feliz olhando para a câmera"
                width={1024}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold text-foreground">
            Como o AdotaPet conecta você
          </h2>
          <p className="mt-4 text-muted-foreground">
            Uma só plataforma para cidadãos e gestores de canis municipais.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="group relative overflow-hidden border-border/60 bg-card p-8 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition-smooth group-hover:bg-accent group-hover:text-accent-foreground">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold">{f.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{f.body}</p>
              <span className="absolute right-6 top-6 font-display text-sm font-bold text-muted-foreground/40">
                0{i + 1}
              </span>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Animais disponíveis agora</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Conheça alguns pets que estão esperando por um lar cheio de carinho.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/pets">Ver todos</Link>
          </Button>
        </div>

        {loadingFeaturedPets ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-accent" />
          </div>
        ) : featuredPets.length === 0 ? (
          <Card className="border-border/60 p-8 text-center text-sm text-muted-foreground">
            No momento não há pets disponíveis para adoção.
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} to={`/pets/${pet.id}`} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section id="onboarding" className="container mx-auto px-6 pb-10">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold">Como deseja começar?</h2>
          <p className="mt-2 text-muted-foreground">
            Escolha seu perfil e finalize seu cadastro inicial.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 p-6 shadow-card">
            <h3 className="font-display text-2xl font-bold">Sou cidadão</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie sua conta agora e entre direto na plataforma para adotar.
            </p>
            <form onSubmit={handleCitizenSubmit} className="mt-5 space-y-4">
              <FormErrorAlert message={citizenFormError} />
              <div className="space-y-2">
                <Label htmlFor="citizen-name">Nome</Label>
                <Input
                  id="citizen-name"
                  required
                  value={citizenForm.name}
                  onChange={(e) =>
                    setCitizenForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="citizen-email">E-mail</Label>
                <Input
                  id="citizen-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={citizenForm.email}
                  onChange={(e) =>
                    setCitizenForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="citizen-password">Senha</Label>
                <Input
                  id="citizen-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={citizenForm.password}
                  onChange={(e) =>
                    setCitizenForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="citizen-confirm-password">Confirmar senha</Label>
                <Input
                  id="citizen-confirm-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={citizenForm.confirmPassword}
                  onChange={(e) =>
                    setCitizenForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                type="submit"
                disabled={citizenSubmitting}
                aria-busy={citizenSubmitting}
                className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {citizenSubmitting ? "Cadastrando..." : "Continuar como cidadão"}
              </Button>
            </form>
          </Card>

          <Card id="shelter-onboarding" className="border-border/60 p-6 shadow-card">
            <h3 className="font-display text-2xl font-bold">Sou um abrigo / entidade</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Envie seus dados para análise. O cadastro será liberado após aprovação.
            </p>
            <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
              Você deve cadastrar os dados da sua instituição antes de prosseguir.
            </div>
            <form onSubmit={handleShelterSubmit} className="mt-5 space-y-4">
              <FormErrorAlert message={shelterFormError} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shelter-user-name">Nome do responsável</Label>
                  <Input
                    id="shelter-user-name"
                    required
                    value={shelterForm.name}
                    onChange={(e) =>
                      setShelterForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelter-user-email">E-mail do responsável</Label>
                  <Input
                    id="shelter-user-email"
                    type="email"
                    required
                    value={shelterForm.email}
                    onChange={(e) =>
                      setShelterForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shelter-user-password">Senha de acesso</Label>
                  <Input
                    id="shelter-user-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={shelterForm.password}
                    onChange={(e) =>
                      setShelterForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelter-user-confirm-password">Confirmar senha</Label>
                  <Input
                    id="shelter-user-confirm-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={shelterForm.confirmPassword}
                    onChange={(e) =>
                      setShelterForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shelter-name">Nome da entidade</Label>
                <Input
                  id="shelter-name"
                  required
                  value={shelterForm.shelterName}
                  onChange={(e) =>
                    setShelterForm((prev) => ({
                      ...prev,
                      shelterName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shelter-cnpj">CNPJ (opcional)</Label>
                  <Input
                    id="shelter-cnpj"
                    value={shelterForm.cnpj}
                    onChange={(e) =>
                      setShelterForm((prev) => ({ ...prev, cnpj: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelter-contact">Contato</Label>
                  <Input
                    id="shelter-contact"
                    required
                    value={shelterForm.contact}
                    onChange={(e) =>
                      setShelterForm((prev) => ({ ...prev, contact: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço do canil</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Rua / Avenida"
                    value={shelterForm.address.street}
                    onChange={(e) =>
                      setShelterForm((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="Número"
                    value={shelterForm.address.number}
                    onChange={(e) =>
                      setShelterForm((prev) => ({
                        ...prev,
                        address: { ...prev.address, number: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="Apartamento / complemento (opcional)"
                    value={shelterForm.address.apartment ?? ""}
                    onChange={(e) =>
                      setShelterForm((prev) => ({
                        ...prev,
                        address: { ...prev.address, apartment: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="CEP (somente números)"
                    value={shelterForm.address.zipCode}
                    onChange={(e) =>
                      setShelterForm((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          zipCode: e.target.value.replace(/\D/g, "").slice(0, 8),
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Cidade"
                    value={shelterForm.address.city}
                    onChange={(e) =>
                      setShelterForm((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="Estado (UF)"
                    value={shelterForm.address.state}
                    onChange={(e) =>
                      setShelterForm((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value.toUpperCase() },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shelter-email">E-mail institucional</Label>
                <Input
                  id="shelter-email"
                  type="email"
                  required
                  value={shelterForm.shelterEmail}
                  onChange={(e) =>
                    setShelterForm((prev) => ({
                      ...prev,
                      shelterEmail: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                type="submit"
                disabled={shelterSubmitting}
                aria-busy={shelterSubmitting}
                className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {shelterSubmitting ? "Enviando solicitação..." : "Enviar para aprovação"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="overflow-hidden rounded-3xl bg-gradient-warm p-10 shadow-soft md:p-16">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Pronto para mudar a vida de um pet?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Faça login e veja todos os animais disponíveis para adoção agora mesmo.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground shadow-warm hover:bg-accent/90">
              <Link to="/login">
                Entrar na plataforma <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-secondary/40">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AdotaPet — Plataforma para canis municipais.
        </div>
      </footer>
    </div>
  );
};

export default Index;
