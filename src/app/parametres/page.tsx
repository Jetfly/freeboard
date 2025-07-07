import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  User,
  Building,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Download,
  Upload,
} from "lucide-react";

const settingSections = [
  {
    title: "Profil Personnel",
    description: "Informations personnelles et coordonnées",
    icon: User,
    items: [
      { label: "Nom", value: "Jean Dupont" },
      { label: "Email", value: "jean.dupont@email.com" },
      { label: "Téléphone", value: "+33 6 12 34 56 78" },
      { label: "Adresse", value: "123 Rue de la Paix, 75001 Paris" },
    ],
  },
  {
    title: "Informations Entreprise",
    description: "Détails de votre activité freelance",
    icon: Building,
    items: [
      { label: "Statut", value: "Micro-entrepreneur" },
      { label: "SIRET", value: "123 456 789 00012" },
      { label: "Code APE", value: "6201Z" },
      { label: "TVA Intracommunautaire", value: "FR12345678901" },
    ],
  },
  {
    title: "Facturation",
    description: "Paramètres de facturation et paiement",
    icon: CreditCard,
    items: [
      { label: "Devise par défaut", value: "EUR (€)" },
      { label: "Taux TVA", value: "20%" },
      { label: "Conditions de paiement", value: "30 jours" },
      { label: "Numérotation factures", value: "YYYY-NNN" },
    ],
  },
];

export default function ParametresPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center gap-2">
          <h1 className="text-lg font-semibold">Paramètres</h1>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6">
        {/* Profile Sections */}
        {settingSections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <section.icon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      {item.label}
                    </label>
                    <p className="text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Additional Settings */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <p className="text-sm text-gray-500">Gérer vos préférences de notification</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nouvelles factures</span>
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rappels de paiement</span>
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rapports mensuels</span>
                  <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Apparence</CardTitle>
                  <p className="text-sm text-gray-500">Personnaliser l'interface</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Thème</label>
                  <div className="mt-1 flex gap-2">
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">
                      Clair
                    </button>
                    <button className="px-3 py-1 text-xs border rounded">
                      Sombre
                    </button>
                    <button className="px-3 py-1 text-xs border rounded">
                      Auto
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Couleur principale</label>
                  <div className="mt-1 flex gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded border-2 border-gray-300"></div>
                    <div className="w-6 h-6 bg-green-600 rounded"></div>
                    <div className="w-6 h-6 bg-purple-600 rounded"></div>
                    <div className="w-6 h-6 bg-red-600 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Sécurité & Données</CardTitle>
                <p className="text-sm text-gray-500">Gérer la sécurité et vos données</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Sauvegarde</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter toutes les données
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer des données
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Sécurité</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Changer le mot de passe
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Authentification 2FA
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}