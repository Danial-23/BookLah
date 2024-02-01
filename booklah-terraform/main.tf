terraform {
    required_providers {
        azurerm = {
            source = "hashicorp/azurerm"
        }
    }
}

provider "azurerm" {
    features {}
}

resource "azurerm_resource_group" "booklahResourceGroup" {
    name = "booklahResourceGroup"
    location = "East US"
}

resource "azurerm_kubernetes_cluster" "booklahAKSCluster" {
    name                = "booklahAKSCluster"
    location            = azurerm_resource_group.booklahResourceGroup.location
    resource_group_name = azurerm_resource_group.booklahResourceGroup.name
    dns_prefix          = "booklah-aks"

    default_node_pool {
        name            = "default"
        node_count      = 1
        vm_size         = "Standard_DS2_v2"
    }

    service_principal {
        client_id = "8b1a6a98-64f0-4f0d-977a-112690a1ddee"
        client_secret = "5428Q~VdWOgDUiznK2bh43HmYsUlGP1VGY-yWbAr"
    }
}