import { Role } from '../../types';

export function canAccessAdminConsole(role?: Role): boolean {
  return role === 'admin';
}

export function canAcknowledgeAlerts(role?: Role): boolean {
  return role === 'operator' || role === 'admin';
}

export function canRunWhatIf(role?: Role): boolean {
  return role === 'operator' || role === 'admin';
}

export function canApplyScenarios(role?: Role): boolean {
  return role === 'operator' || role === 'admin';
}

export function canApproveScenarios(role?: Role): boolean {
  return role === 'admin';
}

export function canConnectDevices(role?: Role): boolean {
  return role === 'operator' || role === 'admin';
}

export function canUseVisionLab(role?: Role): boolean {
  return role === 'operator' || role === 'admin';
}

export function canCreateTickets(role?: Role): boolean {
  return role === 'operator' || role === 'admin';
}

export function canAssignTickets(role?: Role): boolean {
  return role === 'admin';
}

export function getRoleBadgeClass(role?: Role): string {
  switch (role) {
    case 'admin':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'operator':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  }
}
