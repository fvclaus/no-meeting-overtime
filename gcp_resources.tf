terraform {
  required_providers {
		google = {
			source = "hashicorp/google"
		}
  }
}


variable "project" { 
	type = string
}

#variable "credentials_file" { }

variable "region" { 
	type = string
}

provider "google" {
  project     = var.project
  region      = var.region
}

resource "random_id" "terraform_backend" {
  byte_length = 8
}

resource "google_storage_bucket" "terraform_backend" {
  name     = "${random_id.terraform_backend.hex}-terraform-remote-backend"
  location = "US"

  force_destroy               = false
  public_access_prevention    = "enforced"
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

resource "local_file" "terraform_backend" {
  file_permission = "0644"
  filename        = "${path.module}/backend.tf"

  # You can store the template in a file and use the templatefile function for
  # more modularity, if you prefer, instead of storing the template inline as
  # we do here.
  content = <<-EOT
  terraform {
    backend "gcs" {
      bucket = "${google_storage_bucket.terraform_backend.name}"
    }
  }
  EOT
}


resource "google_artifact_registry_repository" "cloud_run_source_deploy" {
  format        = "DOCKER"
  location      = var.region
  mode          = "STANDARD_REPOSITORY"
  repository_id = "repo"

  depends_on = [ google_project_service.artifactregistry_googleapis_com ]
}


# terraform import google_artifact_registry_repository.cloud_run_source_deploy projects/avian-sandbox-438712-j6/locations/europe-west3/repositories/cloud-run-source-deploy
resource "google_service_account" "cloud_build" {
  account_id = "cloud-build"
}


resource "google_project_iam_member" "cloud_build_sa_run_binding" {
	member = "serviceAccount:${google_service_account.cloud_build.email}"
  role = "roles/run.admin"
	project = var.project
}

resource "google_project_iam_member" "cloud_build_sa_run_sa_binding" {
	member = "serviceAccount:${google_service_account.cloud_build.email}"
  role = "roles/run.serviceAgent"
	project = var.project
}

# Write to Cloud Logging API
resource "google_project_iam_member" "cloud_build_sa_log_binding" {
	member = "serviceAccount:${google_service_account.cloud_build.email}"
  role = "roles/logging.logWriter"
	project = var.project
}

# Write logs to cloud bucket
resource "google_project_iam_member" "cloud_build_sa_storage_binding" {
	member = "serviceAccount:${google_service_account.cloud_build.email}"
  role = "roles/storage.admin"
	project = var.project
}

# Push docker images
resource "google_project_iam_member" "cloud_build_sa_registry_binding" {
	member = "serviceAccount:${google_service_account.cloud_build.email}"
  role = "roles/artifactregistry.writer"
	project = var.project
}





# # terraform import google_project.avian_sandbox_438712_j6 projects/avian-sandbox-438712-j6
# resource "google_logging_project_sink" "a_default" {
#   destination            = "logging.googleapis.com/projects/avian-sandbox-438712-j6/locations/global/buckets/_Default"
#   filter                 = "NOT LOG_ID(\"cloudaudit.googleapis.com/activity\") AND NOT LOG_ID(\"externalaudit.googleapis.com/activity\") AND NOT LOG_ID(\"cloudaudit.googleapis.com/system_event\") AND NOT LOG_ID(\"externalaudit.googleapis.com/system_event\") AND NOT LOG_ID(\"cloudaudit.googleapis.com/access_transparency\") AND NOT LOG_ID(\"externalaudit.googleapis.com/access_transparency\")"
#   name                   = "_Default"
#   project                = "702188951486"
#   unique_writer_identity = true
# }
# # terraform import google_logging_project_sink.a_default 702188951486###_Default
# resource "google_logging_project_sink" "a_required" {
#   destination            = "logging.googleapis.com/projects/avian-sandbox-438712-j6/locations/global/buckets/_Required"
#   filter                 = "LOG_ID(\"cloudaudit.googleapis.com/activity\") OR LOG_ID(\"externalaudit.googleapis.com/activity\") OR LOG_ID(\"cloudaudit.googleapis.com/system_event\") OR LOG_ID(\"externalaudit.googleapis.com/system_event\") OR LOG_ID(\"cloudaudit.googleapis.com/access_transparency\") OR LOG_ID(\"externalaudit.googleapis.com/access_transparency\")"
#   name                   = "_Required"
#   project                = "702188951486"
#   unique_writer_identity = true
# }
# resource "google_cloud_run_v2_service" "google_meet_timer" {
#   client         = "gcloud"
#   client_version = "498.0.0"
#   ingress        = "INGRESS_TRAFFIC_ALL"
#   launch_stage   = "GA"
#   location       = "europe-west3"
#   name           = "google-meet-timer"
#   project        = "avian-sandbox-438712-j6"
#   template {
#     containers {
#       image = "europe-west3-docker.pkg.dev/avian-sandbox-438712-j6/cloud-run-source-deploy/google-meet-timer:v1"
#       ports {
#         container_port = 8080
#         name           = "http1"
#       }
#       resources {
#         cpu_idle = true
#         limits = {
#           cpu    = "1000m"
#           memory = "512Mi"
#         }
#         startup_cpu_boost = true
#       }
#       startup_probe {
#         failure_threshold     = 1
#         initial_delay_seconds = 0
#         period_seconds        = 240
#         tcp_socket {
#           port = 8080
#         }
#         timeout_seconds = 240
#       }
#     }
#     max_instance_request_concurrency = 80
#     scaling {
#       max_instance_count = 100
#     }
#     service_account = "702188951486-compute@developer.gserviceaccount.com"
#     timeout         = "300s"
#   }
#   traffic {
#     percent = 100
#     type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
#   }
# }
# terraform import google_cloud_run_v2_service.google_meet_timer projects/avian-sandbox-438712-j6/locations/europe-west3/services/google-meet-timer
resource "google_project_service" "iam_googleapis_com" {
  service = "iam.googleapis.com"
}
# terraform import google_project_service.iam_googleapis_com 702188951486/iam.googleapis.com
resource "google_project_service" "cloudbuild_googleapis_com" {
  service = "cloudbuild.googleapis.com"
}
# terraform import google_project_service.cloudasset_googleapis_com 702188951486/cloudasset.googleapis.com
resource "google_project_service" "meet_googleapis_com" {
  service = "meet.googleapis.com"
}
# terraform import google_project_service.meet_googleapis_com 702188951486/meet.googleapis.com
# resource "google_storage_bucket" "702188951486_europe_west1_cloudbuild_logs" {
#   force_destroy = false
#   labels = {
#     goog-cloudbuild-location = "europe-west1"
#   }
#   lifecycle_rule {
#     action {
#       type = "Delete"
#     }
#     condition {
#       num_newer_versions = 1
#       with_state         = "ANY"
#     }
#   }
#   location                    = "EUROPE-WEST1"
#   name                        = "702188951486-europe-west1-cloudbuild-logs"
#   project                     = "avian-sandbox-438712-j6"
#   public_access_prevention    = "inherited"
#   storage_class               = "STANDARD"
#   uniform_bucket_level_access = true
#   versioning {
#     enabled = true
#   }
# }
# terraform import google_storage_bucket.702188951486_europe_west1_cloudbuild_logs 702188951486-europe-west1-cloudbuild-logs
# terraform import google_project_service.cloudaicompanion_googleapis_com 702188951486/cloudaicompanion.googleapis.com
# resource "google_service_account" "702188951486_compute" {
#   account_id   = "702188951486-compute"
#   display_name = "Default compute service account"
#   project      = "avian-sandbox-438712-j6"
# }
# terraform import google_service_account.702188951486_compute projects/avian-sandbox-438712-j6/serviceAccounts/702188951486-compute@avian-sandbox-438712-j6.iam.gserviceaccount.com
# terraform import google_project_service.storage_api_googleapis_com 702188951486/storage-api.googleapis.com
resource "google_project_service" "artifactregistry_googleapis_com" {
  service = "artifactregistry.googleapis.com"
}
# terraform import google_project_service.artifactregistry_googleapis_com 702188951486/artifactregistry.googleapis.com
# resource "google_storage_bucket" "run_sources_avian_sandbox_438712_j6_europe_west3" {
#   cors {
#     method = ["GET"]
#     origin = ["https://*.cloud.google.com", "https://*.corp.google.com", "https://*.corp.google.com:*", "https://*.cloud.google", "https://*.byoid.goog"]
#   }
#   force_destroy               = false
#   location                    = "EUROPE-WEST3"
#   name                        = "run-sources-avian-sandbox-438712-j6-europe-west3"
#   project                     = "avian-sandbox-438712-j6"
#   public_access_prevention    = "inherited"
#   storage_class               = "STANDARD"
#   uniform_bucket_level_access = true
# }
# terraform import google_storage_bucket.run_sources_avian_sandbox_438712_j6_europe_west3 run-sources-avian-sandbox-438712-j6-europe-west3
# resource "google_storage_bucket" "avian_sandbox_438712_j6_cloudbuild" {
#   force_destroy            = false
#   location                 = "US"
#   name                     = "avian-sandbox-438712-j6_cloudbuild"
#   project                  = "avian-sandbox-438712-j6"
#   public_access_prevention = "inherited"
#   storage_class            = "STANDARD"
# }
# terraform import google_storage_bucket.avian_sandbox_438712_j6_cloudbuild avian-sandbox-438712-j6_cloudbuild
resource "google_project_service" "run_googleapis_com" {
  service = "run.googleapis.com"
}
# terraform import google_project_service.run_googleapis_com 702188951486/run.googleapis.com
# resource "google_storage_bucket" "702188951486_europe_west3_cloudbuild_logs" {
#   force_destroy = false
#   labels = {
#     goog-cloudbuild-location = "europe-west3"
#   }
#   lifecycle_rule {
#     action {
#       type = "Delete"
#     }
#     condition {
#       num_newer_versions = 1
#       with_state         = "ANY"
#     }
#   }
#   location                    = "EUROPE-WEST3"
#   name                        = "702188951486-europe-west3-cloudbuild-logs"
#   project                     = "avian-sandbox-438712-j6"
#   public_access_prevention    = "inherited"
#   storage_class               = "STANDARD"
#   uniform_bucket_level_access = true
#   versioning {
#     enabled = true
#   }
# }
# terraform import google_storage_bucket.702188951486_europe_west3_cloudbuild_logs 702188951486-europe-west3-cloudbuild-logs
# terraform import google_project_service.secretmanager_googleapis_com 702188951486/secretmanager.googleapis.com
