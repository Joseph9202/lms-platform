{{/*
===========================================
HELPER TEMPLATES - LMS PLATFORM
Funciones auxiliares para el Helm Chart
===========================================
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "lms-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "lms-platform.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "lms-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "lms-platform.labels" -}}
helm.sh/chart: {{ include "lms-platform.chart" . }}
{{ include "lms-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: lms-platform
{{- end }}

{{/*
Selector labels
*/}}
{{- define "lms-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "lms-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "lms-platform.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "lms-platform.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the configmap
*/}}
{{- define "lms-platform.configmapName" -}}
{{- include "lms-platform.fullname" . }}-config
{{- end }}

{{/*
Create the name of the secret
*/}}
{{- define "lms-platform.secretName" -}}
{{- include "lms-platform.fullname" . }}-secrets
{{- end }}

{{/*
Create a default image name
*/}}
{{- define "lms-platform.image" -}}
{{- $registry := .Values.image.registry -}}
{{- $repository := .Values.image.repository -}}
{{- $tag := .Values.image.tag | default .Chart.AppVersion -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- end }}

{{/*
MySQL connection string
*/}}
{{- define "lms-platform.mysql.connectionString" -}}
{{- if .Values.mysql.enabled -}}
mysql://{{ .Values.mysql.auth.username }}:{{ .Values.mysql.auth.password }}@{{ include "lms-platform.fullname" . }}-mysql:3306/{{ .Values.mysql.auth.database }}
{{- else -}}
{{- printf "mysql://%s:%s@%s:%s/%s" .Values.mysql.external.username .Values.mysql.external.password .Values.mysql.external.host .Values.mysql.external.port .Values.mysql.external.database -}}
{{- end -}}
{{- end }}

{{/*
Redis connection string
*/}}
{{- define "lms-platform.redis.connectionString" -}}
{{- if .Values.redis.enabled -}}
{{- if .Values.redis.auth.enabled -}}
redis://:{{ .Values.redis.auth.password }}@{{ include "lms-platform.fullname" . }}-redis-master:6379
{{- else -}}
redis://{{ include "lms-platform.fullname" . }}-redis-master:6379
{{- end -}}
{{- else -}}
{{- .Values.redis.external.url -}}
{{- end -}}
{{- end }}

{{/*
Ingress hostname
*/}}
{{- define "lms-platform.ingress.hostname" -}}
{{- if .Values.ingress.hosts -}}
{{- (index .Values.ingress.hosts 0).host -}}
{{- else -}}
{{- "lms.yourdomain.com" -}}
{{- end -}}
{{- end }}

{{/*
Return the appropriate apiVersion for ingress
*/}}
{{- define "lms-platform.ingress.apiVersion" -}}
{{- if semverCompare ">=1.19-0" .Capabilities.KubeVersion.GitVersion -}}
networking.k8s.io/v1
{{- else if semverCompare ">=1.14-0" .Capabilities.KubeVersion.GitVersion -}}
networking.k8s.io/v1beta1
{{- else -}}
extensions/v1beta1
{{- end -}}
{{- end }}

{{/*
Return if ingress is stable
*/}}
{{- define "lms-platform.ingress.isStable" -}}
{{- eq (include "lms-platform.ingress.apiVersion" .) "networking.k8s.io/v1" -}}
{{- end }}

{{/*
Return if ingress supports ingressClassName
*/}}
{{- define "lms-platform.ingress.supportsIngressClassName" -}}
{{- or (eq (include "lms-platform.ingress.isStable" .) "true") (and (eq (include "lms-platform.ingress.apiVersion" .) "networking.k8s.io/v1beta1") (semverCompare ">=1.18-0" .Capabilities.KubeVersion.GitVersion)) -}}
{{- end }}

{{/*
Return if ingress supports pathType
*/}}
{{- define "lms-platform.ingress.supportsPathType" -}}
{{- or (eq (include "lms-platform.ingress.isStable" .) "true") (and (eq (include "lms-platform.ingress.apiVersion" .) "networking.k8s.io/v1beta1") (semverCompare ">=1.18-0" .Capabilities.KubeVersion.GitVersion)) -}}
{{- end }}

{{/*
Common annotations for all resources
*/}}
{{- define "lms-platform.commonAnnotations" -}}
meta.helm.sh/release-name: {{ .Release.Name }}
meta.helm.sh/release-namespace: {{ .Release.Namespace }}
app.kubernetes.io/managed-by: Helm
{{- end }}

{{/*
Pod security context
*/}}
{{- define "lms-platform.podSecurityContext" -}}
{{- if .Values.podSecurityContext -}}
{{- toYaml .Values.podSecurityContext -}}
{{- else -}}
fsGroup: 1001
runAsNonRoot: true
runAsUser: 1001
{{- end -}}
{{- end }}

{{/*
Container security context
*/}}
{{- define "lms-platform.securityContext" -}}
{{- if .Values.securityContext -}}
{{- toYaml .Values.securityContext -}}
{{- else -}}
allowPrivilegeEscalation: false
capabilities:
  drop:
  - ALL
readOnlyRootFilesystem: false
runAsNonRoot: true
runAsUser: 1001
{{- end -}}
{{- end }}

{{/*
Resource requests and limits
*/}}
{{- define "lms-platform.resources" -}}
{{- if .Values.resources -}}
{{- toYaml .Values.resources -}}
{{- else -}}
limits:
  cpu: 1000m
  memory: 1Gi
requests:
  cpu: 500m
  memory: 512Mi
{{- end -}}
{{- end }}
