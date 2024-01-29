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
#az group create --name dvopsProjectGroup --location eastus
#az aks create --resource-group dvopsProjectGroup --name dvopsAKSCluster --node-count 1 --generate-ssh-keys

#az aks install-cli
#az aks get-credentials --resource-group dvopsProjectGroup --name dvopsAKSCluster

#kubectl apply -f rms-deployment.yaml
#kubectl apply -f rms-service.yaml

#kubectl delete deployment rms-deployment
#kubectl delete service rms-service

#for jenking configure ## mean done on jenkin
##docker login -u chaiweicheng -p XXXXXX   (XXXXXX is docker password)
##docker-compose build
##docker-compose push


#az account show --query "id" --output tsv     (subscription id)

##az aks get-credentials --resource-group "dvopsProjectGroup" --name "dvopsAKSCluster"--overwrite-existing --subscription "f77d1d73-c661-481e-a0cb-a1f294f37830"
##kubectl apply -f rms-deployment.yaml
##kubectl apply -f rms-service.yaml
##kubectl rollout history deployment/rms-deployment   (not sure whether is it rms-deploment)
##kubectl get pods
##kubectl get services

#kubectl delete deployment rms-deployment
#kubectl delete service rms-service
#az aks delete --resource-group "dvopsProjectGroup" --name "dvopsAKSCluster" --yes --no-wait