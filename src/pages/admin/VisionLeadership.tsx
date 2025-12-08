import React, { useState, useRef } from 'react';
import { Plus, Video, Mic, FileText, Link2, MoreVertical, Edit, Trash2, Eye, Play, Search, Users, Building2, UserCheck, GitBranch, Layers, Upload, Image, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type TargetType = 'all_organization' | 'direct_reports' | 'all_subordinates' | 'specific_users' | 'specific_levels' | 'specific_branches';
type HierarchyLevel = 'owner' | 'admin' | 'supervisor' | 'employee';

interface ContentItem {
  id: string;
  type: 'video' | 'audio' | 'text' | 'link' | 'image' | 'document';
  content: string;
  fileName?: string;
}

interface CultureContent {
  id: string;
  title: string;
  content_type: string;
  content: string;
  category: string;
  target_type: TargetType;
  target_user_ids: string[];
  target_levels: HierarchyLevel[];
  target_branch_user_ids: string[];
  include_indirect_subordinates: boolean;
  is_active: boolean;
  views_count: number;
  created_at: string;
  creator_id: string;
}

interface Subordinate {
  id: string;
  full_name: string;
  job_title: string | null;
  reports_to_id: string | null;
  role?: string;
}

const categories = ['Visión', 'Motivación', 'Celebración', 'Valores', 'Recursos', 'Anuncios'];

const targetTypeOptions: { value: TargetType; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'all_organization', label: 'Toda la organización', description: 'Todos los miembros del equipo', icon: Building2 },
  { value: 'direct_reports', label: 'Subordinados directos', description: 'Solo quienes reportan directamente a ti', icon: UserCheck },
  { value: 'all_subordinates', label: 'Todos mis subordinados', description: 'Directos e indirectos en tu cadena', icon: Users },
  { value: 'specific_levels', label: 'Por nivel jerárquico', description: 'Elegir niveles específicos', icon: Layers },
  { value: 'specific_branches', label: 'Por gerencia/área', description: 'Elegir gerencias o áreas específicas', icon: GitBranch },
  { value: 'specific_users', label: 'Usuarios específicos', description: 'Seleccionar personas una a una', icon: UserCheck },
];

const hierarchyLevelLabels: Record<HierarchyLevel, string> = {
  owner: 'Dueños/Socios',
  admin: 'Gerentes',
  supervisor: 'Supervisores',
  employee: 'Empleados',
};

const contentTypeConfig = {
  text: { icon: FileText, label: 'Texto', color: 'bg-blue-500/20 text-blue-400' },
  video: { icon: Video, label: 'Video', color: 'bg-red-500/20 text-red-400' },
  audio: { icon: Mic, label: 'Audio', color: 'bg-purple-500/20 text-purple-400' },
  link: { icon: Link2, label: 'Enlace', color: 'bg-green-500/20 text-green-400' },
  image: { icon: Image, label: 'Imagen', color: 'bg-amber-500/20 text-amber-400' },
  document: { icon: File, label: 'Documento', color: 'bg-cyan-500/20 text-cyan-400' },
};

const getTargetLabel = (content: CultureContent) => {
  switch (content.target_type) {
    case 'all_organization': return 'Toda la organización';
    case 'direct_reports': return 'Subordinados directos';
    case 'all_subordinates': return 'Todos mis subordinados';
    case 'specific_levels': return `Niveles: ${content.target_levels.map(l => hierarchyLevelLabels[l]).join(', ')}`;
    case 'specific_branches': return `${content.target_branch_user_ids.length} área(s)`;
    case 'specific_users': return `${content.target_user_ids.length} persona(s)`;
  }
};

const getMainContentType = (content: CultureContent) => {
  // Parse content_type which might be comma-separated now
  const types = content.content_type.split(',');
  return types[0] as keyof typeof contentTypeConfig;
};

export const VisionLeadership: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  
  // Multiple content items
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Visión',
    targetType: 'direct_reports' as TargetType,
    targetUserIds: [] as string[],
    targetLevels: [] as HierarchyLevel[],
    targetBranchUserIds: [] as string[],
    includeIndirectSubordinates: true,
  });

  // File input refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch user's role
  const { data: userRole } = useQuery({
    queryKey: ['userRole', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();
      return data?.role;
    },
    enabled: !!currentUser?.id,
  });

  // Fetch subordinates
  const { data: subordinates = [] } = useQuery({
    queryKey: ['subordinates', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', currentUser.id)
        .single();
      
      if (!profile?.team_id) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, job_title, reports_to_id')
        .eq('team_id', profile.team_id);
      
      if (!profiles) return [];

      const userIds = profiles.map(p => p.id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return profiles.map(p => ({
        ...p,
        role: roleMap.get(p.id) || 'employee',
      })) as Subordinate[];
    },
    enabled: !!currentUser?.id,
  });

  const branchRoots = subordinates.filter(s => 
    s.role === 'business_admin' || s.role === 'supervisor'
  );

  // Fetch culture content
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['cultureContent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('culture_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CultureContent[];
    },
  });

  // Create content mutation
  const createMutation = useMutation({
    mutationFn: async (newContent: Partial<CultureContent>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (!profile?.team_id) throw new Error('No tienes un equipo asignado');

      const { data, error } = await supabase
        .from('culture_content')
        .insert([{
          title: newContent.title,
          content_type: newContent.content_type,
          content: newContent.content,
          category: newContent.category,
          target_type: newContent.target_type,
          target_user_ids: newContent.target_user_ids,
          target_levels: newContent.target_levels,
          target_branch_user_ids: newContent.target_branch_user_ids,
          include_indirect_subordinates: newContent.include_indirect_subordinates,
          is_active: newContent.is_active,
          team_id: profile.team_id,
          creator_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultureContent'] });
      toast.success('Contenido publicado exitosamente');
      setShowCreator(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Error al publicar: ' + error.message);
    },
  });

  // Set active mutation
  const setActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from('culture_content')
        .update({ is_active: false })
        .neq('id', id);
      
      const { error } = await supabase
        .from('culture_content')
        .update({ is_active: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultureContent'] });
      toast.success('Contenido establecido como activo');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('culture_content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultureContent'] });
      toast.success('Contenido eliminado');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Visión',
      targetType: 'direct_reports',
      targetUserIds: [],
      targetLevels: [],
      targetBranchUserIds: [],
      includeIndirectSubordinates: true,
    });
    setContentItems([{ id: '1', type: 'text', content: '' }]);
  };

  const addContentItem = (type: ContentItem['type']) => {
    setContentItems([...contentItems, { 
      id: Date.now().toString(), 
      type, 
      content: '' 
    }]);
  };

  const updateContentItem = (id: string, content: string, fileName?: string) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? { ...item, content, fileName } : item
    ));
  };

  const removeContentItem = (id: string) => {
    if (contentItems.length > 1) {
      setContentItems(contentItems.filter(item => item.id !== id));
    }
  };

  const handleFileUpload = (itemId: string, file: File, type: ContentItem['type']) => {
    // In real implementation, upload to Supabase Storage
    // For now, create a local URL
    const url = URL.createObjectURL(file);
    updateContentItem(itemId, url, file.name);
    toast.success(`${file.name} cargado`);
  };

  const handleCreate = () => {
    if (!formData.title) {
      toast.error('Ingresa un título');
      return;
    }
    
    const validItems = contentItems.filter(item => item.content.trim());
    if (validItems.length === 0) {
      toast.error('Agrega al menos un contenido');
      return;
    }

    // Build content string (JSON for multiple items)
    const contentTypes = validItems.map(item => item.type).join(',');
    const contentData = validItems.length === 1 
      ? validItems[0].content 
      : JSON.stringify(validItems.map(item => ({
          type: item.type,
          content: item.content,
          fileName: item.fileName
        })));

    createMutation.mutate({
      title: formData.title,
      content_type: contentTypes,
      content: contentData,
      category: formData.category,
      target_type: formData.targetType,
      target_user_ids: formData.targetUserIds,
      target_levels: formData.targetLevels,
      target_branch_user_ids: formData.targetBranchUserIds,
      include_indirect_subordinates: formData.includeIndirectSubordinates,
      is_active: true,
    });
  };

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine available target options based on role
  const availableTargetOptions = targetTypeOptions.filter(opt => {
    if (userRole === 'business_admin' || userRole === 'super_admin') {
      return true;
    }
    if (userRole === 'supervisor' && opt.value === 'all_organization') {
      return false;
    }
    return true;
  });

  const renderContentItemEditor = (item: ContentItem, index: number) => {
    const config = contentTypeConfig[item.type];
    const Icon = config.icon;

    return (
      <div key={item.id} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", config.color)}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm text-foreground">{config.label}</span>
            {item.fileName && (
              <span className="text-xs text-muted-foreground">({item.fileName})</span>
            )}
          </div>
          {contentItems.length > 1 && (
            <button
              onClick={() => removeContentItem(item.id)}
              className="p-1 rounded hover:bg-destructive/10 text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {item.type === 'text' && (
          <Textarea
            placeholder="Escribe tu mensaje inspiracional..."
            value={item.content}
            onChange={(e) => updateContentItem(item.id, e.target.value)}
            rows={4}
          />
        )}

        {item.type === 'link' && (
          <Input
            placeholder="https://..."
            value={item.content}
            onChange={(e) => updateContentItem(item.id, e.target.value)}
          />
        )}

        {(item.type === 'video' || item.type === 'audio') && (
          <div className="space-y-3">
            <Input
              placeholder={item.type === 'video' ? 'https://youtube.com/...' : 'https://soundcloud.com/...'}
              value={item.content}
              onChange={(e) => updateContentItem(item.id, e.target.value)}
            />
            <div className="text-center">
              <span className="text-xs text-muted-foreground">o</span>
            </div>
            <input
              ref={item.type === 'video' ? videoInputRef : audioInputRef}
              type="file"
              accept={item.type === 'video' ? 'video/*' : 'audio/*'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(item.id, file, item.type);
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (item.type === 'video') videoInputRef.current?.click();
                else audioInputRef.current?.click();
              }}
            >
              <Upload className="w-4 h-4" />
              Subir archivo {item.type === 'video' ? 'de video' : 'de audio'}
            </Button>
          </div>
        )}

        {item.type === 'image' && (
          <div className="space-y-3">
            {item.content && (
              <div className="rounded-lg overflow-hidden max-h-48">
                <img src={item.content} alt="Preview" className="w-full object-cover" />
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(item.id, file, 'image');
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => imageInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {item.content ? 'Cambiar imagen' : 'Subir imagen'}
            </Button>
          </div>
        )}

        {item.type === 'document' && (
          <div className="space-y-3">
            {item.fileName && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
                <File className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground flex-1">{item.fileName}</span>
              </div>
            )}
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(item.id, file, 'document');
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => documentInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {item.content ? 'Cambiar documento' : 'Subir documento'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visión y Liderazgo</h1>
          <p className="text-muted-foreground">
            Crea contenido inspiracional para tu equipo
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowCreator(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Mensaje
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar contenido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContents.map((content) => {
          const mainType = getMainContentType(content);
          const TypeIcon = contentTypeConfig[mainType]?.icon || FileText;
          const typeColor = contentTypeConfig[mainType]?.color || 'bg-blue-500/20 text-blue-400';
          const hasMultiple = content.content_type.includes(',');
          
          return (
            <div
              key={content.id}
              className={cn(
                "kpi-card hover:border-primary/30 transition-colors",
                content.is_active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", typeColor)}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  {hasMultiple && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                      +{content.content_type.split(',').length - 1}
                    </span>
                  )}
                  {content.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                      Activo
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-secondary">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border border-border">
                      <DropdownMenuItem onClick={() => setActiveMutation.mutate(content.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Establecer como activo
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Vista previa
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(content.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {content.title}
              </h3>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                  {content.category}
                </span>
                <span>{new Date(content.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Users className="w-3 h-3" />
                <span>{getTargetLabel(content)}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{content.views_count} visualizaciones</span>
                <span className="capitalize">
                  {hasMultiple ? 'Múltiple' : contentTypeConfig[mainType]?.label || mainType}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!isLoading && filteredContents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No hay contenido</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primer mensaje inspiracional para el equipo
          </p>
          <Button variant="hero" onClick={() => setShowCreator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear contenido
          </Button>
        </div>
      )}

      {/* Creator Dialog */}
      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear mensaje de liderazgo</DialogTitle>
            <DialogDescription>
              Combina texto, videos, audios, imágenes y documentos en un solo mensaje
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Título
              </label>
              <Input
                placeholder="Ej: Mensaje de bienvenida al nuevo trimestre"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-colors",
                      formData.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Items */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground block">
                Contenido
              </label>
              
              {contentItems.map((item, index) => renderContentItemEditor(item, index))}

              {/* Add Content Buttons */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(contentTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => addContentItem(type as ContentItem['type'])}
                    >
                      <Icon className="w-4 h-4" />
                      + {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground block">
                ¿A quién va dirigido?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableTargetOptions.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      targetType: value,
                      targetUserIds: [],
                      targetLevels: [],
                      targetBranchUserIds: [],
                    }))}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      formData.targetType === value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        formData.targetType === value
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium text-sm",
                          formData.targetType === value ? "text-primary" : "text-foreground"
                        )}>
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Specific Levels Selection */}
              {formData.targetType === 'specific_levels' && (
                <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <p className="text-sm font-medium text-foreground">Selecciona los niveles:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(hierarchyLevelLabels) as [HierarchyLevel, string][]).map(([level, label]) => (
                      <label
                        key={level}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                          formData.targetLevels.includes(level)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          checked={formData.targetLevels.includes(level)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              targetLevels: checked
                                ? [...prev.targetLevels, level]
                                : prev.targetLevels.filter(l => l !== level)
                            }));
                          }}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Branches Selection */}
              {formData.targetType === 'specific_branches' && (
                <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <p className="text-sm font-medium text-foreground">Selecciona las gerencias/áreas:</p>
                  {branchRoots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay gerencias o supervisores disponibles</p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {branchRoots.map((person) => (
                          <label
                            key={person.id}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                              formData.targetBranchUserIds.includes(person.id)
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-primary/50"
                            )}
                          >
                            <Checkbox
                              checked={formData.targetBranchUserIds.includes(person.id)}
                              onCheckedChange={(checked) => {
                                setFormData(prev => ({
                                  ...prev,
                                  targetBranchUserIds: checked
                                    ? [...prev.targetBranchUserIds, person.id]
                                    : prev.targetBranchUserIds.filter(id => id !== person.id)
                                }));
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium">{person.full_name}</p>
                              <p className="text-xs text-muted-foreground">{person.job_title || person.role}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={formData.includeIndirectSubordinates}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              includeIndirectSubordinates: !!checked
                            }));
                          }}
                        />
                        <span>Incluir subordinados indirectos de cada área</span>
                      </label>
                    </>
                  )}
                </div>
              )}

              {/* Specific Users Selection */}
              {formData.targetType === 'specific_users' && (
                <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <p className="text-sm font-medium text-foreground">Selecciona las personas:</p>
                  {subordinates.filter(s => s.id !== currentUser?.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay personas disponibles</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {subordinates.filter(s => s.id !== currentUser?.id).map((person) => (
                        <label
                          key={person.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                            formData.targetUserIds.includes(person.id)
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          <Checkbox
                            checked={formData.targetUserIds.includes(person.id)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                targetUserIds: checked
                                  ? [...prev.targetUserIds, person.id]
                                  : prev.targetUserIds.filter(id => id !== person.id)
                              }));
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium">{person.full_name}</p>
                            <p className="text-xs text-muted-foreground">{person.job_title || person.role}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreator(false)}>
                Cancelar
              </Button>
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisionLeadership;
