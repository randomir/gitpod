#!/usr/bin/env bash
# Copyright (c) 2022 Gitpod GmbH. All rights reserved.
# Licensed under the GNU Affero General Public License (AGPL).
# See License-AGPL.txt in the project root for license information.


set -eu

if [[ "$(gcloud config get-value project)" != "{{ gcp.project }}" ]]; then
    gcloud auth activate-service-account --key-file="/tmp/service-account.json"
    gcloud config set project "{{ gcp.project }}"
    gcloud config set compute/region "{{ gcp.region }}"
    gcloud config set compute/zone "{{ gcp.zone }}"
fi
