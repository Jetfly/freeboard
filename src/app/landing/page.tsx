"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Star,
  ArrowRight,
  BarChart3,
  FileText,
  Calculator,
  Shield,
  Clock,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: BarChart3,
    title: "Tableau de bord intelligent",
    description: "Visualisez vos revenus, dépenses et bénéfices en temps réel avec des graphiques intuitifs."
  },
  {
    icon: Calculator,
    title: "Calcul automatique TVA",
    description: "Fini les erreurs de calcul ! La TVA et les charges sociales sont calculées automatiquement."
  },
  {
    icon: FileText,
    title: "Rapports conformes",
    description: "Générez vos déclarations et rapports comptables en un clic, conformes à la réglementation française."
  },
  {
    icon: Shield,
    title: "Sécurité bancaire",
    description: "Vos données sont protégées avec un chiffrement de niveau bancaire et des sauvegardes automatiques."
  }
];

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Développeuse Web Freelance",
    content: "FreeBoard m'a fait gagner 10h par mois sur ma comptabilité. Je peux enfin me concentrer sur mes clients !",
    rating: 5,
    avatar: "/api/placeholder/64/64"
  },
  {
    name: "Thomas Martin",
    role: "Consultant Marketing",
    content: "Plus de stress avec les déclarations TVA. Tout est automatisé et je suis sûr d'être en conformité.",
    rating: 5,
    avatar: "/api/placeholder/64/64"
  },
  {
    name: "Sophie Laurent",
    role: "Designer Graphique",
    content: "Interface intuitive et support client réactif. Je recommande à tous les freelances !",
    rating: 5,
    avatar: "/api/placeholder/64/64"
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "0€",
    period: "/mois",
    description: "Parfait pour commencer",
    features: [
      "Jusqu'à 10 transactions/mois",
      "Tableau de bord basique",
      "Export PDF",
      "Support email"
    ],
    cta: "Commencer gratuitement",
    popular: false
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les freelances actifs",
    features: [
      "Transactions illimitées",
      "Calcul automatique TVA",
      "Rapports avancés",
      "Intégrations bancaires",
      "Support prioritaire",
      "Sauvegarde automatique"
    ],
    cta: "Essayer 14 jours gratuit",
    popular: true
  },
  {
    name: "Expert",
    price: "49€",
    period: "/mois",
    description: "Pour les entreprises",
    features: [
      "Tout du plan Pro",
      "Multi-utilisateurs",
      "API personnalisée",
      "Conseiller dédié",
      "Formation personnalisée",
      "SLA 99.9%"
    ],
    cta: "Contacter l'équipe",
    popular: false
  }
];

const faqs = [
  {
    question: "FreeBoard est-il conforme à la réglementation française ?",
    answer: "Oui, FreeBoard respecte toutes les obligations comptables et fiscales françaises. Nos rapports sont conformes aux exigences de l'URSSAF et de la DGFiP."
  },
  {
    question: "Puis-je importer mes données existantes ?",
    answer: "Absolument ! Vous pouvez importer vos transactions depuis Excel, CSV ou connecter directement vos comptes bancaires via notre API sécurisée."
  },
  {
    question: "Que se passe-t-il après la période d'essai ?",
    answer: "Après 14 jours, vous pouvez continuer avec le plan gratuit ou passer à un plan payant. Aucune carte bancaire n'est requise pour l'essai."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Vos données sont chiffrées avec un niveau de sécurité bancaire (AES-256) et hébergées en France. Nous ne vendons jamais vos informations."
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client. Aucun engagement de durée."
  },
  {
    question: "Y a-t-il une formation pour utiliser FreeBoard ?",
    answer: "Nous proposons des tutoriels vidéo, une documentation complète et un support client réactif. Les plans Expert incluent une formation personnalisée."
  }
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                FreeBoard
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Tarifs
              </a>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Connexion
              </Link>
              <Button asChild>
                <Link href="/signup">Inscription</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-2">
              <a href="#features" className="block py-2 text-gray-600 hover:text-gray-900">
                Fonctionnalités
              </a>
              <a href="#pricing" className="block py-2 text-gray-600 hover:text-gray-900">
                Tarifs
              </a>
              <Link href="/login" className="block py-2 text-gray-600 hover:text-gray-900">
                Connexion
              </Link>
              <Link href="/signup" className="block py-2">
                <Button className="w-full">Inscription</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                🚀 Déjà 1000+ freelances nous font confiance
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Gérez vos finances freelance en
                <span className="text-yellow-300"> 5 minutes</span> par semaine
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Fini la paperasse et les erreurs de calcul ! FreeBoard automatise votre comptabilité, 
                calcule vos charges et génère vos déclarations en conformité avec la réglementation française.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 text-lg px-8">
                  <Link href="/signup">
                    Essayer 14 jours gratuit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Voir la démo
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-4">
                ✓ Aucune carte bancaire requise ✓ Configuration en 2 minutes
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <div className="text-gray-900">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Dashboard</h3>
                      <Badge className="bg-green-100 text-green-800">En temps réel</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Revenus ce mois</p>
                        <p className="text-2xl font-bold text-blue-600">8,450€</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Bénéfice net</p>
                        <p className="text-2xl font-bold text-green-600">6,120€</p>
                      </div>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-end p-4">
                      <div className="text-white text-sm">📈 Évolution des revenus</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Vous en avez marre de perdre du temps avec la comptabilité ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comme 78% des freelances français, vous passez probablement trop de temps sur des tâches administratives
              au lieu de vous concentrer sur votre cœur de métier.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "😰",
                title: "Calculs TVA complexes",
                description: "Taux multiples, seuils de franchise, régimes spéciaux... Un vrai casse-tête !"
              },
              {
                icon: "📊",
                title: "Suivi des charges sociales",
                description: "URSSAF, CFE, cotisations... Difficile de s'y retrouver et de provisionner."
              },
              {
                icon: "⏰",
                title: "Paperasse chronophage",
                description: "Heures perdues sur Excel, erreurs de saisie, stress des échéances..."
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{problem.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                FreeBoard transforme votre gestion financière
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Notre plateforme automatise tous les aspects pénibles de la comptabilité freelance 
                pour que vous puissiez vous concentrer sur ce que vous faites de mieux.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Zap,
                    title: "Automatisation intelligente",
                    description: "Calculs automatiques, catégorisation des dépenses, provisions en temps réel"
                  },
                  {
                    icon: Shield,
                    title: "Conformité garantie",
                    description: "Toujours à jour avec la réglementation française, rapports conformes"
                  },
                  {
                    icon: Clock,
                    title: "Gain de temps massif",
                    description: "De 10h à 5 minutes par semaine pour votre comptabilité"
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <benefit.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Rapport mensuel automatique</h4>
                    <Badge className="bg-green-100 text-green-800">Généré</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chiffre d'affaires HT</span>
                      <span className="font-semibold">8,450€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TVA collectée</span>
                      <span className="font-semibold">1,690€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Charges déductibles</span>
                      <span className="font-semibold">2,330€</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Bénéfice net</span>
                      <span className="text-green-600">6,120€</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    <FileText className="mr-2 h-4 w-4" />
                    Télécharger le rapport
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Tout ce dont vous avez besoin pour gérer vos finances
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils puissants et simples d'utilisation, conçus spécifiquement pour les freelances français.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ils ont transformé leur gestion financière
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez plus de 1000 freelances qui ont simplifié leur comptabilité
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-50 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Client Logos */}
          <motion.div
            {...fadeInUp}
            className="text-center"
          >
            <p className="text-gray-600 mb-8">Ils nous font confiance</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {["Freelance.com", "Malt", "Upwork", "Fiverr", "99designs"].map((logo, index) => (
                <div key={index} className="text-lg font-semibold text-gray-400">
                  {logo}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Choisissez le plan qui vous convient
            </h2>
            <p className="text-xl text-gray-600">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      ⭐ Plus populaire
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  <Link href={plan.name === 'Expert' ? '#' : '/signup'}>
                    {plan.cta}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="text-center mt-12"
          >
            <p className="text-gray-600">
              💳 Aucune carte bancaire requise pour l'essai • 🔒 Annulation à tout moment • 🇫🇷 Support en français
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur FreeBoard
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="border border-gray-200 rounded-lg"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à simplifier votre comptabilité ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Rejoignez les 1000+ freelances qui ont déjà transformé leur gestion financière
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 text-lg px-8">
                <Link href="/signup">
                  Commencer l'essai gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Planifier une démo
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              ✓ 14 jours d'essai gratuit ✓ Configuration en 2 minutes ✓ Support français
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">FreeBoard</h3>
              <p className="text-gray-400 mb-4">
                La solution comptable pensée pour les freelances français.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Statut</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FreeBoard. Tous droits réservés. Fait avec ❤️ en France.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}