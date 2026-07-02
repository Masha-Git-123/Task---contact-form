terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project     = "contact-manager-app-501210"
  region      = "us-central1"
  zone        = "us-central1-a"
  credentials = file("contact-manager-app-501210-400fd5ce4783.json")
}

resource "google_compute_firewall" "app_firewall" {
  name    = "contact-app-firewall"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22", "3000", "5000"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_instance" "app_server" {
  name         = "contact-app-server"
  machine_type = "e2-micro"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  tags = ["contact-app"]
}

output "instance_ip" {
  value = google_compute_instance.app_server.network_interface[0].access_config[0].nat_ip
}

resource "google_project_iam_member" "terraform_sa_compute_admin" {
  project = "contact-manager-app-501210"
  role    = "roles/compute.admin"
  member  = "serviceAccount:terraform-sa@contact-manager-app-501210.iam.gserviceaccount.com"
}