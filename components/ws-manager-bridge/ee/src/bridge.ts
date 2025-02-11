/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the Gitpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { WorkspaceManagerBridge } from "../../src/bridge";
import { injectable } from "inversify";
import { TraceContext } from "@gitpod/gitpod-protocol/lib/util/tracing";
import { WorkspaceStatus, WorkspaceType, WorkspacePhase } from "@gitpod/ws-manager/lib";
import { HeadlessWorkspaceEvent, HeadlessWorkspaceEventType } from "@gitpod/gitpod-protocol/lib/headless-workspace-log";
import { WorkspaceInstance } from "@gitpod/gitpod-protocol";
import { log, LogContext } from "@gitpod/gitpod-protocol/lib/util/logging";

@injectable()
export class WorkspaceManagerBridgeEE extends WorkspaceManagerBridge {
    protected async cleanupProbeWorkspace(ctx: TraceContext, status: WorkspaceStatus.AsObject | undefined) {
        if (!status) {
            return;
        }
        if (status.spec && status.spec.type != WorkspaceType.PROBE) {
            return;
        }
        if (status.phase !== WorkspacePhase.STOPPED) {
            return;
        }

        const span = TraceContext.startSpan("cleanupProbeWorkspace", ctx);
        try {
            const workspaceId = status.metadata!.metaId!;
            await this.workspaceDB.trace({ span }).hardDeleteWorkspace(workspaceId);
        } catch (e) {
            TraceContext.setError({ span }, e);
            throw e;
        } finally {
            span.finish();
        }
    }

    protected async updatePrebuiltWorkspace(
        ctx: TraceContext,
        userId: string,
        status: WorkspaceStatus.AsObject,
        writeToDB: boolean,
    ) {
        if (status.spec && status.spec.type != WorkspaceType.PREBUILD) {
            return;
        }

        const instanceId = status.id!;
        const workspaceId = status.metadata!.metaId!;
        const logCtx: LogContext = { instanceId, workspaceId, userId };

        log.info("Handling prebuild workspace update.", status);

        const span = TraceContext.startSpan("updatePrebuiltWorkspace", ctx);
        try {
            const prebuild = await this.workspaceDB.trace({ span }).findPrebuildByWorkspaceID(status.metadata!.metaId!);
            if (!prebuild) {
                log.warn(logCtx, "Headless workspace without prebuild");
                TraceContext.setError({ span }, new Error("headless workspace without prebuild"));
                return;
            }
            span.setTag("updatePrebuiltWorkspace.prebuildId", prebuild.id);
            span.setTag("updatePrebuiltWorkspace.workspaceInstance.statusVersion", status.statusVersion);
            log.info("Found prebuild record in database.", prebuild);

            // prebuild.statusVersion = 0 is the default value in the DB, these shouldn't be counted as stale in our metrics
            if (prebuild.statusVersion > 0 && prebuild.statusVersion >= status.statusVersion) {
                // We've gotten an event which is younger than one we've already processed. We shouldn't process the stale one.
                span.setTag("updatePrebuiltWorkspace.staleEvent", true);
                this.prometheusExporter.recordStalePrebuildEvent();
                log.info(logCtx, "Stale prebuild event received, skipping.");
                return;
            }
            prebuild.statusVersion = status.statusVersion;

            if (prebuild.state === "queued") {
                // We've received an update from ws-man for this workspace, hence it must be running.
                prebuild.state = "building";

                if (writeToDB) {
                    await this.workspaceDB.trace({ span }).storePrebuiltWorkspace(prebuild);
                }
                await this.messagebus.notifyHeadlessUpdate({ span }, userId, workspaceId, <HeadlessWorkspaceEvent>{
                    type: HeadlessWorkspaceEventType.Started,
                    workspaceID: workspaceId,
                });
            }

            if (status.phase === WorkspacePhase.STOPPING) {
                let headlessUpdateType: HeadlessWorkspaceEventType = HeadlessWorkspaceEventType.Aborted;
                if (!!status.conditions!.timeout) {
                    prebuild.state = "timeout";
                    prebuild.error = status.conditions!.timeout;
                    headlessUpdateType = HeadlessWorkspaceEventType.AbortedTimedOut;
                } else if (!!status.conditions!.failed) {
                    prebuild.state = "failed";
                    prebuild.error = status.conditions!.failed;
                    headlessUpdateType = HeadlessWorkspaceEventType.Failed;
                } else if (!!status.conditions!.stoppedByRequest) {
                    prebuild.state = "aborted";
                    prebuild.error = "Cancelled";
                    headlessUpdateType = HeadlessWorkspaceEventType.Aborted;
                } else if (!!status.conditions!.headlessTaskFailed) {
                    prebuild.state = "available";
                    if (status.conditions!.headlessTaskFailed) prebuild.error = status.conditions!.headlessTaskFailed;
                    prebuild.snapshot = status.conditions!.snapshot;
                    headlessUpdateType = HeadlessWorkspaceEventType.FinishedButFailed;
                } else if (!!status.conditions!.snapshot) {
                    prebuild.state = "available";
                    prebuild.snapshot = status.conditions!.snapshot;
                    headlessUpdateType = HeadlessWorkspaceEventType.FinishedSuccessfully;
                } else {
                    // stopping event with no clear outcome (i.e. no snapshot yet)
                    return;
                }

                span.setTag("updatePrebuildWorkspace.prebuild.state", prebuild.state);
                span.setTag("updatePrebuildWorkspace.prebuild.error", prebuild.error);

                if (writeToDB) {
                    await this.workspaceDB.trace({ span }).storePrebuiltWorkspace(prebuild);
                }

                // notify updates
                // headless update
                await this.messagebus.notifyHeadlessUpdate({ span }, userId, workspaceId, <HeadlessWorkspaceEvent>{
                    type: headlessUpdateType,
                    workspaceID: workspaceId,
                });

                // prebuild info
                const info = (await this.workspaceDB.trace({ span }).findPrebuildInfos([prebuild.id]))[0];
                if (info) {
                    this.messagebus.notifyOnPrebuildUpdate({ info, status: prebuild.state });
                }
            }
        } catch (e) {
            TraceContext.setError({ span }, e);
            throw e;
        } finally {
            span.finish();
        }
    }

    protected async stopPrebuildInstance(ctx: TraceContext, instance: WorkspaceInstance): Promise<void> {
        const span = TraceContext.startSpan("stopPrebuildInstance", ctx);

        const prebuild = await this.workspaceDB.trace({}).findPrebuildByWorkspaceID(instance.workspaceId);
        if (prebuild) {
            // this is a prebuild - set it to aborted
            prebuild.state = "aborted";
            await this.workspaceDB.trace({}).storePrebuiltWorkspace(prebuild);

            {
                // notify about prebuild updated
                const info = (await this.workspaceDB.trace({ span }).findPrebuildInfos([prebuild.id]))[0];
                if (info) {
                    this.messagebus.notifyOnPrebuildUpdate({ info, status: prebuild.state });
                }
            }
        }
    }
}
