"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

interface Event {
  id: string;
  date: Date;
  title: string;
  type: "deadline" | "meeting" | "payment" | "reminder";
  priority: "high" | "medium" | "low";
}

const events: Event[] = [
  {
    id: "1",
    date: new Date(2024, 11, 15),
    title: "Échéance TVA Q4",
    type: "deadline",
    priority: "high"
  },
  {
    id: "2",
    date: new Date(2024, 11, 20),
    title: "Paiement client ABC",
    type: "payment",
    priority: "medium"
  },
  {
    id: "3",
    date: new Date(2024, 11, 25),
    title: "Réunion projet XYZ",
    type: "meeting",
    priority: "medium"
  },
  {
    id: "4",
    date: new Date(2024, 11, 31),
    title: "Clôture comptable",
    type: "deadline",
    priority: "high"
  }
];

const getEventColor = (type: string, priority: string) => {
  if (priority === "high") return "bg-red-500";
  if (type === "payment") return "bg-green-500";
  if (type === "meeting") return "bg-blue-500";
  return "bg-orange-500";
};

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          Calendrier & Échéances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium text-sm">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={index} className="text-center text-gray-500 font-medium p-1">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const hasEvents = dayEvents.length > 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative p-1 text-xs rounded transition-colors
                  ${isTodayDate ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                  ${isSelected ? 'bg-blue-500 text-white' : ''}
                  ${!isTodayDate && !isSelected ? 'hover:bg-gray-100' : ''}
                  ${!isSameMonth(day, currentDate) ? 'text-gray-300' : ''}
                `}
              >
                {format(day, 'd')}
                {hasEvents && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`w-1 h-1 rounded-full ${getEventColor(event.type, event.priority)}`}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Date Events */}
        {selectedDate && selectedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 p-3 bg-gray-50 rounded-lg"
          >
            <h4 className="font-medium text-sm text-gray-900">
              {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </h4>
            {selectedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${getEventColor(event.type, event.priority)}`} />
                <span className="text-gray-700">{event.title}</span>
                {event.priority === 'high' && (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Upcoming Events */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Prochaines échéances
          </h4>
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs"
            >
              <div className={`w-2 h-2 rounded-full ${getEventColor(event.type, event.priority)}`} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-gray-500">
                  {format(event.date, 'dd MMM', { locale: fr })}
                </div>
              </div>
              {event.priority === 'high' && (
                <AlertCircle className="h-3 w-3 text-red-500" />
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}