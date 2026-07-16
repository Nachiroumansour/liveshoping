// Dashboard Feature - Architecture modulaire enterprise
export { default as DashboardPage } from './pages/DashboardPage';

// Dashboard Components - Architecture modulaire
export { default as DashboardLayout } from './components/DashboardLayout';
export { default as DashboardHeader } from './components/DashboardHeader';
export { default as DashboardSidebar } from './components/DashboardSidebar';
export { default as DashboardContent } from './components/DashboardContent';

// Stats Components
export { default as StatsOverview } from './components/stats/StatsOverview';
export { default as RevenueCard } from './components/stats/RevenueCard';
export { default as OrdersCard } from './components/stats/OrdersCard';
export { default as ProductsCard } from './components/stats/ProductsCard';
export { default as LiveStatsCard } from './components/stats/LiveStatsCard';

// Quick Actions
export { default as QuickActions } from './components/actions/QuickActions';
export { default as CreateProductButton } from './components/actions/CreateProductButton';
export { default as StartLiveButton } from './components/actions/StartLiveButton';
export { default as ViewOrdersButton } from './components/actions/ViewOrdersButton';

// Recent Activity
export { default as RecentActivity } from './components/activity/RecentActivity';
export { default as RecentOrders } from './components/activity/RecentOrders';
export { default as RecentProducts } from './components/activity/RecentProducts';
export { default as ActivityItem } from './components/activity/ActivityItem';

// Public Link Section
export { default as PublicLinkSection } from './components/public/PublicLinkSection';
export { default as LinkDisplay } from './components/public/LinkDisplay';
export { default as CopyLinkButton } from './components/public/CopyLinkButton';
export { default as OpenLinkButton } from './components/public/OpenLinkButton';

// Hooks
export { default as useDashboard } from './hooks/useDashboard';
export { default as useDashboardStats } from './hooks/useDashboardStats';
export { default as useRecentActivity } from './hooks/useRecentActivity';

// Services
export { default as dashboardService } from './services/dashboardService';
export { default as statsService } from './services/statsService';

// Stores
export { default as dashboardStore } from './stores/dashboardStore';

// Feature module
const DashboardFeature = {
  name: 'dashboard',
  pages: {
    main: 'DashboardPage'
  },
  components: {
    layout: {
      DashboardLayout: 'DashboardLayout',
      DashboardHeader: 'DashboardHeader',
      DashboardSidebar: 'DashboardSidebar',
      DashboardContent: 'DashboardContent'
    },
    stats: {
      StatsOverview: 'StatsOverview',
      RevenueCard: 'RevenueCard',
      OrdersCard: 'OrdersCard',
      ProductsCard: 'ProductsCard',
      LiveStatsCard: 'LiveStatsCard'
    },
    actions: {
      QuickActions: 'QuickActions',
      CreateProductButton: 'CreateProductButton',
      StartLiveButton: 'StartLiveButton',
      ViewOrdersButton: 'ViewOrdersButton'
    },
    activity: {
      RecentActivity: 'RecentActivity',
      RecentOrders: 'RecentOrders',
      RecentProducts: 'RecentProducts',
      ActivityItem: 'ActivityItem'
    },
    public: {
      PublicLinkSection: 'PublicLinkSection',
      LinkDisplay: 'LinkDisplay',
      CopyLinkButton: 'CopyLinkButton',
      OpenLinkButton: 'OpenLinkButton'
    }
  },
  hooks: {
    useDashboard: 'useDashboard',
    useDashboardStats: 'useDashboardStats',
    useRecentActivity: 'useRecentActivity'
  },
  services: {
    dashboardService: 'dashboardService',
    statsService: 'statsService'
  },
  stores: {
    dashboardStore: 'dashboardStore'
  }
};

export default DashboardFeature; 