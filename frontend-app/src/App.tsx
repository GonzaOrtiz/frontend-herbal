import { useCallback, useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Box,
  Tabs,
  Tab,
  Stack,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useMediaQuery,
  Container,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SvgIcon from '@mui/material/SvgIcon';
import ConfiguracionModule from './modules/configuracion';
import OperacionModule from './modules/operacion';
import CostosModule from './modules/costos';
import ImportacionesModule from './modules/importaciones';
import ReportesModule from './modules/reportes';
import { buildOperacionRoutes } from './modules/operacion/routes';
import { buildCostosRoutes } from './modules/costos/routes';
import { buildReportesRoutes } from './modules/reportes/routes';
import type { OperacionModulo } from './modules/operacion/types';
import type { CostosSubModulo } from './modules/costos/types';
import type { ImportacionesSection } from './modules/importaciones/types';
import type { ReportCategory } from './modules/reportes/types';
import './App.css';

type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: JSX.Element;
};

type DomainKey = 'configuracion' | 'operacion' | 'importaciones' | 'costos' | 'reportes';

type DomainAction = {
  label: string;
  variant?: 'primary' | 'default';
};

type SidebarStat = {
  value: string;
  label: string;
};

type DomainConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  logo: string;
  actions: DomainAction[];
  overview: {
    description: string;
    stats: SidebarStat[];
  };
  shortcuts: string[];
};

type SidebarIconName =
  | 'dashboard'
  | 'sliders'
  | 'factory'
  | 'users'
  | 'workflow'
  | 'consumos'
  | 'producciones'
  | 'litros'
  | 'perdidas'
  | 'sobrantes'
  | 'gastos'
  | 'depreciaciones'
  | 'sueldos'
  | 'prorrateo'
  | 'importar'
  | 'bitacoras'
  | 'financieros'
  | 'operativos-reportes'
  | 'auditoria-reportes';

type EnhancedNavItem = NavItem & {
  onSelect?: () => void;
  isActive?: boolean;
};

const drawerWidth = 304;

const importacionesNavigation: {
  id: ImportacionesSection;
  label: string;
  description: string;
  icon: SidebarIconName;
}[] = [
  {
    id: 'importar',
    label: 'Importar archivo MDB',
    description: 'Carga archivos Access y distribuye la información entre módulos.',
    icon: 'importar',
  },
  {
    id: 'historial',
    label: 'Historial de bitácoras',
    description: 'Administra y audita las importaciones registradas.',
    icon: 'bitacoras',
  },
];

const domainConfigs: Record<DomainKey, DomainConfig> = {
  configuracion: {
    eyebrow: 'Suite Herbal ERP',
    title: 'Configuración y catálogos',
    subtitle:
      'Administra los catálogos maestros y parámetros generales utilizados por los módulos operativos.',
    logo: '🌿',
    actions: [
      { label: 'Agregar catálogo', variant: 'primary' },
      { label: 'Centro de ayuda' },
    ],
    overview: {
      description:
        'Consulta el estado general de los catálogos y mantén visibles las dependencias clave antes de publicar cambios.',
      stats: [
        { value: '4', label: 'Catálogos activos' },
        { value: '3', label: 'Dependencias críticas' },
        { value: 'En línea', label: 'Estado de sincronización' },
      ],
    },
    shortcuts: ['Revisar dependencias', 'Programar sincronización', 'Descargar respaldo'],
  },
  operacion: {
    eyebrow: 'Suite Herbal ERP · Operación',
    title: 'Operación diaria',
    subtitle:
      'Captura y monitorea consumos, producciones, litros, pérdidas y sobrantes con trazabilidad y cierres controlados.',
    logo: '🛠️',
    actions: [
      { label: 'Nueva importación', variant: 'primary' },
      { label: 'Ver bitácoras' },
    ],
    overview: {
      description:
        'Supervisa la captura diaria, valida cierres pendientes y sincroniza los módulos dependientes en tiempo real.',
      stats: [
        { value: '5', label: 'Turnos abiertos' },
        { value: '2', label: 'Bloqueos activos' },
        { value: '92%', label: 'Sincronización completada' },
      ],
    },
    shortcuts: ['Revisar consumos pendientes', 'Descargar bitácoras', 'Configurar alertas'],
  },
  costos: {
    eyebrow: 'Suite Herbal ERP · Costos',
    title: 'Costos y consolidaciones',
    subtitle:
      'Controla gastos, depreciaciones, sueldos y monitorea las consolidaciones automáticas con trazabilidad completa.',
    logo: '💰',
    actions: [
      { label: 'Reprocesar consolidación', variant: 'primary' },
      { label: 'Historial de bitácoras' },
    ],
    overview: {
      description:
        'Consulta balances, identifica variaciones entre periodos y navega rápidamente hacia existencias y asientos relacionados.',
      stats: [
        { value: '3', label: 'Procesos en curso' },
        { value: '12', label: 'Alertas de balance' },
        { value: 'Actual', label: 'Periodo activo' },
      ],
    },
    shortcuts: ['Ver existencias', 'Ir a asientos', 'Descargar bitácora'],
  },
  reportes: {
    eyebrow: 'Suite Herbal ERP · Analítica',
    title: 'Reportes y analítica',
    subtitle:
      'Explora indicadores financieros, operativos y de auditoría con filtros avanzados y exportaciones seguras.',
    logo: '📊',
    actions: [
      { label: 'Descargar guía rápida' },
      { label: 'Solicitar nuevo reporte', variant: 'primary' },
    ],
    overview: {
      description:
        'Comparte vistas filtradas, monitorea descargas recientes y asegura el cumplimiento de los indicadores clave.',
      stats: [
        { value: '7', label: 'Reportes disponibles' },
        { value: '3', label: 'Descargas hoy' },
        { value: 'AA', label: 'Nivel de accesibilidad' },
      ],
    },
    shortcuts: ['Ver KPIs financieros', 'Explorar consumos', 'Auditar exportaciones'],
  },
  importaciones: {
    eyebrow: 'Suite Herbal ERP · Importaciones',
    title: 'Importación de bases Access',
    subtitle:
      'Carga archivos .mdb, monitorea el procesamiento por tabla y gestiona las bitácoras generadas automáticamente.',
    logo: '📥',
    actions: [
      { label: 'Nueva importación', variant: 'primary' },
      { label: 'Bitácoras recientes' },
    ],
    overview: {
      description:
        'Controla la trazabilidad de las importaciones, revisa los resultados por tabla y audita los movimientos generados.',
      stats: [
        { value: '3', label: 'Importaciones en revisión' },
        { value: '12', label: 'Tablas importadas hoy' },
        { value: 'Sin alertas', label: 'Estado del proceso' },
      ],
    },
    shortcuts: ['Ver últimas bitácoras', 'Descargar log de auditoría', 'Configurar alertas'],
  },
};

const domainEntries: { id: DomainKey; label: string }[] = [
  { id: 'configuracion', label: 'Configuración' },
  { id: 'operacion', label: 'Operación diaria' },
  { id: 'importaciones', label: 'Importaciones MDB' },
  { id: 'costos', label: 'Costos y consolidaciones' },
  { id: 'reportes', label: 'Reportes y analítica' },
];

function SidebarIcon({ name }: { name: SidebarIconName }) {
  switch (name) {
    case 'dashboard':
      return (
        <SvgIcon fontSize="small">
          <path d="M4 13h6v7H4zm10-9h6v16h-6zM4 4h6v7H4zm10 9h6v7h-6z" fill="currentColor" />
        </SvgIcon>
      );
    case 'sliders':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M9 5a2 2 0 1 1-4 0H3V3h2a2 2 0 1 1 4 0h12v2H9zm8 8a2 2 0 1 1 4 0h2v2h-2a2 2 0 1 1-4 0H3v-2h14zm-8 6a2 2 0 1 1-4 0H3v-2h2a2 2 0 1 1 4 0h12v2H9z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'factory':
      return (
        <SvgIcon fontSize="small">
          <path d="M3 21V9l6 4V9l6 4V5l6 3v13H3zm12-7h2v-2h-2zm0 4h2v-2h-2zm-4-4h2v-2h-2zm0 4h2v-2h-2z" fill="currentColor" />
        </SvgIcon>
      );
    case 'users':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-4 6c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4zm8-7a3 3 0 1 0-6 0 3 3 0 0 0 6 0zm-1 7c1.298.607 2 1.398 2 2.3V21h-3v-2c0-.673-.342-1.3-.959-1.87z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'workflow':
      return (
        <SvgIcon fontSize="small">
          <path d="M7 4h10v6H7zm12 14h-4v-4h-2v4H5v-6h4v-4h2v4h6V8h2z" fill="currentColor" />
        </SvgIcon>
      );
    case 'consumos':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M12 2c-1.657 0-3 1.79-3 4v1H7a3 3 0 0 0-3 3v2h16V10a3 3 0 0 0-3-3h-2V6c0-2.21-1.343-4-3-4zm-8 12v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4H4z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'producciones':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M4 4h4l2 3h4l2-3h4v6h-4l-2 3h-4l-2-3H4zM4 18h16v2H4z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'litros':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M12 2 7 9c0 3.314 2.239 6 5 6s5-2.686 5-6l-5-7zm0 20a5 5 0 0 1-5-5h2a3 3 0 0 0 6 0h2a5 5 0 0 1-5 5z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'perdidas':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M12 2 3 22h18L12 2zm0 4 6.16 14H5.84L12 6zm-1 5v5h2v-5h-2zm0 6v2h2v-2h-2z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'sobrantes':
      return (
        <SvgIcon fontSize="small">
          <path d="M4 4h16v10H5.414L4 15.414V4zm6 14h10v2H10v-2z" fill="currentColor" />
        </SvgIcon>
      );
    case 'gastos':
      return (
        <SvgIcon fontSize="small">
          <path d="M4 5h16v2H4zm2 4h12v2H6zm-2 4h16v6H4z" fill="currentColor" />
        </SvgIcon>
      );
    case 'depreciaciones':
      return (
        <SvgIcon fontSize="small">
          <path d="M12 2 3 7v2h18V7l-9-5zm-9 9h18v11H3zm5 2v7h2v-7zm4 0v7h2v-7zm4 0v7h2v-7z" fill="currentColor" />
        </SvgIcon>
      );
    case 'sueldos':
      return (
        <SvgIcon fontSize="small">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.314 0-8 1.657-8 5v3h16v-3c0-3.343-4.686-5-8-5z" fill="currentColor" />
        </SvgIcon>
      );
    case 'prorrateo':
      return (
        <SvgIcon fontSize="small">
          <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8zm1 1v9h9a9 9 0 0 0-9-9z" fill="currentColor" />
        </SvgIcon>
      );
    case 'importar':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M12 2a3 3 0 0 1 3 3v6.586l1.293-1.293 1.414 1.414L12 16.414 6.293 11.707l1.414-1.414L9 11.586V5a3 3 0 0 1 3-3zm-7 14h2v4h10v-4h2v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'bitacoras':
      return (
        <SvgIcon fontSize="small">
          <path
            d="M6 3a3 3 0 0 0-3 3v13h2.5l1 2H19a2 2 0 0 0 2-2V6a3 3 0 0 0-3-3H6zm0 2h12a1 1 0 0 1 1 1v13H8.5l-1-2H5V6a1 1 0 0 1 1-1zm2 3v2h8V8H8zm0 4v2h6v-2H8z"
            fill="currentColor"
          />
        </SvgIcon>
      );
    case 'financieros':
      return (
        <SvgIcon fontSize="small">
          <path d="M4 4h4v16H4zm6 6h4v10h-4zm6-4h4v14h-4z" fill="currentColor" />
        </SvgIcon>
      );
    case 'operativos-reportes':
      return (
        <SvgIcon fontSize="small">
          <path d="M3 5h18v2H3zm0 6h12v2H3zm0 6h18v2H3zM19 9h2v2h-2zm-4 6h2v2h-2z" fill="currentColor" />
        </SvgIcon>
      );
    case 'auditoria-reportes':
      return (
        <SvgIcon fontSize="small">
          <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8v2l4-3-4-3v2zM9 11h2v5H9zm4 0h2v5h-2z" fill="currentColor" />
        </SvgIcon>
      );
    default:
      return null;
  }
}

const buildConfiguracionNavigation = ({
  activeRouteId,
  onSelectRoute,
}: {
  activeRouteId: string;
  onSelectRoute: (routeId: string) => void;
}): EnhancedNavItem[] => {
  const items: Array<{
    id: string;
    label: string;
    description: string;
    icon: SidebarIconName;
    routeId?: string;
  }> = [
    {
      id: 'overview',
      label: 'Panel general',
      description: 'Monitorea el estado global de los catálogos y sus dependencias.',
      icon: 'dashboard',
    },
    {
      id: 'parametros',
      label: 'Parámetros generales',
      description: 'Ajusta políticas y parámetros maestros del sistema.',
      icon: 'sliders',
      routeId: 'parametros-generales',
    },
    {
      id: 'centros',
      label: 'Centros de producción',
      description: 'Administra ubicaciones, responsables y capacidades.',
      icon: 'factory',
      routeId: 'centros',
    },
    {
      id: 'empleados',
      label: 'Personal operativo',
      description: 'Gestiona credenciales, roles y perfiles por área.',
      icon: 'users',
      routeId: 'empleados',
    },
    {
      id: 'actividades',
      label: 'Actividades',
      description: 'Define etapas de producción y tareas dependientes.',
      icon: 'workflow',
      routeId: 'actividades',
    },
  ];

  return items.map((item) => {
    const routeId = item.routeId;
    return {
      id: item.id,
      label: item.label,
      description: item.description,
      icon: <SidebarIcon name={item.icon} />,
      onSelect: routeId ? () => onSelectRoute(routeId) : undefined,
      isActive: routeId ? routeId === activeRouteId : false,
    };
  });
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const headerOffset = isMobile ? 184 : 168;
  const highlightColor = alpha(theme.palette.primary.main, 0.08);
  const highlightHoverColor = alpha(theme.palette.primary.main, 0.12);
  const statBackground = alpha(theme.palette.primary.main, 0.08);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ overview: true, shortcuts: false });
  const [activeDomain, setActiveDomain] = useState<DomainKey>('configuracion');
  const [configuracionRouteId, setConfiguracionRouteId] = useState('actividades');
  const [operacionModulo, setOperacionModulo] = useState<OperacionModulo>('consumos');
  const [costosModulo, setCostosModulo] = useState<CostosSubModulo>('gastos');
  const [importacionesSection, setImportacionesSection] = useState<ImportacionesSection>('importar');
  const [reportesCategory, setReportesCategory] = useState<ReportCategory>('financieros');

  const operacionRoutes = useMemo(() => buildOperacionRoutes(), []);
  const costosRoutes = useMemo(() => buildCostosRoutes(), []);
  const reportesRoutes = useMemo(() => buildReportesRoutes(), []);

  const handleConfiguracionRouteChange = useCallback(
    (routeId: string) => {
      setConfiguracionRouteId(routeId);
      if (isMobile) {
        setMobileOpen(false);
      }
    },
    [isMobile],
  );

  const navigationItems = useMemo<EnhancedNavItem[]>(() => {
    if (activeDomain === 'operacion') {
      return operacionRoutes.map((route) => ({
        id: route.id,
        label: route.title,
        description: route.description,
        icon: <SidebarIcon name={route.id} />,
        onSelect: () => setOperacionModulo(route.id),
        isActive: route.id === operacionModulo,
      }));
    }
    if (activeDomain === 'costos') {
      return costosRoutes.map((route) => ({
        id: route.id,
        label: route.title,
        description: route.description,
        icon: <SidebarIcon name={route.id} />,
        onSelect: () => setCostosModulo(route.id),
        isActive: route.id === costosModulo,
      }));
    }
    if (activeDomain === 'reportes') {
      return reportesRoutes.map((route) => {
        const iconName: SidebarIconName =
          route.id === 'financieros'
            ? 'financieros'
            : route.id === 'operativos'
              ? 'operativos-reportes'
              : 'auditoria-reportes';
        return {
          id: route.id,
          label: route.title,
          description: route.description,
          icon: <SidebarIcon name={iconName} />,
          onSelect: () => setReportesCategory(route.id),
          isActive: route.id === reportesCategory,
        };
      });
    }
    if (activeDomain === 'importaciones') {
      return importacionesNavigation.map((item) => ({
        id: item.id,
        label: item.label,
        description: item.description,
        icon: <SidebarIcon name={item.icon} />,
        onSelect: () => setImportacionesSection(item.id),
        isActive: item.id === importacionesSection,
      }));
    }
    return buildConfiguracionNavigation({
      activeRouteId: configuracionRouteId,
      onSelectRoute: handleConfiguracionRouteChange,
    });
  }, [
    activeDomain,
    configuracionRouteId,
    costosModulo,
    costosRoutes,
    handleConfiguracionRouteChange,
    importacionesSection,
    operacionModulo,
    operacionRoutes,
    reportesCategory,
    reportesRoutes,
  ]);

  const domainConfig = domainConfigs[activeDomain];

  const handleDrawerToggle = () => {
    setMobileOpen((open) => !open);
  };

  const handleDomainChange = (_event: React.SyntheticEvent, value: DomainKey) => {
    setActiveDomain(value);
    setExpandedSections({ overview: true, shortcuts: false });
  };

  const handleAccordionChange = (section: 'overview' | 'shortcuts') => (
    _event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpandedSections((prev) => ({ ...prev, [section]: isExpanded }));
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="overline" color="text.secondary">
          Navegación contextual
        </Typography>
        <List sx={{ p: 0 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  item.onSelect?.();
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                selected={Boolean(item.isActive)}
                disabled={!item.onSelect}
                sx={{
                  borderRadius: 2,
                  alignItems: 'flex-start',
                  py: 1.25,
                  px: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: highlightColor,
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: highlightHoverColor,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.25, color: item.isActive ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: item.isActive ? 600 : 500,
                    color: item.isActive ? 'primary.main' : 'text.primary',
                  }}
                  secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Accordion
          elevation={0}
          disableGutters
          expanded={expandedSections.overview}
          onChange={handleAccordionChange('overview')}
          sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="overview-content" id="overview-header">
            <Typography variant="subtitle2">Resumen del módulo</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {domainConfig.overview.description}
            </Typography>
            <Stack spacing={1.5}>
              {domainConfig.overview.stats.map((stat) => (
                <Paper key={stat.label} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion
          elevation={0}
          disableGutters
          expanded={expandedSections.shortcuts}
          onChange={handleAccordionChange('shortcuts')}
          sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="shortcuts-content" id="shortcuts-header">
            <Typography variant="subtitle2">Atajos recomendados</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {domainConfig.shortcuts.map((shortcut) => (
                <Button
                  key={shortcut}
                  variant="text"
                  color="primary"
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={() => {
                    if (isMobile) {
                      setMobileOpen(false);
                    }
                  }}
                >
                  {shortcut}
                </Button>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="default"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 2, py: 2, px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} aria-label="Abrir menú">
                <MenuIcon />
              </IconButton>
            )}
            <Paper
              elevation={0}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                fontSize: 24,
                bgcolor: highlightColor,
                color: 'primary.main',
              }}
              aria-hidden="true"
            >
              {domainConfig.logo}
            </Paper>
            <Box sx={{ flexGrow: 1, minWidth: 220 }}>
              <Typography variant="caption" color="text.secondary">
                {domainConfig.eyebrow}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                {domainConfig.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {domainConfig.subtitle}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            >
              {domainConfig.actions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant === 'primary' ? 'contained' : 'outlined'}
                  color={action.variant === 'primary' ? 'primary' : 'inherit'}
                  size="small"
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Stack>
          <Tabs
            value={activeDomain}
            onChange={handleDomainChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{ sx: { height: 3, borderRadius: 1 } }}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 0,
              },
            }}
          >
            {domainEntries.map((entry) => (
              <Tab key={entry.id} label={entry.label} value={entry.id} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="Panel lateral">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              mt: { md: `${headerOffset}px`, xs: 0 },
              height: { md: `calc(100% - ${headerOffset}px)`, xs: '100%' },
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          pt: `${headerOffset + 16}px`,
          px: { xs: 2, sm: 3, lg: 4 },
          pb: { xs: 8, md: 10 },
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              backgroundColor: 'background.paper',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Resumen rápido
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {domainConfig.overview.description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {domainConfig.overview.stats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    minWidth: 120,
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 2,
                    backgroundColor: statBackground,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Box sx={{ backgroundColor: 'transparent' }}>
            {activeDomain === 'configuracion' ? (
              <ConfiguracionModule
                activeRouteId={configuracionRouteId}
                onRouteChange={handleConfiguracionRouteChange}
              />
            ) : activeDomain === 'operacion' ? (
              <OperacionModule initialModulo={operacionModulo} />
            ) : activeDomain === 'importaciones' ? (
              <ImportacionesModule
                activeSection={importacionesSection}
                onSectionChange={setImportacionesSection}
              />
            ) : activeDomain === 'reportes' ? (
              <ReportesModule activeCategory={reportesCategory} onCategoryChange={setReportesCategory} />
            ) : (
              <CostosModule initialSubmodule={costosModulo} />
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
