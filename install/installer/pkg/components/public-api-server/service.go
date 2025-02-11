// Copyright (c) 2022 Gitpod GmbH. All rights reserved.
// Licensed under the MIT License. See License-MIT.txt in the project root for license information.

package public_api_server

import (
	"github.com/gitpod-io/gitpod/installer/pkg/common"
	"k8s.io/apimachinery/pkg/runtime"
)

func service(ctx *common.RenderContext) ([]runtime.Object, error) {
	return common.GenerateService(Component, map[string]common.ServicePort{
		HTTPPortName: {
			ContainerPort: HTTPContainerPort,
			ServicePort:   HTTPServicePort,
		},
		GRPCPortName: {
			ContainerPort: GRPCContainerPort,
			ServicePort:   GRPCServicePort,
		},
	})(ctx)
}
