import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingService } from "@/services";
import { homeForRole } from "@/lib/roleRoutes";
import { toast } from "sonner";
import { ArrowRight, Calendar, HeartHandshake, PawPrint, Search, ShieldCheck } from "lucide-react";
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
  const { login } = useAuth();
  const [citizenSubmitting, setCitizenSubmitting] = useState(false);
  const [shelterSubmitting, setShelterSubmitting] = useState(false);
  const [citizenForm, setCitizenForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [shelterForm, setShelterForm] = useState({
    name: "",
    email: "",
    shelterName: "",
    cnpj: "",
    contact: "",
    address: "",
    shelterEmail: "",
  });

  async function handleCitizenSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      toast.success("Cadastro concluído com sucesso!");
      navigate(homeForRole[user.role]);
    } finally {
      setCitizenSubmitting(false);
    }
  }

  async function handleShelterSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setShelterSubmitting(true);
      await onboardingService.createAdminRegisterTicket({
        name: shelterForm.name,
        email: shelterForm.email,
        shelter: {
          name: shelterForm.shelterName,
          cnpj: shelterForm.cnpj || undefined,
          contact: shelterForm.contact,
          address: shelterForm.address,
          email: shelterForm.shelterEmail,
        },
      });
      toast.success(
        "Solicitação enviada! Um super admin irá analisar seu cadastro.",
      );
      setShelterForm({
        name: "",
        email: "",
        shelterName: "",
        cnpj: "",
        contact: "",
        address: "",
        shelterEmail: "",
      });
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
          <Link
            to="/login"
            className="hidden text-sm font-semibold text-muted-foreground hover:text-foreground sm:block"
          >
            Entrar
          </Link>
          <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <a href="#onboarding">Começar agora</a>
          </Button>
        </div>
      </header>

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
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              <div>
                <dt className="font-display text-3xl font-bold text-accent">3+</dt>
                <dd className="text-xs text-muted-foreground">Canis parceiros</dd>
              </div>
              <div>
                <dt className="font-display text-3xl font-bold text-accent">120</dt>
                <dd className="text-xs text-muted-foreground">Pets adotados</dd>
              </div>
              <div>
                <dt className="font-display text-3xl font-bold text-accent">24h</dt>
                <dd className="text-xs text-muted-foreground">Agendamento online</dd>
              </div>
            </dl>
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
                className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {citizenSubmitting ? "Cadastrando..." : "Continuar como cidadão"}
              </Button>
            </form>
          </Card>

          <Card className="border-border/60 p-6 shadow-card">
            <h3 className="font-display text-2xl font-bold">Sou um abrigo / entidade</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Envie seus dados para análise. O cadastro será liberado após aprovação.
            </p>
            <form onSubmit={handleShelterSubmit} className="mt-5 space-y-4">
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
                <Label htmlFor="shelter-address">Endereço</Label>
                <Input
                  id="shelter-address"
                  required
                  value={shelterForm.address}
                  onChange={(e) =>
                    setShelterForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
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
                className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {shelterSubmitting ? "Enviando..." : "Enviar para aprovação"}
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
