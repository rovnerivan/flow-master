import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, CheckCircle, BookOpen, Calendar, Heart } from 'lucide-react';

interface TeamMemberData {
  id: string;
  name: string;
  cargo: string;
  cargoDescription: string;
  skills: string[];
  usualTasks: { id: string; title: string; frequency: string }[];
  usualProcesses: { id: string; title: string }[];
  funFact?: string;
  joinedDate: string;
}

interface TeamMemberModalProps {
  member: TeamMemberData | null;
  open: boolean;
  onClose: () => void;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ member, open, onClose }) => {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{member.name}</p>
              <p className="text-sm text-primary font-normal">{member.cargo}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Cargo Description */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Sobre su cargo</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {member.cargoDescription}
            </p>
          </div>

          {/* Skills */}
          {member.skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Habilidades clave
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Usual Tasks */}
          {member.usualTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Tareas usuales
              </h3>
              <div className="space-y-2">
                {member.usualTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-background border border-border"
                  >
                    <span className="text-sm text-foreground">{task.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {task.frequency}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usual Processes */}
          {member.usualProcesses.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Procesos asignados
              </h3>
              <div className="space-y-2">
                {member.usualProcesses.map((process) => (
                  <div 
                    key={process.id} 
                    className="p-2 rounded-lg bg-background border border-border"
                  >
                    <span className="text-sm text-foreground">{process.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fun Fact */}
          {member.funFact && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Dato curioso</p>
              <p className="text-sm text-foreground italic">"{member.funFact}"</p>
            </div>
          )}

          {/* Join Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Calendar className="w-3 h-3" />
            <span>En el equipo desde {member.joinedDate}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
