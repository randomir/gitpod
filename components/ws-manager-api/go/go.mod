module github.com/gitpod-io/gitpod/ws-manager/api

go 1.18

require (
	github.com/gitpod-io/gitpod/common-go v0.0.0-00010101000000-000000000000
	github.com/gitpod-io/gitpod/content-service/api v0.0.0-00010101000000-000000000000
	github.com/go-ozzo/ozzo-validation v3.6.0+incompatible
	github.com/golang/mock v1.6.0
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1
	google.golang.org/grpc v1.45.0
	google.golang.org/protobuf v1.28.0
	k8s.io/api v0.23.5
	k8s.io/apimachinery v0.23.5
)

require (
	github.com/asaskevich/govalidator v0.0.0-20190424111038-f61b66f89f4a // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/cespare/xxhash/v2 v2.1.2 // indirect
	github.com/go-logr/logr v1.2.0 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/google/go-cmp v0.5.7 // indirect
	github.com/google/gofuzz v1.1.0 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0 // indirect
	github.com/grpc-ecosystem/go-grpc-prometheus v1.2.0 // indirect
	github.com/hashicorp/golang-lru v0.5.1 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.1 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/opencontainers/image-spec v1.0.2 // indirect
	github.com/opentracing/opentracing-go v1.2.0 // indirect
	github.com/prometheus/client_golang v1.12.1 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.32.1 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	github.com/sirupsen/logrus v1.8.1 // indirect
	golang.org/x/net v0.0.0-20211209124913-491a49abca63 // indirect
	golang.org/x/sys v0.0.0-20220114195835-da31bd327af9 // indirect
	golang.org/x/text v0.3.7 // indirect
	golang.org/x/time v0.0.0-20200630173020-3af7569d3a1e // indirect
	google.golang.org/genproto v0.0.0-20201019141844-1ed22bb0c154 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	k8s.io/klog/v2 v2.30.0 // indirect
	k8s.io/utils v0.0.0-20211116205334-6203023598ed // indirect
	sigs.k8s.io/json v0.0.0-20211020170558-c049b76a60c6 // indirect
	sigs.k8s.io/structured-merge-diff/v4 v4.2.1 // indirect
	sigs.k8s.io/yaml v1.2.0 // indirect
)

replace github.com/gitpod-io/gitpod/common-go => ../../common-go // leeway

replace github.com/gitpod-io/gitpod/content-service/api => ../../content-service-api/go // leeway

replace k8s.io/api => k8s.io/api v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/apiextensions-apiserver => k8s.io/apiextensions-apiserver v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/apimachinery => k8s.io/apimachinery v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/apiserver => k8s.io/apiserver v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/cli-runtime => k8s.io/cli-runtime v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/client-go => k8s.io/client-go v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/cloud-provider => k8s.io/cloud-provider v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/cluster-bootstrap => k8s.io/cluster-bootstrap v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/code-generator => k8s.io/code-generator v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/component-base => k8s.io/component-base v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/cri-api => k8s.io/cri-api v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/csi-translation-lib => k8s.io/csi-translation-lib v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/kube-aggregator => k8s.io/kube-aggregator v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/kube-controller-manager => k8s.io/kube-controller-manager v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/kube-proxy => k8s.io/kube-proxy v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/kube-scheduler => k8s.io/kube-scheduler v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/kubelet => k8s.io/kubelet v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/legacy-cloud-providers => k8s.io/legacy-cloud-providers v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/metrics => k8s.io/metrics v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/sample-apiserver => k8s.io/sample-apiserver v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/component-helpers => k8s.io/component-helpers v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/controller-manager => k8s.io/controller-manager v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/kubectl => k8s.io/kubectl v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/mount-utils => k8s.io/mount-utils v0.23.5 // leeway indirect from components/common-go:lib

replace k8s.io/pod-security-admission => k8s.io/pod-security-admission v0.23.5 // leeway indirect from components/common-go:lib
