# Use an official Node.js runtime as a parent image
FROM node:14
# Set the working directory in the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install app dependencies
RUN npm install
# Bundle app source
COPY . .
# Expose the port your app runs on
EXPOSE 5050
# Define the command to run your app
CMD [ "npm", "start" ]

#command
#docker build -t rms-docker-img .

#use container
#docker run -p 8000:5050 rms-docker-img

#push local docker image to docker hub
#docker tag rms-docker-img:latest chaiweicheng/rms-docker-img:latest
#• rms-docker-img is the name of your local Docker image.
#• latest is the tag of your local Docker image (usually "latest" if not specified).
#• chaiweicheng/rms-docker-img is your Docker Hub username followed by the name of the repository on Docker Hub where you want to push the image.
#• latest is the tag you want to use on Docker Hub (e.g., "latest" or a version number).
#docker push chaiweicheng/rms-docker-img:latest

#az login
#az group create --name dvopsResourceGroup --location eastus
#az aks create --resource-group dvopsResourceGroup --name dvopsAKSCluster --node-count 1 --generate-ssh-keys

#az aks install-cli
#az aks get-credentials --resource-group dvopsResourceGroup --name dvopsAKSCluster

#kubectl apply -f rms-deployment.yaml
#kubectl apply -f rms-service.yaml

#kubectl delete deployment rms-deployment
#kubectl delete service rms-service

#for jenking configure ## mean done on jenkin
##docker login -u chaiweicheng -p XXXXXX   (XXXXXX is docker password)
##docker-compose build
##docker-compose push


#az account show --query "id" --output tsv     (subscription id)

##az aks get-credentials --resource-group "dvopsResourceGroup" --name "dvopsAKSCluster"--overwrite-existing --subscription "f77d1d73-c661-481e-a0cb-a1f294f37830"
##kubectl apply -f rms-deployment.yaml
##kubectl apply -f rms-service.yaml
##kubectl rollout history deployment/rms-deployment   (not sure whether is it rms-deploment)
##kubectl get pods
##kubectl get services

#kubectl delete deployment rms-deployment
#kubectl delete service rms-service
#az aks delete --resource-group "dvopsResourceGroup" --name "dvopsAKSCluster" --yes --no-wait
#az group delete --name "dvopsResourceGroup" --yes --no-wait

# az ad sp create-for-rbac --role Contributor --scopes /subscriptions/f77d1d73-c661-481e-a0cb-a1f294f37830/resourceGroups/dvopsResourceGroup
# appId: a6322ee5-0a4b-4471-9260-7ab727f7a923
# password:dW08Q~Tjjvl0tz.8V~ycxmhRhIJ6BQQ-t_pQrcq9