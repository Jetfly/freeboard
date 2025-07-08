"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface NextDeclarationProps {
  nextDeadline?: Date;
  declarationType?: string;
}

export function NextDeclaration({ 
  nextDeadline = new Date('2024-04-30'), 
  declarationType = 'TVA trimestrielle' 
}: NextDeclarationProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadline = nextDeadline.getTime();
      const difference = deadline - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [nextDeadline]);
  
  const isUrgent = timeLeft.days <= 7;
  const isOverdue = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;
  
  const getStatusColor = () => {
    if (isOverdue) return { color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-200' };
    if (isUrgent) return { color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' };
    return { color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: '' };
  };
  
  const status = getStatusColor();
  
  return (
    <Card className={`min-h-[280px] flex flex-col transition-all duration-300 hover:shadow-lg border rounded-lg ${
      isOverdue ? 'border-red-200 bg-red-50' : 
      isUrgent ? 'border-orange-200 bg-orange-50' : 'border-gray-200 hover:border-blue-200'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium text-gray-900 leading-relaxed">Prochaine déclaration</CardTitle>
        <div className={`p-2 rounded-lg ${status.bgColor}`}>
          {isOverdue ? (
            <FileText className={`h-4 w-4 ${status.color}`} />
          ) : (
            <Calendar className={`h-4 w-4 ${status.color}`} />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-base font-semibold text-gray-900 leading-relaxed">{declarationType}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium">Échéance:</span> {nextDeadline.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          {isOverdue ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-4 bg-red-50 rounded-lg border border-red-200"
            >
              <p className="text-red-600 font-bold text-base leading-relaxed">⚠️ ÉCHÉANCE DÉPASSÉE</p>
              <p className="text-red-500 text-sm mt-2 leading-relaxed">Action immédiate requise</p>
            </motion.div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center items-center space-x-6 mb-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${status.color}`}>{timeLeft.days}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">jours</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${status.color}`}>{timeLeft.hours}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">heures</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${status.color}`}>{timeLeft.minutes}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">min</div>
                </div>
              </div>
              
              {isUrgent && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-orange-600 font-semibold flex items-center justify-center leading-relaxed mt-3"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Échéance proche
                </motion.p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}