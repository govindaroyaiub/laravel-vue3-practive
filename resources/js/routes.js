import Dashboard from './components/Dashboard.vue';
import ListAppointments from './components/pages/appointments/ListAppointments.vue';
import ListUsers from './components/pages/users/ListUsers.vue';
import UpdateSettings from './components/pages/settings/UpdateSettings.vue';
import UpdateProfile from './components/pages/profile/UpdateProfile.vue';

export default [
    {
        path: '/admin/dashboard',
        name: 'admin.dashboard',
        component: Dashboard,
    },
    {
        path: '/admin/appointments',
        name: 'admin.appointments',
        component: ListAppointments,
    },
    {
        path: '/admin/users',
        name: 'admin.users',
        component: ListUsers,
    },
    {
        path: '/admin/settings',
        name: 'admin.settings',
        component: UpdateSettings,
    },
    {
        path: '/admin/profile',
        name: 'admin.profile',
        component: UpdateProfile,
    }
]