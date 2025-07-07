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
    <Card className={`transition-all duration-300 ${status.borderColor ? `${status.borderColor} bg-opacity-50` : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Prochaine déclaration</CardTitle>
        <div className={`p-2 rounded-lg ${status.bgColor}`}>
          {isOverdue ? (
            <FileText className={`h-4 w-4 ${status.color}`} />
          ) : (
            <Calendar className={`h-4 w-4 ${status.color}`} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{declarationType}</p>
            <p className="text-sm text-muted-foreground">
              Échéance: {nextDeadline.toLocaleDateString('fr-FR', { 
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
              className="text-center p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <p className="text-red-600 font-semibold text-sm">⚠️ ÉCHÉANCE DÉPASSÉE</p>
              <p className="text-red-500 text-xs mt-1">Action immédiate requise</p>
            </motion.div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center items-center space-x-4 mb-2">
                <div className="text-center">
                  <div className={`text-xl font-bold ${status.color}`}>{timeLeft.days}</div>
                  <div className="text-xs text-muted-foreground">jours</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${status.color}`}>{timeLeft.hours}</div>
                  <div className="text-xs text-muted-foreground">heures</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${status.color}`}>{timeLeft.minutes}</div>
                  <div className="text-xs text-muted-foreground">min</div>
                </div>
              </div>
              
              {isUrgent && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-orange-600 font-medium flex items-center justify-center"
                >
                  <Clock className="h-3 w-3 mr-1" />
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