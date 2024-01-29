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
resource "azurerm_resource_group" "dvopsResourceGroup" {
  name = "dvopsResourceGroup"
  location = "East US"
}
resource "azurerm_kubernetes_cluster" "dvopsAKSCluster" {
  name = "dvopsAKSCluster"
  location = azurerm_resource_group.dvopsResourceGroup.location
  resource_group_name = azurerm_resource_group.dvopsResourceGroup.name
  dns_prefix = "rms-aks"

  default_node_pool {
    name = "default"
    node_count = 1
    vm_size = "Standard_DS2_v2"
  }
  service_principal {
    client_id = "a6322ee5-0a4b-4471-9260-7ab727f7a923"
    client_secret = "dW08Q~Tjjvl0tz.8V~ycxmhRhIJ6BQQ-t_pQrcq9"
  }
}