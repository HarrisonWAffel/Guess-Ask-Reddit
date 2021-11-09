## Guess Ask Reddit

A simple game which presents you with posts from reddit.com/r/AskReddit, and asks you to guess what comment has the most karma. This game was created so that I could learn Typescript (this is my first project utilizing it) and improve my understanding of React.


### How to run this project using docker-compose

The simplest way to run this project is with docker-compose, to run it locally first clone and navigate to this repository and run `docker-compose up --build`. After building the project should be available at http://localhost:8080.


### How to run this project using kubernetes 

This project also supports deployment to a local kubernetes cluster, and provides the required yaml files for the 
project pods and services. Deployment to cloud services has not been tested, but in theory should work with minimal changes.
kubernetes support was added as a way to learn kubectl, minikube, and kubernetes concepts, therefore setup instructions are
only included for a local osx environment.  


#### Running this project in a local kubernetes cluster (minikube) on OSX

1. download minikube
   1. `brew install minikube`
2. download the kubernetes-cli (kubectl)
   1. `brew install kubernetes-cli`
3. start minikube 
   1. `minikube start`
4. run the provided support script to create the required services
   1. `./create-k8-services`
5. in a new terminal window run the following command to expose the backend service 
   1. `minikube service --url backend`
   2. copy the port number displayed by minikube, ensure that this terminal window stays open as it acts as a network tunnel.
6. edit the `frontend-replica.yaml` file so that the `REACT_APP_BACKEND_PORT` value equals the port number you copied in step `5`. This is required for the frontend and backend services to communicate over HTTP.
7. run the provided support script to create the kubernetes pods 
   1. `./create-k8-pods`
8. expose the frontend so that you can access the URL 
   1. `minikube service --url frontend`
   2. you can paste the resulting URL into your browser to be taken to the app. Again, the `minikube service --url frontend` command will act as a network tunnel, be sure not to close the terminal window running that command while using the application.