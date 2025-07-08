"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Building, FileText, Settings, Save, AlertCircle, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, updateUserProfile } from "@/lib/dashboard-service";
import { VatRegimeSettings } from "@/components/vat-regime-settings";
import { LegalStatus } from "@/lib/vat-service";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  legal_status?: string;
  vat_number?: string;
  siret?: string;
  address?: string;
  phone?: string;
  website?: string;
  created_at: string;
  updated_at?: string;
}

interface UserPreferences {
  currency: string;
  dateFormat: string;
  language: string;
  emailNotifications: boolean;
  vatCalculation: boolean;
  autoBackup: boolean;
  darkMode: boolean;
}

export default function ParametresPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    language: 'fr',
    emailNotifications: true,
    vatCalculation: true,
    autoBackup: false,
    darkMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'vat' | 'preferences'>('profile');

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profileData = await getUserProfile(user.id);
      setProfile(profileData);
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      toast.error('Erreur lors du chargement du profil');
      // Créer un profil par défaut si aucun n'existe
      setProfile({
        id: user.id,
        email: user.email || '',
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    try {
      setSaving(true);
      await updateUserProfile(user.id, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        business_name: profile.business_name,
        legal_status: profile.legal_status,
        vat_number: profile.vat_number,
        siret: profile.siret
      });
      
      toast.success('Profil mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      toast.error('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = () => {
    // Sauvegarder les préférences dans le localStorage pour le moment
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    toast.success('Préférences sauvegardées!');
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const updatePreferences = (field: keyof UserPreferences, value: string | boolean) => {
    setPreferences({ ...preferences, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">Paramètres</h1>
          </div>
        </header>
        <main className="flex-1 space-y-6 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center gap-2">
          <h1 className="text-lg font-semibold">Paramètres</h1>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
        </motion.div>

        {/* Navigation par onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit"
        >
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="h-4 w-4 mr-2 inline" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'business'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building className="h-4 w-4 mr-2 inline" />
            Entreprise
          </button>
          <button
            onClick={() => setActiveTab('vat')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'vat'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Receipt className="h-4 w-4 mr-2 inline" />
            TVA
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Préférences
          </button>
        </motion.div>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gérez vos informations personnelles
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={profile?.first_name || ''}
                      onChange={(e) => updateProfile('first_name', e.target.value)}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={profile?.last_name || ''}
                      onChange={(e) => updateProfile('last_name', e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'business' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations d'entreprise
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gérez les informations de votre entreprise
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nom de l'entreprise</Label>
                  <Input
                    id="businessName"
                    value={profile?.business_name || ''}
                    onChange={(e) => updateProfile('business_name', e.target.value)}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalStatus">Statut juridique</Label>
                  <Select
                    value={profile?.legal_status || ''}
                    onValueChange={(value) => updateProfile('legal_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto-entrepreneur">Auto-entrepreneur</SelectItem>
                      <SelectItem value="eirl">EIRL</SelectItem>
                      <SelectItem value="eurl">EURL</SelectItem>
                      <SelectItem value="sarl">SARL</SelectItem>
                      <SelectItem value="sas">SAS</SelectItem>
                      <SelectItem value="sa">SA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      value={profile?.siret || ''}
                      onChange={(e) => updateProfile('siret', e.target.value)}
                      placeholder="Numéro SIRET"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">Numéro de TVA</Label>
                    <Input
                      id="vatNumber"
                      value={profile?.vat_number || ''}
                      onChange={(e) => updateProfile('vat_number', e.target.value)}
                      placeholder="FR12345678901"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'vat' && (
            <div className="space-y-6">
              <VatRegimeSettings userId={user?.id || ''} />
            </div>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Préférences
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personnalisez votre expérience
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <Select
                      value={preferences.currency}
                      onValueChange={(value) => updatePreferences('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dollar US ($)</SelectItem>
                        <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Format de date</Label>
                    <Select
                      value={preferences.dateFormat}
                      onValueChange={(value) => updatePreferences('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications par email</p>
                        <p className="text-sm text-muted-foreground">
                          Recevez des alertes importantes par email
                        </p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => updatePreferences('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Calcul automatique de la TVA</p>
                        <p className="text-sm text-muted-foreground">
                          Calculer automatiquement la TVA sur les transactions
                        </p>
                      </div>
                      <Switch
                        checked={preferences.vatCalculation}
                        onCheckedChange={(checked) => updatePreferences('vatCalculation', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Système</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mode sombre</p>
                        <p className="text-sm text-muted-foreground">
                          Interface en thème sombre
                        </p>
                      </div>
                      <Switch
                        checked={preferences.darkMode}
                        onCheckedChange={(checked) => updatePreferences('darkMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sauvegarde automatique</p>
                        <p className="text-sm text-muted-foreground">
                          Sauvegarde quotidienne de vos données
                        </p>
                      </div>
                      <Switch
                        checked={preferences.autoBackup}
                        onCheckedChange={(checked) => updatePreferences('autoBackup', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSavePreferences}>
                    Sauvegarder les préférences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}