/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { PermissionName, User, Workspace, WorkspaceInstance } from "@gitpod/gitpod-protocol";
import { AdmissionConstraint, WorkspaceClusterWoTLS } from "@gitpod/gitpod-protocol/lib/workspace-cluster";

/**
 * ExtendedUser adds additional attributes to a user which are helpful
 * during cluster selection.
 */
export interface ExtendedUser extends User  {
    level?: string;
    getsMoreResources?: boolean;
}

export interface WorkspaceClusterConstraintSet {
    name: string;
    constraint: Constraint;
}

/**
 * workspaceClusterSets defines an order of preference in which we'll select
 * workspace cluster when starting a workspace.
 */
export const workspaceClusterSets: WorkspaceClusterConstraintSet[] = [
    {
        name: "new workspace cluster",
        constraint: constraintHasPermissions("new-workspace-cluster")
    },
    {
        name: "regional more resources",
        constraint:
            intersect(
                constraintRegional,
                constraintMoreResources,
                constraintInverseHasPermissions("new-workspace-cluster")
            )
    },
    {
        name: "regional regular",
        constraint:
            intersect(
                constraintRegional,
                constraintInverseMoreResources,
                constraintInverseHasPermissions("new-workspace-cluster")
            )
    },
    {
        name: "non-regional more resources",
        constraint:
            intersect(
                invert(constraintRegional),
                constraintMoreResources,
                constraintInverseHasPermissions("new-workspace-cluster")
            )
    },
    {
        name: "non-regional non-paying",
        constraint:
            intersect(
                invert(constraintRegional),
                constraintInverseMoreResources,
                constraintInverseHasPermissions("new-workspace-cluster")
            )
    },
]

export type Constraint = (all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance) => WorkspaceClusterWoTLS[]

export function invert(c: Constraint): Constraint {
    return (all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance) => {
        const s = c(all, user, workspace, instance);
        return all.filter(c => !s.find(sc => c.name === sc.name));
    }
}

export function intersect(...cs: Constraint[]): Constraint {
    return (all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance) => {
        if (cs.length === 0) {
            // no constraints means all clusters match
            return all;
        }

        const sets = cs.map(c => c(all, user, workspace, instance));

        return sets[0].filter(c => sets.slice(1).every(s => s.includes(c)));
    }
}

function hasPermissionConstraint(cluster: WorkspaceClusterWoTLS, permission: PermissionName): boolean {
    return !!cluster.admissionConstraints?.find(constraint => AdmissionConstraint.hasPermission(constraint, permission));
}

/**
 * The returned Constraint _filters out_ all clusters that require _any_ of the given permissions
 * @param permissions
 * @returns
 */
export function constraintInverseHasPermissions(...permissions: PermissionName[]): Constraint {
    return (all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance) => {
        return all.filter(cluster => !permissions.some(p => hasPermissionConstraint(cluster, p)))
    }
}

/**
 * The returned Constraint returns all clusters that require _any_ of the given permissions
 * @param permissions
 * @returns
 */
export function constraintHasPermissions(...permissions: PermissionName[]): Constraint {
    return (all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance) => {
        return all.filter(cluster => permissions.some(p => hasPermissionConstraint(cluster, p)));
    }
}

export function constraintRegional(all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance): WorkspaceClusterWoTLS[] {
    // TODO(cw): implement me
    return [];
}

export function constraintInverseMoreResources(all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance): WorkspaceClusterWoTLS[] {
    return all.filter(cluster => !cluster.admissionConstraints?.find(constraint => constraint.type === "has-more-resources"));
}

export function constraintMoreResources(all: WorkspaceClusterWoTLS[], user: ExtendedUser, workspace: Workspace, instance: WorkspaceInstance): WorkspaceClusterWoTLS[] {
    return all.filter(cluster => !!cluster.admissionConstraints?.find(constraint => constraint.type === "has-more-resources"));
}
